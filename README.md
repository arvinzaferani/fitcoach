<div align="center">

# FitCoach

**پلتفرم مدیریت تمرینات بین مربی و ورزشکار**

A Persian-first, RTL coach–athlete workout management platform.

Built with Next.js, NestJS, and PostgreSQL.

</div>

---

## About

FitCoach lets coaches design workout programs, assign them to athletes, and track progress — while athletes view their plans, log workouts, and update their body metrics. The entire UI is Persian and right-to-left.

Three user roles are supported:

| Role | What they can do |
|------|------------------|
| **Admin** | Manage the base exercise library (with GIFs) |
| **Coach** | Design program templates, manage athletes, assign & customize programs |
| **Athlete** | View assigned plans, log workouts, track metrics |

## Features

- JWT + bcrypt authentication with role-based access control (admin / coach / athlete)
- Exercise catalog with Persian names, muscle groups, equipment, and animated GIFs
- Coach program template library + per-athlete assignment and customization
- Coach–athlete invitations and athlete management
- Daily workout player with set logging and rest timer
- Metric tracking (weight, body fat, muscle mass) with charts
- RTL Persian UI with Vazirmatn font, light/dark themes
- MinIO (S3-compatible) storage for exercise media

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Recharts |
| Backend | NestJS, TypeScript, Prisma ORM, Passport JWT |
| Database | PostgreSQL 16 (Docker) |
| Storage | MinIO (S3-compatible) for exercise GIFs |
| Auth | JWT access + refresh tokens, bcrypt password hashing |

## Getting Started

### Prerequisites

- Node.js 18+
- Docker

### 1. Install & configure

```bash
cp .env.example .env
npm install
```

### 2. Start services (PostgreSQL, Adminer, MinIO)

```bash
docker compose up -d postgres adminer minio minio-init
```

### 3. Set up the database

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4. Run the apps

```bash
npm run dev:backend   # API → http://localhost:3001
npm run dev:frontend  # UI  → http://localhost:3000
```

### Demo accounts (from seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@fitcoach.local` | `Fit123!@` |
| Coach | `coach@fitcoach.local` | `Fit123!@` |
| Athlete | `athlete@fitcoach.local` | `Fit123!@` |

## Project Structure

```text
gym/
├── frontend/                 # Next.js app
│   ├── app/
│   │   ├── login/ register/  # Authentication
│   │   ├── admin/            # Exercise library management
│   │   ├── coach/            # Dashboard, templates, athletes, assignments
│   │   └── athlete/          # Dashboard, workouts, metrics, coaches
│   ├── components/           # Shared UI and spec components
│   ├── lib/                  # API client, utilities, mock data
│   └── types/                # Domain types
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── modules/          # auth, users, media, exercises, templates,
│   │   │                     # coach-athlete, assignments, workouts, metrics
│   │   ├── common/           # Guards, decorators
│   │   └── prisma/           # Prisma service
│   └── prisma/
│       ├── schema.prisma     # Database models
│       ├── migrations/
│       └── seed.ts           # Exercises, templates, demo users
└── docker-compose.yml        # PostgreSQL, Adminer, MinIO
```

## Available Scripts

From the repo root:

| Command | Description |
|---------|-------------|
| `npm run dev:frontend` | Start the Next.js dev server |
| `npm run dev:backend` | Start the NestJS dev server (watch mode) |
| `npm run build` | Build all workspaces |
| `npm run lint` | Lint all workspaces |
| `npm run prisma:generate` | Generate the Prisma client |
| `npm run prisma:migrate` | Apply database migrations |
| `npm run prisma:seed` | Seed exercises, templates, and demo users |

## API

The API runs under the `/api` prefix (e.g. `http://localhost:3001/api`). Core modules:

- `auth` — login / register / refresh
- `users` — profile and account management
- `exercises` — exercise catalog (admin-managed)
- `media` — exercise GIF upload (MinIO presigned URLs)
- `templates` — coach program templates
- `coach-athlete` — invitations and coach–athlete relations
- `assignments` — program assignment to athletes
- `workouts` — workout sessions and set logging
- `metrics` — athlete body metrics

## License

Private project.
