import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export interface PortalJob {
  id: string
  job_name: string
  job_site_address: string
  customer_email: string
  status: string
}

export type OrderAccess =
  | { ok: true; job: PortalJob }
  | { ok: false; error: string; status: number }

/**
 * Confirms the signed-in user owns this order, matching on email the same way
 * the rest of the portal does (case-insensitively).
 */
export async function verifyOrderOwnership(jobId: string): Promise<OrderAccess> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return { ok: false, error: 'Unauthorized', status: 401 }
  }

  const { data: job, error: jobError } = await supabaseAdmin
    .from('jobs')
    .select('id, job_name, job_site_address, customer_email, status')
    .eq('id', jobId)
    .single()

  if (jobError || !job) {
    return { ok: false, error: 'Job not found', status: 404 }
  }

  if (job.customer_email.toLowerCase() !== user.email.toLowerCase()) {
    console.error('Portal ownership check failed', {
      jobId,
      jobEmail: job.customer_email,
      userEmail: user.email,
    })
    return { ok: false, error: 'Forbidden', status: 403 }
  }

  return { ok: true, job }
}
