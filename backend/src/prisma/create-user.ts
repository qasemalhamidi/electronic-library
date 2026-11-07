import { db } from './db.js';
import { hashPassword } from '../auth/password.js';

const email = process.env.MEMBER_EMAIL;
const password = process.env.MEMBER_PASSWORD;
const name = process.env.MEMBER_NAME;

if (!email || !password || !name) {
  throw new Error(
    'Set MEMBER_EMAIL, MEMBER_PASSWORD and MEMBER_NAME first',
  );
}

const memberEmail = email;
const memberPassword = password;
const memberName = name;

async function main() {
  const normalized = memberEmail.toLowerCase();

  const existing = await db.orm.public.User.where({
    email: normalized,
  }).first();

  if (existing) {
    console.log('User already exists');
    return;
  }

  await db.orm.public.User.create({
    email: normalized,
    username: normalized.split('@')[0],
    password: await hashPassword(memberPassword),
    name: memberName,
    role: 'MEMBER',
  });

  console.log('Member created');
}

main()
  .catch(console.error)
  .finally(() => db.close());