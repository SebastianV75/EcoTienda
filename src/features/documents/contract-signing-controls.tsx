"use client";
import { useEffect, useState } from "react";
type SigningRequest = { status: "pending" | "signed" | "revoked" | "expired"; expiresAt: string; signerName: string | null; signedAt: string | null; hasSignedPdf: boolean };
export function ContractSigningControls({ trabajoId }: { trabajoId: string }) {
  const [request, setRequest] = useState<SigningRequest | null>(null); const [url, setUrl] = useState<string | null>(null); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false); const [loaded, setLoaded] = useState(false);
  async function refresh() { const response = await fetch(`/api/trabajos/${trabajoId}/firma`, { cache: "no-store" }); const body = await response.json().catch(() => ({})); if (response.ok) setRequest(body.request); setLoaded(true); }
  useEffect(() => { void refresh(); }, [trabajoId]);
  async function generate() { setBusy(true); setMessage(""); const response = await fetch(`/api/trabajos/${trabajoId}/firma`, { method: "POST" }); const body = await response.json().catch(() => ({})); setBusy(false); if (!response.ok) { setMessage(body.error ?? "No se pudo generar."); await refresh(); return; } setUrl(body.url); setMessage("Enlace generado por 7 días."); await refresh(); }
  async function revoke() { setBusy(true); const response = await fetch(`/api/trabajos/${trabajoId}/firma`, { method: "DELETE" }); setBusy(false); if (!response.ok) { setMessage("No se pudo revocar el enlace."); return; } setUrl(null); setMessage("Enlace revocado."); await refresh(); }
  async function copy() { if (!url) return; await navigator.clipboard.writeText(url); setMessage("Enlace copiado."); }
  const pending = request?.status === "pending" && new Date(request.expiresAt).getTime() > Date.now(); const signed = request?.status === "signed" && request.hasSignedPdf; const canGenerate = !request || request.status === "expired" || request.status === "revoked" || (!pending && !signed);
  if (!loaded) return <div className="text-xs text-[var(--muted)]">Consultando estado de firma…</div>;
  return <div className="flex flex-wrap items-center gap-2">
    {pending ? <><span className="text-sm font-medium">Enlace enviado</span><span className="text-xs text-[var(--muted)]">Expira: {new Date(request.expiresAt).toLocaleString()}</span>{url ? <button type="button" className="ui-secondary-action" onClick={copy}>Copiar enlace</button> : null}<button type="button" className="ui-secondary-action text-red-700" onClick={revoke} disabled={busy}>Revocar</button></> : signed ? <><span className="text-sm font-medium">Contrato firmado</span><span className="text-xs text-[var(--muted)]">{request.signerName} · {request.signedAt ? new Date(request.signedAt).toLocaleString() : ""}</span><a className="ui-secondary-action" href={`/api/trabajos/${trabajoId}/firma?download=1`}>Descargar contrato firmado</a></> : canGenerate ? <button type="button" className="ui-secondary-action" onClick={generate} disabled={busy}>Generar enlace de firma</button> : null}
    {message ? <span className="text-xs text-[var(--muted)]">{message}</span> : null}
  </div>;
}
