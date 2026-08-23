import React, { useState } from 'react';
import {
  Users,
  Star,
  Search,
  Award,
  Layers,
  ChevronRight,
  Trash2,
  Eye,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function CandidateList({
  candidates = [],
  isLoading = false,
  error = null,
  onShortlistToggle,
  onViewCandidate,
  onDeleteCandidate,
  onNavigateToScreener
}) {
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'shortlisted'
  const [searchQuery, setSearchQuery] = useState('');

  const shortlistedList = candidates.filter((c) => c.shortlisted);
  const displayedList = (filterTab === 'shortlisted' ? shortlistedList : candidates).filter(
    (c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (c.candidateName || '').toLowerCase().includes(q) ||
        (c.jobTitle || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.skills || []).some((s) => s.toLowerCase().includes(q))
      );
    }
  );

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

  const handleDelete = (id, name, e) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to delete ${name || 'this candidate'}'s record?`
      )
    ) {
      onDeleteCandidate(id);
    }
  };

  return (
    <div className="candidates-view-container">
      {/* Top Controls: Filter Tabs & Search Bar */}
      <div className="candidates-top-bar">
        <div className="candidates-filter-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={filterTab === 'all'}
            className={`filter-tab-btn ${filterTab === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTab('all')}
          >
            <Users size={15} />
            <span>All Candidates</span>
            <span className="filter-count-badge">{candidates.length}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filterTab === 'shortlisted'}
            className={`filter-tab-btn ${filterTab === 'shortlisted' ? 'active' : ''}`}
            onClick={() => setFilterTab('shortlisted')}
          >
            <Star
              size={15}
              fill={filterTab === 'shortlisted' ? '#f59e0b' : 'none'}
              color={filterTab === 'shortlisted' ? '#f59e0b' : 'currentColor'}
            />
            <span>Shortlisted</span>
            <span className="filter-count-badge">{shortlistedList.length}</span>
          </button>
        </div>

        <div className="search-bar-wrap">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, skill, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search candidates"
          />
        </div>
      </div>

      {error && (
        <div className="alert-box alert-warning" style={{ marginTop: '1rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Candidates List / Cards */}
      {displayedList.length > 0 ? (
        <div className="candidate-card-grid">
          {displayedList.map((cand) => {
            const {
              _id,
              candidateName = 'Not detected',
              email,
              phone,
              jobTitle = 'Target Role',
              atsScore = 0,
              atsRating = 'Good',
              overallMatchScore = 0,
              recommendation = 'Good Match',
              matchedSkills = [],
              shortlisted = false,
              shortlistJustification = ''
            } = cand;

            return (
              <div
                key={_id}
                className={`candidate-item-card ${shortlisted ? 'is-shortlisted-card' : ''}`}
                onClick={() => onViewCandidate(cand)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onViewCandidate(cand);
                  }
                }}
              >
                <div className="candidate-card-header">
                  <div>
                    <div className="card-cand-name">{candidateName}</div>
                    <div className="card-cand-role">
                      <Briefcase size={12} /> {jobTitle}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`card-shortlist-btn ${shortlisted ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onShortlistToggle(_id, !shortlisted);
                    }}
                    title={shortlisted ? 'Remove from Shortlist' : 'Shortlist Candidate'}
                    aria-label={shortlisted ? 'Remove from Shortlist' : 'Shortlist Candidate'}
                  >
                    <Star
                      size={16}
                      fill={shortlisted ? '#f59e0b' : 'none'}
                      color={shortlisted ? '#f59e0b' : 'currentColor'}
                    />
                  </button>
                </div>

                {/* Contact Subtext */}
                {(email || phone) && (
                  <div className="card-contact-row">
                    {email && (
                      <span className="card-contact-item">
                        <Mail size={12} /> {email}
                      </span>
                    )}
                    {phone && (
                      <span className="card-contact-item">
                        <Phone size={12} /> {phone}
                      </span>
                    )}
                  </div>
                )}

                {/* Dual Score Badges */}
                <div className="card-scores-row">
                  <div className="card-score-box ats-box">
                    <span className="card-score-label">ATS Score</span>
                    <div className="card-score-val">
                      <strong>{atsScore}</strong>/100
                    </div>
                    <span className={`ats-rating-tag ${getAtsRatingClass(atsRating)}`} style={{ fontSize: '0.625rem', padding: '0.1rem 0.4rem' }}>
                      {atsRating}
                    </span>
                  </div>

                  <div className="card-score-box match-box">
                    <span className="card-score-label">Overall Match</span>
                    <div className="card-score-val">
                      <strong>{overallMatchScore}%</strong>
                    </div>
                    <span className={`recommendation-badge ${getRecommendationClass(recommendation)}`} style={{ fontSize: '0.625rem', padding: '0.1rem 0.4rem' }}>
                      {recommendation}
                    </span>
                  </div>
                </div>

                {/* Shortlist Justification Snippet if Shortlisted */}
                {shortlisted && shortlistJustification && (
                  <div className="card-justification-snippet">
                    <div className="snippet-title">
                      <Star size={12} fill="#f59e0b" color="#f59e0b" />
                      <span>Shortlist Justification:</span>
                    </div>
                    <p className="snippet-body">"{shortlistJustification}"</p>
                  </div>
                )}

                {/* Matched Skills Preview */}
                {matchedSkills && matchedSkills.length > 0 && (
                  <div className="card-skills-preview">
                    {matchedSkills.slice(0, 4).map((s, idx) => (
                      <span key={idx} className="card-skill-tag">
                        {s}
                      </span>
                    ))}
                    {matchedSkills.length > 4 && (
                      <span className="card-skill-tag more-tag">
                        +{matchedSkills.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="candidate-card-footer">
                  <button
                    type="button"
                    className="card-view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewCandidate(cand);
                    }}
                  >
                    <Eye size={13} />
                    <span>View Details</span>
                    <ChevronRight size={13} />
                  </button>

                  <button
                    type="button"
                    className="card-del-btn"
                    onClick={(e) => handleDelete(_id, candidateName, e)}
                    title="Delete Candidate Record"
                    aria-label={`Delete ${candidateName}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="empty-state" style={{ marginTop: '2rem' }}>
          <div className="empty-icon-wrap">
            {filterTab === 'shortlisted' ? <Star size={32} /> : <Users size={32} />}
          </div>
          <h3 className="empty-title">
            {filterTab === 'shortlisted'
              ? 'No Shortlisted Candidates Yet'
              : 'No Candidates Stored Yet'}
          </h3>
          <p className="empty-desc">
            {filterTab === 'shortlisted'
              ? 'Click the star icon or Shortlist button on any candidate to bookmark them with AI justification.'
              : 'Run resume screenings in the Screener tab to automatically save candidates and view full structured profiles here.'}
          </p>
          {filterTab !== 'shortlisted' && (
            <button
              type="button"
              className="btn-primary"
              style={{ width: 'auto', marginTop: '0.75rem' }}
              onClick={onNavigateToScreener}
            >
              <Sparkles size={15} />
              <span>Go to Screener</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
