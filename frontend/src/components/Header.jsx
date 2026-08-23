import React from 'react';
import { Sparkles, Users, Layers, Star } from 'lucide-react';

export default function Header({
  activeView = 'screener',
  onViewChange,
  candidateCount = 0,
  shortlistedCount = 0
}) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand-section">
          <div className="brand-logo" aria-hidden="true">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="brand-title">
              Smart Resume Screener
              <span className="brand-badge">AI 2.5</span>
            </h1>
            <p className="brand-subtitle">
              Automated candidate screening against job requirements
            </p>
          </div>
        </div>

        <nav className="header-nav" aria-label="Main Navigation">
          <button
            type="button"
            className={`nav-tab-btn ${activeView === 'screener' ? 'active' : ''}`}
            onClick={() => onViewChange && onViewChange('screener')}
            aria-current={activeView === 'screener' ? 'page' : undefined}
          >
            <Layers size={15} />
            <span>Screener</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeView === 'candidates' ? 'active' : ''}`}
            onClick={() => onViewChange && onViewChange('candidates')}
            aria-current={activeView === 'candidates' ? 'page' : undefined}
          >
            <Users size={15} />
            <span>Candidates</span>
            {candidateCount > 0 && (
              <span className="nav-badge">{candidateCount}</span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
