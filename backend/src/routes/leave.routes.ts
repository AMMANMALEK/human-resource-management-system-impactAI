import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const applySchema = z.object({
  startDay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().optional(),
});

router.use(requireAuth);

// Employee applies for leave (PENDING by default)
router.post('/apply', requireRole('EMPLOYEE', 'ADMIN'), async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string };
  const parsed = applySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input' });
  const { startDay, endDay, reason } = parsed.data;

  // Ensure no overlapping leave requests that are PENDING or APPROVED
  const overlap = await prisma.leave.findFirst({
    where: {
      userId: user.id,
      status: { in: ['PENDING', 'APPROVED'] },
      OR: [
        { AND: [{ startDay: { lte: endDay } }, { endDay: { gte: startDay } }] },
      ],
    },
  });
  if (overlap) return res.status(400).json({ message: 'Overlapping leave exists' });

  const leave = await prisma.leave.create({ data: { userId: user.id, startDay, endDay, reason } });
  res.json(leave);
});

// Admin lists all pending leaves
router.get('/pending', requireRole('ADMIN'), async (_req: Request, res: Response) => {
  const list = await prisma.leave.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' }, include: { user: { select: { email: true } } } });
  res.json(list);
});

// Admin lists all leaves
router.get('/all', requireRole('ADMIN'), async (_req: Request, res: Response) => {
  const list = await prisma.leave.findMany({ orderBy: { createdAt: 'desc' }, include: { user: { select: { email: true } } } });
  res.json(list);
});

// Admin approves a leave and updates attendance records for the range
router.post('/:id/approve', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const leave = await prisma.leave.update({ where: { id }, data: { status: 'APPROVED' } });

  // Update attendance for approved range
  const days: string[] = enumerateDays(leave.startDay, leave.endDay);
  await prisma.$transaction(
    days.map((day) =>
      prisma.attendance.upsert({
        where: { userId_day: { userId: leave.userId, day } },
        update: { isLeave: true, checkIn: null, checkOut: null },
        create: { userId: leave.userId, day, isLeave: true },
      })
    )
  );

  res.json(leave);
});

// Admin rejects a leave
router.post('/:id/reject', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const leave = await prisma.leave.update({ where: { id }, data: { status: 'REJECTED' } });
  res.json(leave);
});

// Employee can view their leaves
router.get('/me', requireRole('EMPLOYEE', 'ADMIN'), async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string };
  const list = await prisma.leave.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  res.json(list);
});

function enumerateDays(startDay: string, endDay: string): string[] {
  const res: string[] = [];
  const start = new Date(startDay + 'T00:00:00Z');
  const end = new Date(endDay + 'T00:00:00Z');
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    res.push(`${y}-${m}-${day}`);
  }
  return res;
}

export default router;
