import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/my', authenticate, async (req: AuthRequest, res) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user!.id },
    include: { subscription: { include: { plan: true, seat: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(payments);
});

router.post('/:id/pay', authenticate, async (req: AuthRequest, res) => {
  const paymentId = String(req.params.id);
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId: req.user!.id },
  });
  if (!payment) return res.status(404).json({ error: 'Payment not found' });

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      paymentMethod: req.body.method || 'manual',
      externalId: req.body.externalId || null,
    },
  });

  if (payment.subscriptionId) {
    await prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: { status: 'ACTIVE' },
    });
  }

  res.json(updated);
});

router.get('/', authenticate, requireAdmin, async (_req, res) => {
  const payments = await prisma.payment.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      subscription: { include: { plan: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(payments);
});

router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  const paymentId = String(req.params.id);
  const { status } = req.body;
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status,
      paidAt: status === 'PAID' ? new Date() : null,
    },
  });
  res.json(payment);
});

export default router;
