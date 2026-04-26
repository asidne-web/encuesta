/* ========================================
   Survey Type Definitions
   ======================================== */

export type QuestionType =
  | 'radio'
  | 'checkbox'
  | 'text'
  | 'number'
  | 'select'
  | 'date'
  | 'textarea'
  | 'iban';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface ConditionalField {
  /** The value of the parent question that triggers this sub-question */
  showWhen: string;
  /** The sub-question to display */
  question: Question;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required?: boolean;
  placeholder?: string;
  options?: QuestionOption[];
  /** Hint text shown below the input */
  hint?: string;
  /** Informational text about documents to provide later */
  documentInfo?: string;
  /** Conditional sub-questions that appear based on answers */
  conditionals?: ConditionalField[];
  /** Validation pattern (regex string) */
  validation?: string;
  /** Validation error message */
  validationMessage?: string;
}

export interface SurveySection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  questions: Question[];
}

export interface SurveyAnswers {
  [questionId: string]: string | string[] | boolean;
}

export interface SurveyState {
  currentStep: number;
  answers: SurveyAnswers;
  completedSections: string[];
  clientName: string;
  clientNIF: string;
  startedAt: string;
}
