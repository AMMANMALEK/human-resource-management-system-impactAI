import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import bcrypt from 'bcryptjs';
import { signJwt } from '../utils/jwt';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum(['ADMIN', 'EMPLOYEE']).optional(),
});

router.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  const { email, password, role, name } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.warn(`User registration failed: Email ${email} already exists`);
    return res.status(400).json({ message: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: role ?? 'EMPLOYEE',
      name: name ?? null,
    },
  });

  const token = signJwt({ id: user.id, role: user.role });

  return res.json({
    token,
    role: user.role,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name ?? user.email,
    },
  });
});

router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signJwt({ id: user.id, role: user.role });

  return res.json({
    token,
    role: user.role,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name ?? user.email,
    },
  });
});

export default router;
