# FitCoach

FitCoach is a Persian, RTL-first coach-athlete workout management platform based on `spec.md`.

## Stack

- `frontend`: Next.js 14 App Router, TypeScript, Tailwind CSS
- `backend`: NestJS, TypeScript, Prisma ORM
- `database`: PostgreSQL via `docker-compose.yml`
- `storage`: local MinIO for exercise GIFs via `docker-compose.yml`

## Quick Start

```bash
cp .env.example .env
npm install
docker compose up -d postgres adminer minio minio-init
npm run prisma:generate
npm run prisma:migrate
npm run dev:backend
npm run dev:frontend
```

## Project Structure

```text
frontend/
  app/                 RTL dashboard routes for auth, coach, athlete
  components/          Shared UI primitives and spec components
  lib/                 Mock data and utilities
  types/               Shared frontend domain types
backend/
  src/modules/         Auth, users, media, exercises, templates, assignments, workouts, metrics
  src/prisma/          Prisma service
  prisma/schema.prisma Database model from the spec
```

## Implemented Foundation

- Role-aware API module skeletons for admin, coach, and athlete flows
- Prisma schema covering users, profiles, metrics, exercises, templates, assignments, customizations, and workout logs
- RTL Persian UI pages for login, register, coach dashboard, athlete management, template library/create, assignment, athlete dashboard, workout player, and metrics
- Core reusable UI components requested in the spec: `WorkoutCard`, `SetTimer`, and `MetricChart`
