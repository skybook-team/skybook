import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toEmail, toName, fromName, amount, groupName } = body

    if (!toEmail || !amount) {
      return NextResponse.json(
        { error: 'toEmail and amount are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY not configured' },
        { status: 500 }
      )
    }

    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    const { data, error } = await resend.emails.send({
      from: 'SettleUp <no-reply@settleup.app>',
      to: toEmail,
      subject: `Reminder: You owe ${fromName || 'someone'} $${Number(amount).toFixed(2)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>SettleUp Reminder</title>
        </head>
        <body style="font-family: Inter, Arial, sans-serif; background: #030712; color: #f9fafb; margin: 0; padding: 40px 20px;">
          <div style="max-width: 520px; margin: 0 auto;">
            <div style="background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                <div style="width: 36px; height: 36px; background: #22c55e; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: black; font-weight: bold; font-size: 16px;">S</span>
                </div>
                <span style="font-size: 20px; font-weight: 700; color: #f9fafb;">SettleUp</span>
              </div>

              <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px; color: #f9fafb;">
                Hi ${toName || 'there'}!
              </h1>
              <p style="color: #9ca3af; margin: 0 0 24px; font-size: 15px; line-height: 1.6;">
                This is a friendly reminder that you have an outstanding balance in your SettleUp group.
              </p>

              <div style="background: #1f2937; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 4px; color: #6b7280; font-size: 13px;">You owe</p>
                <p style="margin: 0; font-size: 32px; font-weight: 700; color: #22c55e;">
                  $${Number(amount).toFixed(2)}
                </p>
                ${fromName ? `<p style="margin: 8px 0 0; color: #9ca3af; font-size: 14px;">to ${fromName}${groupName ? ` in ${groupName}` : ''}</p>` : ''}
              </div>

              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://settleup.app'}/dashboard"
                style="display: block; background: #22c55e; color: black; text-decoration: none; font-weight: 600; text-align: center; padding: 14px; border-radius: 10px; font-size: 15px;">
                View in SettleUp
              </a>

              <p style="color: #374151; font-size: 12px; margin: 24px 0 0; text-align: center;">
                You received this because someone used SettleUp to send you a reminder.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('Email reminder error:', err)
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    )
  }
}
