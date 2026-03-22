-- Create jobs table
CREATE TABLE public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL,
  business_name TEXT,
  job_name TEXT NOT NULL,
  job_site_address TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('deck', 'screen_porch')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'revision_requested')),
  total_amount INTEGER NOT NULL,
  promo_code TEXT,
  discount_amount INTEGER DEFAULT 0,
  customer_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_files table
CREATE TABLE public.job_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create promo_codes table
CREATE TABLE public.promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value INTEGER NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create revision_requests table
CREATE TABLE public.revision_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  request_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_requests ENABLE ROW LEVEL SECURITY;

-- Jobs policies
CREATE POLICY "Customers can view own jobs" ON public.jobs
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Drafters and admins can view all jobs" ON public.jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role IN ('drafter', 'admin')
    )
  );

CREATE POLICY "System can insert jobs" ON public.jobs
  FOR INSERT WITH CHECK (true);

-- Job files policies
CREATE POLICY "Customers can view files for own jobs" ON public.job_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE id = job_id AND customer_id = auth.uid()
    )
  );

CREATE POLICY "Drafters and admins can view all job files" ON public.job_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role IN ('drafter', 'admin')
    )
  );

CREATE POLICY "System can insert job files" ON public.job_files
  FOR INSERT WITH CHECK (true);

-- Promo codes policies (admins only)
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Revision requests policies
CREATE POLICY "Customers can view revision requests for own jobs" ON public.revision_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE id = job_id AND customer_id = auth.uid()
    )
  );

CREATE POLICY "Drafters and admins can view all revision requests" ON public.revision_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role IN ('drafter', 'admin')
    )
  );

CREATE POLICY "Customers can insert revision requests for own jobs" ON public.revision_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE id = job_id AND customer_id = auth.uid()
    )
  );