# Electronic Library System

A full-stack library management web application built with **Angular**, **NestJS**, and **PostgreSQL**.
Librarians and admins manage books, members, and loans; visitors can browse and search the catalog.
The interface is bilingual (**Arabic RTL / English LTR**) and fully responsive.

## Features

- **Authentication & roles** – JWT login with three roles: `ADMIN`, `LIBRARIAN`, `MEMBER`
- **Role-based access control** – a global NestJS guard with `@Public()` and `@Roles()` decorators protects every endpoint
- **Book management** – create, update, delete (blocked if the book has loan history), and view details
- **Search & filtering** – search by text and filter by category
- **Member management** – CRUD for library members
- **Borrowing & returning** – loans run inside database transactions so a book's availability never gets out of sync
- **Validation** – request DTOs validated with `class-validator`
- **Bilingual UI** – Arabic (RTL) and English (LTR) with a one-click language toggle

## Tech Stack

| Layer    | Technologies |
| -------- | ------------ |
| Frontend | Angular 21 (standalone components, Signals), Tailwind CSS v4, TypeScript |
| Backend  | NestJS, TypeScript, class-validator, class-transformer |
| Database | PostgreSQL with Prisma |
| Auth     | JWT (`jose`), scrypt password hashing |
| Testing  | Vitest, Supertest |

## Roles & Permissions

| Action                         | Visitor | Member | Librarian | Admin |
| ------------------------------ | :-----: | :----: | :-------: | :---: |
| Browse / search books          |    ✅    |   ✅    |     ✅     |   ✅   |
| Add / edit / delete books      |    ❌    |   ❌    |     ✅     |   ✅   |
| Manage members                 |    ❌    |   ❌    |     ✅     |   ✅   |
| Borrow / return books (loans)  |    ❌    |   ❌    |     ✅     |   ✅   |

## API Overview

| Method | Endpoint             | Access             |
| ------ | -------------------- | ------------------ |
| POST   | `/auth/login`        | Public             |
| GET    | `/auth/me`           | Authenticated      |
| GET    | `/books`, `/books/:id` | Public           |
| POST   | `/books`             | Admin, Librarian   |
| PATCH  | `/books/:id`         | Admin, Librarian   |
| DELETE | `/books/:id`         | Admin, Librarian   |
| GET/POST | `/members`         | Admin, Librarian   |
| GET/PATCH/DELETE | `/members/:id` | Admin, Librarian |
| GET/POST | `/loans`           | Admin, Librarian   |
| PATCH  | `/loans/:id/return`  | Admin, Librarian   |

## Project Structure

```
library/
├── backend/            # NestJS API
│   └── src/
│       ├── auth/       # JWT, guard, roles, password hashing
│       ├── books/
│       ├── members/
│       ├── loans/
│       └── prisma/     # schema (contract.prisma), db, seed scripts
└── frontend/           # Angular app
    └── src/app/
        ├── core/       # auth service, guards, interceptor, i18n, API client
        ├── layout/     # navbar, footer
        ├── pages/      # home, books, book details, members, login
        └── shared/     # cards, dialogs, reusable components
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env     # then edit the values
```

Set these variables in `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB_NAME"
JWT_SECRET="a-long-random-secret"
```

Create the tables and start the API:

```bash
npx prisma db init
npm run start:dev        # http://localhost:3001
```

Optional: create an admin user and seed sample data using the scripts in `backend/src/prisma/`
(`create-admin.ts` reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the environment).

### 2. Frontend

```bash
cd frontend
npm install
npm start                # http://localhost:4200
```

In development, requests to `/api` are proxied to the backend at `http://localhost:3001`, so no CORS setup is needed.

### Production build

```bash
cd frontend && npm run build
cd backend && npm run build && npm run start:prod
```

## Tests

```bash
cd backend
npm test            # unit tests
npm run test:e2e    # end-to-end tests
```

## Author

**Qasem Alhamidi** – [GitHub](https://github.com/qasemalhamidi)
