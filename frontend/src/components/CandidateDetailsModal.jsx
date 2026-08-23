import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  Layers,
  Star,
  Briefcase,
  GraduationCap,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Cpu,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import SkillBadge from './SkillBadge';

export default function CandidateDetailsModal({
  candidate,
  onClose,
  onShortlistToggle,
  onDelete
}) {
  const [showJd, setShowJd] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!candidate) return null;

  const {
    _id,
    candidateName = 'Not detected',
    email,
    phone,
    skills = [],
    experience = [],
    education = [],
    certifications = [],
    summary = '',
    atsScore = 0,
    atsRating = 'Good',
    overallMatchScore = 0,
    recommendation = 'Match Evaluation',
    matchedSkills = [],
    missingSkills = [],
    strengths = [],
    gaps = [],
    aiAssessment = '',
    shortlistJustification = '',
    jobTitle = 'Target Role',
    jobDescription = '',
    jobDescriptionSourceName = 'Text Input',
    shortlisted = false,
    aiUsed = false,
    createdAt
  } = candidate;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '';
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

  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete ${candidateName}'s record? This action cannot be undone.`)) {
      onDelete(_id);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-avatar">
              <User size={24} />
            </div>
            <div>
              <div className="modal-candidate-name">{candidateName}</div>
              <div className="modal-candidate-meta">
                {email && (
                  <span className="meta-item">
                    <Mail size={13} /> {email}
                  </span>
                )}
                {phone && (
                  <span className="meta-item">
                    <Phone size={13} /> {phone}
                  </span>
                )}
                {createdAt && (
                  <span className="meta-item">
                    <Calendar size={13} /> {formatDate(createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="modal-header-actions">
            <button
              type="button"
              className={`shortlist-toggle-btn ${shortlisted ? 'is-shortlisted' : ''}`}
              onClick={() => onShortlistToggle(_id, !shortlisted)}
              title={shortlisted ? 'Remove from Shortlist' : 'Shortlist Candidate'}
            >
              <Star size={15} fill={shortlisted ? '#f59e0b' : 'none'} color={shortlisted ? '#f59e0b' : 'currentColor'} />
              <span>{shortlisted ? 'Shortlisted' : 'Shortlist'}</span>
            </button>

            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close candidate details modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body">
          {/* Dual Score Row */}
          <div className="dual-score-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="score-hero-card ats-hero-card">
              <div className="ats-card-title">
                <Award size={15} />
                <span>ATS SCORE</span>
              </div>
              <div className="ats-score-display">
                <span className="ats-score-number">{atsScore}</span>
                <span className="ats-score-denom">/100</span>
              </div>
              <div className={`ats-rating-tag ${getAtsRatingClass(atsRating)}`}>
                {atsRating}
              </div>
            </div>

            <div className="score-hero-card overall-hero-card">
              <div className="ats-card-title" style={{ color: '#c7d2fe' }}>
                <Layers size={15} />
                <span>OVERALL MATCH</span>
              </div>
              <div className="ats-score-display">
                <span className="ats-score-number">{overallMatchScore}</span>
                <span className="ats-score-denom">%</span>
              </div>
              <div className={`recommendation-badge ${getRecommendationClass(recommendation)}`}>
                {recommendation}
              </div>
            </div>
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

          {/* Professional Summary */}
          {summary && (
            <div className="profile-section">
              <h4 className="section-subtitle">
                <FileText size={15} color="var(--primary)" />
                Professional Summary
              </h4>
              <p className="profile-summary-text">{summary}</p>
            </div>
          )}

          {/* Structured Skills */}
          {skills && skills.length > 0 && (
            <div className="profile-section">
              <h4 className="section-subtitle">
                <FileCheck2 size={15} color="var(--primary)" />
                Extracted Skills ({skills.length})
              </h4>
              <div className="skills-badge-list">
                {skills.map((skill, idx) => (
                  <span key={idx} className="skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Structured Work Experience */}
          {experience && experience.length > 0 && (
            <div className="profile-section">
              <h4 className="section-subtitle">
                <Briefcase size={15} color="var(--primary)" />
                Work Experience ({experience.length})
              </h4>
              <div className="timeline-list">
                {experience.map((exp, idx) => (
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
          {education && education.length > 0 && (
            <div className="profile-section">
              <h4 className="section-subtitle">
                <GraduationCap size={15} color="var(--primary)" />
                Education ({education.length})
              </h4>
              <div className="education-grid">
                {education.map((edu, idx) => (
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

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div className="profile-section">
              <h4 className="section-subtitle">
                <Award size={15} color="var(--primary)" />
                Certifications ({certifications.length})
              </h4>
              <div className="skills-badge-list">
                {certifications.map((cert, idx) => (
                  <span key={idx} className="cert-pill">
                    <Award size={12} />
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Matched vs Missing Skills */}
          <div className="skills-section">
            <div className="skills-heading">
              <CheckCircle2 size={15} color="var(--success-dark)" />
              <span>Matched Job Requirements ({matchedSkills.length})</span>
            </div>
            <div className="skills-badge-list">
              {matchedSkills.map((s, idx) => (
                <SkillBadge key={idx} name={s} type="matched" />
              ))}
            </div>
          </div>

          {missingSkills && missingSkills.length > 0 && (
            <div className="skills-section">
              <div className="skills-heading">
                <XCircle size={15} color="var(--danger-dark)" />
                <span>Missing Requirements ({missingSkills.length})</span>
              </div>
              <div className="skills-badge-list">
                {missingSkills.map((s, idx) => (
                  <SkillBadge key={idx} name={s} type="missing" />
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Gaps */}
          <div className="strengths-gaps-grid" style={{ marginTop: '1rem' }}>
            <div className="bullets-box">
              <div className="bullets-title bullets-title-strengths">
                <CheckCircle2 size={14} />
                Candidate Strengths
              </div>
              <ul className="bullet-list">
                {strengths.map((item, idx) => (
                  <li key={idx} className="bullet-list-item">
                    <span className="bullet-dot-strength">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bullets-box">
              <div className="bullets-title bullets-title-gaps">
                <XCircle size={14} />
                Potential Gaps
              </div>
              <ul className="bullet-list">
                {gaps.map((item, idx) => (
                  <li key={idx} className="bullet-list-item">
                    <span className="bullet-dot-gap">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Assessment */}
          {aiAssessment && (
            <div className="assessment-card" style={{ marginTop: '1rem' }}>
              <div className="assessment-header">
                <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                  AI Assessment Summary
                </span>
                {aiUsed && (
                  <span className="ai-badge">
                    <Cpu size={12} />
                    Gemini AI
                  </span>
                )}
              </div>
              <p className="ai-summary-text" style={{ margin: 0 }}>
                {aiAssessment}
              </p>
            </div>
          )}

          {/* Collapsible Job Description */}
          {jobDescription && (
            <div className="resume-text-card" style={{ marginTop: '1rem' }}>
              <button
                type="button"
                className="resume-text-toggle"
                onClick={() => setShowJd(!showJd)}
                aria-expanded={showJd}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={15} color="var(--primary)" />
                  Target Job Description ({jobTitle})
                </span>
                {showJd ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showJd && (
                <div className="resume-text-content">
                  <pre className="extracted-pre">{jobDescription}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn-danger-outline"
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            <Trash2 size={14} />
            <span>Delete Candidate</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ padding: '0.5rem 1.25rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
