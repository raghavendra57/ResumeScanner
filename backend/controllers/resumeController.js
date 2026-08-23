const { extractTextFromPDF } = require('../services/pdfService');
const {
  matchSkills,
  extractCandidateName,
  calculateStructureScore,
  calculateEducationScoreFallback,
  calculateExperienceScoreFallback,
  extractExperienceFallback,
  extractEducationFallback,
  getAtsRating
} = require('../services/matchingService');
const { analyzeWithGemini } = require('../services/geminiService');
const Candidate = require('../models/Candidate');
const { isDbConnected } = require('../db');

/**
 * Determine recommendation text based on final score
 * 80–100 → Strong Match
 * 60–79  → Good Match
 * 40–59  → Partial Match
 * 0–39   → Low Match
 * @param {number} score
 * @returns {string}
 */
function getRecommendation(score) {
  if (score >= 80) return 'Strong Match';
  if (score >= 60) return 'Good Match';
  if (score >= 40) return 'Partial Match';
  return 'Low Match';
}

/**
 * Merge and deduplicate skills arrays case-insensitively
 * @param {string[]} listA
 * @param {string[]} listB
 * @returns {string[]}
 */
function mergeSkillLists(listA = [], listB = []) {
  const map = new Map();

  for (const item of [...listA, ...listB]) {
    if (typeof item === 'string' && item.trim().length > 0) {
      const clean = item.trim();
      const lower = clean.toLowerCase();
      if (!map.has(lower)) {
        map.set(lower, clean);
      }
    }
  }

  return Array.from(map.values());
}

/**
 * Extract email using regex heuristic from text
 * @param {string} text
 * @returns {string|null}
 */
function extractEmail(text) {
  const match = (text || '').match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

/**
 * Extract phone using regex heuristic from text
 * @param {string} text
 * @returns {string|null}
 */
function extractPhone(text) {
  const match = (text || '').match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return match ? match[0] : null;
}

/**
 * POST /api/analyze
 * Main screening controller with ATS scoring, JD Text/PDF support, and MongoDB persistence
 */
async function analyzeResume(req, res) {
  try {
    // 1. Validate Resume file presence
    const resumeFile = (req.files && req.files['resume'] && req.files['resume'][0]) || req.file;

    if (!resumeFile || !resumeFile.buffer) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a resume before analyzing.'
      });
    }

    // 2. Validate Job Description (Text OR PDF)
    let jobDescription = '';
    let jobDescriptionSource = 'text';
    let jobDescriptionSourceName = 'Text Input';

    const jdText = (req.body.jobDescriptionText || req.body.jobDescription || '').trim();
    const jdFile = req.files && req.files['jobDescriptionFile'] && req.files['jobDescriptionFile'][0];

    if (jdText) {
      jobDescription = jdText;
      jobDescriptionSource = 'text';
      jobDescriptionSourceName = 'Text Input';
    } else if (jdFile && jdFile.buffer) {
      jobDescriptionSource = 'pdf';
      jobDescriptionSourceName = jdFile.originalname || 'Job Description PDF';
      try {
        const jdExtraction = await extractTextFromPDF(jdFile.buffer);
        jobDescription = jdExtraction.text;
      } catch (jdPdfError) {
        return res.status(400).json({
          success: false,
          error:
            'Unable to extract text from this Job Description PDF. Please upload a text-based PDF.'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Please provide a job description by pasting text or uploading a PDF.'
      });
    }

    if (!jobDescription || jobDescription.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a job description by pasting text or uploading a PDF.'
      });
    }

    // 3. Extract text from Resume PDF buffer
    let resumeText = '';
    try {
      const extraction = await extractTextFromPDF(resumeFile.buffer);
      resumeText = extraction.text;
    } catch (pdfError) {
      return res.status(400).json({
        success: false,
        error:
          pdfError.message || 'Unable to extract text from this PDF. Please upload a text-based resume.'
      });
    }

    // 4. Candidate Name Detection
    let candidateName = extractCandidateName(resumeText);
    const candidateEmail = extractEmail(resumeText);
    const candidatePhone = extractPhone(resumeText);

    // 5. Rule-based Skill Matching
    const ruleMatch = matchSkills(resumeText, jobDescription);
    const basicSkillScore = ruleMatch.basicScore;

    // 6. Resume Structure Score
    const structureScore = calculateStructureScore(resumeText);

    // 7. Gemini Semantic & Structured Extraction Analysis
    const geminiResult = await analyzeWithGemini(resumeText, jobDescription);

    let semanticScore = null;
    let experienceScore = null;
    let educationScore = null;
    let overallMatchScore = basicSkillScore;
    let aiUsed = false;
    let aiFallbackNotice = null;
    let matchedSkills = ruleMatch.matchedSkills;
    let missingSkills = ruleMatch.missingSkills;
    let strengths = [];
    let gaps = [];
    let summary = '';
    let shortlistJustification = '';
    let structuredExperience = [];
    let structuredEducation = [];
    let structuredCertifications = [];
    let candidateSkills = ruleMatch.resumeSkills;

    if (geminiResult.success && geminiResult.data) {
      aiUsed = true;
      semanticScore = geminiResult.data.semanticScore;
      experienceScore = geminiResult.data.experienceScore;
      educationScore = geminiResult.data.educationScore;

      // Use AI extracted candidate name if our heuristic missed or if AI is high confidence
      if (geminiResult.data.candidate?.name && candidateName === 'Not detected') {
        candidateName = geminiResult.data.candidate.name;
      }

      structuredExperience = (geminiResult.data.candidate?.experience && geminiResult.data.candidate.experience.length > 0)
        ? geminiResult.data.candidate.experience
        : extractExperienceFallback(resumeText);

      structuredEducation = (geminiResult.data.candidate?.education && geminiResult.data.candidate.education.length > 0)
        ? geminiResult.data.candidate.education
        : extractEducationFallback(resumeText);

      structuredCertifications = geminiResult.data.candidate?.certifications || [];
      candidateSkills = mergeSkillLists(candidateSkills, geminiResult.data.candidate?.skills || []);

      shortlistJustification = geminiResult.data.shortlistJustification;

      // Overall Match Score: (40% * Basic Skill Score) + (60% * Gemini Semantic Score)
      overallMatchScore = Math.round((basicSkillScore * 0.40) + (semanticScore * 0.60));

      // Merge matched skills safely
      matchedSkills = mergeSkillLists(ruleMatch.matchedSkills, geminiResult.data.matchedSkills);

      // Merge missing skills, ensuring none of them exist in matchedSkills
      const matchedSet = new Set(matchedSkills.map(s => s.toLowerCase()));
      const rawMissing = mergeSkillLists(ruleMatch.missingSkills, geminiResult.data.missingSkills);
      missingSkills = rawMissing.filter(s => !matchedSet.has(s.toLowerCase()));

      strengths = geminiResult.data.strengths.length > 0
        ? geminiResult.data.strengths
        : (matchedSkills.length > 0 ? [`Demonstrates relevant skills: ${matchedSkills.slice(0, 4).join(', ')}`] : ['Candidate profile processed.']);

      gaps = geminiResult.data.gaps.length > 0
        ? geminiResult.data.gaps
        : (missingSkills.length > 0 ? [`Missing desired qualifications: ${missingSkills.slice(0, 3).join(', ')}`] : ['No critical skill gaps identified.']);

      summary = geminiResult.data.summary || 'AI semantic screening completed successfully.';
    } else {
      // Fallback mode when Gemini is not available
      aiUsed = false;
      semanticScore = basicSkillScore;
      experienceScore = calculateExperienceScoreFallback(resumeText, jobDescription, basicSkillScore);
      educationScore = calculateEducationScoreFallback(resumeText, jobDescription);
      overallMatchScore = basicSkillScore;
      aiFallbackNotice = geminiResult.message || 'AI analysis unavailable. ATS score is based on rule-based analysis.';

      structuredExperience = extractExperienceFallback(resumeText);
      structuredEducation = extractEducationFallback(resumeText);
      structuredCertifications = [];

      shortlistJustification = matchedSkills.length > 0
        ? `Strong candidate profile matching ${matchedSkills.length} required technical qualifications: ${matchedSkills.slice(0, 4).join(', ')}.`
        : 'Candidate evaluated via rule-based skill dictionary.';

      strengths = matchedSkills.length > 0
        ? [`Matched required technical skills: ${matchedSkills.join(', ')}`]
        : ['Profile evaluated using rule-based dictionary matching.'];

      gaps = missingSkills.length > 0
        ? [`Unmatched job requirements: ${missingSkills.join(', ')}`]
        : ['No explicit skill deficiencies detected against dictionary.'];

      summary = matchedSkills.length > 0
        ? `Candidate matched ${matchedSkills.length} of ${ruleMatch.requiredSkills.length} identified job requirements.`
        : 'Rule-based evaluation completed based on keyword and technical skill alignment.';
    }

    // 8. Calculate ATS Score:
    const effectiveSemantic = semanticScore !== null ? semanticScore : basicSkillScore;
    const effectiveExp = experienceScore !== null ? experienceScore : basicSkillScore;
    const effectiveEdu = educationScore !== null ? educationScore : 100;

    const atsScore = Math.round(
      (basicSkillScore * 0.40) +
      (effectiveSemantic * 0.30) +
      (effectiveExp * 0.15) +
      (effectiveEdu * 0.10) +
      (structureScore * 0.05)
    );

    const atsRating = getAtsRating(atsScore);
    const recommendation = getRecommendation(overallMatchScore);

    // 9. Save Candidate to MongoDB (if connected)
    let candidateId = null;
    let dbSaved = false;
    let dbNotice = null;

    if (isDbConnected()) {
      try {
        const candidateDoc = await Candidate.create({
          candidateName,
          email: candidateEmail || geminiResult.data?.candidate?.email || null,
          phone: candidatePhone || geminiResult.data?.candidate?.phone || null,
          skills: candidateSkills,
          experience: structuredExperience,
          education: structuredEducation,
          certifications: structuredCertifications,
          summary: summary || geminiResult.data?.candidate?.summary || '',
          atsScore,
          atsRating,
          overallMatchScore,
          recommendation,
          basicSkillScore,
          semanticScore,
          experienceScore: effectiveExp,
          educationScore: effectiveEdu,
          structureScore,
          matchedSkills,
          missingSkills,
          strengths,
          gaps,
          aiAssessment: summary,
          shortlistJustification,
          jobTitle: jobDescription.split('\n')[0].replace(/^job title:\s*/i, '').slice(0, 80) || 'Target Role',
          jobDescription,
          jobDescriptionSource,
          jobDescriptionSourceName,
          shortlisted: false,
          aiUsed
        });

        candidateId = candidateDoc._id;
        dbSaved = true;
      } catch (dbErr) {
        console.error('Error saving candidate to MongoDB:', dbErr.message);
        dbSaved = false;
        dbNotice = 'Resume analyzed successfully, but candidate history could not be saved.';
      }
    } else {
      dbSaved = false;
      dbNotice = 'Resume analyzed successfully. Database storage is currently offline.';
    }

    return res.status(200).json({
      success: true,
      candidateId,
      dbSaved,
      dbNotice,
      candidateName,
      candidateEmail: candidateEmail || geminiResult.data?.candidate?.email || null,
      candidatePhone: candidatePhone || geminiResult.data?.candidate?.phone || null,
      candidateSkills,
      structuredExperience,
      structuredEducation,
      structuredCertifications,
      shortlistJustification,
      basicScore: basicSkillScore,
      basicSkillScore,
      semanticScore,
      experienceScore: effectiveExp,
      educationScore: effectiveEdu,
      structureScore,
      atsScore,
      atsRating,
      finalScore: overallMatchScore,
      overallMatchScore,
      recommendation,
      matchedSkills,
      missingSkills,
      strengths,
      gaps,
      summary,
      aiUsed,
      aiFallbackNotice,
      jobDescriptionSource,
      jobDescriptionSourceName,
      jobDescriptionText: jobDescription,
      resumeText,
      atsBreakdown: {
        skillScore: basicSkillScore,
        skillWeight: '40%',
        semanticScore: effectiveSemantic,
        semanticWeight: '30%',
        experienceScore: effectiveExp,
        experienceWeight: '15%',
        educationScore: effectiveEdu,
        educationWeight: '10%',
        structureScore,
        structureWeight: '5%',
        atsScore,
        atsRating
      },
      scoreBreakdown: {
        basicWeight: 0.40,
        semanticWeight: 0.60,
        basicScore: basicSkillScore,
        semanticScore,
        finalScore: overallMatchScore,
        aiUsed
      }
    });
  } catch (error) {
    console.error('Unhandled Controller Error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during resume analysis. Please try again.'
    });
  }
}

module.exports = {
  analyzeResume
};
