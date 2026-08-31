# TesseraCareerBridge architecture

## Purpose

TesseraCareerBridge is an internship and career-learning platform, primarily for VTU students. Students discover programs, join batches, follow a day-by-day curriculum, complete practice and assessments, work with mentors, and receive documents and verified certificates.

This document describes the **foundation** established in the first implementation pass. Product features are not complete.

## Project structure

One repository, one frontend application, one API:

- `client/` — Vite + React SPA. Desktop, laptop, tablet, and mobile share this application.
- `server/` — Express API with modular routers.
- `database/` — Prisma schema, migrations, and seed. Domain data does not live in the server package.
- `shared/` — Roles, API path constants, shared TypeScript types.
- `storage/local/` — Development object-storage root. Large files are not stored in PostgreSQL.
- `docs/` — Architecture and project documentation.
- `scripts/` — Local setup helpers.

There is no `mobile/`, `expo/`, `react-native/`, or `mobile-web/` project.

## Frontend architecture

- React 18, React Router 6, TypeScript.
- Design tokens in `client/src/styles/tokens.css` (colors, type, space, radius, shadow, motion, breakpoints).
- Reusable primitives in `client/src/components/ui`.
- Internship entity shells in `client/src/components/internship`.
- Layouts:
  - `PublicLayout` — marketing and legal routes.
  - `StudentLayout` / `MentorLayout` / `AdminLayout` — application shells.
- Routing lives in `client/src/AppRoutes.tsx`. Nested routes match the product map; most pages are explicit foundation placeholders, not fake finished features.
- Auth context and `RequireRole` exist as architecture. Session login is not implemented, so role guards are not wrapping routes yet. When authentication lands, wrap student/mentor/admin trees with `RequireRole`.

### Responsive strategy

Tokens and media queries are the source of layout change. The same route (for example `/programs` or `/student/internship/:id/day/:dayId`) renders on every viewport.

| Viewport | Layout |
| --- | --- |
| Mobile (360–430px) | Top header, main content, bottom navigation in app areas |
| Tablet (768–1024px) | Wider content grid, public header links from 1024px |
| Desktop (1280px+) | Persistent sidebar + main content; bottom navigation hidden |

Breakpoints align with 360, 375, 390, 430, 768, 820, 1024, 1280, 1440, and 1920.

Do not create a second component tree for mobile unless a specific interaction cannot be solved with CSS.

## Backend architecture

Express app in `server/src/app.ts`.

- Prefix: `/api/v1`
- Working endpoint: `GET /api/v1/health`
- Modules registered in `server/src/modules/register.ts`: Authentication, Users, Students, Mentors, Admins, Programs, Batches, Enrollments, Curriculum, Learning Content, Progress, DDP, Assignments, Tests, Projects, Mentorship, Notifications, Attendance, Certificates, Analytics, Payments.
- Unimplemented modules return **501** with `NOT_IMPLEMENTED`. That is intentional. They must not look like finished APIs.

### Authentication architecture

- JWT access and refresh secrets in environment variables.
- `optionalAuth` reads `Authorization: Bearer`.
- `requireAuth` and `requireRoles` enforce identity and role.
- Super Admin bypasses role checks.
- `AuthSession` table is prepared for refresh-token persistence.
- Password hashing and login flows are not implemented.

### User roles

| Role | Access intent |
| --- | --- |
| STUDENT | Own learning and personal data only |
| MENTOR | Assigned batches, students, and mentor tools |
| CONTENT_MANAGER | Curriculum and learning content |
| ADMIN | Management according to permissions |
| SUPER_ADMIN | Full system access |

Permission strings live in `@tesseracareerbridge/shared`.

## Database architecture

PostgreSQL via Prisma (`database/prisma/schema.prisma`).

Core curriculum chain (data-driven, never hard-coded in UI):

```
Program → Batch → Week → Day → content (lessons, videos, notes, resources, practice)
                              → DDP / Assignment / Test
         → Project → Evaluation → Certificate
```

Batches belong to programs. Weeks and days belong to the program curriculum so multiple batches can share one syllabus. Enrollments bind a user to a program and batch. Progress is per enrollment and day.

Large files (video, PDF, submissions, certificates) are referenced as `StorageObject` keys. The API exposes a local object-storage adapter; S3-compatible storage is the intended production driver.

Seed currently writes no curriculum on purpose.

## API structure

All JSON APIs sit under `/api/v1`. Shared path constants are in `shared/src/api.ts`. Success payloads use `{ data }`. Errors use `{ error: { code, message } }`.

The client reads `VITE_API_URL` (default `/api/v1` via Vite proxy in development).

## Design direction

Inspired by a dark, amber-gold, high-contrast technology aesthetic — not a copy of any existing website.

- Near-black / warm charcoal surfaces
- Warm amber / golden orange for primary actions, active nav, progress, and highlights
- Off-white primary text, muted gray secondary text
- IBM Plex Sans for UI, Source Serif 4 for display headings
- Generous spacing, subtle borders, restrained glow
- No generic dashboard chrome, no loud education-app palette

All future screens must use these tokens. Do not introduce ad-hoc colors.

## Object storage

`server/src/storage/object-storage.ts` defines `ObjectStorage`. The local driver is a structural stand-in. Upload streams and cloud adapters come later. Relational tables store metadata only.

## Future work (not this foundation)

Student dashboard, program catalog, enrollment, day player, DDP, assignments, tests, projects, mentor workspace, admin management, payments, and certificates.
