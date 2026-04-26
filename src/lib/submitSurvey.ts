/* ========================================
   Survey Submission Service
   ========================================
   Handles submitting survey data either to Supabase
   or falling back to local console logging.
   ======================================== */

import { supabase, isSupabaseConfigured } from './supabase';
import type { SurveyAnswers } from '../types/survey';

export interface SurveySubmission {
  client_name: string;
  client_nif: string;
  answers: SurveyAnswers;
  started_at: string;
  submitted_at: string;
  status: 'pending' | 'reviewed' | 'completed';
}

export interface SubmitResult {
  success: boolean;
  message: string;
  id?: string;
  mode: 'supabase' | 'local';
}

/**
 * Submits the survey data.
 * - If Supabase is configured → inserts into the `survey_submissions` table.
 * - Otherwise → logs to console and returns success (local-only mode).
 */
export async function submitSurvey(
  clientName: string,
  clientNIF: string,
  answers: SurveyAnswers,
  startedAt: string
): Promise<SubmitResult> {
  const submission: SurveySubmission = {
    client_name: clientName,
    client_nif: clientNIF,
    answers,
    started_at: startedAt,
    submitted_at: new Date().toISOString(),
    status: 'pending',
  };

  // --- Supabase mode ---
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('survey_submissions')
        .insert([submission])
        .select('id')
        .single();

      if (error) {
        console.error('❌ Supabase insert error:', error);
        return {
          success: false,
          message: `Error al guardar: ${error.message}`,
          mode: 'supabase',
        };
      }

      return {
        success: true,
        message: 'Cuestionario enviado correctamente a la base de datos.',
        id: data?.id,
        mode: 'supabase',
      };
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      return {
        success: false,
        message: 'Error de conexión con el servidor.',
        mode: 'supabase',
      };
    }
  }

  // --- Local mode ---
  console.log('📨 [LOCAL MODE] Survey submitted:', JSON.stringify(submission, null, 2));
  
  return {
    success: true,
    message: 'Cuestionario guardado localmente (modo sin conexión).',
    id: `local-${Date.now()}`,
    mode: 'local',
  };
}
