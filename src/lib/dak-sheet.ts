import { supabaseAdmin } from '@/lib/supabase/admin'
import { google } from 'googleapis'

const SPREADSHEET_ID = '1INeeEKHBtEjg2lNcJZs5Uf0F6o-Jre2mwDvFSBnm0Ro'
const SHEET_NAME = '2026 Jobs'
const TARGET_COLUMN = 'AK'
const NAME_COLUMN_INDEX = 0 // column A
const ADDRESS_COLUMN_INDEX = 2 // column C
// The job number column is located by its header text rather than hardcoded, so
// it keeps working if DAK inserts or reorders columns.
const JOB_NUMBER_HEADER = 'job number'
const HEADER_SCAN_ROWS = 5
// Wide enough to cover the job number column wherever it sits.
const SEARCH_RANGE = 'A:BZ'

export type PushToSheetResult =
  | { success: true; row: number; matchedOn: string; fileName: string }
  | { success: false; error: string; status: number }

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

/**
 * Writes the newest final file's public URL into column AK of the DAK sheet, on
 * the row matching the job by DAK job number (column located by its "Job Number"
 * header), then by name (column A), then by site address (column C).
 *
 * Performs no auth checks — callers are responsible for authorizing the push.
 */
export async function pushJobToSheet(jobId: string): Promise<PushToSheetResult> {
  try {
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('id, job_name, job_site_address, dak_job_number')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return { success: false, error: 'Job not found', status: 404 }
    }

    const jobName = (job.job_name || '').trim()
    const jobAddress = (job.job_site_address || '').trim()
    const jobNumber = (job.dak_job_number || '').trim()
    if (!jobName && !jobAddress && !jobNumber) {
      return {
        success: false,
        error: 'Job has no number, name, or site address to match against',
        status: 400,
      }
    }

    // Only the newest final file gets pushed.
    const { data: latestFile, error: filesError } = await supabaseAdmin
      .from('job_files')
      .select('file_name, file_path, uploaded_at')
      .eq('job_id', jobId)
      .eq('file_type', 'final')
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (filesError) {
      console.error('Push to sheet file lookup error:', filesError)
      return { success: false, error: 'Failed to load job files', status: 500 }
    }

    if (!latestFile) {
      return { success: false, error: 'No final files to push', status: 400 }
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

    // One wide read covers the name column (A), the address column (C), and the
    // job number column wherever its header turns out to be.
    let rows: unknown[][]
    try {
      const { data: sheetValues } = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${quotedTitle}!${SEARCH_RANGE}`,
      })
      rows = sheetValues.values || []
    } catch (lookupError) {
      console.error('Push to sheet range read error:', lookupError)
      return {
        success: false,
        error: `Could not read the "${SHEET_NAME}" tab in the DAK sheet`,
        status: 404,
      }
    }

    // Locate the job number column by its header text. A title row above the
    // headers is common, so scan the first few rows rather than only row 1.
    let jobNumberColumnIndex = -1
    let headerRowIndex = -1
    for (let i = 0; i < Math.min(HEADER_SCAN_ROWS, rows.length); i++) {
      const columnIndex = (rows[i] || []).findIndex(
        (cell) => typeof cell === 'string' && cell.trim().toLowerCase() === JOB_NUMBER_HEADER
      )
      if (columnIndex !== -1) {
        headerRowIndex = i
        jobNumberColumnIndex = columnIndex
        break
      }
    }

    if (jobNumber && jobNumberColumnIndex === -1) {
      console.warn(
        `Push to sheet: no "Job Number" header found in the first ${HEADER_SCAN_ROWS} rows of "${SHEET_NAME}"; falling back to name matching`
      )
    }

    // Everything below the detected header row is data.
    const firstDataRow = headerRowIndex + 1

    // Rows come back truncated at the last populated cell, so a row matching on
    // name may have no column C at all.
    const findRow = (columnIndex: number, value: string, exact: boolean) => {
      if (!value || columnIndex < 0) return -1
      const needle = value.toLowerCase()
      return rows.findIndex((row, rowIndex) => {
        if (rowIndex < firstDataRow) return false
        const cell = row?.[columnIndex]
        if (typeof cell !== 'string') return false
        const candidate = cell.trim().toLowerCase()
        return exact ? candidate === needle : candidate.includes(needle)
      })
    }

    // Job number is the most reliable key, so it is tried first. It is matched
    // exactly — a substring match would let DAK-2026-4 hit DAK-2026-42.
    let matchIndex = findRow(jobNumberColumnIndex, jobNumber, true)
    let matchedOn = 'DAK job number'

    // Older jobs predate the job number field, so name matching stays as the
    // fallback, with site address behind it.
    if (matchIndex === -1) {
      matchIndex = findRow(NAME_COLUMN_INDEX, jobName, false)
      matchedOn = 'job name'
    }

    if (matchIndex === -1) {
      matchIndex = findRow(ADDRESS_COLUMN_INDEX, jobAddress, false)
      matchedOn = 'job site address'
    }

    if (matchIndex === -1) {
      return { success: false, error: 'Job name not found in DAK sheet', status: 404 }
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

    return {
      success: true,
      row: rowNumber,
      matchedOn,
      fileName: latestFile.file_name,
    }
  } catch (error) {
    console.error('Push to sheet unexpected error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return { success: false, error: message, status: 500 }
  }
}
