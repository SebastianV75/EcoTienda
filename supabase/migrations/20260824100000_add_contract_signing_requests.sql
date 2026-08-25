create table if not exists public.contract_signing_requests (
  id uuid primary key default gen_random_uuid(),
  trabajo_id uuid not null references public.trabajos(id) on delete cascade,
  token_hash text not null unique,
  status text not null default 'pending' check (status in ('pending','signed','revoked','expired')),
  expires_at timestamptz not null,
  signer_name text,
  consented_at timestamptz,
  signed_at timestamptz,
  signature_sha256 text,
  contract_snapshot_sha256 text not null,
  contract_snapshot jsonb not null default '{}'::jsonb,
  signed_pdf_path text,
  created_by uuid,
  created_at timestamptz not null default timezone('utc', now()),
  revoked_at timestamptz
);
create unique index if not exists contract_signing_requests_one_pending
  on public.contract_signing_requests(trabajo_id) where status = 'pending';
create index if not exists contract_signing_requests_token_idx on public.contract_signing_requests(token_hash);
alter table public.contract_signing_requests enable row level security;
revoke all on public.contract_signing_requests from anon, authenticated;
grant all on public.contract_signing_requests to service_role;

insert into storage.buckets (id, name, public)
values ('signed-contracts', 'signed-contracts', false)
on conflict (id) do update set public = false;

create or replace function public.claim_contract_signing_request(
  p_token_hash text,
  p_signer_name text,
  p_consented_at timestamptz,
  p_signature_sha256 text,
  p_signed_pdf_path text
) returns public.contract_signing_requests
language plpgsql security definer set search_path = public
as $$
declare result public.contract_signing_requests;
begin
  update public.contract_signing_requests
  set status='signed', signer_name=p_signer_name, consented_at=p_consented_at,
      signed_at=timezone('utc',now()), signature_sha256=p_signature_sha256,
      signed_pdf_path=p_signed_pdf_path
  where token_hash=p_token_hash and status='pending' and expires_at > timezone('utc',now())
  returning * into result;
  if not found then raise exception 'invalid_or_used_token'; end if;
  return result;
end;
$$;
revoke all on function public.claim_contract_signing_request(text,text,timestamptz,text,text) from public, anon, authenticated;
grant execute on function public.claim_contract_signing_request(text,text,timestamptz,text,text) to service_role;
