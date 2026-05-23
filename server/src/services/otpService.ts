import nodemailer from 'nodemailer';

export type OtpChannel = 'email' | 'phone';

type MailTransporter = nodemailer.Transporter;

let cachedTestTransporter: MailTransporter | null = null;
let testTransporterPromise: Promise<MailTransporter | null> | null = null;

const OTP_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function getTestTransporter(): Promise<MailTransporter | null> {
  if (cachedTestTransporter) return cachedTestTransporter;
  if (!testTransporterPromise) {
    testTransporterPromise = (async () => {
      try {
        const testAccount = await withTimeout(
          nodemailer.createTestAccount(),
          OTP_TIMEOUT_MS,
          'Ethereal test account'
        );
        cachedTestTransporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
        return cachedTestTransporter;
      } catch (err) {
        console.warn('[OTP] Could not create test mail account:', err);
        return null;
      } finally {
        testTransporterPromise = null;
      }
    })();
  }
  return testTransporterPromise;
}

async function createTransporter(): Promise<MailTransporter | null> {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Dev/local: try Ethereal; if network blocks it, OTP is still returned in API response
  if (process.env.NODE_ENV !== 'production') {
    return getTestTransporter();
  }

  return null;
}

export async function sendOtpEmail(to: string, otp: string, name: string) {
  try {
    const transporter = await withTimeout(createTransporter(), OTP_TIMEOUT_MS, 'Mail transporter');

    if (!transporter) {
      console.log('══════════════════════════════════════════');
      console.log(`[OTP] Email to ${to}`);
      console.log(`[OTP] Verification code: ${otp}`);
      console.log('══════════════════════════════════════════');
      return { sent: false, previewUrl: null, fallback: true };
    }

    const from = process.env.SMTP_FROM || '"Aspirants Library" <noreply@aspirantslibrary.com>';

    const info = await withTimeout(
      transporter.sendMail({
        from,
        to,
        subject: `${otp} — Aspirants Library verification code`,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0c1f3d; color: #fff; border-radius: 16px;">
            <h1 style="color: #f5c518; margin: 0 0 8px;">Aspirants Library</h1>
            <p style="color: #94a3b8;">Hi ${name},</p>
            <p style="color: #e2e8f0;">Your verification code is:</p>
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f5c518; margin: 24px 0;">${otp}</p>
            <p style="color: #94a3b8; font-size: 14px;">Valid for 10 minutes.</p>
          </div>
        `,
        text: `Aspirants Library — Your code is ${otp}. Valid 10 minutes.`,
      }),
      OTP_TIMEOUT_MS,
      'sendMail'
    );

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('[OTP] Test email preview:', previewUrl);
    } else {
      console.log(`[OTP] Email sent to ${to}`);
    }

    return { sent: true, previewUrl: previewUrl || null, fallback: false };
  } catch (err) {
    console.warn('[OTP] Email send failed:', err);
    console.log('══════════════════════════════════════════');
    console.log(`[OTP] Use this code for ${to}: ${otp}`);
    console.log('══════════════════════════════════════════');
    return { sent: false, previewUrl: null, fallback: true };
  }
}

export async function sendOtpPhone(phone: string, otp: string) {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const body = `Aspirants Library: Your code is ${otp}. Valid 10 min.`;
      const url = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
      const auth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString('base64');

      await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`,
          From: process.env.TWILIO_PHONE_NUMBER || '',
          Body: body,
        }),
      });

      return { sent: true, devMode: false };
    } catch (err) {
      console.warn('[OTP] Twilio failed:', err);
    }
  }

  console.log('══════════════════════════════════════════');
  console.log(`[OTP] SMS to ${phone}: ${otp}`);
  console.log('══════════════════════════════════════════');
  return { sent: true, devMode: true };
}

export async function deliverOtp(params: {
  otp: string;
  name: string;
  email: string;
  phone: string;
  channel: OtpChannel;
}) {
  const { otp, name, email, phone, channel } = params;

  if (channel === 'email') {
    const result = await sendOtpEmail(email, otp, name);
    return {
      channel: 'email' as const,
      emailSent: result.sent,
      emailPreviewUrl: result.previewUrl,
      phoneSent: false,
      showOtpInApp: result.fallback || !result.sent,
    };
  }

  const phoneResult = await sendOtpPhone(phone, otp);
  return {
    channel: 'phone' as const,
    emailSent: false,
    emailPreviewUrl: null,
    phoneSent: phoneResult.sent,
    phoneDevMode: phoneResult.devMode,
    showOtpInApp: true,
  };
}
