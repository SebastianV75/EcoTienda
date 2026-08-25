"use client";
import { useRef, useState } from "react";
export function SignatureForm({ token, clientName }: { token: string; clientName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null); const drawing = useRef(false); const [consent, setConsent] = useState(false); const [hasInk, setHasInk] = useState(false); const [error, setError] = useState(""); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false);
  function point(event: React.PointerEvent<HTMLCanvasElement>) { const canvas = canvasRef.current; if (!canvas) return null; const rect = canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height }; }
  function start(event: React.PointerEvent<HTMLCanvasElement>) { drawing.current = true; setHasInk(true); canvasRef.current?.setPointerCapture(event.pointerId); const p = point(event); const ctx = canvasRef.current?.getContext("2d"); if (p && ctx) { ctx.beginPath(); ctx.moveTo(p.x, p.y); } }
  function move(event: React.PointerEvent<HTMLCanvasElement>) { if (!drawing.current) return; const p = point(event); const ctx = canvasRef.current?.getContext("2d"); if (p && ctx) { ctx.lineTo(p.x, p.y); ctx.stroke(); } }
  function clear() { const canvas = canvasRef.current; canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height); setHasInk(false); }
  function signatureDataUrl(canvas: HTMLCanvasElement): string {
    const context = canvas.getContext("2d");
    if (!context) return canvas.toDataURL("image/png");
    const { width, height } = canvas;
    const pixels = context.getImageData(0, 0, width, height).data;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (pixels[(y * width + x) * 4 + 3] > 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    if (maxX < 0) return canvas.toDataURL("image/png");

    const padding = 8;
    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const cropRight = Math.min(width, maxX + padding + 1);
    const cropBottom = Math.min(height, maxY + padding + 1);
    const cropped = document.createElement("canvas");
    cropped.width = cropRight - cropX;
    cropped.height = cropBottom - cropY;
    cropped
      .getContext("2d")
      ?.drawImage(canvas, cropX, cropY, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
    return cropped.toDataURL("image/png");
  }

  async function submit(event: React.FormEvent) { event.preventDefault(); setError(""); const canvas = canvasRef.current; if (!consent || !hasInk || !canvas) { setError("Acepta el contrato y firma en el recuadro."); return; } setBusy(true); const response = await fetch(`/api/firma/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ signerName: clientName, consent, signature: signatureDataUrl(canvas) }) }); const body = await response.json().catch(() => ({})); setBusy(false); if (!response.ok) { setError(body.error ?? "No se pudo guardar la firma."); return; } setDone(true); }
  if (done) return <div className="rounded-xl border p-6"><h2 className="text-lg font-semibold">Contrato firmado</h2><p className="mt-2">Tu firma electrónica fue guardada.</p><a className="ui-primary-action mt-4 inline-flex" href={`/api/firma/${token}`} download>Descargar contrato firmado</a></div>;
  const canSubmit = consent && hasInk && !busy;
  return <form onSubmit={submit} className="space-y-4"><label className="block text-sm font-medium">Nombre completo<input value={clientName} readOnly className="mt-1 w-full rounded border p-2" /></label><div><p className="text-sm font-medium">Firma</p><canvas ref={canvasRef} width={700} height={220} className="mt-1 h-44 w-full touch-none rounded border bg-white" onPointerDown={start} onPointerMove={move} onPointerUp={() => { drawing.current = false; }} /><button type="button" className="mt-2 text-sm underline" onClick={clear}>Limpiar firma</button></div><label className="flex gap-2 text-sm"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />Acepto el contenido del contrato y autorizo el uso de esta firma electrónica interna.</label><button type="submit" disabled={!canSubmit} className="ui-primary-action disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Guardando…" : "Firmar contrato"}</button>{error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}</form>;
}
