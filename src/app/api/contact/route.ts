import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
    }

    const html = `
      <div style="font-family: system-ui, sans-serif; max-width: 600px;">
        <h2 style="color: #1A2332;">New Contact Form Submission</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 100px;">Name:</td>
            <td style="padding: 8px 0; color: #475569;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #374151;">Email:</td>
            <td style="padding: 8px 0; color: #475569;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          ${phone ? `<tr>
            <td style="padding: 8px 0; font-weight: 600; color: #374151;">Phone:</td>
            <td style="padding: 8px 0; color: #475569;"><a href="tel:${phone}">${phone}</a></td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #374151; vertical-align: top;">Message:</td>
            <td style="padding: 8px 0; color: #475569;">${message.replace(/\n/g, '<br>')}</td>
          </tr>
        </table>
      </div>
    `

    const result = await sendEmail(
      'info@readysetplans.com',
      `Contact Form: Message from ${name}`,
      html
    )

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Message sent successfully' })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
