import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const jobId = formData.get('jobId') as string
    const revisionNotes = formData.get('revisionNotes') as string
    const files = formData.getAll('files') as File[]

    if (!jobId || !revisionNotes) {
      return NextResponse.json({ error: 'Job ID and revision notes are required' }, { status: 400 })
    }

    // Get job details and verify ownership
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('id, job_name, customer_email, drafter_id')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.customer_email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Upload files server-side using supabaseAdmin
    const uploadedFilePaths: string[] = []
    for (const file of files) {
      if (!(file instanceof File) || file.size === 0) continue

      const fileName = `revision-${Date.now()}-${file.name}`
      const filePath = `jobs/${jobId}/revisions/${fileName}`
      const buffer = Buffer.from(await file.arrayBuffer())

      const { error: uploadError } = await supabaseAdmin.storage
        .from('uploads')
        .upload(filePath, buffer, { contentType: file.type })

      if (uploadError) {
        console.error('Revision file upload error:', uploadError)
        continue
      }

      await supabaseAdmin.from('job_files').insert({
        job_id: jobId,
        file_name: file.name,
        file_path: filePath,
        file_type: 'revision',
      })

      uploadedFilePaths.push(filePath)
    }

    // Create revision request
    const { data: revision, error: revisionError } = await supabaseAdmin
      .from('revision_requests')
      .insert({
        job_id: jobId,
        request_text: revisionNotes,
      })
      .select()
      .single()

    if (revisionError) {
      console.error('Failed to create revision request:', revisionError)
      return NextResponse.json({ error: 'Failed to create revision request' }, { status: 500 })
    }

    // Send email to drafter
    if (job.drafter_id) {
      const { data: drafterUser } = await supabaseAdmin.auth.admin.getUserById(job.drafter_id)

      if (drafterUser.user?.email) {
        let fileLinksHtml = ''
        if (uploadedFilePaths.length > 0) {
          const signedUrls = await Promise.all(
            uploadedFilePaths.map(async (path) => {
              const { data } = await supabaseAdmin.storage
                .from('uploads')
                .createSignedUrl(path, 60 * 60 * 24 * 7) // 7 days
              return { name: path.split('/').pop(), url: data?.signedUrl }
            })
          )
          const valid = signedUrls.filter(f => f.url)
          if (valid.length > 0) {
            fileLinksHtml = `
              <div style="margin-top: 16px;">
                <strong>Annotated Files:</strong>
                <ul style="margin-top: 8px;">
                  ${valid.map(f => `<li><a href="${f.url}">${f.name}</a></li>`).join('')}
                </ul>
              </div>`
          }
        }

        await sendEmail(drafterUser.user.email, 'Revision Requested', `
          <h1>Revision Requested</h1>
          <p>A customer has requested revisions for the job ${job.job_name}.</p>
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <strong>Revision Notes:</strong><br>
            ${revisionNotes.replace(/\n/g, '<br>')}
          </div>
          ${fileLinksHtml}
          <p>Please review the feedback and update the plans accordingly.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/drafter/jobs/${jobId}">View Job & Revisions</a>
        `)
      }
    }

    return NextResponse.json({ success: true, revision })
  } catch (error) {
    console.error('Error creating revision request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
