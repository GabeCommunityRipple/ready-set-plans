import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { google } from 'googleapis'
import { NextRequest, NextResponse } from 'next/server'

const SPREADSHEET_ID = '1INeeEKHBtEjg2lNcJZs5Uf0F6o-Jre2mwDvFSBnm0Ro'
const SHEET_NAME = '2026 Jobs'
const TARGET_COLUMN = 'AK'
const NAME_COLUMN_INDEX = 0 // column A
const ADDRESS_COLUMN_INDEX = 2 // column C

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
      .select('id, job_name, job_site_address')
      .eq('id', id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const jobName = (job.job_name || '').trim()
    const jobAddress = (job.job_site_address || '').trim()
    if (!jobName && !jobAddress) {
      return NextResponse.json(
        { error: 'Job has no name or site address to match against' },
        { status: 400 }
      )
    }

    // Only the newest final file gets pushed.
    const { data: latestFile, error: filesError } = await supabaseAdmin
      .from('job_files')
      .select('file_name, file_path, uploaded_at')
      .eq('job_id', id)
      .eq('file_type', 'final')
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (filesError) {
      console.error('Push to sheet file lookup error:', filesError)
      return NextResponse.json({ error: 'Failed to load job files' }, { status: 500 })
    }

    if (!latestFile) {
      return NextResponse.json({ error: 'No final files to push' }, { status: 400 })
    }

    const fileUrl = supabaseAdmin.storage
      .from('uploads')
      .getPublicUrl(latestFile.file_path).data.publicUrl

    const credentials = loadServiceAccount()
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const sheets = google.sheets({ version: 'v4', auth })

    const quotedTitle = quoteSheetTitle(SHEET_NAME)

    // A:C in one read covers both the name column (A) and the address column (C).
    let rows: unknown[][]
    try {
      const { data: nameAndAddressColumns } = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${quotedTitle}!A:C`,
      })
      rows = nameAndAddressColumns.values || []
    } catch (lookupError) {
      console.error('Push to sheet range read error:', lookupError)
      return NextResponse.json(
        { error: `Could not read the "${SHEET_NAME}" tab in the DAK sheet` },
        { status: 404 }
      )
    }

    // Rows come back truncated at the last populated cell, so a row matching on
    // name may have no column C at all.
    const findRow = (columnIndex: number, value: string) => {
      if (!value) return -1
      const needle = value.toLowerCase()
      return rows.findIndex((row) => {
        const cell = row?.[columnIndex]
        return typeof cell === 'string' && cell.toLowerCase().includes(needle)
      })
    }

    // Name is the primary key; site address is the fallback.
    let matchIndex = findRow(NAME_COLUMN_INDEX, jobName)
    let matchedOn = 'job name'

    if (matchIndex === -1) {
      matchIndex = findRow(ADDRESS_COLUMN_INDEX, jobAddress)
      matchedOn = 'job site address'
    }

    if (matchIndex === -1) {
      return NextResponse.json(
        { error: 'Job name not found in DAK sheet' },
        { status: 404 }
      )
    }

    const rowNumber = matchIndex + 1

    // update() overwrites the cell, so any existing AK value is replaced.
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${quotedTitle}!${TARGET_COLUMN}${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[fileUrl]],
      },
    })

    return NextResponse.json({
      success: true,
      row: rowNumber,
      matchedOn,
      fileName: latestFile.file_name,
    })
  } catch (error) {
    console.error('Push to sheet unexpected error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
