import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  User,
  AlertTriangle,
  FileText,
  BarChart3,
  Cpu,
  Layers,
  Award,
  Info,
  FileCode,
  Star,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Database
} from 'lucide-react';
import SkillBadge from './SkillBadge';

export default function Results({ data, onShortlistToggle }) {
  const [showResumeText, setShowResumeText] = useState(false);
  const [showJdText, setShowJdText] = useState(false);
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedJd, setCopiedJd] = useState(false);
  const [isShortlistedLocal, setIsShortlistedLocal] = useState(false);

  if (!data) return null;

  const {
    candidateId,
    dbSaved,
    dbNotice,
    candidateName,
    candidateEmail,
    candidatePhone,
    candidateSkills = [],
    structuredExperience = [],
    structuredEducation = [],
    structuredCertifications = [],
    shortlistJustification = '',
    basicScore = 0,
    basicSkillScore = basicScore,
    semanticScore,
    experienceScore = 80,
    educationScore = 100,
    structureScore = 80,
    atsScore = 85,
    atsRating = 'Good',
    finalScore = 0,
    overallMatchScore = finalScore,
    recommendation = 'Match Evaluation',
    matchedSkills = [],
    missingSkills = [],
    strengths = [],
    gaps = [],
    summary = '',
    aiUsed = false,
    aiFallbackNotice,
    jobDescriptionSource = 'text',
    jobDescriptionSourceName = 'Text Input',
    jobDescriptionText = '',
    resumeText = '',
    atsBreakdown,
    scoreBreakdown
  } = data;

  const handleShortlistClick = () => {
    const nextState = !isShortlistedLocal;
    setIsShortlistedLocal(nextState);
    if (candidateId && onShortlistToggle) {
      onShortlistToggle(candidateId, nextState);
    }
  };

  const getRecommendationClass = (rec) => {
    switch (rec) {
      case 'Strong Match':
        return 'recommendation-strong';
      case 'Good Match':
        return 'recommendation-good';
      case 'Partial Match':
        return 'recommendation-partial';
      default:
        return 'recommendation-low';
    }
  };

  const getAtsRatingClass = (rating) => {
    switch (rating) {
      case 'Excellent':
        return 'ats-rating-excellent';
      case 'Good':
        return 'ats-rating-good';
      case 'Fair':
        return 'ats-rating-fair';
      default:
        return 'ats-rating-needs-improvement';
    }
  };

  const getStrokeColor = (score) => {
    if (score >= 80) return '#10b981'; // emerald
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  // SVG Gauge calculations
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallMatchScore / 100) * circumference;

  const handleCopyResumeText = async () => {
    try {
      await navigator.clipboard.writeText(resumeText);
      setCopiedResume(true);
      setTimeout(() => setCopiedResume(false), 2000);
    } catch (err) {
      console.error('Failed to copy resume text', err);
    }
  };

  const handleCopyJdText = async () => {
    try {
      await navigator.clipboard.writeText(jobDescriptionText);
      setCopiedJd(true);
      setTimeout(() => setCopiedJd(false), 2000);
    } catch (err) {
      console.error('Failed to copy JD text', err);
    }
  };

  // ATS Component Progress Bars
  const breakdownItems = [
    {
      label: 'Skills / Keywords',
      weight: '40%',
      score: atsBreakdown?.skillScore ?? basicSkillScore,
      color: '#4f46e5'
    },
    {
      label: 'Semantic Alignment',
      weight: '30%',
      score: atsBreakdown?.semanticScore ?? (semanticScore !== null ? semanticScore : basicSkillScore),
      color: '#6366f1'
    },
    {
      label: 'Experience Alignment',
      weight: '15%',
      score: atsBreakdown?.experienceScore ?? experienceScore,
      color: '#0ea5e9'
    },
    {
      label: 'Education / Certification',
      weight: '10%',
      score: atsBreakdown?.educationScore ?? educationScore,
      color: '#10b981'
    },
    {
      label: 'Resume Structure',
      weight: '5%',
      score: atsBreakdown?.structureScore ?? structureScore,
      color: '#f59e0b'
    }
  ];

  return (
    <div className="results-dashboard">
      {/* Fallback Notice Banner if AI was unavailable */}
      {!aiUsed && (
        <div className="alert-box alert-warning" role="status">
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Rule-Based Analysis Active:</strong>{' '}
            {aiFallbackNotice ||
              'AI analysis unavailable. ATS score is based on rule-based analysis.'}
          </div>
        </div>
      )}

      {/* Database Status Notice */}
      {dbNotice && (
        <div className="alert-box alert-info" role="status">
          <Database size={16} style={{ flexShrink: 0 }} />
          <span>{dbNotice}</span>
        </div>
      )}

      {/* Meta Bar: Candidate Info + JD Source + Shortlist Button */}
      <div className="results-meta-bar">
        <div className="candidate-name-pill">
          <User size={14} />
          <span>Candidate: <strong>{candidateName || 'Not detected'}</strong></span>
          {candidateEmail && <span className="meta-subtext"> • {candidateEmail}</span>}
          {candidatePhone && <span className="meta-subtext"> • {candidatePhone}</span>}
        </div>

        <div className="results-meta-actions">
          <div className="jd-source-badge" title={`Job Description parsed via ${jobDescriptionSourceName}`}>
            {jobDescriptionSource === 'pdf' ? <FileCode size={14} /> : <FileText size={14} />}
            <span>
              JD: <strong>{jobDescriptionSource === 'pdf' ? `PDF (${jobDescriptionSourceName})` : 'Text'}</strong>
            </span>
          </div>

          <button
            type="button"
            className={`shortlist-toggle-btn ${isShortlistedLocal ? 'is-shortlisted' : ''}`}
            onClick={handleShortlistClick}
            title={isShortlistedLocal ? 'Remove from Shortlist' : 'Shortlist Candidate'}
          >
            <Star
              size={14}
              fill={isShortlistedLocal ? '#f59e0b' : 'none'}
              color={isShortlistedLocal ? '#f59e0b' : 'currentColor'}
            />
            <span>{isShortlistedLocal ? 'Shortlisted' : 'Shortlist'}</span>
          </button>
        </div>
      </div>

      {/* Dual Hero Score Cards Grid: ATS Score + Overall Match */}
      <div className="dual-score-grid">
        {/* Card 1: ATS SCORE */}
        <div className="score-hero-card ats-hero-card">
          <div className="score-meta-left">
            <div className="ats-card-title">
              <Award size={16} />
              <span>ATS SCORE</span>
            </div>
            <div className="ats-score-display">
              <span className="ats-score-number">{atsScore}</span>
              <span className="ats-score-denom">/100</span>
            </div>
            <div className={`ats-rating-tag ${getAtsRatingClass(atsRating)}`}>
              {atsRating}
            </div>
            <div className="score-label" style={{ marginTop: '0.25rem' }}>
              ATS Compatibility Rating
            </div>
          </div>
        </div>

        {/* Card 2: OVERALL MATCH SCORE */}
        <div className="score-hero-card overall-hero-card">
          <div className="score-meta-left">
            <div className="ats-card-title" style={{ color: '#c7d2fe' }}>
              <Layers size={16} />
              <span>OVERALL MATCH</span>
            </div>
            <div className={`recommendation-badge ${getRecommendationClass(recommendation)}`}>
              {recommendation}
            </div>
            <div className="score-label">Role Compatibility Match</div>
          </div>

          {/* Circular Score Gauge */}
          <div className="score-gauge-wrap" aria-label={`Overall Match: ${overallMatchScore}%`}>
            <svg className="score-gauge-svg" width="88" height="88" viewBox="0 0 88 88">
              <circle
                className="gauge-bg"
                cx="44"
                cy="44"
                r={radius}
                strokeWidth="7"
                fill="none"
              />
              <circle
                className="gauge-bar"
                cx="44"
                cy="44"
                r={radius}
                strokeWidth="7"
                stroke={getStrokeColor(overallMatchScore)}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                fill="none"
              />
            </svg>
            <div className="score-gauge-text">
              <span className="gauge-number">{overallMatchScore}</span>
              <span className="gauge-pct">% Match</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ats-explanation-note">
        <Info size={14} style={{ flexShrink: 0 }} />
        <span>
          ATS score is an automated compatibility estimate based on the resume's alignment with the provided job description.
        </span>
      </div>

      {/* Shortlist Justification Callout */}
      {shortlistJustification && (
        <div className="shortlist-justification-card">
          <div className="justification-header">
            <Star size={15} fill="#f59e0b" color="#f59e0b" />
            <span>Shortlist Justification</span>
          </div>
          <p className="justification-text">{shortlistJustification}</p>
        </div>
      )}

      {/* ATS Score Breakdown Card */}
      <div className="breakdown-card">
        <div className="breakdown-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BarChart3 size={16} color="var(--primary)" />
            ATS Score Breakdown
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
            Final ATS Score: {atsScore}/100
          </span>
        </div>

        <div className="ats-progress-list">
          {breakdownItems.map((item, idx) => (
            <div key={idx} className="ats-progress-row">
              <div className="ats-progress-labels">
                <span className="ats-progress-name">{item.label}</span>
                <div className="ats-progress-vals">
                  <span className="ats-progress-weight">Weight: {item.weight}</span>
                  <span className="ats-progress-score">
                    <strong>{item.score}</strong>/100
                  </span>
                </div>
              </div>
              <div className="ats-progress-track">
                <div
                  className="ats-progress-fill"
                  style={{
                    width: `${Math.max(4, Math.min(100, item.score))}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Structured Work Experience */}
      {structuredExperience && structuredExperience.length > 0 && (
        <div className="profile-section">
          <h4 className="section-subtitle">
            <Briefcase size={15} color="var(--primary)" />
            Extracted Work Experience ({structuredExperience.length})
          </h4>
          <div className="timeline-list">
            {structuredExperience.map((exp, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-role">{exp.role || 'Role'}</div>
                  <div className="timeline-company-row">
                    <span className="timeline-company">{exp.company || 'Company'}</span>
                    {exp.duration && (
                      <span className="timeline-duration">{exp.duration}</span>
                    )}
                  </div>
                  {exp.description && (
                    <p className="timeline-desc">{exp.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structured Education */}
      {structuredEducation && structuredEducation.length > 0 && (
        <div className="profile-section">
          <h4 className="section-subtitle">
            <GraduationCap size={15} color="var(--primary)" />
            Extracted Education ({structuredEducation.length})
          </h4>
          <div className="education-grid">
            {structuredEducation.map((edu, idx) => (
              <div key={idx} className="education-card">
                <div className="edu-degree">
                  {edu.degree || 'Degree'} {edu.field ? `in ${edu.field}` : ''}
                </div>
                <div className="edu-institution">{edu.institution || 'Institution'}</div>
                {edu.year && <div className="edu-year">{edu.year}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structured Certifications */}
      {structuredCertifications && structuredCertifications.length > 0 && (
        <div className="profile-section">
          <h4 className="section-subtitle">
            <Award size={15} color="var(--primary)" />
            Certifications ({structuredCertifications.length})
          </h4>
          <div className="skills-badge-list">
            {structuredCertifications.map((cert, idx) => (
              <span key={idx} className="cert-pill">
                <Award size={12} />
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Matched Skills */}
      <div className="skills-section">
        <div className="skills-heading">
          <CheckCircle2 size={16} color="var(--success-dark)" />
          <span>Matched Skills ({matchedSkills.length})</span>
        </div>

        {matchedSkills.length > 0 ? (
          <div className="skills-badge-list">
            {matchedSkills.map((skill, idx) => (
              <SkillBadge key={idx} name={skill} type="matched" />
            ))}
          </div>
        ) : (
          <p className="skills-empty-note">No matching skills identified against job requirements.</p>
        )}
      </div>

      {/* Missing Skills */}
      <div className="skills-section">
        <div className="skills-heading">
          <XCircle size={16} color="var(--danger-dark)" />
          <span>Missing Skills ({missingSkills.length})</span>
        </div>

        {missingSkills.length > 0 ? (
          <div className="skills-badge-list">
            {missingSkills.map((skill, idx) => (
              <SkillBadge key={idx} name={skill} type="missing" />
            ))}
          </div>
        ) : (
          <p className="skills-empty-note">All identified job skills are present in the candidate profile.</p>
        )}
      </div>

      {/* Candidate Strengths, Gaps & AI Summary */}
      <div className="assessment-card">
        <div className="assessment-header">
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Candidate Assessment
          </span>
          {aiUsed ? (
            <span className="ai-badge">
              <Cpu size={12} />
              Gemini AI Analyzed
            </span>
          ) : (
            <span className="panel-badge">Rule-Based Matcher</span>
          )}
        </div>

        {summary && (
          <div className="ai-summary-text">
            <strong>Assessment Summary:</strong> {summary}
          </div>
        )}

        <div className="strengths-gaps-grid">
          {/* Strengths */}
          <div className="bullets-box">
            <div className="bullets-title bullets-title-strengths">
              <CheckCircle2 size={14} />
              Candidate Strengths
            </div>
            {strengths && strengths.length > 0 ? (
              <ul className="bullet-list">
                {strengths.map((item, idx) => (
                  <li key={idx} className="bullet-list-item">
                    <span className="bullet-dot-strength">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="skills-empty-note">No specific strengths cataloged.</p>
            )}
          </div>

          {/* Gaps */}
          <div className="bullets-box">
            <div className="bullets-title bullets-title-gaps">
              <XCircle size={14} />
              Potential Gaps
            </div>
            {gaps && gaps.length > 0 ? (
              <ul className="bullet-list">
                {gaps.map((item, idx) => (
                  <li key={idx} className="bullet-list-item">
                    <span className="bullet-dot-gap">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="skills-empty-note">No critical gaps identified.</p>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Job Description Preview / Extracted Text */}
      {jobDescriptionText && (
        <div className="resume-text-card">
          <button
            type="button"
            className="resume-text-toggle"
            onClick={() => setShowJdText(!showJdText)}
            aria-expanded={showJdText}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {jobDescriptionSource === 'pdf' ? (
                <FileCode size={16} color="var(--primary)" />
              ) : (
                <FileText size={16} color="var(--primary)" />
              )}
              {jobDescriptionSource === 'pdf'
                ? 'View Extracted Job Description'
                : 'Job Description Preview'}
            </span>
            {showJdText ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showJdText && (
            <div className="resume-text-content">
              <div className="resume-text-actions">
                <button
                  type="button"
                  className="copy-btn"
                  onClick={handleCopyJdText}
                  title="Copy job description text to clipboard"
                >
                  {copiedJd ? (
                    <>
                      <Check size={12} color="var(--success-dark)" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      Copy JD Text
                    </>
                  )}
                </button>
              </div>
              <pre className="extracted-pre">{jobDescriptionText}</pre>
            </div>
          )}
        </div>
      )}

      {/* Collapsible Extracted Resume Text */}
      {resumeText && (
        <div className="resume-text-card">
          <button
            type="button"
            className="resume-text-toggle"
            onClick={() => setShowResumeText(!showResumeText)}
            aria-expanded={showResumeText}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} color="var(--primary)" />
              View Extracted Resume Text
            </span>
            {showResumeText ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showResumeText && (
            <div className="resume-text-content">
              <div className="resume-text-actions">
                <button
                  type="button"
                  className="copy-btn"
                  onClick={handleCopyResumeText}
                  title="Copy extracted text to clipboard"
                >
                  {copiedResume ? (
                    <>
                      <Check size={12} color="var(--success-dark)" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      Copy Resume Text
                    </>
                  )}
                </button>
              </div>
              <pre className="extracted-pre">{resumeText}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
