import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { surveySections } from '../data/surveyData';
import { updateSubmissionStatus, updateReviewerNotes, type SubmissionRow } from '../lib/adminService';
import { useAuth } from '../hooks/useAuth';
import type { SurveySection, SurveyAnswers, Question } from '../types/survey';
import './SubmissionDetail.css';

interface SubmissionDetailProps {
  submission: SubmissionRow;
  onBack: () => void;
  onGeneratePdf: (submission: SubmissionRow) => void;
  onRefresh: () => void;
}

/** Resolve answer to human-readable label */
function resolveLabel(q: Question, val: string | string[] | boolean | undefined): string {
  if (val === undefined || val === '') return '';
  if ((q.type === 'radio' || q.type === 'select') && q.options) {
    return q.options.find((o) => o.value === val)?.label || String(val);
  }
  if (q.type === 'checkbox' && Array.isArray(val) && q.options) {
    return val.map((v) => q.options!.find((o) => o.value === v)?.label || v).join(', ');
  }
  return String(val);
}

/** Collapsible review section */
const ReviewSection: React.FC<{
  section: SurveySection;
  answers: SurveyAnswers;
  defaultOpen?: boolean;
}> = ({ section, answers, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  const items: { q: Question; value: string }[] = [];
  section.questions.forEach((q) => {
    const raw = answers[q.id];
    items.push({ q, value: resolveLabel(q, raw) });
    if (q.conditionals && typeof raw === 'string') {
      q.conditionals.forEach((cond) => {
        if (raw === cond.showWhen) {
          items.push({ q: cond.question, value: resolveLabel(cond.question, answers[cond.question.id]) });
        }
      });
    }
  });

  return (
    <div className="summary-section">
      <div className="summary-section__header" onClick={() => setOpen(!open)}>
        <div className="summary-section__header-left">
          <span className="summary-section__icon">{section.icon}</span>
          <span className="summary-section__title">{section.title}</span>
        </div>
        <span className={`summary-section__toggle ${open ? 'summary-section__toggle--open' : ''}`}>▾</span>
      </div>
      {open && (
        <div className="summary-section__body">
          {items.map(({ q, value }) => (
            <div key={q.id} className="answer-item">
              <span className="answer-item__question">{q.text}</span>
              <span className={`answer-item__value ${!value ? 'answer-item__value--empty' : ''}`}>
                {value || 'Sin respuesta'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const SubmissionDetail: React.FC<SubmissionDetailProps> = ({
  submission,
  onBack,
  onGeneratePdf,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState(submission.reviewer_notes || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const formatDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })
      : '—';

  const handleSaveNotes = useCallback(async () => {
    setSaving(true);
    try {
      await updateReviewerNotes(submission.id, notes);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setSaving(false);
    }
  }, [submission.id, notes]);

  const handleStatusChange = useCallback(async (status: SubmissionRow['status']) => {
    try {
      await updateSubmissionStatus(submission.id, status, user?.email);
      onRefresh();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  }, [submission.id, user?.email, onRefresh]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="detail"
    >
      {/* Back button */}
      <button className="detail__back" onClick={onBack}>
        ← Volver al listado
      </button>

      {/* Info bar */}
      <div className="detail__info-bar">
        <div className="detail__info-item">
          <span className="detail__info-label">Contribuyente</span>
          <span className="detail__info-value">{submission.client_name}</span>
        </div>
        <div className="detail__info-item">
          <span className="detail__info-label">NIF</span>
          <span className="detail__info-value" style={{ fontFamily: 'monospace' }}>
            {submission.client_nif}
          </span>
        </div>
        <div className="detail__info-item">
          <span className="detail__info-label">Estado</span>
          <span className="detail__info-value">
            <span className={`status-badge status-badge--${submission.status}`}>
              {submission.status === 'pending' && '🟡 Pendiente'}
              {submission.status === 'reviewed' && '🔵 Revisado'}
              {submission.status === 'completed' && '🟢 Completado'}
              {submission.status === 'archived' && '⚫ Archivado'}
            </span>
          </span>
        </div>
        <div className="detail__info-item">
          <span className="detail__info-label">Referencia</span>
          <span className="detail__info-value" style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'monospace' }}>
            {submission.id.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="detail__actions">
        <Button variant="primary" icon="📄" onClick={() => onGeneratePdf(submission)}>
          Generar Informe PDF
        </Button>
        {submission.status === 'pending' && (
          <Button variant="secondary" icon="🔵" onClick={() => handleStatusChange('reviewed')}>
            Marcar como revisado
          </Button>
        )}
        {submission.status === 'reviewed' && (
          <Button variant="secondary" icon="🟢" onClick={() => handleStatusChange('completed')}>
            Marcar como completado
          </Button>
        )}
        {submission.status !== 'archived' && (
          <Button variant="secondary" icon="🗄️" onClick={() => handleStatusChange('archived')}>
            Archivar
          </Button>
        )}
      </div>

      {/* Timestamps */}
      <div className="detail__timestamps">
        <span>📅 Iniciado: {formatDate(submission.started_at)}</span>
        <span>📨 Enviado: {formatDate(submission.submitted_at)}</span>
        {submission.reviewed_at && <span>✅ Revisado: {formatDate(submission.reviewed_at)}</span>}
        {submission.reviewed_by && <span>👤 Por: {submission.reviewed_by}</span>}
      </div>

      {/* Reviewer Notes */}
      <div className="review-panel">
        <h3 className="review-panel__title">📝 Notas del asesor</h3>
        <textarea
          className="review-panel__textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Añada aquí observaciones, notas o instrucciones para el contribuyente..."
        />
        <button
          className={`review-panel__save ${saved ? 'review-panel__save--saved' : ''}`}
          onClick={handleSaveNotes}
          disabled={saving}
        >
          {saving ? '⏳ Guardando...' : saved ? '✅ Guardado' : '💾 Guardar notas'}
        </button>
      </div>

      {/* Survey answers by section */}
      <div className="summary__sections">
        {surveySections.map((section, i) => (
          <ReviewSection
            key={section.id}
            section={section}
            answers={submission.answers}
            defaultOpen={i === 0}
          />
        ))}
      </div>
    </motion.div>
  );
};
