import React from 'react';
import { Check, X } from 'lucide-react';

export default function SkillBadge({ name, type = 'matched' }) {
  const isMatched = type === 'matched';

  return (
    <span
      className={`skill-badge ${
        isMatched ? 'skill-badge-matched' : 'skill-badge-missing'
      }`}
      title={isMatched ? `Matched skill: ${name}` : `Missing requirement: ${name}`}
    >
      <span className="skill-badge-icon" aria-hidden="true">
        {isMatched ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
      </span>
      <span>{name}</span>
    </span>
  );
}
