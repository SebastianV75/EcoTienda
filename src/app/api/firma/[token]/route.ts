import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateContractPdf, getContractFilename, type ContractPdfData } from "@/features/documents/contract-pdf";
import { hashSigningToken, SIGNING_BUCKET, validateSignatureDataUrl, validateSignerName } from "@/features/documents/contract-signing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Snapshot = ContractPdfData & { clientName: string };
async function getRequest(token: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("contract_signing_requests").select("*").eq("token_hash", hashSigningToken(token)).maybeSingle();
  return { admin, data };
}
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params; const { admin, data } = await getRequest(token);
  if (!data || data.status !== "pending" || new Date(data.expires_at).getTime() <= Date.now()) return NextResponse.json({ error: "El enlace no es válido o expiró." }, { status: 410 });
  const body = await request.json().catch(() => null) as { signerName?: unknown; consent?: unknown; signature?: unknown } | null;
  if (!body?.consent) return NextResponse.json({ error: "Debes aceptar el contrato." }, { status: 400 });
  const snapshot = data.contract_snapshot as Snapshot; let signature: Buffer; let signerName: string;
  try { signature = validateSignatureDataUrl(body.signature); signerName = validateSignerName(body.signerName, snapshot.clientName); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Datos inválidos." }, { status: 400 }); }
  const signedAt = new Date().toISOString();
  const pdf = await generateContractPdf({ ...snapshot, signaturePng: signature, signedAt });
  const path = `${data.trabajo_id}/${data.id}.pdf`;
  const upload = await admin.storage.from(SIGNING_BUCKET).upload(path, pdf, { contentType: "application/pdf", upsert: false });
  if (upload.error) return NextResponse.json({ error: "No se pudo guardar el contrato." }, { status: 500 });
  const claim = await admin.rpc("claim_contract_signing_request", { p_token_hash: hashSigningToken(token), p_signer_name: signerName, p_consented_at: signedAt, p_signature_sha256: createHash("sha256").update(signature).digest("hex"), p_signed_pdf_path: path });
  if (claim.error) { await admin.storage.from(SIGNING_BUCKET).remove([path]); return NextResponse.json({ error: "El enlace ya fue utilizado." }, { status: 409 }); }
  return NextResponse.json({ ok: true });
}
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params; const { admin, data } = await getRequest(token);
  if (!data || (data.status !== "pending" && data.status !== "signed") || (data.status === "pending" && new Date(data.expires_at).getTime() <= Date.now())) return NextResponse.json({ error: "El enlace no es válido o expiró." }, { status: 404 });
  const snapshot = data.contract_snapshot as Snapshot;
  let bytes: Uint8Array;
  let disposition = "inline";
  if (data.status === "signed" && data.signed_pdf_path) {
    const file = await admin.storage.from(SIGNING_BUCKET).download(data.signed_pdf_path);
    if (file.error || !file.data) return NextResponse.json({ error: "No se pudo descargar el contrato." }, { status: 404 });
    bytes = new Uint8Array(await file.data.arrayBuffer());
    disposition = "attachment";
  } else {
    bytes = await generateContractPdf(snapshot);
  }
  return new NextResponse(bytes as BodyInit, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `${disposition}; filename="${getContractFilename(snapshot.clientName)}"`, "Cache-Control": "private, no-store" } });
}
