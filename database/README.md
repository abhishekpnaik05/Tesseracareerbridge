# Database package

Prisma schema, migrations, and seed live here — not in the server package.

Curriculum is stored as Program → Week → Day → content records. Never encode a syllabus in application code.

Generate client: `pnpm db:generate`  
Migrate: `pnpm db:migrate`  
Seed: `pnpm db:seed` (currently a no-op by design)
