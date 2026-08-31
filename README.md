# TesseraCareerBridge

Internship and career-learning platform for VTU students.

This repository is **one application ecosystem**: a single responsive frontend (`client/`) and a modular API (`server/`). There is no separate mobile app, Expo project, or React Native project. Mobile, tablet, and desktop all use the same routes and the same React application.

## Stack

| Layer | Choice |
| --- | --- |
| Client | Vite, React, TypeScript, React Router |
| Server | Node.js, Express, TypeScript |
| Database | PostgreSQL 16, Prisma |
| Shared | TypeScript types, roles, API path constants |
| Local DB | Docker Compose |

## Repository layout

```
TesseraCareerBridge/
├── client/       # single responsive frontend
├── server/       # API
├── database/     # Prisma schema, migrations, seed
├── shared/       # types, roles, constants
├── storage/      # local object-storage root
├── docs/
├── scripts/
├── docker-compose.yml
├── package.json
└── pnpm-workspace.yaml
```

## Local setup

Prerequisites: Node.js 20+, pnpm 8+, Docker Desktop.

```powershell
Copy-Item .env.example .env
Copy-Item .env.example client/.env
pnpm install
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Or run `scripts/setup.ps1` then `pnpm db:migrate` and `pnpm dev`.

- Frontend: http://localhost:5173
- API health: http://localhost:4000/api/v1/health

Docker Postgres is mapped to **55432** by default so it does not collide with an existing local PostgreSQL on 5432. Change `POSTGRES_PORT` and `DATABASE_URL` in `.env` if you need a different port.

### Commands

| Command | Purpose |
| --- | --- |
| `pnpm install` | Install workspace packages |
| `pnpm dev` | Client + server |
| `pnpm dev:client` | Frontend only |
| `pnpm dev:server` | API only |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Create/apply migrations |
| `pnpm db:seed` | Seed (currently a no-op) |
| `pnpm build` | Production build |

There is no `pnpm dev:mobile`.

## What this foundation includes

- Design tokens and reusable UI components
- Responsive public layout and role shells (student / mentor / admin)
- Route map for public, student, mentor, and admin areas
- Modular API routers (business logic not implemented)
- Relational schema for programs, batches, curriculum, assessments, certificates
- JWT middleware and role helpers
- Local object-storage interface (S3-compatible later)

## What is intentionally not built yet

Dashboards, enrollment, DDP workflows, assignments, tests, projects, mentor tools, admin CMS, and certificates. Those belong in later prompts.

Curriculum is never hard-coded in the client. Days and topics come from the database.
