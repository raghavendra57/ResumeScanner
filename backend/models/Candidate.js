const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    duration: { type: String, default: '' },
    description: { type: String, default: '' }
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, default: '' },
    degree: { type: String, default: '' },
    field: { type: String, default: '' },
    year: { type: String, default: '' }
  },
  { _id: false }
);

const candidateSchema = new mongoose.Schema(
  {
    candidateName: { type: String, required: true, default: 'Not detected' },
    email: { type: String, default: null },
    phone: { type: String, default: null },

    // Structured candidate extraction
    skills: [{ type: String }],
    experience: [experienceSchema],
    education: [educationSchema],
    certifications: [{ type: String }],
    summary: { type: String, default: '' },

    // Match & ATS Scores
    atsScore: { type: Number, required: true, default: 0 },
    atsRating: { type: String, default: 'Good' },
    overallMatchScore: { type: Number, required: true, default: 0 },
    recommendation: { type: String, default: 'Good Match' },
    basicSkillScore: { type: Number, default: 0 },
    semanticScore: { type: Number, default: null },
    experienceScore: { type: Number, default: 0 },
    educationScore: { type: Number, default: 100 },
    structureScore: { type: Number, default: 80 },

    // Skills & Gap analysis
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    strengths: [{ type: String }],
    gaps: [{ type: String }],

    // AI Assessment & Justification
    aiAssessment: { type: String, default: '' },
    shortlistJustification: { type: String, default: '' },

    // Job Context
    jobTitle: { type: String, default: 'Software Engineer' },
    jobDescription: { type: String, default: '' },
    jobDescriptionSource: { type: String, enum: ['text', 'pdf'], default: 'text' },
    jobDescriptionSourceName: { type: String, default: 'Text Input' },

    // State & Metadata
    shortlisted: { type: Boolean, default: false },
    aiUsed: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

// Index for fast sorting by newest
candidateSchema.index({ createdAt: -1 });
candidateSchema.index({ shortlisted: 1, createdAt: -1 });

module.exports = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);
