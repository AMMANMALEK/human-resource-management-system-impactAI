import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export type JwtPayload = { id: string; role: 'ADMIN' | 'EMPLOYEE' };

export function signJwt(payload: JwtPayload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
