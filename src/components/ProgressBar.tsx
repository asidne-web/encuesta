import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  sectionTitle?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  sectionTitle,
}) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="progress-bar">
      <div className="progress-bar__header">
        <span className="progress-bar__label">
          {sectionTitle || `Paso ${currentStep} de ${totalSteps}`}
        </span>
        <span className="progress-bar__percentage">{percentage}%</span>
      </div>
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="steps-indicator">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepIndex = i + 1;
          let dotClass = 'step-dot';
          if (stepIndex === currentStep) dotClass += ' step-dot--active';
          else if (stepIndex < currentStep) dotClass += ' step-dot--completed';
          return <div key={i} className={dotClass} />;
        })}
      </div>
    </div>
  );
};
