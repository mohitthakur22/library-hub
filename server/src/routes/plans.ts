import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/', async (_req, res) => {
  const plans = await prisma.plan.findMany({ orderBy: { price: 'asc' } });
  res.json(
    plans.map((p) => ({
      ...p,
      features: p.features ? JSON.parse(p.features) : [],
    }))
  );
});

export default router;
