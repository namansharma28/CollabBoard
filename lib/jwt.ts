import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  userId: string;
  email: string;
  name?: string;
  iat?: number;
  exp?: number;
}

export function verifyJwt(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function createJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}