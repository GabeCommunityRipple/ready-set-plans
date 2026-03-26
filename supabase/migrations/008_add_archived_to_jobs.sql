ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;
