import { supabase } from './supabase';
import type { SurveyAnswers } from '../types/survey';

export interface SurveyDraft {
  client_nif: string;
  client_name: string;
  answers: SurveyAnswers;
  current_step: number;
}

export const draftService = {
  /**
   * Saves or updates a draft in Supabase
   */
  async saveDraft(draft: SurveyDraft) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    try {
      const { error } = await supabase
        .from('survey_drafts')
        .upsert({
          client_nif: draft.client_nif,
          client_name: draft.client_name,
          answers: draft.answers,
          current_step: draft.current_step,
          updated_at: new Date().toISOString()
        }, { onConflict: 'client_nif' });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error saving draft:', err);
      return { success: false, error: err };
    }
  },

  /**
   * Retrieves a draft by NIF
   */
  async getDraft(nif: string) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    try {
      const { data, error } = await supabase
        .from('survey_drafts')
        .select('*')
        .eq('client_nif', nif.toUpperCase())
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return { success: true, data: data as SurveyDraft | null };
    } catch (err) {
      console.error('Error fetching draft:', err);
      return { success: false, error: err };
    }
  },

  /**
   * Deletes a draft (call this after final submission)
   */
  async deleteDraft(nif: string) {
    if (!supabase) return { success: false };
    try {
      const { error } = await supabase
        .from('survey_drafts')
        .delete()
        .eq('client_nif', nif.toUpperCase());

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error deleting draft:', err);
      return { success: false };
    }
  }
};
