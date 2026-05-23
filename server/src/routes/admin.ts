import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { startOfDay, endOfDay } from '../lib/utils.js';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/stats', async (_req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalStudents, activeSeats, revenueAgg, pendingPayments, overduePayments, conflicts] =
    await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT', isBlocked: false } }),
      prisma.seat.count({ where: { status: { in: ['BOOKED', 'OCCUPIED_TODAY'] } } }),
      prisma.payment.aggregate({
        where: { status: 'PAID', paidAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'OVERDUE' } }),
      prisma.bookingConflict.count({ where: { resolved: false } }),
    ]);

  const totalSeats = await prisma.seat.count();

  res.json({
    totalStudents,
    activeSeats,
    totalSeats,
    revenueThisMonth: revenueAgg._sum.amount || 0,
    pendingPayments,
    overduePayments,
    openConflicts: conflicts,
  });
});

router.get('/revenue', async (req, res) => {
  const period = (req.query.period as string) || 'monthly';
  const payments = await prisma.payment.findMany({
    where: { status: 'PAID', paidAt: { not: null } },
    select: { amount: true, paidAt: true },
    orderBy: { paidAt: 'asc' },
  });

  const grouped: Record<string, number> = {};
  for (const p of payments) {
    if (!p.paidAt) continue;
    const d = new Date(p.paidAt);
    let key: string;
    if (period === 'daily') {
      key = d.toISOString().split('T')[0];
    } else if (period === 'weekly') {
      const week = Math.floor(d.getTime() / (7 * 24 * 60 * 60 * 1000));
      key = `W${week}`;
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    grouped[key] = (grouped[key] || 0) + p.amount;
  }

  res.json(
    Object.entries(grouped).map(([label, amount]) => ({ label, amount }))
  );
});

router.get('/students', async (_req, res) => {
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: {
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: { plan: true, seat: true },
        take: 1,
      },
      _count: { select: { payments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(students);
});

router.post('/students', async (req, res) => {
  const { name, email, phone, collegeId, password } = req.body;
  const hashed = await bcrypt.hash(password || 'student123', 10);
  const user = await prisma.user.create({
    data: { name, email, phone, collegeId, password: hashed, emailVerified: true },
  });
  res.status(201).json(user);
});

router.patch('/students/:id', async (req, res) => {
  const { name, phone, collegeId, isBlocked } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { name, phone, collegeId, isBlocked },
  });
  res.json(user);
});

router.get('/conflicts', async (_req, res) => {
  const conflicts = await prisma.bookingConflict.findMany({
    where: { resolved: false },
    orderBy: { createdAt: 'desc' },
  });
  res.json(conflicts);
});

router.post('/conflicts/:id/resolve', async (req: AuthRequest, res) => {
  const { resolution, winnerId } = req.body;
  const conflict = await prisma.bookingConflict.findUnique({
    where: { id: req.params.id },
  });
  if (!conflict) return res.status(404).json({ error: 'Conflict not found' });

  const dayStart = startOfDay(conflict.date);
  const dayEnd = endOfDay(conflict.date);

  if (winnerId) {
    await prisma.booking.updateMany({
      where: {
        seatId: conflict.seatId,
        date: { gte: dayStart, lte: dayEnd },
        userId: { not: winnerId },
      },
      data: { status: 'CANCELLED' },
    });
  }

  const updated = await prisma.bookingConflict.update({
    where: { id: conflict.id },
    data: { resolved: true, resolution, resolvedBy: req.user!.id },
  });

  res.json(updated);
});

export default router;
