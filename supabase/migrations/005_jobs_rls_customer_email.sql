-- Fix customer RLS policies to match on customer_email from JWT
-- instead of customer_id (UUID), since jobs are keyed by email.

DROP POLICY IF EXISTS "Customers can view own jobs" ON public.jobs;
CREATE POLICY "Customers can view own jobs" ON public.jobs
  FOR SELECT USING (customer_email = auth.jwt()->>'email');

DROP POLICY IF EXISTS "Customers can update own jobs" ON public.jobs;
CREATE POLICY "Customers can update own jobs" ON public.jobs
  FOR UPDATE USING (customer_email = auth.jwt()->>'email');
