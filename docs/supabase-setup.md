# Supabase setup guide

This guide documents the minimum Supabase setup required for EcoTienda Phase 0.

## Create the project

1. Create a new Supabase project.
2. Copy the project URL.
3. Copy the publishable key (or anon key if you prefer that naming).
4. Copy the service role key for server-only operations.
5. Copy the Postgres connection string if Prisma or direct SQL access is added later.

## Local environment

Create a `.env.local` file from `.env.example`.

Required keys:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
# optional fallback name if you prefer the old convention
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
GOOGLE_MAPS_API_KEY=
```

## Auth baseline

Phase 0 now includes:

- email/password sign-in
- sign-out action
- middleware-based session refresh
- role-aware redirects after login

Supported roles are `admin` and `technician`.

Role source order:

1. `app_metadata.role`
2. `user_metadata.role`
3. fallback role: `technician`

Suggested metadata example:

```json
{
  "role": "admin"
}
```

## Storage baseline

Recommended initial bucket strategy:

- `documents` → internal generated files
- `quotations` → quotation PDFs
- `visit-reports` → technical visit PDFs and related assets

Do not over-model buckets yet. Keep the first version minimal.

## Notes

- Only server-side code should use `SUPABASE_SERVICE_ROLE_KEY`.
- Route protection is scaffolded in the app and becomes active once the public Supabase environment keys are present.
- Phase 0 now includes the first real sign-in / sign-out flow.
- Keep admin role explicit in metadata. Unknown users fall back to `technician` for safer default access.
