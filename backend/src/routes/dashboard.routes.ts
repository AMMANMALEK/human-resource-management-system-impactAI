import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/admin-stats', requireRole('ADMIN'), async (_req: Request, res: Response) => {
  const [totalRequests, pendingRequests, approvedRequests, rejectedRequests, recentActivity] = await Promise.all([
    prisma.leave.count(),
    prisma.leave.count({ where: { status: 'PENDING' } }),
    prisma.leave.count({ where: { status: 'APPROVED' } }),
    prisma.leave.count({ where: { status: 'REJECTED' } }),
    prisma.leave.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } }
    })
  ]);

  const formattedActivity = recentActivity.map(leave => ({
    id: leave.id,
    user: leave.user.email, // Using email as name for now
    type: leave.reason || 'Leave Request',
    status: leave.status.toLowerCase(),
    date: leave.createdAt.toISOString().split('T')[0]
  }));

  res.json({
    totalRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    recentActivity: formattedActivity
  });
});

router.get('/employee-stats', requireRole('EMPLOYEE', 'ADMIN'), async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string };
  
  const [leavesApplied, pendingLeaves, approvedLeaves, rejectedLeaves, recentRequests] = await Promise.all([
    prisma.leave.count({ where: { userId: user.id } }),
    prisma.leave.count({ where: { userId: user.id, status: 'PENDING' } }),
    prisma.leave.count({ where: { userId: user.id, status: 'APPROVED' } }),
    prisma.leave.count({ where: { userId: user.id, status: 'REJECTED' } }),
    prisma.leave.findMany({
      where: { userId: user.id },
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
  ]);

  // Calculate leave balance (assuming 20 days per year for now)
  // We should sum the days of approved leaves to subtract from balance
  const approvedLeavesList = await prisma.leave.findMany({
    where: { userId: user.id, status: 'APPROVED' }
  });
  
  let daysUsed = 0;
  approvedLeavesList.forEach(leave => {
    const start = new Date(leave.startDay);
    const end = new Date(leave.endDay);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    daysUsed += diffDays;
  });

  const leaveBalance = 20 - daysUsed;

  const formattedRequests = recentRequests.map(leave => ({
    id: leave.id,
    type: leave.reason || 'Leave Request',
    status: leave.status.toLowerCase(),
    startDate: leave.startDay,
    endDate: leave.endDay
  }));

  res.json({
    leavesApplied,
    pendingLeaves,
    approvedLeaves,
    rejectedLeaves,
    leaveBalance,
    recentRequests: formattedRequests
  });
});

export default router;
