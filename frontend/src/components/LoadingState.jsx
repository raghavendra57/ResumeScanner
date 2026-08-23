import React, { useEffect, useState } from 'react';
import { Sparkles, FileText, CheckCircle2, Cpu } from 'lucide-react';

const STAGES = [
  { text: 'Extracting resume text...', icon: FileText },
  { text: 'Analyzing technical skills...', icon: CheckCircle2 },
  { text: 'Generating AI assessment...', icon: Cpu },
  { text: 'Preparing results...', icon: Sparkles }
];

export default function LoadingState() {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true" />
      <div className="loading-title">Analyzing Resume...</div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Evaluating candidate experience and job compatibility
      </p>

      <div className="loading-steps">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = idx === activeStage;
          const isPassed = idx < activeStage;

          return (
            <div
              key={idx}
              className={`loading-step-item ${isActive ? 'active' : ''}`}
            >
              <span className="step-indicator-dot" aria-hidden="true" />
              <Icon size={16} />
              <span>{stage.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
