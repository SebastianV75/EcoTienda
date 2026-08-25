import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hashSigningToken } from "@/features/documents/contract-signing";
import { SignatureForm } from "@/features/documents/signature-form";

export const dynamic = "force-dynamic";
export default async function FirmaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("contract_signing_requests").select("status,expires_at,contract_snapshot,signer_name").eq("token_hash", hashSigningToken(token)).maybeSingle();
  const snapshot = data?.contract_snapshot as { clientName?: string; agreedAmount?: number } | null;
  if (!data || data.status !== "pending" || new Date(data.expires_at).getTime() <= Date.now() || !snapshot?.clientName) notFound();
  return <main className="mx-auto max-w-2xl space-y-6 p-6"><div><p className="text-sm text-[var(--muted)]">Ecotienda · Firma electrónica</p><h1 className="mt-2 text-2xl font-semibold">Firma de contrato</h1><p className="mt-2">Contrato para {snapshot.clientName}. Monto acordado: ${Number(snapshot.agreedAmount ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}.</p><a className="ui-secondary-action mt-4 inline-flex" href={`/api/firma/${token}`} target="_blank" rel="noreferrer">Ver contrato completo</a></div><SignatureForm token={token} clientName={snapshot.clientName} /></main>;
}
