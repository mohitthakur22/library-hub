import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { addDays, generateInvoiceNumber } from '../lib/utils.js';
import { bookSeat } from '../services/bookingService.js';

const router = Router();

router.get('/my', authenticate, async (req: AuthRequest, res) => {
  const subs = await prisma.subscription.findMany({
    where: { userId: req.user!.id },
    include: { plan: true, seat: true, payments: { orderBy: { createdAt: 'desc' }, take: 3 } },
    orderBy: { startDate: 'desc' },
  });
  res.json(subs);
});

router.post('/subscribe', authenticate, async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      planId: z.string(),
      seatId: z.string().optional(),
      startDate: z.string().optional(),
    });
    const { planId, seatId, startDate } = schema.parse(req.body);

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    if (plan.type === 'FIXED' && !seatId) {
      return res.status(400).json({ error: 'Fixed plan requires seat selection' });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = addDays(start, plan.durationDays);

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user!.id,
        planId,
        seatId: plan.type === 'FIXED' ? seatId : null,
        startDate: start,
        endDate: end,
        status: 'PENDING',
      },
      include: { plan: true, seat: true },
    });

    const payment = await prisma.payment.create({
      data: {
        userId: req.user!.id,
        subscriptionId: subscription.id,
        amount: plan.price,
        dueDate: addDays(start, 3),
        invoiceNumber: generateInvoiceNumber(),
        status: 'PENDING',
      },
    });

    if (plan.type === 'FIXED' && seatId) {
      try {
        await bookSeat({
          userId: req.user!.id,
          seatId,
          date: start,
          type: 'FIXED',
          subscriptionId: subscription.id,
        });
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'ACTIVE' },
        });
      } catch (e) {
        await prisma.subscription.delete({ where: { id: subscription.id } });
        await prisma.payment.delete({ where: { id: payment.id } });
        const msg = e instanceof Error ? e.message : 'Seat booking failed';
        return res.status(409).json({ error: msg.replace('SEAT_CONFLICT: ', '') });
      }
    }

    res.status(201).json({ subscription, payment });
  } catch {
    res.status(400).json({ error: 'Invalid subscription request' });
  }
});

router.post('/:id/extend', authenticate, async (req: AuthRequest, res) => {
  const subscriptionId = String(req.params.id);
  const sub = await prisma.subscription.findFirst({
    where: { id: subscriptionId, userId: req.user!.id },
    include: { plan: true },
  });
  if (!sub) return res.status(404).json({ error: 'Subscription not found' });

  const newEnd = addDays(sub.endDate, sub.plan.durationDays);
  const updated = await prisma.subscription.update({
    where: { id: sub.id },
    data: { endDate: newEnd },
  });

  const payment = await prisma.payment.create({
    data: {
      userId: req.user!.id,
      subscriptionId: sub.id,
      amount: sub.plan.price,
      dueDate: addDays(new Date(), 7),
      invoiceNumber: generateInvoiceNumber(),
      status: 'PENDING',
    },
  });

  res.json({ subscription: updated, payment });
});

export default router;
