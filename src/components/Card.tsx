import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'flat';
  className?: string;
}

interface CardHeaderProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ icon, title, subtitle }) => (
  <div className="card__header">
    {icon && <div className="card__icon">{icon}</div>}
    <div>
      <h2 className="card__title">{title}</h2>
      {subtitle && <p className="card__subtitle">{subtitle}</p>}
    </div>
  </div>
);

export const Card: React.FC<CardProps> = ({ children, variant = 'default', className = '' }) => {
  const variantClass = variant !== 'default' ? `card--${variant}` : '';
  return (
    <div className={`card ${variantClass} ${className}`.trim()}>
      {children}
    </div>
  );
};
