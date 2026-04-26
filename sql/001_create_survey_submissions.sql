-- ========================================
-- RentaFácil: Database Schema for Supabase
-- Migration: Create survey_submissions table
-- ========================================

-- Table to store all survey submissions
CREATE TABLE IF NOT EXISTS public.survey_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Client identification
  client_name TEXT NOT NULL,
  client_nif TEXT NOT NULL,
  
  -- Survey data (all answers stored as JSONB)
  answers JSONB NOT NULL DEFAULT '{}',
  
  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Review workflow
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'reviewed', 'completed', 'archived')),
  
  -- Reviewer notes (optional, filled by the accountant)
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  
  -- Standard audit columns
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_survey_submissions_nif ON public.survey_submissions(client_nif);
CREATE INDEX IF NOT EXISTS idx_survey_submissions_status ON public.survey_submissions(status);
CREATE INDEX IF NOT EXISTS idx_survey_submissions_submitted ON public.survey_submissions(submitted_at DESC);

-- Enable Row Level Security
ALTER TABLE public.survey_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for public form submission)
CREATE POLICY "Allow anonymous inserts" ON public.survey_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Only authenticated users can read submissions
CREATE POLICY "Authenticated users can read" ON public.survey_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can update (for review workflow)  
CREATE POLICY "Authenticated users can update" ON public.survey_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_survey_submissions_updated
  BEFORE UPDATE ON public.survey_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.survey_submissions IS 'Stores all IRPF survey submissions from clients';
COMMENT ON COLUMN public.survey_submissions.answers IS 'JSONB containing all question answers keyed by question_id';
COMMENT ON COLUMN public.survey_submissions.status IS 'Workflow status: pending → reviewed → completed → archived';
