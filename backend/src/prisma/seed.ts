import { db } from './db.js';
import { hashPassword } from '../auth/password.js';

async function main() {
  await db.connect();
  await db.orm.public.Book.createAll([
    { title: 'Book 1', author: 'Qasem', category: 'Programming', year: 2026, available: true },
    { title: 'Book 2', author: 'Abood', category: 'Software', year: 2024, available: true },
    { title: 'Book 3', author: 'Aziz', category: 'Computer', year: 2021, available: false },
    { title: 'Book 4', author: 'Mohamad', category: 'Engineering', year: 2020, available: false },
    { title: 'Book 5', author: 'Ali', category: 'Software', year: 2019, available: false },
    { title: 'Clean Code', author: 'Robert Martin', category: 'Software', year: 2008, available: true },
  ]);

  const members = [
    { name: 'Qasem', email: 'qasem@gmail.com', username: 'qasem', active: true },
    { name: 'Abood', email: 'abood@gmail.com', username: 'abood', active: true },
    { name: 'Ali', email: 'ali@gmail.com', username: 'ali', active: false },
    { name: 'Obada', email: 'obada@gmail.com', username: 'obada', active: true },
    { name: 'Zakar', email: 'zakar@gmail.com', username: 'zakar', active: true },
    { name: 'Mohamad', email: 'mohamad@gmail.com', username: 'mohamad', active: false },
  ];

  const defaultPassword = await hashPassword('member123');

  const createdMembers = await db.orm.public.User.createAll(
    members.map((m) => ({
      ...m,
      password: defaultPassword,
      role: 'MEMBER' as const,
    })),
  );

  await db.orm.public.Loan.createAll([
    { bookId: 3, memberId: createdMembers[0].id, borrowedAt: '2026-08-15' }, // Qasem
    { bookId: 4, memberId: createdMembers[3].id, borrowedAt: '2025-08-14' }, // Obada
    { bookId: 5, memberId: createdMembers[1].id, borrowedAt: '2026-09-01' }, // Abood
  ]);
}

main()
  .then(() => console.log('Seed done'))
  .catch(console.error)
  .finally(() => db.close());