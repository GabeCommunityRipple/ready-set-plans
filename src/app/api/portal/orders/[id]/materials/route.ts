import { generateMaterialsList, MAX_PDF_BYTES } from '@/lib/materials-estimator'
import { verifyOrderOwnership } from '@/lib/portal-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// Analyzing a plan PDF takes well past the default serverless limit.
export const maxDuration = 300

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const access = await verifyOrderOwnership(id)
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const { data: latestFinal, error: fileError } = await supabaseAdmin
      .from('job_files')
      .select('file_name, file_path')
      .eq('job_id', id)
      .eq('file_type', 'final')
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fileError) {
      console.error('Materials list: file lookup failed', fileError)
      return NextResponse.json({ error: 'Failed to load plan files' }, { status: 500 })
    }

    if (!latestFinal) {
      return NextResponse.json(
        { error: 'No final plans are available for this order yet' },
        { status: 400 }
      )
    }

    if (!latestFinal.file_name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: `The latest final file (${latestFinal.file_name}) is not a PDF, so it cannot be analyzed` },
        { status: 400 }
      )
    }

    const { data: pdfBlob, error: downloadError } = await supabaseAdmin.storage
      .from('uploads')
      .download(latestFinal.file_path)

    if (downloadError || !pdfBlob) {
      console.error('Materials list: download failed', { path: latestFinal.file_path, downloadError })
      return NextResponse.json({ error: 'Failed to download the plan PDF' }, { status: 500 })
    }

    if (pdfBlob.size > MAX_PDF_BYTES) {
      return NextResponse.json(
        { error: 'The plan PDF is too large to analyze (limit 20MB)' },
        { status: 400 }
      )
    }

    const pdfBase64 = Buffer.from(await pdfBlob.arrayBuffer()).toString('base64')
    const materialsText = await generateMaterialsList(pdfBase64)

    return new NextResponse(materialsText, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Materials list: unexpected error', error)
    const message = error instanceof Error ? error.message : 'Failed to generate materials list'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
