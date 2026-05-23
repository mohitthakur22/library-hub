import jwt from 'jsonwebtoken';

export function signToken(payload: {
  id: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  name: string;
}) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateInvoiceNumber(): string {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
