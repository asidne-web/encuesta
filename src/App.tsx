import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { RestoreDialog } from './components/RestoreDialog';
import { ToastContainer } from './components/Toast';
import type { ToastData } from './components/Toast';
import { WelcomeScreen } from './pages/WelcomeScreen';
import { SurveyPage } from './pages/SurveyPage';
import { SummaryScreen } from './pages/SummaryScreen';
import { surveySections } from './data/surveyData';
import { useSurvey } from './hooks/useSurvey';
import { submitSurvey } from './lib/submitSurvey';
import { Card } from './components/Card';
import { Button } from './components/Button';
import './App.css';

type AppView = 'welcome' | 'survey' | 'summary' | 'submitted';

function App() {
  const survey = useSurvey(surveySections);

  const [view, setView] = useState<AppView>('welcome');
  const [showRestoreDialog, setShowRestoreDialog] = useState(
    survey.hasRestoredSession && !!survey.clientName
  );
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  /* ---- Toast helpers ---- */
  const addToast = useCallback((type: ToastData['type'], message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ---- Start fresh ---- */
  const handleStart = useCallback(
    (name: string, nif: string, restoredAnswers?: any, restoredStep?: number) => {
      survey.startSurvey(name, nif, restoredAnswers, restoredStep);
      setView('survey');
      if (restoredAnswers) {
        addToast('success', 'Sesión recuperada de la nube. Continúe donde lo dejó.');
      } else {
        addToast('info', '¡Bienvenido! Su progreso se guardará automáticamente.');
      }
    },
    [survey, addToast]
  );

  /* ---- Restore session ---- */
  const handleRestore = useCallback(() => {
    setShowRestoreDialog(false);
    setView('survey');
    addToast('success', 'Sesión restaurada. Continúe donde lo dejó.');
  }, [addToast]);

  const handleDiscardSession = useCallback(() => {
    survey.resetSurvey();
    setShowRestoreDialog(false);
    setView('welcome');
  }, [survey]);

  /* ---- Navigation ---- */
  const handleNext = useCallback((): boolean => {
    const valid = survey.goNext();
    if (!valid) {
      addToast('error', 'Complete los campos obligatorios antes de continuar.');
    }
    return valid;
  }, [survey, addToast]);

  const handlePrev = useCallback(() => {
    survey.goPrev();
  }, [survey]);

  const handleFinish = useCallback(() => {
    if (survey.validateSection(survey.currentStep - 1)) {
      setView('summary');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      addToast('info', 'Revise sus respuestas antes de enviar.');
    } else {
      addToast('error', 'Complete los campos obligatorios de esta sección.');
    }
  }, [survey, addToast]);

  /* ---- Edit from summary ---- */
  const handleEditSection = useCallback(
    (step: number) => {
      survey.setCurrentStep(step);
      setView('survey');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [survey]
  );

  /* ---- Submit ---- */
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const result = await submitSurvey(
        survey.clientName,
        survey.clientNIF,
        survey.answers,
        survey.startedAt
      );

      if (result.success) {
        setSubmissionId(result.id || null);
        addToast('success', result.message);
        survey.resetSurvey();
        setView('submitted');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        addToast('error', result.message);
      }
    } catch {
      addToast('error', 'Error inesperado al enviar. Inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }, [survey, addToast]);

  /* ---- Reset ---- */
  const handleReset = useCallback(() => {
    survey.resetSurvey();
    setSubmissionId(null);
    setView('welcome');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [survey]);

  return (
    <div className="app">
      <Header clientName={view !== 'welcome' ? survey.clientName : undefined} />

      {/* Restore dialog */}
      <RestoreDialog
        visible={showRestoreDialog}
        clientName={survey.clientName}
        onRestore={handleRestore}
        onDiscard={handleDiscardSession}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <main className="app__main">
        {view === 'welcome' && <WelcomeScreen onStart={handleStart} />}

        {view === 'survey' && (
          <SurveyPage
            sections={surveySections}
            currentStep={survey.currentStep}
            answers={survey.answers}
            errors={survey.errors}
            onAnswer={survey.handleAnswer}
            onNext={handleNext}
            onPrev={handlePrev}
            onFinish={handleFinish}
          />
        )}

        {view === 'summary' && (
          <SummaryScreen
            clientName={survey.clientName}
            clientNIF={survey.clientNIF}
            sections={surveySections}
            answers={survey.answers}
            onEditSection={handleEditSection}
            onSubmit={handleSubmit}
            onReset={handleReset}
            isSubmitting={isSubmitting}
          />
        )}

        {view === 'submitted' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="survey-page"
            style={{ paddingTop: 'var(--space-3xl)' }}
          >
            <Card variant="elevated" className="submitted-card">
              <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
                <div className="summary__check" style={{ margin: '0 auto var(--space-lg)' }}>
                  📨
                </div>
                <h1 className="summary__title">¡Cuestionario enviado con éxito!</h1>
                <p className="summary__subtitle" style={{ marginBottom: 'var(--space-lg)' }}>
                  Hemos recibido sus respuestas correctamente.
                  Un asesor fiscal revisará su información y se pondrá en contacto con usted
                  a la mayor brevedad posible.
                </p>

                {submissionId && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    padding: 'var(--space-sm) var(--space-base)',
                    background: 'var(--color-input-bg)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--space-xl)',
                  }}>
                    🔖 Referencia: <strong>{submissionId}</strong>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  gap: 'var(--space-base)',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  marginTop: 'var(--space-lg)',
                }}>
                  <Button variant="primary" icon="🏠" onClick={handleReset}>
                    Volver al inicio
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
