-- Let an authenticated worker read only their own worker row.
-- Needed so technician sessions can resolve `auth_user_id -> workers.id`
-- without requiring manual auth metadata role management.

alter table public.workers enable row level security;

drop policy if exists "workers can read own profile" on public.workers;
create policy "workers can read own profile"
on public.workers
for select
using (auth.uid() = auth_user_id);
