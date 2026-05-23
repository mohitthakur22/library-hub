import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { subject, description } = req.body;
  const issue = await prisma.issue.create({
    data: { userId: req.user!.id, subject, description },
  });
  res.status(201).json(issue);
});

router.get('/my', authenticate, async (req: AuthRequest, res) => {
  const issues = await prisma.issue.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(issues);
});

router.get('/', authenticate, requireAdmin, async (_req, res) => {
  const issues = await prisma.issue.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(issues);
});

export default router;
