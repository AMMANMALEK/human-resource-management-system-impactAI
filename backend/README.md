# HRMS Backend (Node.js + Express + PostgreSQL/Supabase + Prisma)

Implements authentication (JWT), RBAC (ADMIN/EMPLOYEE), Attendance, Leave Management, and Payroll APIs with centralized error handling and integrity constraints.

## Stack
- Node.js + Express (TypeScript)
- PostgreSQL (Supabase recommended)
- Prisma ORM
- JWT (jsonwebtoken)
- Zod for request validation

## Getting Started (Supabase)

1) Copy environment file (Windows PowerShell)
```
Copy-Item .env.example .env
```

2) In Supabase, create a dedicated schema for HRMS tables (SQL Editor):
```
create schema if not exists hrms;
```

3) In Supabase (Project Settings → Database), copy your connection string and set it as `DATABASE_URL` in `.env`.
Example format (note `schema=hrms`):
```
postgresql://postgres:<PASSWORD>@<HOST>:5432/postgres?schema=hrms&sslmode=require
```

4) Install dependencies
```
npm install
```

5) Generate Prisma client and push schema
```
npx prisma generate
npx prisma db push
```

6) Seed initial users (ADMIN and EMPLOYEE)
```
npm run seed
```

7) Start the dev server
```
npm run dev
```

Server runs at http://localhost:4000

## Auth
- POST /api/auth/login
  - body: { email, password }
  - returns: { token, role }
  - Use as Authorization: Bearer <token>

## Attendance
- POST /api/attendance/check-in
- POST /api/attendance/check-out
- GET /api/attendance/me

Rules enforced:
- One check-in/out per day per user.
- Server-generated timestamps only.
- Cannot check-in/out when on leave.

## Leave Management
- POST /api/leave/apply (EMPLOYEE/ADMIN)
- GET /api/leave/pending (ADMIN)
- POST /api/leave/:id/approve (ADMIN) -> also marks attendance as leave for the range
- POST /api/leave/:id/reject (ADMIN)
- GET /api/leave/me

## Payroll
- GET /api/payroll/me (EMPLOYEE/ADMIN)
- GET /api/payroll (ADMIN)
- POST /api/payroll (ADMIN) create/update by userId+month
- DELETE /api/payroll/:id (ADMIN)

## Notes
- Prisma schema enforces:
  - Unique attendance per user per day
  - Unique payroll per user per month
  - FKs with CASCADE
- All protected routes require JWT; RBAC via `requireRole`.
