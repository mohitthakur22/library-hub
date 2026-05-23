import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { generateOtp, signToken } from '../lib/utils.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { deliverOtp, type OtpChannel } from '../services/otpService.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  collegeId: z.string().min(3),
  otpChannel: z.enum(['email', 'phone']).optional().default('email'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function formatZodError(e: z.ZodError) {
  return e.errors.map((err) => err.message).join(', ');
}

async function findUserByIdentifier(identifier: string, type: 'email' | 'phone') {
  if (type === 'email') {
    return prisma.user.findUnique({ where: { email: identifier } });
  }
  const cleaned = identifier.replace(/\D/g, '');
  return prisma.user.findFirst({
    where: {
      OR: [{ phone: identifier }, { phone: { endsWith: cleaned.slice(-10) } }],
    },
  });
}

router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const channel = data.otpChannel as OtpChannel;

    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) return res.status(400).json({ error: 'Email already registered' });

    const existingPhone = await prisma.user.findFirst({
      where: { phone: data.phone },
    });
    if (existingPhone) return res.status(400).json({ error: 'Phone number already registered' });

    const otp = generateOtp();
    const hashed = await bcrypt.hash(data.password, 10);

    const phoneDigits = data.phone.replace(/\D/g, '').slice(-10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        phone: phoneDigits,
        collegeId: data.collegeId,
        otp,
        otpExpires: new Date(Date.now() + 10 * 60 * 1000),
        emailVerified: false,
      },
    });

    const delivery = await deliverOtp({
      otp,
      name: data.name,
      email: data.email,
      phone: phoneDigits,
      channel,
    });

    const showOtpInApp =
      'showOtpInApp' in delivery && delivery.showOtpInApp === true;

    res.status(201).json({
      message:
        channel === 'email'
          ? delivery.emailSent
            ? 'Verification code sent to your email'
            : 'Account created — enter the verification code shown below'
          : 'Enter the verification code shown below (check server terminal for SMS)',
      userId: user.id,
      email: user.email,
      phone: user.phone,
      channel,
      emailSent: delivery.emailSent,
      emailPreviewUrl: delivery.emailPreviewUrl,
      phoneSent: delivery.phoneSent,
      showOtpInApp,
      otp: showOtpInApp || process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: formatZodError(e) });
    console.error('Register error:', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, phone, otp } = req.body;

  let user = null;
  if (email) user = await prisma.user.findUnique({ where: { email } });
  else if (phone) user = await findUserByIdentifier(phone, 'phone');

  if (!user || user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, otp: null, otpExpires: null },
  });

  const token = signToken({
    id: updated.id,
    email: updated.email,
    role: updated.role as 'STUDENT' | 'ADMIN',
    name: updated.name,
  });

  res.json({
    token,
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      phone: updated.phone,
      collegeId: updated.collegeId,
      photo: updated.photo,
    },
  });
});

router.post('/resend-otp', async (req, res) => {
  const { email, phone, channel = 'email' } = req.body;

  let user = null;
  if (email) user = await prisma.user.findUnique({ where: { email } });
  else if (phone) user = await findUserByIdentifier(phone, 'phone');

  if (!user) return res.status(404).json({ error: 'User not found' });

  const otp = generateOtp();
  await prisma.user.update({
    where: { id: user.id },
    data: { otp, otpExpires: new Date(Date.now() + 10 * 60 * 1000) },
  });

  const delivery = await deliverOtp({
    otp,
    name: user.name,
    email: user.email,
    phone: user.phone,
    channel: channel as OtpChannel,
  });

  const showOtpInApp = 'showOtpInApp' in delivery && delivery.showOtpInApp === true;

  res.json({
    message: 'OTP resent',
    channel,
    emailSent: delivery.emailSent,
    emailPreviewUrl: delivery.emailPreviewUrl,
    phoneSent: delivery.phoneSent,
    showOtpInApp,
    otp: showOtpInApp || process.env.NODE_ENV !== 'production' ? otp : undefined,
  });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.isBlocked) return res.status(403).json({ error: 'Account blocked' });
    if (!user.emailVerified) {
      return res.status(403).json({
        error: 'Please verify your account first',
        needsOtp: true,
        email: user.email,
        phone: user.phone,
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role as 'STUDENT' | 'ADMIN',
      name: user.name,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        collegeId: user.collegeId,
        photo: user.photo,
      },
    });
  } catch {
    res.status(400).json({ error: 'Invalid request' });
  }
});

router.post('/google', async (req, res) => {
  const { googleId, email, name, photo } = req.body;
  if (!googleId || !email) return res.status(400).json({ error: 'Google auth data required' });

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        googleId,
        email,
        name: name || email.split('@')[0],
        phone: '',
        emailVerified: true,
        photo,
      },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId, photo: photo || user.photo, emailVerified: true },
    });
  }

  if (user.isBlocked) return res.status(403).json({ error: 'Account blocked' });

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role as 'STUDENT' | 'ADMIN',
    name: user.name,
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      collegeId: user.collegeId,
      photo: user.photo,
    },
  });
});

router.post('/forgot-password', async (req, res) => {
  const { email, phone, channel = 'email' } = req.body;
  let user = null;
  if (email) user = await prisma.user.findUnique({ where: { email } });
  else if (phone) user = await findUserByIdentifier(phone, 'phone');

  if (!user) return res.json({ message: 'If account exists, OTP has been sent' });

  const otp = generateOtp();
  await prisma.user.update({
    where: { id: user.id },
    data: { otp, otpExpires: new Date(Date.now() + 10 * 60 * 1000) },
  });

  const delivery = await deliverOtp({
    otp,
    name: user.name,
    email: user.email,
    phone: user.phone,
    channel: channel as OtpChannel,
  });

  res.json({
    message: 'OTP sent',
    email: user.email,
    phone: user.phone,
    emailPreviewUrl: delivery.emailPreviewUrl,
    otp: process.env.NODE_ENV === 'development' ? otp : undefined,
  });
});

router.post('/reset-password', async (req, res) => {
  const { email, phone, otp, newPassword } = req.body;

  let user = null;
  if (email) user = await prisma.user.findUnique({ where: { email } });
  else if (phone) user = await findUserByIdentifier(phone, 'phone');

  if (!user || user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, otp: null, otpExpires: null },
  });

  res.json({ message: 'Password reset successful' });
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      collegeId: true,
      photo: true,
      emailVerified: true,
      createdAt: true,
    },
  });
  res.json(user);
});

export default router;
