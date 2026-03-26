import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify drafter role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'drafter') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const jobId = formData.get('jobId') as string | null

    if (!file || !jobId) {
      return NextResponse.json({ error: 'file and jobId are required' }, { status: 400 })
    }

    // Verify the drafter owns this job
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .eq('drafter_id', user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found or not assigned to you' }, { status: 404 })
    }

    const filePath = `jobs/${jobId}/completed/${file.name}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('uploads')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      console.error('Storage upload failed:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { error: dbError } = await supabaseAdmin
      .from('job_files')
      .insert({
        job_id: jobId,
        file_name: file.name,
        file_path: filePath,
        file_type: 'drafter_upload',
      })

    if (dbError) {
      console.error('job_files insert failed:', dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ filePath, fileName: file.name })
  } catch (error) {
    console.error('Unexpected error in drafter upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
