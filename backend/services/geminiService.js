const { GoogleGenAI } = require('@google/genai');

/**
 * Perform semantic analysis on Resume and Job Description using Gemini AI
 * @param {string} resumeText - Extracted text of resume
 * @param {string} jobDescription - Pasted job description
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
async function analyzeWithGemini(resumeText, jobDescription) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.trim() === 'your_api_key_here') {
    return {
      success: false,
      reason: 'NO_API_KEY',
      message: 'AI analysis unavailable. Results are based on skill matching.'
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

    const prompt = `You are an AI resume screening and information extraction assistant.

Analyze the candidate resume against the provided job description.

Extract structured information from the resume and evaluate the candidate only on job-relevant qualifications.

Extract:
- Candidate name when clearly available (or null if uncertain)
- Candidate email when clearly available (or null)
- Candidate phone when clearly available (or null)
- Technical & domain skills
- Work experience (company, role, duration, relevant responsibilities/description)
- Education (institution, degree, field, year)
- Certifications (certification name)
- Professional summary (concise summary based only on the resume)

Also evaluate against the job description:
- Semantic relevance score (0-100)
- Experience alignment score (0-100)
- Education alignment score (0-100) (default to 100 if job description does not require specific education)
- Matched skills
- Missing skills
- Candidate strengths
- Potential gaps
- Concise AI assessment summary
- Shortlist justification (1-2 sentences explaining why the candidate is a strong fit or their top qualifications for this role)

Do not invent information. If information is not present, return null or an empty array.

Do NOT evaluate candidates based on:
- Age
- Gender
- Religion
- Race or ethnicity
- Disability
- Marital status
- Photograph
- Personal appearance
- Name
- Address or location unless explicitly job-relevant

Return ONLY valid JSON.

Required JSON structure:
{
  "candidate": {
    "name": null,
    "email": null,
    "phone": null,
    "skills": [],
    "experience": [
      {
        "company": "",
        "role": "",
        "duration": "",
        "description": ""
      }
    ],
    "education": [
      {
        "institution": "",
        "degree": "",
        "field": "",
        "year": ""
      }
    ],
    "certifications": [],
    "summary": ""
  },
  "semanticScore": 0,
  "experienceScore": 0,
  "educationScore": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "strengths": [],
  "gaps": [],
  "summary": "",
  "shortlistJustification": ""
}

Resume:
${resumeText}

Job Description:
${jobDescription}`;

    // List of supported models in fallback priority order (fastest & high availability first)
    const candidateModels = [
      'gemini-flash-lite-latest',
      'gemini-3.5-flash-lite',
      'gemini-3.6-flash',
      'gemini-3.7-flash',
      'gemini-flash-latest'
    ];

    let lastError = null;
    let rawText = '';

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        if (response && response.text) {
          rawText = typeof response.text === 'function' ? response.text() : response.text;
        } else if (response && response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
          rawText = response.candidates[0].content.parts[0].text;
        }

        if (rawText && rawText.trim().length > 0) {
          break; // Successfully received response
        }
      } catch (err) {
        lastError = err;
        console.warn(`Gemini attempt with model [${model}] failed: ${err.message || err}. Trying next fallback model...`);
      }
    }

    if (!rawText) {
      throw lastError || new Error('Empty response from all Gemini models');
    }

    // Clean any markdown wrapper if present
    const cleanedJson = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanedJson);

    // Validate and sanitize the parsed response
    const sanitized = validateAndSanitizeGeminiResponse(parsed);

    return {
      success: true,
      data: sanitized
    };
  } catch (error) {
    console.error('Gemini Service Error:', error.message || error);
    return {
      success: false,
      reason: 'API_ERROR',
      message: 'AI analysis is temporarily unavailable. Basic skill matching has been used instead.'
    };
  }
}

/**
 * Validate and sanitize Gemini JSON response
 * @param {object} parsed
 * @returns {object} Sanitized structure
 */
function validateAndSanitizeGeminiResponse(parsed) {
  let score = Number(parsed.semanticScore);
  if (isNaN(score)) score = 50;
  score = Math.max(0, Math.min(100, Math.round(score)));

  let expScore = Number(parsed.experienceScore);
  if (isNaN(expScore)) expScore = score;
  expScore = Math.max(0, Math.min(100, Math.round(expScore)));

  let eduScore = Number(parsed.educationScore);
  if (isNaN(eduScore)) eduScore = 100;
  eduScore = Math.max(0, Math.min(100, Math.round(eduScore)));

  const matchedSkills = Array.isArray(parsed.matchedSkills)
    ? parsed.matchedSkills.filter(s => typeof s === 'string' && s.trim().length > 0).map(s => s.trim())
    : [];

  const missingSkills = Array.isArray(parsed.missingSkills)
    ? parsed.missingSkills.filter(s => typeof s === 'string' && s.trim().length > 0).map(s => s.trim())
    : [];

  const strengths = Array.isArray(parsed.strengths)
    ? parsed.strengths.filter(s => typeof s === 'string' && s.trim().length > 0).map(s => s.trim())
    : [];

  const gaps = Array.isArray(parsed.gaps)
    ? parsed.gaps.filter(s => typeof s === 'string' && s.trim().length > 0).map(s => s.trim())
    : [];

  const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
  const shortlistJustification =
    typeof parsed.shortlistJustification === 'string' && parsed.shortlistJustification.trim().length > 0
      ? parsed.shortlistJustification.trim()
      : (summary || 'Candidate demonstrates relevant alignment with job requirements.');

  // Sanitize structured candidate object
  const rawCand = parsed.candidate || {};
  const candidate = {
    name: typeof rawCand.name === 'string' && rawCand.name.trim().length > 0 ? rawCand.name.trim() : null,
    email: typeof rawCand.email === 'string' && rawCand.email.includes('@') ? rawCand.email.trim() : null,
    phone: typeof rawCand.phone === 'string' && rawCand.phone.trim().length > 0 ? rawCand.phone.trim() : null,
    skills: Array.isArray(rawCand.skills)
      ? rawCand.skills.filter(s => typeof s === 'string' && s.trim().length > 0).map(s => s.trim())
      : [],
    experience: Array.isArray(rawCand.experience)
      ? rawCand.experience.map(exp => ({
          company: typeof exp.company === 'string' ? exp.company.trim() : '',
          role: typeof exp.role === 'string' ? exp.role.trim() : '',
          duration: typeof exp.duration === 'string' ? exp.duration.trim() : '',
          description: typeof exp.description === 'string' ? exp.description.trim() : ''
        }))
      : [],
    education: Array.isArray(rawCand.education)
      ? rawCand.education.map(edu => ({
          institution: typeof edu.institution === 'string' ? edu.institution.trim() : '',
          degree: typeof edu.degree === 'string' ? edu.degree.trim() : '',
          field: typeof edu.field === 'string' ? edu.field.trim() : '',
          year: typeof edu.year === 'string' ? edu.year.trim() : ''
        }))
      : [],
    certifications: Array.isArray(rawCand.certifications)
      ? rawCand.certifications.filter(c => typeof c === 'string' && c.trim().length > 0).map(c => c.trim())
      : [],
    summary: typeof rawCand.summary === 'string' ? rawCand.summary.trim() : ''
  };

  return {
    candidate,
    semanticScore: score,
    experienceScore: expScore,
    educationScore: eduScore,
    matchedSkills,
    missingSkills,
    strengths,
    gaps,
    summary,
    shortlistJustification
  };
}

module.exports = {
  analyzeWithGemini
};
