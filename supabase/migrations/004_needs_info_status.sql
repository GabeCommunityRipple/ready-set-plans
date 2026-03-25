-- Add 'needs_info' to the jobs status check constraint
-- PostgreSQL requires dropping and re-creating check constraints
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check
  CHECK (status IN ('pending', 'in_progress', 'completed', 'revision_requested', 'needs_info'));

-- Store AI check results on the job
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS missing_items TEXT[] DEFAULT '{}';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS ai_message TEXT;
