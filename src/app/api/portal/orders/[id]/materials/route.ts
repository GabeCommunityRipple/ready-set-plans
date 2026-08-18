import { generateMaterialsList, MAX_PDF_BYTES } from '@/lib/materials-estimator'
import { verifyOrderOwnership } from '@/lib/portal-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// Vercel Pro's maximum. The Anthropic call uses a 240s SDK timeout so it aborts
// with a logged error inside this budget rather than being killed mid-request.
export const maxDuration = 300

// DEBUG: verbose console.error tracing through every step of this route.
// Remove once the failure has been identified.

// Error objects lose their useful fields when interpolated into a string, so
// pull out the non-enumerable ones alongside anything the SDK attached
// (Anthropic and Supabase errors carry status/code/details).
function describeError(error: unknown) {
  if (error instanceof Error) {
    return {
      ...(error as unknown as Record<string, unknown>),
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    }
  }
  return { nonError: true, raw: error }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startedAt = Date.now()
  const elapsed = () => `${Date.now() - startedAt}ms`

  try {
    const { id } = await params
    console.error('[materials] STEP 1 request received', { jobId: id, elapsed: elapsed() })

    const access = await verifyOrderOwnership(id)
    console.error('[materials] STEP 2 ownership check', {
      jobId: id,
      ok: access.ok,
      ...(access.ok
        ? { jobName: access.job.job_name, status: access.job.status }
        : { error: access.error, status: access.status }),
      elapsed: elapsed(),
    })

    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    // Fetching every file for the job (not just finals) so the log shows what
    // actually exists — a plan uploaded under the wrong file_type is invisible
    // if the query filters it out server-side.
    const { data: allFiles, error: fileError } = await supabaseAdmin
      .from('job_files')
      .select('id, file_name, file_path, file_type, uploaded_at')
      .eq('job_id', id)
      .order('uploaded_at', { ascending: false })

    if (fileError) {
      console.error('[materials] STEP 3 FAILED job_files query errored', {
        jobId: id,
        error: describeError(fileError),
        rawError: fileError,
        elapsed: elapsed(),
      })
      return NextResponse.json({ error: 'Failed to load plan files' }, { status: 500 })
    }

    const finalFiles = (allFiles ?? [])
      .filter((file) => file.file_type === 'final')
      .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())

    console.error('[materials] STEP 3 job_files found', {
      jobId: id,
      totalFiles: allFiles?.length ?? 0,
      finalFileCount: finalFiles.length,
      allRecords: allFiles,
      finalRecords: finalFiles,
      elapsed: elapsed(),
    })

    const latestFinal = finalFiles[0]

    if (!latestFinal) {
      console.error('[materials] STEP 3 FAILED no final files', {
        jobId: id,
        fileTypesPresent: (allFiles ?? []).map((file) => file.file_type),
        elapsed: elapsed(),
      })
      return NextResponse.json(
        { error: 'No final plans are available for this order yet' },
        { status: 400 }
      )
    }

    console.error('[materials] STEP 4 selected latest final', {
      jobId: id,
      fileId: latestFinal.id,
      fileName: latestFinal.file_name,
      filePath: latestFinal.file_path,
      uploadedAt: latestFinal.uploaded_at,
      elapsed: elapsed(),
    })

    if (!latestFinal.file_name.toLowerCase().endsWith('.pdf')) {
      console.error('[materials] STEP 4 FAILED not a PDF', {
        jobId: id,
        fileName: latestFinal.file_name,
        elapsed: elapsed(),
      })
      return NextResponse.json(
        { error: `The latest final file (${latestFinal.file_name}) is not a PDF, so it cannot be analyzed` },
        { status: 400 }
      )
    }

    console.error('[materials] STEP 5 downloading from storage', {
      jobId: id,
      bucket: 'uploads',
      path: latestFinal.file_path,
      elapsed: elapsed(),
    })

    const { data: pdfBlob, error: downloadError } = await supabaseAdmin.storage
      .from('uploads')
      .download(latestFinal.file_path)

    if (downloadError || !pdfBlob) {
      console.error('[materials] STEP 5 FAILED storage download', {
        jobId: id,
        bucket: 'uploads',
        path: latestFinal.file_path,
        hasBlob: Boolean(pdfBlob),
        error: describeError(downloadError),
        rawError: downloadError,
        elapsed: elapsed(),
      })
      return NextResponse.json({ error: 'Failed to download the plan PDF' }, { status: 500 })
    }

    console.error('[materials] STEP 5 storage download OK', {
      jobId: id,
      path: latestFinal.file_path,
      sizeBytes: pdfBlob.size,
      sizeMB: (pdfBlob.size / (1024 * 1024)).toFixed(2),
      blobType: pdfBlob.type,
      limitBytes: MAX_PDF_BYTES,
      elapsed: elapsed(),
    })

    if (pdfBlob.size > MAX_PDF_BYTES) {
      console.error('[materials] STEP 5 FAILED PDF over size limit', {
        jobId: id,
        sizeBytes: pdfBlob.size,
        limitBytes: MAX_PDF_BYTES,
        elapsed: elapsed(),
      })
      return NextResponse.json(
        { error: 'The plan PDF is too large to analyze (limit 20MB)' },
        { status: 400 }
      )
    }

    const pdfBase64 = Buffer.from(await pdfBlob.arrayBuffer()).toString('base64')
    console.error('[materials] STEP 6 encoded to base64', {
      jobId: id,
      rawBytes: pdfBlob.size,
      base64Length: pdfBase64.length,
      elapsed: elapsed(),
    })

    const materialsText = await generateMaterialsList(pdfBase64)

    console.error('[materials] STEP 8 SUCCESS returning materials list', {
      jobId: id,
      textLength: materialsText.length,
      elapsed: elapsed(),
    })

    return new NextResponse(materialsText, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('[materials] FAILED unexpected error', {
      error: describeError(error),
      rawError: error,
      elapsed: elapsed(),
    })
    const message = error instanceof Error ? error.message : 'Failed to generate materials list'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
