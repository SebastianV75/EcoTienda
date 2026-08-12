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
APP_URL=https://app.example.com
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
- invitation confirmation through `/auth/confirm` and password creation through
  `/auth/set-password`

`APP_URL` is server-only and required only when sending invitations. It must be
the canonical HTTPS origin without a path, query or fragment. Profile-only worker
creation continues to work without it. HTTP is accepted only for localhost.

## Invite email configuration

This external setup is mandatory; deploying the code is not sufficient.

In **Authentication > URL Configuration** set:

- **Site URL** to the exact `APP_URL` origin.
- **Redirect URLs** to the exact `${APP_URL}/auth/confirm` URL.
- Add `http://localhost:3000/auth/confirm` separately only for local development.

In **Authentication > Email Templates > Invite user**, use exactly:

```html
<h2>Activa tu acceso a EcoTienda</h2>
<p>Has sido invitado a crear tu cuenta.</p>
<p>
  <a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=invite">
    Aceptar invitación
  </a>
</p>
```

Do not replace this link with `ConfirmationURL`: the SSR callback needs
`TokenHash` and `type=invite` to call `verifyOtp` and persist the session cookies.
The GET confirmation page never calls `verifyOtp`; it requires an explicit button
POST so mail scanners and link previews cannot consume the invitation.
Also enable the email provider and configure production SMTP as appropriate.
Invitations are not production-ready until these remote settings have been
applied and tested for the target Supabase project.

For an existing database, apply SQL in this order:

1. `docs/sql/add-administrative-role-to-workers.sql`
2. `docs/sql/update-administrative-role-policies.sql`

Both SQL files are mandatory before invitations are enabled. The first creates the
private role resolver and the Workers policies; the second moves every related RLS
policy to that resolver. JWT `app_metadata.role` alone never authorizes a request:
the resolver also requires a linked, active Worker with the same normalized role.

For a new database, run `docs/sql/create-workers-table.sql` before the other base
table scripts because their policies depend on `app_private.current_worker_role()`.

Then refresh affected user sessions so JWT `app_metadata` claims match the new
role. Database migration does not revoke or refresh existing sessions.

Supported roles are `admin` (Administrador), `administrative` (Administrativo) and
`technician` (Técnico). `staff` is legacy data only and is normalized to
`administrative` when a worker is edited.

Authorization requires `app_metadata.role` and, for linked workers, an active
`workers` row with the same role and `auth_user_id`. `user_metadata.role` is not
used for authorization. Users without a valid synchronized role receive no access;
there is no fallback to `technician`.

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
- `.env*` files are ignored except `.env.example`; accidental downloads matching
  `env.local*.download` are ignored too. If a real key was present in such a file,
  delete/ignore is not rotation: rotate it manually in Supabase and deployment
  providers.
- Route protection is scaffolded in the app and becomes active once the public Supabase environment keys are present.
- Phase 0 now includes the first real sign-in / sign-out flow.
- Keep the role explicit in `app_metadata` and let the application manage the
  `workers.auth_user_id` link. Unknown or unsynchronized users fail closed.
- `scripts/make-admin.mjs` remains as a bootstrap/legacy utility, but the normal
  flow is now the protected worker-management screen in the app.
