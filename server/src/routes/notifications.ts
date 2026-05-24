import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const notifications = await prisma.notification.findMany({
    where: {
      OR: [{ userId: req.user!.id }, { broadcast: true }],
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(notifications);
});

router.patch('/:id/read', authenticate, async (req: AuthRequest, res) => {
  const id = String(req.params.id);
  await prisma.notification.updateMany({
    where: { id, userId: req.user!.id },
    data: { read: true },
  });
  res.json({ success: true });
});

router.patch('/read-all', authenticate, async (req: AuthRequest, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, read: false },
    data: { read: true },
  });
  res.json({ success: true });
});

router.post('/broadcast', authenticate, requireAdmin, async (req, res) => {
  const { title, message, type } = req.body;
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT', isBlocked: false },
    select: { id: true },
  });

  await prisma.notification.createMany({
    data: students.map((s) => ({
      userId: s.id,
      title,
      message,
      type: type || 'info',
      broadcast: true,
    })),
  });

  res.json({ message: `Sent to ${students.length} students` });
});

export default router;
