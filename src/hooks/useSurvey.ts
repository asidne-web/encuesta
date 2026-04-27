import { useState, useCallback, useEffect, useRef } from 'react';
import type { SurveyAnswers, SurveySection, Question } from '../types/survey';
import { draftService } from '../lib/draftService';

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

  /* ---- Sync with Supabase (Debounced/Strategic) ---- */
  const syncDraft = useCallback(async (
    name: string, 
    nif: string, 
    step: number, 
    currAnswers: SurveyAnswers
  ) => {
    if (!nif) return;
    await draftService.saveDraft({
      client_nif: nif,
      client_name: name,
      current_step: step,
      answers: currAnswers
    });
  }, []);

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
        if (q.required) {
          if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
            newErrors[q.id] = 'Este campo es obligatorio';
            return;
          }
        }
        if (val && typeof val === 'string' && val.trim()) {
          if (q.validation) {
            const raw = val.replace(/\s/g, '');
            const regex = new RegExp(q.validation);
            if (!regex.test(raw)) {
              newErrors[q.id] = q.validationMessage || 'Formato no válido';
            }
          }
        }
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
      const firstErrorId = Object.keys(errors)[0];
      if (firstErrorId) {
        document.getElementById(firstErrorId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }
    const nextStep = Math.min(currentStep + 1, sections.length);
    setCurrentStep(nextStep);
    // Sync to Supabase when moving to next section
    syncDraft(clientName, clientNIF, nextStep, answers);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  }, [currentStep, validateSection, errors, sections.length, clientName, clientNIF, answers, syncDraft]);

  const goPrev = useCallback(() => {
    setErrors({});
    const prevStep = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStep);
    syncDraft(clientName, clientNIF, prevStep, answers);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, clientName, clientNIF, answers, syncDraft]);

  /* ---- Start / Init ---- */
  const startSurvey = useCallback((name: string, nif: string, restoredAnswers?: SurveyAnswers, restoredStep?: number) => {
    setClientName(name);
    setClientNIF(nif);
    if (restoredAnswers) setAnswers(restoredAnswers);
    if (restoredStep) setCurrentStep(restoredStep);
  }, []);

  /* ---- Reset ---- */
  const resetSurvey = useCallback(() => {
    if (clientNIF) draftService.deleteDraft(clientNIF); // Clean up Supabase
    localStorage.removeItem(STORAGE_KEY);
    setClientName('');
    setClientNIF('');
    setCurrentStep(1);
    setAnswers({});
    setErrors({});
  }, [clientNIF]);

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
