ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check
  CHECK (status IN ('pending', 'in_progress', 'completed', 'revision_requested', 'needs_info', 'delivered', 'approved'));
