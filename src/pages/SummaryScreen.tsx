import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import type { SurveySection, SurveyAnswers, Question } from '../types/survey';
import './SummaryScreen.css';

interface SummaryScreenProps {
  clientName: string;
  clientNIF: string;
  sections: SurveySection[];
  answers: SurveyAnswers;
  onEditSection: (stepIndex: number) => void;
  onSubmit: () => void;
  onReset: () => void;
  isSubmitting?: boolean;
}

/** Resolve a question's answer to a human-readable label */
function resolveAnswerLabel(question: Question, value: string | string[] | boolean | undefined): string {
  if (value === undefined || value === '') return '';

  // Radio / Select — resolve option label
  if ((question.type === 'radio' || question.type === 'select') && question.options) {
    const match = question.options.find((o) => o.value === value);
    return match?.label || String(value);
  }

  // Checkbox — resolve all option labels
  if (question.type === 'checkbox' && Array.isArray(value) && question.options) {
    return value
      .map((v) => {
        const match = question.options!.find((o) => o.value === v);
        return match?.label || v;
      })
      .join(', ');
  }

  return String(value);
}

/** Collapsible section component */
const SummarySection: React.FC<{
  section: SurveySection;
  sectionIndex: number;
  answers: SurveyAnswers;
  onEdit: (step: number) => void;
  defaultOpen?: boolean;
}> = ({ section, sectionIndex, answers, onEdit, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  /** Recursively gather question+answer pairs, including visible conditionals */
  const gatherAnswers = (questions: Question[]): { question: Question; value: string }[] => {
    const result: { question: Question; value: string }[] = [];
    questions.forEach((q) => {
      const raw = answers[q.id];
      const label = resolveAnswerLabel(q, raw);
      result.push({ question: q, value: label });

      // If the parent value triggers a conditional, include the sub-question
      if (q.conditionals && typeof raw === 'string') {
        q.conditionals.forEach((cond) => {
          if (raw === cond.showWhen) {
            const subRaw = answers[cond.question.id];
            const subLabel = resolveAnswerLabel(cond.question, subRaw);
            result.push({ question: cond.question, value: subLabel });
          }
        });
      }
    });
    return result;
  };

  const items = gatherAnswers(section.questions);
  const answeredCount = items.filter((i) => i.value).length;

  return (
    <div className="summary-section">
      <div className="summary-section__header" onClick={() => setIsOpen(!isOpen)}>
        <div className="summary-section__header-left">
          <span className="summary-section__icon">{section.icon}</span>
          <span className="summary-section__title">
            {section.title}
            <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: '8px' }}>
              ({answeredCount}/{items.length})
            </span>
          </span>
        </div>
        <span className={`summary-section__toggle ${isOpen ? 'summary-section__toggle--open' : ''}`}>
          ▾
        </span>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.25 }}
          className="summary-section__body"
        >
          {items.map(({ question, value }) => (
            <div key={question.id} className="answer-item">
              <span className="answer-item__question">{question.text}</span>
              <span className={`answer-item__value ${!value ? 'answer-item__value--empty' : ''}`}>
                {value || 'Sin respuesta'}
              </span>
            </div>
          ))}

          <button
            className="summary-section__edit"
            onClick={() => onEdit(sectionIndex + 1)}
          >
            ✏️ Editar sección
          </button>
        </motion.div>
      )}
    </div>
  );
};

export const SummaryScreen: React.FC<SummaryScreenProps> = ({
  clientName,
  clientNIF,
  sections,
  answers,
  onEditSection,
  onSubmit,
  onReset,
  isSubmitting = false,
}) => {
  const completedAt = new Date().toLocaleString('es-ES', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="summary"
    >
      {/* Hero */}
      <div className="summary__hero">
        <div className="summary__check">✅</div>
        <h1 className="summary__title">¡Cuestionario completado!</h1>
        <p className="summary__subtitle">
          Gracias, <strong>{clientName}</strong> (NIF: {clientNIF}).<br />
          Revise sus respuestas a continuación antes de enviar.
        </p>
        <p style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
          marginTop: 'var(--space-sm)',
        }}>
          Completado el {completedAt}
        </p>
      </div>

      {/* Section review cards */}
      <div className="summary__sections">
        {sections.map((section, i) => (
          <SummarySection
            key={section.id}
            section={section}
            sectionIndex={i}
            answers={answers}
            onEdit={onEditSection}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="summary__actions">
        <div className="summary__actions-row">
          <Button
            variant="secondary"
            fullWidth
            icon="🔄"
            onClick={onReset}
          >
            Nuevo cuestionario
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={isSubmitting ? '⏳' : '📨'}
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Confirmar y enviar'}
          </Button>
        </div>
        <p className="summary__disclaimer">
          Al enviar, sus respuestas serán almacenadas de forma segura.
          Se le notificará por correo electrónico cuando un asesor haya
          revisado su información.
        </p>
      </div>
    </motion.div>
  );
};
