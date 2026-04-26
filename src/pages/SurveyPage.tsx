import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { QuestionRenderer } from '../components/FormControls';
import { Button } from '../components/Button';
import type { SurveySection, SurveyAnswers } from '../types/survey';
import './SurveyPage.css';

interface SurveyPageProps {
  sections: SurveySection[];
  currentStep: number;
  answers: SurveyAnswers;
  errors: { [key: string]: string };
  onAnswer: (questionId: string, value: string | string[]) => void;
  onNext: () => boolean;
  onPrev: () => void;
  onFinish: () => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
};

export const SurveyPage: React.FC<SurveyPageProps> = ({
  sections,
  currentStep,
  answers,
  errors,
  onAnswer,
  onNext,
  onPrev,
  onFinish,
}) => {
  const section = sections[currentStep - 1];
  const isLast = currentStep === sections.length;
  const isFirst = currentStep === 1;

  const [direction, setDirection] = React.useState(1);
  const [shakeKey, setShakeKey] = React.useState(0);

  const handleNext = () => {
    setDirection(1);
    if (isLast) {
      onFinish();
    } else {
      const valid = onNext();
      if (!valid) {
        // Trigger shake animation on the card
        setShakeKey((k) => k + 1);
      }
    }
  };

  const handlePrev = () => {
    setDirection(-1);
    onPrev();
  };

  // Count answered questions in current section
  const answeredInSection = section.questions.filter((q) => {
    const val = answers[q.id];
    return val !== undefined && val !== '' && (!Array.isArray(val) || val.length > 0);
  }).length;
  const totalInSection = section.questions.filter((q) => q.required).length;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="survey-page">
      {/* Progress */}
      <div className="survey-page__progress">
        <ProgressBar
          currentStep={currentStep}
          totalSteps={sections.length}
          sectionTitle={`Sección ${currentStep} de ${sections.length} — ${section.title}`}
        />
      </div>

      {/* Section status */}
      <div className="survey-page__status">
        <span className="survey-page__status-badge">
          {answeredInSection >= totalInSection ? '✅' : '📝'}{' '}
          {answeredInSection} de {section.questions.length} respondidas
        </span>
        {hasErrors && (
          <span className="survey-page__status-error">
            ⚠ Hay campos obligatorios sin completar
          </span>
        )}
      </div>

      {/* Section Card with Animation */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={section.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="survey-page__section"
        >
          <motion.div
            key={`shake-${shakeKey}`}
            animate={shakeKey > 0 ? {
              x: [0, -8, 8, -6, 6, -3, 3, 0],
            } : {}}
            transition={{ duration: 0.5 }}
          >
            <Card variant="elevated">
              <CardHeader
                icon={section.icon}
                title={section.title}
                subtitle={section.subtitle}
              />
              <div className="card__body">
                <div className="survey-page__questions">
                  {section.questions.map((q) => (
                    <QuestionRenderer
                      key={q.id}
                      question={q}
                      value={answers[q.id] ?? ''}
                      onChange={onAnswer}
                      error={errors[q.id]}
                      allAnswers={answers}
                      allErrors={errors}
                    />
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="btn-row btn-row--between">
                  {!isFirst ? (
                    <Button variant="secondary" icon="←" onClick={handlePrev}>
                      Anterior
                    </Button>
                  ) : (
                    <div />
                  )}
                  <Button
                    variant="primary"
                    size="lg"
                    icon={isLast ? '✅' : '→'}
                    onClick={handleNext}
                  >
                    {isLast ? 'Finalizar y revisar' : 'Siguiente'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
