import React from 'react';
import { Link } from 'react-router-dom';
import { isSupabaseConfigured } from '../lib/supabase';
import './Footer.css';

export const Footer: React.FC = () => (
  <footer className="footer">
    <div className="footer__inner">
      <div className="footer__left">
        <span className="footer__brand">RentaFácil</span>
        <Link to="/admin" className="footer__copy" style={{ textDecoration: 'none', color: 'inherit', cursor: 'default' }}>
          © {new Date().getFullYear()} — Cuestionario IRPF
        </Link>
      </div>
      <div className="footer__right">
        <span className="footer__link">Política de privacidad</span>
        <span className="footer__link">Términos de uso</span>
        <span className={`footer__badge ${!isSupabaseConfigured ? 'footer__badge--offline' : ''}`}>
          {isSupabaseConfigured ? '🟢 Conectado' : '🟡 Modo local'}
        </span>
      </div>
    </div>
  </footer>
);
