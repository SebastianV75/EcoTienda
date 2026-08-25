import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { requireRole } from "@/features/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTrabajoDocumentById } from "@/features/trabajos/data";
import { buildTrabajoPreviewSubject } from "@/features/documents/preview-data";
import { getCompanySettings } from "@/features/settings/data";
import { getContractFilename } from "@/features/documents/contract-pdf";
import { createSigningToken, signingExpiry } from "@/features/documents/contract-signing";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "administrative"]);
  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("contract_signing_requests").select("status,expires_at,signer_name,signed_at,signed_pdf_path,created_at,contract_snapshot").eq("trabajo_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const download = new URL(request.url).searchParams.get("download") === "1";
  if (download) {
    if (!data?.signed_pdf_path || data.status !== "signed") return NextResponse.json({ error: "El contrato aún no está firmado." }, { status: 404 });
    const file = await admin.storage.from("signed-contracts").download(data.signed_pdf_path);
    if (file.error || !file.data) return NextResponse.json({ error: "No se pudo descargar el contrato." }, { status: 404 });
    const bytes = await file.data.arrayBuffer();
    const snapshot = await admin.from("contract_signing_requests").select("contract_snapshot").eq("trabajo_id", id).eq("status", "signed").order("created_at", { ascending: false }).limit(1).maybeSingle();
    const clientName = (snapshot.data?.contract_snapshot as { clientName?: string } | null)?.clientName ?? "cliente";
    return new NextResponse(bytes, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${getContractFilename(clientName)}"`, "Cache-Control": "private, no-store" } });
  }
  if (error) return NextResponse.json({ error: "No se pudo consultar el estado." }, { status: 500 });
  if (!data) return NextResponse.json({ request: null });
  const expired = data.status === "pending" && new Date(data.expires_at).getTime() <= Date.now();
  if (expired) await admin.from("contract_signing_requests").update({ status: "expired" }).eq("trabajo_id", id).eq("status", "pending");
  return NextResponse.json({ request: { status: expired ? "expired" : data.status, expiresAt: data.expires_at, signerName: data.signer_name, signedAt: data.signed_at, hasSignedPdf: Boolean(data.signed_pdf_path) } });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["admin", "administrative"]);
  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin.from("contract_signing_requests").select("status,expires_at").eq("trabajo_id", id).in("status", ["pending", "signed"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (existing?.status === "signed") return NextResponse.json({ error: "El contrato ya está firmado.", conflict: true }, { status: 409 });
  if (existing?.status === "pending") {
    if (new Date(existing.expires_at).getTime() > Date.now()) return NextResponse.json({ error: "Ya existe un enlace de firma activo.", conflict: true }, { status: 409 });
    await admin.from("contract_signing_requests").update({ status: "expired" }).eq("trabajo_id", id).eq("status", "pending");
  }
  const trabajo = await getTrabajoDocumentById(id);
  if (!trabajo?.venta) return NextResponse.json({ error: "La venta no está confirmada." }, { status: 422 });
  const clientName = buildTrabajoPreviewSubject(trabajo, "carta-poder").full_name.trim();
  const agreedAmount = Number(trabajo.venta.agreed_amount);
  if (!clientName || !Number.isFinite(agreedAmount) || agreedAmount < 0) return NextResponse.json({ error: "El contrato no tiene datos completos." }, { status: 422 });
  const { settings: company } = await getCompanySettings();
  const snapshot = { clientName, companyName: company?.company_name, representativeName: company?.contact_name, companyCity: company?.city, agreedAmount, confirmedOn: trabajo.venta.confirmed_on };
  const snapshotHash = createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
  const { token, tokenHash } = createSigningToken();
  const { error } = await admin.from("contract_signing_requests").insert({ trabajo_id: id, token_hash: tokenHash, expires_at: signingExpiry(), contract_snapshot_sha256: snapshotHash, contract_snapshot: snapshot, created_by: user.id });
  if (error) return NextResponse.json({ error: "No se pudo generar el enlace." }, { status: error.code === "23505" ? 409 : 500 });
  const origin = new URL(request.url).origin;
  return NextResponse.json({ url: `${origin}/firma/${token}` });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "administrative"]);
  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("contract_signing_requests").update({ status: "revoked", revoked_at: new Date().toISOString() }).eq("trabajo_id", id).eq("status", "pending");
  if (error) return NextResponse.json({ error: "No se pudo revocar el enlace." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
