import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import './LoginScreen.css';

export const LoginScreen: React.FC = () => {
  const { signIn, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    await signIn(email.trim(), password);
  };

  return (
    <div className="login">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="login__card"
      >
        <div className="login__header">
          <div className="login__icon">🔐</div>
          <h1 className="login__title">Panel de Administración</h1>
          <p className="login__subtitle">RentaFácil — Cuestionario IRPF 2025</p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label className="login__label" htmlFor="admin-email">
              Correo electrónico
            </label>
            <input
              id="admin-email"
              className="login__input"
              type="email"
              placeholder="admin@migestoria.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="login__field">
            <label className="login__label" htmlFor="admin-password">
              Contraseña
            </label>
            <input
              id="admin-password"
              className="login__input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="login__error">
              ⚠️ {error}
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={loading ? '⏳' : '→'}
            onClick={() => {}}
            disabled={loading || !email.trim() || !password.trim()}
          >
            {loading ? 'Accediendo...' : 'Acceder al panel'}
          </Button>
        </form>

        <p className="login__footer">
          <a href="/">← Volver a la encuesta pública</a>
        </p>
      </motion.div>
    </div>
  );
};
