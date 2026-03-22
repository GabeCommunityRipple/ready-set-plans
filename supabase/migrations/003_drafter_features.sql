-- Add drafter support to jobs table
ALTER TABLE public.jobs ADD COLUMN drafter_id UUID REFERENCES auth.users(id);

-- Add file_type to job_files table
ALTER TABLE public.job_files ADD COLUMN file_type TEXT DEFAULT 'customer_upload' CHECK (file_type IN ('customer_upload', 'draft', 'revision', 'final'));

-- Update RLS policies for drafters
CREATE POLICY "Drafters can update assigned jobs" ON public.jobs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'drafter'
    ) AND drafter_id = auth.uid()
  );

CREATE POLICY "Drafters can view assigned jobs" ON public.jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'drafter'
    ) AND drafter_id = auth.uid()
  );

-- Job files policies for drafters
CREATE POLICY "Drafters can view files for assigned jobs" ON public.job_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE id = job_id AND drafter_id = auth.uid()
    )
  );

CREATE POLICY "Drafters can insert files for assigned jobs" ON public.job_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE id = job_id AND drafter_id = auth.uid()
    )
  );

-- Revision requests policies for drafters
CREATE POLICY "Drafters can view revision requests for assigned jobs" ON public.revision_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE id = job_id AND drafter_id = auth.uid()
    )
  );