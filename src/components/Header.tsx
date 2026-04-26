import React from 'react';
import './Header.css';

interface HeaderProps {
  clientName?: string;
}

export const Header: React.FC<HeaderProps> = ({ clientName }) => {
  const initials = clientName
    ? clientName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '👤';

  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__brand">
          <div className="header__logo">📋</div>
          <div>
            <div className="header__title">RentaFácil</div>
            <div className="header__subtitle">Cuestionario IRPF 2025</div>
          </div>
        </div>
        <div className="header__right">
          {clientName && (
            <div className="header__user">
              <div className="header__user-icon">{initials}</div>
              <span>{clientName}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
