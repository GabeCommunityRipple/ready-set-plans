-- Adds DAK's own job number so RSP jobs can be matched back to rows in the DAK sheet.
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS dak_job_number text;
