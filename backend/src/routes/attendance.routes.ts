import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const router = Router();

router.use(requireAuth);

router.post('/check-in', async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string };
  const day = todayKey();
  const existing = await prisma.attendance.findUnique({ where: { userId_day: { userId: user.id, day } } });
  if (existing) {
    if (existing.checkIn) return res.status(400).json({ message: 'Already checked in today' });
    // If record exists due to leave marking, disallow manual check-in
    if (existing.isLeave) return res.status(400).json({ message: 'On leave today' });
  }
  const now = new Date();
  const record = await prisma.attendance.upsert({
    where: { userId_day: { userId: user.id, day } },
    update: { checkIn: now },
    create: { userId: user.id, day, checkIn: now },
  });
  res.json(record);
});

router.post('/check-out', async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string };
  const day = todayKey();
  const existing = await prisma.attendance.findUnique({ where: { userId_day: { userId: user.id, day } } });
  if (!existing || !existing.checkIn) return res.status(400).json({ message: 'Check-in required' });
  if (existing.checkOut) return res.status(400).json({ message: 'Already checked out today' });
  if (existing.isLeave) return res.status(400).json({ message: 'On leave today' });
  const now = new Date();
  const record = await prisma.attendance.update({
    where: { id: existing.id },
    data: { checkOut: now },
  });
  res.json(record);
});

router.get('/me', async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string };
  const list = await prisma.attendance.findMany({ where: { userId: user.id }, orderBy: { day: 'desc' } });
  res.json(list);
});

// Admin: Get all attendance records
router.get('/', requireRole('ADMIN'), async (_req: Request, res: Response) => {
  const list = await prisma.attendance.findMany({
    orderBy: { day: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        }
      }
    }
  });
  res.json(list);
});

// Get monthly stats for current user
router.get('/stats/monthly', async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string };
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const startOfMonth = `${year}-${month}-01`;
  const endOfMonth = `${year}-${month}-31`; // Rough end date

  const records = await prisma.attendance.findMany({
    where: {
      userId: user.id,
      day: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });

  const stats = {
    present: records.filter(r => r.checkIn && !r.isLeave).length,
    absent: 0, // Need logic to calculate absent days vs working days
    late: 0, // Need logic for late check-in
    halfDays: 0, // Need logic
  };

  // Simple late calculation: checkIn after 9:30 AM
  records.forEach(r => {
    if (r.checkIn) {
      const checkInTime = new Date(r.checkIn);
      if (checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 30)) {
        stats.late++;
      }
    }
  });

  res.json(stats);
});

export default router;
