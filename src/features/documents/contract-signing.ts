import { createHash, randomBytes } from "node:crypto";
import { inflateSync } from "node:zlib";

export const SIGNING_TTL_DAYS = 7;
export const SIGNING_BUCKET = "signed-contracts";

export function createSigningToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashSigningToken(token) };
}

export function hashSigningToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function validateSignatureDataUrl(value: unknown): Buffer {
  if (typeof value !== "string") throw new Error("Firma requerida.");
  const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(value);
  if (!match) throw new Error("La firma debe ser una imagen PNG válida.");
  const bytes = Buffer.from(match[1], "base64");
  if (bytes.length < 50 || bytes.length > 512 * 1024) throw new Error("La imagen de firma excede el tamaño permitido.");
  const signature = Buffer.from([137,80,78,71,13,10,26,10]);
  if (bytes.subarray(0, 8).compare(signature) !== 0) throw new Error("La firma PNG no es válida.");
  let width = 0; let height = 0; let colorType = 0; let bitDepth = 0; let compression = 1; let filterMethod = 1; let interlace = 1; let offset = 8; let ended = false; const chunks: Buffer[] = [];
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset); const type = bytes.toString("ascii", offset + 4, offset + 8); const end = offset + 12 + length;
    if (end > bytes.length) throw new Error("La firma PNG está truncada.");
    const chunk = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") { if (length !== 13) throw new Error("PNG inválido."); width = chunk.readUInt32BE(0); height = chunk.readUInt32BE(4); bitDepth = chunk[8]; colorType = chunk[9]; compression = chunk[10]; filterMethod = chunk[11]; interlace = chunk[12]; }
    if (type === "IDAT") chunks.push(chunk);
    offset = end; if (type === "IEND") { ended = true; break; }
  }
  if (!ended || !width || !height || width > 2000 || height > 1000 || width * height > 2_000_000 || bitDepth !== 8 || ![2, 6].includes(colorType) || compression !== 0 || filterMethod !== 0 || interlace !== 0 || !chunks.length) throw new Error("La firma PNG tiene dimensiones o formato inválidos.");
  try {
    const channels = colorType === 6 ? 4 : 3; const rowBytes = width * channels; const expected = height * (rowBytes + 1);
    const raw = inflateSync(Buffer.concat(chunks), { maxOutputLength: expected });
    if (raw.length !== expected) throw new Error("PNG truncado.");
    let ink = 0; let previous = Buffer.alloc(rowBytes);
    for (let y = 0; y < height; y++) {
      const filter = raw[y * (rowBytes + 1)]; const row = Buffer.from(raw.subarray(y * (rowBytes + 1) + 1, (y + 1) * (rowBytes + 1))); if (![0,1,2,3,4].includes(filter)) throw new Error("Filtro PNG inválido.");
      for (let x = 0; x < rowBytes; x++) { const left = x >= channels ? row[x - channels] : 0; const up = previous[x]; const upperLeft = x >= channels ? previous[x - channels] : 0; if (filter === 1) row[x] = (row[x] + left) & 255; else if (filter === 2) row[x] = (row[x] + up) & 255; else if (filter === 3) row[x] = (row[x] + Math.floor((left + up) / 2)) & 255; else if (filter === 4) { const p = left + up - upperLeft; const pa = Math.abs(p-left); const pb = Math.abs(p-up); const pc = Math.abs(p-upperLeft); row[x] = (row[x] + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upperLeft)) & 255; } }
      for (let x = 0; x < width; x++) { const alpha = channels === 4 ? row[x * channels + 3] : 255; const dark = row[x * channels] < 245 || row[x * channels + 1] < 245 || row[x * channels + 2] < 245; if (alpha > 20 && dark) ink++; }
      previous = row;
    }
    if (ink < 5) throw new Error("La firma está vacía.");
  } catch (error) { throw new Error(error instanceof Error ? `Firma PNG inválida: ${error.message}` : "Firma PNG inválida."); }
  return bytes;
}

export function validateSignerName(value: unknown, expected: string) {
  if (typeof value !== "string" || value.trim().length < 2 || value.trim().length > 160) {
    throw new Error("Escribe tu nombre completo.");
  }
  if (value.trim().toLocaleLowerCase() !== expected.trim().toLocaleLowerCase()) {
    throw new Error("El nombre debe coincidir con el del contrato.");
  }
  return value.trim();
}

export function signingExpiry() {
  return new Date(Date.now() + SIGNING_TTL_DAYS * 86400000).toISOString();
}
