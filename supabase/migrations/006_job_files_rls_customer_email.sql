-- Fix job_files customer RLS policy to use customer_email instead of customer_id.
-- The jobs table no longer uses customer_id for auth; it uses customer_email matched
-- against the JWT email claim.

DROP POLICY IF EXISTS "Customers can view files for own jobs" ON public.job_files;
CREATE POLICY "Customers can view files for own jobs" ON public.job_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE id = job_id
        AND customer_email = auth.jwt()->>'email'
    )
  );
