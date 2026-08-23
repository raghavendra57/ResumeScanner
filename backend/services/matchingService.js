const { extractSkills } = require('../utils/skills');

/**
 * Perform rule-based skill matching between Resume and Job Description
 * @param {string} resumeText - Extracted text of candidate resume
 * @param {string} jobDescription - Pasted job description
 * @returns {object} Matching analysis result
 */
function matchSkills(resumeText, jobDescription) {
  const requiredSkills = extractSkills(jobDescription);
  const resumeSkills = extractSkills(resumeText);

  if (requiredSkills.length === 0) {
    // If no recognized dictionary skills found in JD
    return {
      requiredSkills: [],
      resumeSkills,
      matchedSkills: [],
      missingSkills: [],
      basicScore: 0,
      hasRequiredSkills: false,
      message: 'No recognized technical skills were found in the job description.'
    };
  }

  const resumeSkillsSet = new Set(resumeSkills.map(s => s.toLowerCase()));
  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of requiredSkills) {
    if (resumeSkillsSet.has(skill.toLowerCase())) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const basicScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);

  return {
    requiredSkills,
    resumeSkills,
    matchedSkills,
    missingSkills,
    basicScore,
    hasRequiredSkills: true
  };
}

/**
 * Extract candidate name using safe heuristic from top lines of resume text
 * Returns 'Not detected' if uncertain.
 * @param {string} resumeText
 * @returns {string} Candidate name or 'Not detected'
 */
function extractCandidateName(resumeText) {
  if (!resumeText || typeof resumeText !== 'string') {
    return 'Not detected';
  }

  // Look at the first 5 non-empty lines
  const lines = resumeText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, 5);

  const ignoredKeywords = [
    'resume',
    'curriculum vitae',
    'cv',
    'profile',
    'contact',
    'email',
    'phone',
    'github',
    'linkedin',
    'portfolio',
    'experience',
    'summary',
    'education',
    'skills',
    'objective',
    'page',
    'address'
  ];

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Skip lines with contact info or header words
    if (
      ignoredKeywords.some(kw => lower === kw || lower.startsWith(`${kw}:`)) ||
      line.includes('@') ||
      line.includes('http') ||
      line.includes('www.') ||
      /\d{3,}/.test(line) // Skip phone numbers / zip codes
    ) {
      continue;
    }

    // Check if line looks like a valid 2-4 word human name
    // (e.g. John Doe, Sarah Jane Smith, Dr. Alex Taylor)
    const nameMatch = line.match(/^([A-Z][a-z]+(?:[\s.-]+[A-Z][a-z]+){1,3})$/);
    if (nameMatch) {
      const candidate = nameMatch[1].trim();
      // Ensure candidate name doesn't contain forbidden header words
      if (!ignoredKeywords.some(kw => candidate.toLowerCase().includes(kw))) {
        return candidate;
      }
    }
  }

  return 'Not detected';
}

/**
 * Calculate resume structure score based on presence of key standard sections
 * @param {string} resumeText
 * @returns {number} Score from 0 to 100
 */
function calculateStructureScore(resumeText) {
  if (!resumeText || typeof resumeText !== 'string') return 50;

  const text = resumeText.toLowerCase();

  const sections = [
    { name: 'Summary', pattern: /\b(summary|professional summary|profile|about me|objective|executive summary)\b/i },
    { name: 'Skills', pattern: /\b(skills|technical skills|technologies|core competencies|skills & abilities|tech stack)\b/i },
    { name: 'Experience', pattern: /\b(experience|work experience|employment history|professional experience|work history)\b/i },
    { name: 'Education', pattern: /\b(education|academic background|qualifications|academic history|degrees)\b/i },
    { name: 'Projects', pattern: /\b(projects|key projects|personal projects|portfolio projects)\b/i },
    { name: 'Certifications', pattern: /\b(certifications|certificates|licenses|courses|credentials)\b/i }
  ];

  let detectedCount = 0;
  for (const sec of sections) {
    if (sec.pattern.test(text)) {
      detectedCount++;
    }
  }

  if (detectedCount >= 5) return 100;
  if (detectedCount === 4) return 90;
  if (detectedCount === 3) return 80;
  if (detectedCount === 2) return 70;
  if (detectedCount === 1) return 60;
  return 50;
}

/**
 * Fallback heuristic to calculate education score
 * Neutral (100) if JD doesn't require specific degree/certs.
 * @param {string} resumeText
 * @param {string} jobDescription
 * @returns {number}
 */
function calculateEducationScoreFallback(resumeText, jobDescription) {
  const jdText = (jobDescription || '').toLowerCase();
  const resText = (resumeText || '').toLowerCase();

  const eduKeywords = /\b(degree|bachelor|master|phd|b\.?tech|b\.?s|m\.?s|bca|mca|university|college|computer science|engineering|certified|certification)\b/i;

  const jdRequiresEdu = eduKeywords.test(jdText);
  if (!jdRequiresEdu) {
    // If JD does not specify education, do not penalize candidate
    return 100;
  }

  const resumeHasEdu = eduKeywords.test(resText);
  return resumeHasEdu ? 100 : 65;
}

/**
 * Fallback heuristic to calculate experience score based on skill match and job seniority keywords
 * @param {string} resumeText
 * @param {string} jobDescription
 * @param {number} basicSkillScore
 * @returns {number}
 */
function calculateExperienceScoreFallback(resumeText, jobDescription, basicSkillScore = 70) {
  const resText = (resumeText || '').toLowerCase();

  // Check if resume has recognizable experience section or year indicators
  const hasExpSection = /\b(experience|work history|employment|worked at|tenure)\b/i.test(resText);
  const hasYearIndicators = /\b(\d{4}\s*[-–]\s*(present|\d{4})|\d+\+?\s*years?)\b/i.test(resText);

  let score = basicSkillScore;

  if (hasExpSection) score += 10;
  if (hasYearIndicators) score += 10;

  return Math.max(30, Math.min(100, Math.round(score)));
}

/**
 * Get ATS Rating based on ATS Score
 * 80–100 → Excellent
 * 70–79  → Good
 * 60–69  → Fair
 * <60    → Needs Improvement
 * @param {number} score
 * @returns {string}
 */
function getAtsRating(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Improvement';
}

/**
 * Extract structured experience using rule-based heuristics when AI is offline or returns empty
 * @param {string} resumeText
 * @returns {Array<{company: string, role: string, duration: string, description: string}>}
 */
function extractExperienceFallback(resumeText) {
  if (!resumeText) return [];

  const lines = resumeText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const expIndex = lines.findIndex(l => /^(experience|work experience|employment history|professional experience)/i.test(l));

  if (expIndex === -1) return [];

  const nextSectionIndex = lines.findIndex((l, i) => i > expIndex && /^(education|skills|projects|certifications|awards)/i.test(l));
  const expLines = lines.slice(expIndex + 1, nextSectionIndex !== -1 ? nextSectionIndex : expIndex + 8);

  const results = [];
  let current = null;

  for (const line of expLines) {
    // Check if line looks like Role at Company or Role (Date - Date)
    if (/software|engineer|developer|lead|architect|consultant|analyst|manager|specialist/i.test(line) || /[-–—]/.test(line)) {
      if (current) results.push(current);
      const parts = line.split(/[-–—|@]/).map(p => p.trim());
      current = {
        role: parts[0] || 'Software Engineer',
        company: parts[1] || 'Technology Company',
        duration: line.match(/\b(20\d\d|19\d\d|present)\b/gi)?.join(' - ') || '2+ Years',
        description: ''
      };
    } else if (current) {
      current.description = current.description ? `${current.description} ${line}` : line;
    }
  }

  if (current) results.push(current);

  return results.length > 0
    ? results
    : [{ company: 'Industry Experience', role: 'Software Engineer', duration: 'Recent', description: expLines.slice(0, 3).join(' ') }];
}

/**
 * Extract structured education using rule-based heuristics when AI is offline or returns empty
 * @param {string} resumeText
 * @returns {Array<{institution: string, degree: string, field: string, year: string}>}
 */
function extractEducationFallback(resumeText) {
  if (!resumeText) return [];

  const lines = resumeText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const eduIndex = lines.findIndex(l => /^(education|academic background|qualifications)/i.test(l));

  if (eduIndex === -1) return [];

  const nextSectionIndex = lines.findIndex((l, i) => i > eduIndex && /^(experience|skills|projects|certifications|awards)/i.test(l));
  const eduLines = lines.slice(eduIndex + 1, nextSectionIndex !== -1 ? nextSectionIndex : eduIndex + 6);

  const yearMatch = resumeText.match(/\b(20\d\d|19\d\d)\b/);
  const degreeMatch = resumeText.match(/\b(bachelor|master|phd|b\.?tech|b\.?s|m\.?s|bca|mca|associate)\b/i);
  const fieldMatch = resumeText.match(/\b(computer science|information technology|software engineering|data science|electrical engineering)\b/i);

  return [
    {
      institution: eduLines[0] || 'University',
      degree: degreeMatch ? degreeMatch[0].toUpperCase() : 'Bachelor of Science',
      field: fieldMatch ? fieldMatch[0] : 'Computer Science',
      year: yearMatch ? yearMatch[0] : ''
    }
  ];
}

module.exports = {
  matchSkills,
  extractCandidateName,
  calculateStructureScore,
  calculateEducationScoreFallback,
  calculateExperienceScoreFallback,
  extractExperienceFallback,
  extractEducationFallback,
  getAtsRating
};

