# EcoTienda

Internal web platform for EcoTienda operations.

## Current status

Phase 0 bootstrap is in progress.

The repository already includes:

- Next.js with TypeScript and Tailwind CSS
- mobile-first application shell
- Supabase client/server scaffolding
- role-aware protected route foundation
- admin and technician protected areas
- real Supabase email/password sign-in foundation
- phase planning documents in `docs/`

## Official stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Google Maps API

## Project priorities

1. Downloadable documents
2. Quotations
3. Technical visits

## Team ownership

- Sebas → downloadable documents
- Darian → quotations
- Technical visits → shared later

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Fill the required Supabase keys in `.env.local`.
   Preferred key names:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   ```

4. Start development server:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`.

## Available scripts

```bash
npm run dev
npm run build
npm run lint
npm run start
```

## Important routes

- `/` → landing page for the bootstrap foundation
- `/auth/sign-in` → real sign-in screen for Supabase Auth
- `/admin` → protected admin shell foundation
- `/technician` → protected technician area placeholder

## Documentation

- `docs/development-plan.md`
- `docs/phase-0-bootstrap.md`
- `docs/supabase-setup.md`

## Next step

Create the first authenticated admin user in Supabase and start the Phase 1 documents module.
