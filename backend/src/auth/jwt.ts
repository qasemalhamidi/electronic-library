import { SignJWT, jwtVerify } from 'jose';
import type { Role } from './roles.js';

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(s);
}

export async function signToken(user: {
  id: number;
  email: string;
  role: string;
}) {
  return await new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret());
  return {
    id: Number(payload.sub),
    email: String(payload.email),
    role: payload.role as Role,
  };
}