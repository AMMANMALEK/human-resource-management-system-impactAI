import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const router = Router();

router.use(requireAuth);

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'EMPLOYEE']).optional(),
  password: z.string().min(6).optional(),
});

// Get current user profile
router.get('/me', async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string };
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    }
  });
  
  if (!profile) return res.status(404).json({ message: 'User not found' });
  res.json(profile);
});

// Update current user profile
router.put('/me', async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string };
  const parsed = updateSchema.safeParse(req.body);
  
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input' });
  const { name } = parsed.data; // Only allow name update for self for now

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    }
  });

  res.json(updated);
});

// Admin: Get all users
router.get('/', requireRole('ADMIN'), async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    }
  });
  res.json(users);
});

// Admin: Create user
router.post('/', requireRole('ADMIN'), async (req: Request, res: Response) => {
    const createSchema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
        role: z.enum(['ADMIN', 'EMPLOYEE']).optional(),
    });
    
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Invalid input' });
    
    const { email, password, name, role } = parsed.data;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            name,
            role: role ?? 'EMPLOYEE',
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        }
    });
    
    res.json(user);
});

// Admin: Update any user
router.put('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
    const { id } = req.params;
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Invalid input' });
    
    const data: any = { ...parsed.data };
    if (data.password) {
        data.passwordHash = await bcrypt.hash(data.password, 10);
        delete data.password;
    }
    
    const updated = await prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        }
    });
    res.json(updated);
});

// Admin: Delete user
router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
});

export default router;
