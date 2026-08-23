import React from 'react';
import { Sparkles, RotateCcw, ArrowRight } from 'lucide-react';

export default function AnalyzeButton({ onAnalyze, onClear, isLoading, canAnalyze }) {
  return (
    <div className="action-buttons">
      <button
        type="button"
        className="btn-primary"
        onClick={onAnalyze}
        disabled={isLoading || !canAnalyze}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner-sm" aria-hidden="true" />
            Analyzing Resume...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Analyze Resume
            <ArrowRight size={16} />
          </>
        )}
      </button>

      <button
        type="button"
        className="btn-secondary"
        onClick={onClear}
        disabled={isLoading}
        title="Reset resume, job description and analysis results"
      >
        <RotateCcw size={16} />
        Clear
      </button>
    </div>
  );
}
