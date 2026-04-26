import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FieldGroup, TextInput } from '../components/FormControls';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onStart: (name: string, nif: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [nif, setNif] = useState('');
  const [errors, setErrors] = useState<{ name?: string; nif?: string }>({});

  const handleStart = () => {
    const newErrors: { name?: string; nif?: string } = {};
    if (!name.trim()) newErrors.name = 'Por favor, introduzca su nombre completo';
    if (!nif.trim()) newErrors.nif = 'Por favor, introduzca su NIF/NIE';
    else if (!/^[0-9XYZ]\d{7}[A-Z]$/i.test(nif.replace(/\s/g, ''))) {
      newErrors.nif = 'Formato de NIF/NIE no válido (ej: 12345678A)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onStart(name.trim(), nif.trim().toUpperCase());
  };

  return (
    <div className="welcome">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="welcome__card"
      >
        <Card variant="elevated">
          <div className="welcome__icon">🏛️</div>

          <h1 className="welcome__title">
            Tu declaración, <span>simplificada</span>
          </h1>

          <p className="welcome__description">
            Completa este cuestionario previo para preparar toda la información necesaria
            para la presentación de tu <strong>Declaración de la Renta 2025</strong>.
            Solo te llevará unos minutos.
          </p>

          <div className="welcome__features">
            <div className="welcome__feature">
              <span className="welcome__feature-icon">⏱️</span>
              <span className="welcome__feature-text">
                <strong>10-15 minutos</strong>
                Tiempo estimado
              </span>
            </div>
            <div className="welcome__feature">
              <span className="welcome__feature-icon">🔒</span>
              <span className="welcome__feature-text">
                <strong>100% Seguro</strong>
                Datos protegidos
              </span>
            </div>
            <div className="welcome__feature">
              <span className="welcome__feature-icon">💾</span>
              <span className="welcome__feature-text">
                <strong>Guardado auto.</strong>
                Continúa cuando quieras
              </span>
            </div>
            <div className="welcome__feature">
              <span className="welcome__feature-icon">📊</span>
              <span className="welcome__feature-text">
                <strong>Resumen final</strong>
                Revisión completa
              </span>
            </div>
          </div>

          <div className="welcome__form">
            <FieldGroup label="Nombre completo" required error={errors.name}>
              <TextInput
                id="welcome-name"
                value={name}
                onChange={(v) => {
                  setName(v);
                  if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
                }}
                placeholder="Ej: María García López"
                error={!!errors.name}
              />
            </FieldGroup>

            <FieldGroup label="NIF / NIE" required error={errors.nif}>
              <TextInput
                id="welcome-nif"
                value={nif}
                onChange={(v) => {
                  setNif(v.toUpperCase());
                  if (errors.nif) setErrors((e) => ({ ...e, nif: undefined }));
                }}
                placeholder="Ej: 12345678A"
                error={!!errors.nif}
              />
            </FieldGroup>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon="🚀"
            onClick={handleStart}
          >
            Comenzar cuestionario
          </Button>

          <p className="welcome__disclaimer">
            Sus datos serán tratados de forma confidencial conforme a la
            normativa de protección de datos (RGPD). Al continuar, acepta
            nuestros términos de uso.
          </p>
        </Card>
      </motion.div>
    </div>
  );
};
