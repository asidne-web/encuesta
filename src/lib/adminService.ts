/* ========================================
   Admin Service — Supabase Queries
   ======================================== */

import { supabase } from './supabase';
import type { SurveyAnswers } from '../types/survey';

export interface SubmissionRow {
  id: string;
  client_name: string;
  client_nif: string;
  answers: SurveyAnswers;
  started_at: string;
  submitted_at: string;
  status: 'pending' | 'reviewed' | 'completed' | 'archived';
  reviewer_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  reviewed: number;
  completed: number;
  archived: number;
  today: number;
}

export type StatusFilter = 'all' | 'pending' | 'reviewed' | 'completed' | 'archived';

interface FetchOptions {
  status?: StatusFilter;
  search?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderAsc?: boolean;
}

/* ---- Dashboard Stats ---- */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  if (!supabase) throw new Error('Supabase not configured');

  const [totalRes, pendingRes, reviewedRes, completedRes, archivedRes, todayRes] = await Promise.all([
    supabase.from('survey_submissions').select('id', { count: 'exact', head: true }),
    supabase.from('survey_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('survey_submissions').select('id', { count: 'exact', head: true }).eq('status', 'reviewed'),
    supabase.from('survey_submissions').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('survey_submissions').select('id', { count: 'exact', head: true }).eq('status', 'archived'),
    supabase.from('survey_submissions').select('id', { count: 'exact', head: true })
      .gte('submitted_at', new Date(Date.now() - 86400000).toISOString()),
  ]);

  return {
    total: totalRes.count ?? 0,
    pending: pendingRes.count ?? 0,
    reviewed: reviewedRes.count ?? 0,
    completed: completedRes.count ?? 0,
    archived: archivedRes.count ?? 0,
    today: todayRes.count ?? 0,
  };
}

/* ---- Fetch Submissions List ---- */
export async function fetchSubmissions(options: FetchOptions = {}): Promise<{
  data: SubmissionRow[];
  total: number;
}> {
  if (!supabase) throw new Error('Supabase not configured');

  const { status = 'all', search = '', page = 1, pageSize = 20, orderBy = 'submitted_at', orderAsc = false } = options;

  let query = supabase
    .from('survey_submissions')
    .select('*', { count: 'exact' });

  // Status filter
  if (status !== 'all') {
    query = query.eq('status', status);
  }

  // Search by name or NIF
  if (search.trim()) {
    query = query.or(`client_name.ilike.%${search}%,client_nif.ilike.%${search}%`);
  }

  // Order
  query = query.order(orderBy, { ascending: orderAsc });

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return {
    data: (data || []) as SubmissionRow[],
    total: count ?? 0,
  };
}

/* ---- Fetch Single Submission ---- */
export async function fetchSubmission(id: string): Promise<SubmissionRow | null> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('survey_submissions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as SubmissionRow;
}

/* ---- Update Status ---- */
export async function updateSubmissionStatus(
  id: string,
  status: SubmissionRow['status'],
  reviewerEmail?: string
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const updates: Record<string, unknown> = { status };
  if (status === 'reviewed' || status === 'completed') {
    updates.reviewed_at = new Date().toISOString();
    if (reviewerEmail) updates.reviewed_by = reviewerEmail;
  }

  const { error } = await supabase
    .from('survey_submissions')
    .update(updates)
    .eq('id', id);

  if (error) throw new Error(error.message);
}

/* ---- Update Reviewer Notes ---- */
export async function updateReviewerNotes(id: string, notes: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('survey_submissions')
    .update({ reviewer_notes: notes })
    .eq('id', id);

  if (error) throw new Error(error.message);
}
