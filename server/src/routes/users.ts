import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.patch('/profile', authenticate, async (req: AuthRequest, res) => {
  const { name, phone, photo, collegeId } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name, phone, photo, collegeId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      collegeId: true,
      photo: true,
    },
  });
  res.json(user);
});

router.get('/dashboard', authenticate, async (req: AuthRequest, res) => {
  const [activeSub, upcomingPayment, notifications, recentCheckIns] = await Promise.all([
    prisma.subscription.findFirst({
      where: {
        userId: req.user!.id,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
      include: { plan: true, seat: true },
      orderBy: { endDate: 'desc' },
    }),
    prisma.payment.findFirst({
      where: { userId: req.user!.id, status: { in: ['PENDING', 'OVERDUE'] } },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.notification.findMany({
      where: { userId: req.user!.id, read: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.checkIn.findMany({
      where: { userId: req.user!.id },
      orderBy: { checkedAt: 'desc' },
      take: 7,
    }),
  ]);

  let streak = 0;
  const allCheckIns = await prisma.checkIn.findMany({
    where: { userId: req.user!.id },
    orderBy: { checkedAt: 'desc' },
  });
  const dates = new Set(allCheckIns.map((c) => new Date(c.checkedAt).toDateString()));
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (dates.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  const todayBooking = await prisma.booking.findFirst({
    where: {
      userId: req.user!.id,
      date: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
      status: 'CONFIRMED',
    },
    include: { seat: true },
  });

  res.json({
    activeSubscription: activeSub,
    upcomingPayment,
    notifications,
    recentCheckIns,
    streak,
    todayBooking,
  });
});

export default router;
