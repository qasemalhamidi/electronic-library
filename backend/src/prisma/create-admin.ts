import { db } from './db.js';
import { hashPassword } from '../auth/password.js';

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) {
  throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD first');
}

async function main() {
  await db.connect();
  const normalized = email!.toLowerCase();

  const existing = await db.orm.public.User.where({ email: normalized }).first();
  if (existing) {
    console.log('User already exists');
    return;
  }

  await db.orm.public.User.create({
    email: normalized,
    username: 'admin',
    password: await hashPassword(password!),
    name: 'Administrator',
    role: 'ADMIN',
  });
  console.log('Admin created');
}

main()
  .catch(console.error)
  .finally(() => db.close());