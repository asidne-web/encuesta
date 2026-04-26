import { useState, useCallback, useEffect, useRef } from 'react';
import type { SurveyAnswers, SurveySection, Question } from '../types/survey';

const STORAGE_KEY = 'rentafacil_survey';

interface PersistedState {
  clientName: string;
  clientNIF: string;
  currentStep: number;
  answers: SurveyAnswers;
  startedAt: string;
}

interface ValidationErrors {
  [questionId: string]: string;
}

/**
 * Custom hook that manages the entire survey lifecycle:
 * - State management for answers
 * - localStorage persistence (auto-save)
 * - Validation per section
 * - Navigation guards
 */
export function useSurvey(sections: SurveySection[]) {
  /* ---- Restore from localStorage ---- */
  const loadSavedState = (): PersistedState | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as PersistedState;
    } catch {
      // corrupted – ignore
    }
    return null;
  };

  const saved = useRef(loadSavedState());

  const [clientName, setClientName] = useState(saved.current?.clientName ?? '');
  const [clientNIF, setClientNIF] = useState(saved.current?.clientNIF ?? '');
  const [currentStep, setCurrentStep] = useState(saved.current?.currentStep ?? 1);
  const [answers, setAnswers] = useState<SurveyAnswers>(saved.current?.answers ?? {});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [startedAt] = useState(saved.current?.startedAt ?? new Date().toISOString());
  const [hasRestoredSession] = useState(!!saved.current);

  /* ---- Auto-save to localStorage ---- */
  useEffect(() => {
    const state: PersistedState = {
      clientName,
      clientNIF,
      currentStep,
      answers,
      startedAt,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [clientName, clientNIF, currentStep, answers, startedAt]);

  /* ---- Answer handler ---- */
  const handleAnswer = useCallback((questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    // Clear error for this field when user interacts
    setErrors((prev) => {
      if (prev[questionId]) {
        const next = { ...prev };
        delete next[questionId];
        return next;
      }
      return prev;
    });
  }, []);

  /* ---- Validation ---- */
  const validateSection = useCallback(
    (sectionIndex: number): boolean => {
      const section = sections[sectionIndex];
      const newErrors: ValidationErrors = {};

      const validateQuestion = (q: Question) => {
        const val = answers[q.id];

        // Required check
        if (q.required) {
          if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
            newErrors[q.id] = 'Este campo es obligatorio';
            return;
          }
        }

        // Only validate non-empty values
        if (val && typeof val === 'string' && val.trim()) {
          // Custom regex validation (e.g. IBAN)
          if (q.validation) {
            const raw = val.replace(/\s/g, '');
            const regex = new RegExp(q.validation);
            if (!regex.test(raw)) {
              newErrors[q.id] = q.validationMessage || 'Formato no válido';
            }
          }
        }

        // Validate visible conditional sub-questions
        if (q.conditionals && typeof val === 'string') {
          q.conditionals.forEach((cond) => {
            if (val === cond.showWhen) {
              validateQuestion(cond.question);
            }
          });
        }
      };

      section.questions.forEach(validateQuestion);

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [sections, answers]
  );

  /* ---- Navigation ---- */
  const goNext = useCallback(() => {
    if (!validateSection(currentStep - 1)) {
      // Scroll to first error
      const firstErrorId = Object.keys(errors)[0];
      if (firstErrorId) {
        document.getElementById(firstErrorId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }
    setCurrentStep((prev) => Math.min(prev + 1, sections.length));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  }, [currentStep, validateSection, errors, sections.length]);

  const goPrev = useCallback(() => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* ---- Start / Init ---- */
  const startSurvey = useCallback((name: string, nif: string) => {
    setClientName(name);
    setClientNIF(nif);
    setCurrentStep(1);
  }, []);

  /* ---- Reset ---- */
  const resetSurvey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setClientName('');
    setClientNIF('');
    setCurrentStep(1);
    setAnswers({});
    setErrors({});
  }, []);

  /* ---- Computed values ---- */
  const currentSection = sections[currentStep - 1];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === sections.length;
  const totalAnswered = Object.keys(answers).filter((k) => {
    const v = answers[k];
    return v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0);
  }).length;

  // Count all questions including conditionals that are visible
  const countVisibleQuestions = useCallback(() => {
    let count = 0;
    sections.forEach((section) => {
      section.questions.forEach((q) => {
        count++;
        if (q.conditionals) {
          q.conditionals.forEach((cond) => {
            const parentVal = answers[q.id];
            if (typeof parentVal === 'string' && parentVal === cond.showWhen) {
              count++;
            }
          });
        }
      });
    });
    return count;
  }, [sections, answers]);

  const progressPercent = Math.round(
    (totalAnswered / Math.max(countVisibleQuestions(), 1)) * 100
  );

  return {
    // State
    clientName,
    clientNIF,
    currentStep,
    answers,
    errors,
    startedAt,
    hasRestoredSession,

    // Current
    currentSection,
    isFirstStep,
    isLastStep,
    totalAnswered,
    progressPercent,

    // Actions
    handleAnswer,
    goNext,
    goPrev,
    startSurvey,
    resetSurvey,
    validateSection,
    setCurrentStep,
  };
}
