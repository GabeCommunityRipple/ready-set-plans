import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  await params

  const body = await request.json()
  const { type, id } = body as { type: 'job' | 'revision', id: string }

  if (!id || (type !== 'job' && type !== 'revision')) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const table = type === 'job' ? 'jobs' : 'revision_requests'

  const { error } = await supabaseAdmin
    .from(table)
    .update({
      drafter_paid: true,
      drafter_paid_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Mark paid error:', error)
    return NextResponse.json({ error: 'Failed to mark as paid' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
