import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  console.log('[email] Attempting to send email:', { to, from: 'Ready Set Plans <info@readysetplans.com>', subject })

  try {
    const result = await resend.emails.send({
      from: 'Ready Set Plans <info@readysetplans.com>',
      to: [to],
      subject,
      html,
    });

    if (result.error) {
      console.error('[email] Resend error:', { to, subject, error: result.error });
      return { success: false, error: result.error.message };
    }

    console.log('[email] Sent successfully:', { to, subject, id: result.data?.id })
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};