import test from "node:test";
import assert from "node:assert/strict";
import { deflateSync } from "node:zlib";
import { createSigningToken, hashSigningToken, validateSignatureDataUrl, validateSignerName } from "../src/features/documents/contract-signing.ts";

function png(rgba) {
  const width = 3; const height = 3; const header = Buffer.alloc(13); header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
  const row = Buffer.alloc((width * 4 + 1) * height); for (let y = 0; y < height; y++) { row[y * 13] = 0; rgba.copy(row, y * 13 + 1); }
  const chunk = (type, data) => { const out = Buffer.alloc(12 + data.length); out.writeUInt32BE(data.length, 0); out.write(type, 4); data.copy(out, 8); return out; };
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk("IHDR", header), chunk("IDAT", deflateSync(row)), chunk("IEND", Buffer.alloc(0))]);
}

test("signing tokens are opaque and hash deterministically", () => {
  const first = createSigningToken(); const second = createSigningToken(); assert.notEqual(first.token, second.token); assert.equal(first.tokenHash, hashSigningToken(first.token)); assert.equal(first.tokenHash.length, 64);
});
test("signature input rejects malformed, transparent and truncated PNG", () => {
  assert.throws(() => validateSignatureDataUrl("data:image/jpeg;base64,abc"));
  const transparent = png(Buffer.alloc(12)); assert.throws(() => validateSignatureDataUrl(`data:image/png;base64,${transparent.toString("base64")}`));
  const valid = png(Buffer.from([0,0,0,255, 0,0,0,255, 0,0,0,255])); assert.doesNotThrow(() => validateSignatureDataUrl(`data:image/png;base64,${valid.toString("base64")}`));
  assert.throws(() => validateSignatureDataUrl(`data:image/png;base64,${valid.subarray(0, 40).toString("base64")}`));
});
test("signer must match immutable contract name", () => { assert.equal(validateSignerName(" Ana Pérez ", "ana pérez"), "Ana Pérez"); assert.throws(() => validateSignerName("Otra Persona", "Ana Pérez")); });
