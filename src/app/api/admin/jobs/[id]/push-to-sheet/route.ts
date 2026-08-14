import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { google } from 'googleapis'
import { NextRequest, NextResponse } from 'next/server'

const SPREADSHEET_ID = '1INeeEKHBtEjg2lNcJZs5Uf0F6o-Jre2mwDvFSBnm0Ro'
const SHEET_GID = 531107093
const TARGET_COLUMN = 'AK'

// Service account JSON may be stored raw or base64-encoded, and private keys
// pasted into env files usually keep their newlines escaped.
function loadServiceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not set')
  }

  let parsed: { client_email?: string; private_key?: string }
  try {
    parsed = JSON.parse(raw)
  } catch {
    try {
      parsed = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'))
    } catch {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON')
    }
  }

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is missing client_email or private_key')
  }

  return {
    client_email: parsed.client_email,
    private_key: parsed.private_key.replace(/\\n/g, '\n'),
  }
}

// A1 notation requires quoting titles that contain spaces or punctuation,
// and internal single quotes are escaped by doubling them.
function quoteSheetTitle(title: string) {
  return `'${title.replace(/'/g, "''")}'`
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('id, job_name')
      .eq('id', id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const jobName = (job.job_name || '').trim()
    if (!jobName) {
      return NextResponse.json({ error: 'Job has no name to match against' }, { status: 400 })
    }

    const { data: files, error: filesError } = await supabaseAdmin
      .from('job_files')
      .select('file_name, file_path, uploaded_at')
      .eq('job_id', id)
      .eq('file_type', 'final')
      .order('uploaded_at', { ascending: true })

    if (filesError) {
      console.error('Push to sheet file lookup error:', filesError)
      return NextResponse.json({ error: 'Failed to load job files' }, { status: 500 })
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No final files to push' }, { status: 400 })
    }

    const fileUrls = files.map(
      (file) => supabaseAdmin.storage.from('uploads').getPublicUrl(file.file_path).data.publicUrl
    )

    const credentials = loadServiceAccount()
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const sheets = google.sheets({ version: 'v4', auth })

    // The values API addresses sheets by title, so resolve the gid first.
    const { data: spreadsheet } = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: 'sheets.properties(sheetId,title)',
    })

    const sheetTitle = spreadsheet.sheets?.find(
      (sheet) => sheet.properties?.sheetId === SHEET_GID
    )?.properties?.title

    if (!sheetTitle) {
      return NextResponse.json(
        { error: `Sheet with gid ${SHEET_GID} not found in DAK sheet` },
        { status: 404 }
      )
    }

    const quotedTitle = quoteSheetTitle(sheetTitle)

    const { data: columnA } = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${quotedTitle}!A:A`,
    })

    const needle = jobName.toLowerCase()
    const rows = columnA.values || []
    const matchIndex = rows.findIndex((row) => {
      const cell = row?.[0]
      return typeof cell === 'string' && cell.toLowerCase().includes(needle)
    })

    if (matchIndex === -1) {
      return NextResponse.json(
        { error: 'Job name not found in DAK sheet' },
        { status: 404 }
      )
    }

    const rowNumber = matchIndex + 1

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${quotedTitle}!${TARGET_COLUMN}${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[fileUrls.join('\n')]],
      },
    })

    return NextResponse.json({
      success: true,
      row: rowNumber,
      fileCount: fileUrls.length,
    })
  } catch (error) {
    console.error('Push to sheet unexpected error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
