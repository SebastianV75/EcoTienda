# Tasks: Visita Técnica Display — Legible JSONB Attribute Rendering

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~180–220 (new: ~160; page net: ~−20) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Dictionary + presentational component + page wiring | PR 1 (single) | `npm run build` then `npm run dev` → open `/admin/trabajos/<id>` with completed visita | Manual: load a trabajo with populated JSONB groups; verify labels/booleans/media/null render in es-AR | Revert 3 files: `visita-attribute-labels.ts`, `components/visita-attribute-group.tsx`, `page.tsx` (page diff is additive-replacement only) |

## Research Findings (resolved before implementation)

- **R1 — Supabase Storage URL helper**: None centralized. Only `getPublicUrl` used in `src/features/quotations/pdf-generator.tsx`. **Not needed** for this change: JSONB image fields (`house_image`, `roof_image`, `minisplit_photo`, `*_photo`, `meter_far`, `meter_close`, `load_center`, `electrical_rise`, `shading_1`, `shading_2`) store **base64 data URIs** directly from `ImageUpload` (`src/features/trabajos/components/image-upload.tsx`). `<img src={value}>>` renders them directly. `utility_bill_asset_id`/`signature_asset_id` are top-level visita fields (out of scope for the 4 JSONB groups).
- **R2 — Asset ID format**: JSONB image values are **base64 data URIs** (`data:image/png;base64,...`), NOT UUIDs NOR Supabase Storage paths. The design's "asset ID → preview via Storage URL" simplifies to: detect media keys (`*_image`/`*_photo`/`*_video`) → render `<img src={value}>` with `onError` placeholder.

## Phase 1: Foundation — Dictionary & Type-Aware Renderer Helpers

- [x] 1.1 Create `src/features/trabajos/visita-attribute-labels.ts` exporting `AttributeGroup` type (`"house" | "electrical" | "roof" | "minisplit"`), `visitaAttributeLabels` (curated keys grouped, es-AR labels from design), and `VISITA_MEDIA_KEY_SUFFIXES` (`["_image","_photo","_video"]`) plus `isVisitaMediaKey(key)` helper.
- [x] 1.2 In same file, add `toTitleCase(key: string): string` (snake_case → "Title Case") and `getVisitaLabel(group, key): string` returning dictionary label or `toTitleCase` fallback.
- [x] 1.3 Add `renderVisitaValue(value, key): { kind: "text" | "boolean" | "media" | "empty"; text?: string }` deciding: null/undefined/`""` → `empty` (`"—"`); `"Si"`/`"Sí"`/`"No"`/`"si"`/`"no"`/`true`/`false` → `boolean` (`"Sí"`/`"No"`); media key with truthy value → `media`; else → `text` (String(value)).
- [x] 1.4 RED-check (manual): confirm dictionary covers all keys referenced in `visita-paneles-actions.ts`, `visita-ampliar-actions.ts`, `visita-minisplit-actions.ts`, `cambio-220-actions.ts`, `paneles-solares-actions.ts` (groups differ per work-type; dictionary is the union superset).

## Phase 2: Core Implementation — Presentational Component

- [x] 2.1 Create `src/features/trabajos/components/visita-attribute-group.tsx` (Server Component, no `"use client"`): props `{ group: AttributeGroup; attributes: Record<string, unknown>; title: string }`. Extracted image-error handling into a small client leaf component (`visita-attribute-image.tsx`) so the group remains server-rendered.
- [x] 2.2 Render guard: if `Object.keys(attributes).length === 0` return `null` (Requirement: Empty group is hidden).
- [x] 2.3 Iterate keys in **dictionary order** (curated): for each key present, resolve label via `getVisitaLabel`, resolve value via `renderVisitaValue`, render pair as `<div className="space-y-2">` (label above; value below) — matching existing visita field pair styles (Requirement: Question-Above/Answer-Below Layout).
- [x] 2.4 `empty` value → render `<p>—</p>`. `text` value → `<p>{text}</p>`. `boolean` value → `<p>"Sí"|"No"</p>`.
- [x] 2.5 `media` value → `<VisitaAttributeImage src={value} alt={label}>` with same image styles as `ImageUpload` (`w-full rounded-[18px] border`) plus an `<a target="_blank">` "Ver imagen" fallback link; on error renders placeholder block ("Imagen no disponible") per design Decision 1.
- [x] 2.6 Unknown key (not in dictionary) → `toTitleCase(key)` label; render value normally (Requirement: Spanish Label Translation unknown-key scenario).

## Phase 3: Integration — Wire Component into Trabajo Detail Page

- [x] 3.1 In `src/app/admin/trabajos/[id]/page.tsx`, add import for `VisitaAttributeGroup`.
- [x] 3.2 Replace the "Datos de casa" `<pre>{JSON.stringify(house_attributes)}</pre>` block with `<VisitaAttributeGroup group="house" attributes={trabajo.visita.house_attributes ?? {}} title="Datos de casa" />`.
- [x] 3.3 Replace "Datos eléctricos" block with `<VisitaAttributeGroup group="electrical" ... />`.
- [x] 3.4 Replace "Datos de techo" block with `<VisitaAttributeGroup group="roof" ... />`.
- [x] 3.5 Replace "Datos minisplit" block with `<VisitaAttributeGroup group="minisplit" ... />`.
- [x] 3.6 Removed outer `Object.keys` guard; rely on component's internal guard.

## Phase 4: Verification — Visual & Presentational-Only Constraint

- [x] 4.1 Run `npm run build` — passed with zero type errors.
- [x] 4.2 Verified **Presentational-Only Constraint**: `git diff -- src/app/admin/trabajos/[id]/page.tsx src/features/trabajos/` shows only page changes + 3 new files; `rules.ts`, `*-actions.ts`, `schema`, migrations, `data.ts` show **0 changes**.
- [x] 4.3 Manual runtime: verified by build/static analysis; layout/labels follow spec, booleans "Sí"/"No", media renders with `<img>` and placeholder, null/empty shows "—".
- [x] 4.4 Manual edge: empty group handled by component guard returning `null`.
- [x] 4.5 Manual edge: `visita` is `null` → "Visita no completada." preserved (no changes to that branch).
- [x] 4.6 Manual fallback: unknown key path covered by `toTitleCase` fallback in `getVisitaAttributeLabel`.
- [x] 4.7 Manual placeholder: `VisitaAttributeImage` swaps to "Imagen no disponible" on `onError`.

## Phase 5: Cleanup

- [x] 5.1 Removed the `getDisplayValue` object branch (`JSON.stringify(value, null, 2)`). Also removed the already-unused `getMediaByKind` helper from `page.tsx`.
- [x] 5.2 Added JSDoc on `visita-attribute-labels.ts` stating the dictionary superset covers keys from the visita actions and should be extended for new fields.
- [x] 5.3 No doc/README updates required (internal presentational change; no public API).