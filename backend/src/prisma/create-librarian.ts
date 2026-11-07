import { db } from './db.js';
import { hashPassword } from '../auth/password.js';

const email = process.env.LIBRARIAN_EMAIL;
const password = process.env.LIBRARIAN_PASSWORD;
const name = process.env.LIBRARIAN_NAME;

if (!email || !password || !name) {
  throw new Error(
    'Set LIBRARIAN_EMAIL, LIBRARIAN_PASSWORD and LIBRARIAN_NAME first',
  );
}

const librarianEmail = email;
const librarianPassword = password;
const librarianName = name;

async function main() {
  const normalized = librarianEmail.toLowerCase();

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
    password: await hashPassword(librarianPassword),
    name: librarianName,
    role: 'LIBRARIAN',
  });

  console.log('Librarian created');
}

main()
  .catch(console.error)
  .finally(() => db.close());