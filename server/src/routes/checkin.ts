import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { seatId } = req.body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.checkIn.findFirst({
    where: {
      userId: req.user!.id,
      checkedAt: { gte: today },
    },
  });

  if (existing) {
    return res.status(400).json({ error: 'Already checked in today' });
  }

  const checkIn = await prisma.checkIn.create({
    data: { userId: req.user!.id, seatId: seatId || null },
  });

  res.status(201).json(checkIn);
});

router.get('/my', authenticate, async (req: AuthRequest, res) => {
  const checkIns = await prisma.checkIn.findMany({
    where: { userId: req.user!.id },
    orderBy: { checkedAt: 'desc' },
    take: 90,
  });

  let streak = 0;
  const dates = new Set(
    checkIns.map((c) => new Date(c.checkedAt).toDateString())
  );
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (dates.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  res.json({ checkIns, streak });
});

router.get('/verify/:userId', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.userId },
    select: { id: true, name: true, email: true, photo: true, isBlocked: true },
  });
  if (!user || user.isBlocked) return res.status(404).json({ error: 'Invalid QR' });

  const activeSub = await prisma.subscription.findFirst({
    where: { userId: user.id, status: 'ACTIVE', endDate: { gte: new Date() } },
    include: { plan: true, seat: true },
  });

  res.json({ user, activeSubscription: activeSub });
});

export default router;
