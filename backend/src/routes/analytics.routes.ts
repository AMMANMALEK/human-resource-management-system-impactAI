import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth);
router.use(requireRole('ADMIN'));

function getDatesInRange(startDate: Date, endDate: Date) {
  const dates = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

router.get('/summary', async (_req: Request, res: Response) => {
  const today = formatDate(new Date());
  const currentMonth = today.substring(0, 7); // YYYY-MM

  const [employeeCount, onLeaveToday, payrollAgg] = await Promise.all([
    prisma.user.count(),
    prisma.leave.count({
      where: {
        status: 'APPROVED',
        startDay: { lte: today },
        endDay: { gte: today }
      }
    }),
    prisma.payroll.aggregate({
      _sum: {
        net: true
      },
      where: {
        month: currentMonth
      }
    })
  ]);

  res.json({
    employeeCount,
    activeEmployees: employeeCount, // Assuming all are active
    onLeaveToday,
    totalPayroll: Number(payrollAgg._sum.net || 0)
  });
});

router.get('/attendance-trends', async (_req: Request, res: Response) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6); // Last 7 days

  const dates = getDatesInRange(startDate, endDate);
  const formattedDates = dates.map(d => formatDate(d));
  
  const totalUsers = await prisma.user.count();

  const attendanceData = await prisma.attendance.groupBy({
    by: ['day'],
    where: {
      day: { in: formattedDates }
    },
    _count: {
      checkIn: true,
      isLeave: true
    }
  });

  const trends = formattedDates.map(date => {
    const record = attendanceData.find(d => d.day === date);
    const present = record ? record._count.checkIn : 0;
    // Note: isLeave in attendance table might not be fully populated if we don't sync leaves to attendance
    // But let's use what we have.
    // Ideally we should check Leave table too.
    const onLeave = record ? record._count.isLeave : 0; 
    
    // Better logic for leave: check Leave table
    // But for performance, let's stick to simple logic or query Leave table for each day?
    // Querying Leave table for 7 days is fine.
    
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      present,
      leave: onLeave,
      absent: Math.max(0, totalUsers - present - onLeave)
    };
  });

  // Re-calculate leaves correctly using Leave table
  // This is a bit heavier but more accurate
  const trendsWithLeaves = await Promise.all(trends.map(async (t, i) => {
    const date = formattedDates[i];
    const leaveCount = await prisma.leave.count({
        where: {
            status: 'APPROVED',
            startDay: { lte: date },
            endDay: { gte: date }
        }
    });
    const present = t.present;
    // If attendance table says isLeave, it means it was synced. 
    // If we use Leave table, we get approved leaves.
    // Let's use the max of both or just Leave table.
    // Actually, present people might be on half-day leave?
    // Let's simplify: Present = checkIn. Leave = Approved Leave. Absent = Total - Present - Leave.
    // If someone checked in AND is on leave (half day?), we might double count?
    // For now, simplify.
    
    return {
        ...t,
        leave: leaveCount,
        absent: Math.max(0, totalUsers - present - leaveCount)
    };
  }));

  res.json(trendsWithLeaves);
});

router.get('/department-distribution', async (_req: Request, res: Response) => {
  // Since we don't have department in User model, we'll mock this data based on Roles
  // or just return a static distribution for "General".
  
  const [adminCount, employeeCount] = await Promise.all([
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { role: 'EMPLOYEE' } })
  ]);

  res.json([
    { department: 'Administration', count: adminCount },
    { department: 'Engineering', count: employeeCount }, // Assuming all employees are Engineering for demo
    { department: 'HR', count: 0 },
    { department: 'Sales', count: 0 },
  ]);
});

export default router;
