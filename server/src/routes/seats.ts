import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { bookSeat, getSeatAvailability } from '../services/bookingService.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const date = req.query.date ? new Date(req.query.date as string) : new Date();
  const seats = await getSeatAvailability(date);
  res.json(seats);
});

router.get('/layout', async (_req, res) => {
  const seats = await prisma.seat.findMany({
    orderBy: [{ row: 'asc' }, { col: 'asc' }],
    select: { id: true, number: true, row: true, col: true, status: true },
  });
  const rows = Math.max(...seats.map((s) => s.row), 0);
  const cols = Math.max(...seats.map((s) => s.col), 0);
  res.json({ seats, rows, cols });
});

router.post('/book', authenticate, async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      seatId: z.string(),
      date: z.string(),
      type: z.enum(['FIXED', 'ROTATIONAL', 'DAY_PASS']),
      subscriptionId: z.string().optional(),
    });
    const data = schema.parse(req.body);

    const booking = await bookSeat({
      userId: req.user!.id,
      seatId: data.seatId,
      date: new Date(data.date),
      type: data.type,
      subscriptionId: data.subscriptionId,
    });

    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: 'Seat Booked',
        message: `Your seat booking for ${booking.seat.number} is confirmed.`,
        type: 'success',
      },
    });

    res.status(201).json(booking);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Booking failed';
    if (msg.startsWith('SEAT_CONFLICT')) {
      return res.status(409).json({ error: msg.replace('SEAT_CONFLICT: ', ''), conflict: true });
    }
    res.status(400).json({ error: msg });
  }
});

router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const seat = await prisma.seat.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json(seat);
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { number, row, col } = req.body;
  const seat = await prisma.seat.create({ data: { number, row, col } });
  res.status(201).json(seat);
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.seat.delete({ where: { id: req.params.id } });
  res.json({ message: 'Seat removed' });
});

export default router;
