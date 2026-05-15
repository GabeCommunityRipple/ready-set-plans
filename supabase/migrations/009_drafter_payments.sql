ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS drafter_paid boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS drafter_paid_at timestamp with time zone;

ALTER TABLE public.revision_requests
  ADD COLUMN IF NOT EXISTS drafter_paid boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS drafter_paid_at timestamp with time zone;
