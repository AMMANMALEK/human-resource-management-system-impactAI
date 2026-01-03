import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

router.use(requireAuth);

const upsertSchema = z.object({
  userId: z.string(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  base: z.number().nonnegative(),
  allowance: z.number().nonnegative(),
  deduction: z.number().nonnegative(),
});

// Employee read-only: list own payrolls
router.get('/me', requireRole('EMPLOYEE', 'ADMIN'), async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string };
  const list = await prisma.payroll.findMany({ where: { userId: user.id }, orderBy: { month: 'desc' } });
  res.json(list);
});

// Admin: list all payrolls
router.get('/', requireRole('ADMIN'), async (_req: Request, res: Response) => {
  const list = await prisma.payroll.findMany({ 
    orderBy: [{ userId: 'asc' }, { month: 'desc' }],
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true
        }
      }
    }
  });
  res.json(list);
});

// Admin: create or update payroll entry
router.post('/', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input' });
  const { userId, month, base, allowance, deduction } = parsed.data;
  const net = base + allowance - deduction;

  const record = await prisma.payroll.upsert({
    where: { userId_month: { userId, month } },
    update: { base: base.toString(), allowance: allowance.toString(), deduction: deduction.toString(), net: net.toString() },
    create: { userId, month, base: base.toString(), allowance: allowance.toString(), deduction: deduction.toString(), net: net.toString() },
  });
  res.json(record);
});

// Admin: delete payroll entry
router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.payroll.delete({ where: { id } });
  res.status(204).send();
});

export default router;
