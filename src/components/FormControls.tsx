import React from 'react';
import type { Question, QuestionOption } from '../types/survey';
import './FormControls.css';

/* ==============================================
   Shared Field Group Wrapper
   ============================================== */
interface FieldGroupProps {
  label: string;
  required?: boolean;
  hint?: string;
  help?: string;
  error?: string;
  documentInfo?: string;
  children: React.ReactNode;
}

export const FieldGroup: React.FC<FieldGroupProps> = ({
  label,
  required,
  hint,
  help,
  error,
  documentInfo,
  children,
}) => (
  <div className="field-group">
    <label className={`field-group__label ${required ? 'field-group__label--required' : ''}`}>
      {label}
      {help && <span style={{ marginLeft: 'var(--space-sm)', fontSize: '0.8em', color: 'var(--color-primary)', fontWeight: 'normal' }}>({help})</span>}
    </label>
    {hint && <p className="field-group__hint">{hint}</p>}
    {children}
    {error && (
      <p className="field-group__error">
        <span>⚠</span> {error}
      </p>
    )}
    {documentInfo && (
      <div className="document-info">
        <span className="document-info__icon">📄</span>
        <span className="document-info__text">{documentInfo}</span>
      </div>
    )}
  </div>
);

/* ==============================================
   Text / Number / Date / IBAN Input
   ============================================== */
interface TextInputProps {
  id: string;
  type?: 'text' | 'number' | 'date' | 'iban';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
}) => {
  const inputType = type === 'iban' ? 'text' : type;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (type === 'iban') {
      val = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
      // Format: ES12 3456 7890 1234 5678 9012
      val = val.replace(/(.{4})/g, '$1 ').trim();
    }
    onChange(val);
  };

  return (
    <input
      id={id}
      type={inputType}
      className={`input ${error ? 'input--error' : ''}`}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      maxLength={type === 'iban' ? 29 : undefined}
    />
  );
};

/* ==============================================
   Textarea
   ============================================== */
interface TextareaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  id,
  value,
  onChange,
  placeholder,
  error,
}) => (
  <textarea
    id={id}
    className={`input ${error ? 'input--error' : ''}`}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={4}
  />
);

/* ==============================================
   Select
   ============================================== */
interface SelectInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: QuestionOption[];
  placeholder?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder,
}) => (
  <div className="select-wrapper">
    <select
      id={id}
      className="select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

/* ==============================================
   Radio Group
   ============================================== */
interface RadioGroupProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: QuestionOption[];
  horizontal?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  id,
  value,
  onChange,
  options,
  horizontal,
}) => (
  <div className={`radio-group ${horizontal ? 'radio-group--horizontal' : ''}`} role="radiogroup">
    {options.map((opt) => (
      <label
        key={opt.value}
        className={`radio-option ${value === opt.value ? 'radio-option--selected' : ''}`}
      >
        <input
          type="radio"
          name={id}
          value={opt.value}
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
          className="radio-option__input"
        />
        <span className="radio-option__label">{opt.label}</span>
      </label>
    ))}
  </div>
);

/* ==============================================
   Checkbox Group
   ============================================== */
interface CheckboxGroupProps {
  id: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: QuestionOption[];
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  id,
  values,
  onChange,
  options,
}) => {
  const handleToggle = (optValue: string) => {
    if (values.includes(optValue)) {
      onChange(values.filter((v) => v !== optValue));
    } else {
      onChange([...values, optValue]);
    }
  };

  return (
    <div className="radio-group">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`checkbox-option ${values.includes(opt.value) ? 'checkbox-option--selected' : ''}`}
        >
          <input
            type="checkbox"
            name={`${id}-${opt.value}`}
            checked={values.includes(opt.value)}
            onChange={() => handleToggle(opt.value)}
            className="checkbox-option__input"
          />
          <span className="checkbox-option__label">{opt.label}</span>
        </label>
      ))}
    </div>
  );
};

/* ==============================================
   Dynamic Question Renderer
   ============================================== */
interface QuestionRendererProps {
  question: Question;
  value: string | string[];
  onChange: (questionId: string, value: string | string[]) => void;
  error?: string;
  /** All answers map — used to wire conditional sub-question values */
  allAnswers?: { [key: string]: string | string[] | boolean };
  /** All validation errors map — used to show errors on conditional sub-questions */
  allErrors?: { [key: string]: string };
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
  error,
  allAnswers = {},
  allErrors = {},
}) => {
  const stringValue = typeof value === 'string' ? value : '';
  const arrayValue = Array.isArray(value) ? value : [];

  const renderInput = () => {
    switch (question.type) {
      case 'radio':
        return (
          <RadioGroup
            id={question.id}
            value={stringValue}
            onChange={(v) => onChange(question.id, v)}
            options={question.options || []}
            horizontal={(question.options?.length || 0) <= 3}
          />
        );

      case 'checkbox':
        return (
          <CheckboxGroup
            id={question.id}
            values={arrayValue}
            onChange={(v) => onChange(question.id, v)}
            options={question.options || []}
          />
        );

      case 'select':
        return (
          <SelectInput
            id={question.id}
            value={stringValue}
            onChange={(v) => onChange(question.id, v)}
            options={question.options || []}
            placeholder={question.placeholder || 'Seleccione una opción'}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={question.id}
            value={stringValue}
            onChange={(v) => onChange(question.id, v)}
            placeholder={question.placeholder}
            error={!!error}
          />
        );

      case 'number':
      case 'date':
      case 'iban':
        return (
          <TextInput
            id={question.id}
            type={question.type}
            value={stringValue}
            onChange={(v) => onChange(question.id, v)}
            placeholder={question.placeholder}
            error={!!error}
          />
        );

      case 'text':
      default:
        return (
          <TextInput
            id={question.id}
            type="text"
            value={stringValue}
            onChange={(v) => onChange(question.id, v)}
            placeholder={question.placeholder}
            error={!!error}
          />
        );
    }
  };

  return (
    <FieldGroup
      label={question.text}
      required={question.required}
      hint={question.hint}
      error={error}
      documentInfo={question.documentInfo}
    >
      {renderInput()}

      {/* Conditional sub-questions — fully wired to global state */}
      {question.conditionals?.map((cond) => {
        if (stringValue === cond.showWhen) {
          const condValue = allAnswers[cond.question.id];
          const condStringValue =
            typeof condValue === 'string'
              ? condValue
              : Array.isArray(condValue)
                ? condValue
                : '';
          return (
            <div
              key={cond.question.id}
              className="conditional-field"
              style={{ marginTop: '12px', paddingLeft: '16px', borderLeft: '3px solid var(--color-primary-light)' }}
            >
              <QuestionRenderer
                question={cond.question}
                value={condStringValue}
                onChange={onChange}
                error={allErrors[cond.question.id]}
                allAnswers={allAnswers}
                allErrors={allErrors}
              />
            </div>
          );
        }
        return null;
      })}
    </FieldGroup>
  );
};
