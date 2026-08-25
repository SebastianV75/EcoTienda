import "server-only";

import { createHash } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
	getUnifilarRuleByKey,
	UNIFILAR_BUCKET,
	UNIFILAR_MAX_FILE_SIZE,
} from "./unifilar-diagrams";

export async function readUnifilarPng(input: FormData | File) {
	const entry = input instanceof File ? input : input.get("diagram");
	if (!(entry instanceof File) || entry.size === 0) {
		throw new Error("Selecciona un archivo PNG.");
	}

	if (entry.type !== "image/png") {
		throw new Error("El diagrama debe estar en formato PNG.");
	}

	if (entry.size > UNIFILAR_MAX_FILE_SIZE) {
		throw new Error("El PNG no puede superar 10 MB.");
	}

	const bytes = Buffer.from(await entry.arrayBuffer());
	return {
		entry,
		bytes,
		sha256: createHash("sha256").update(bytes).digest("hex"),
	};
}

async function uploadObject(path: string, bytes: Buffer) {
	const admin = createSupabaseAdminClient();
	const { error } = await admin.storage.from(UNIFILAR_BUCKET).upload(path, bytes, {
		contentType: "image/png",
		cacheControl: "31536000",
		upsert: false,
	});
	if (error) throw new Error(`No se pudo subir el PNG: ${error.message}`);
}

async function removeObject(path: string) {
	try {
		await createSupabaseAdminClient().storage.from(UNIFILAR_BUCKET).remove([path]);
	} catch {
		// El archivo huérfano se puede limpiar desde el catálogo administrativo.
	}
}

export async function saveGlobalUnifilarDiagram({
	ruleKey,
	file,
	userId,
}: {
	ruleKey: string;
	file: File;
	userId: string;
}) {
	const rule = getUnifilarRuleByKey(ruleKey);
	if (!rule) throw new Error("La regla de paneles no es válida.");

	const { entry, bytes, sha256 } = await readUnifilarPng(file);
	const supabase = await createSupabaseServerClient();
	const { data: latest } = await supabase
		.from("unifilar_diagram_assets")
		.select("version")
		.eq("scope", "global")
		.eq("rule_key", rule.key)
		.order("version", { ascending: false })
		.limit(1)
		.maybeSingle();

	const version = Number(latest?.version ?? 0) + 1;
	const path = `global/${rule.key}/v${version}-${crypto.randomUUID()}.png`;
	await uploadObject(path, bytes);

	try {
		const { data: asset, error: insertError } = await supabase
			.from("unifilar_diagram_assets")
			.insert({
				scope: "global",
				rule_key: rule.key,
				original_filename: entry.name,
				storage_path: path,
				mime_type: entry.type,
				size_bytes: entry.size,
				sha256,
				version,
				is_current: false,
				created_by: userId,
			})
			.select("id")
			.single();
		if (insertError || !asset) throw insertError ?? new Error("No se pudo registrar el PNG.");

		const { error: retireError } = await supabase
			.from("unifilar_diagram_assets")
			.update({ is_current: false })
			.eq("scope", "global")
			.eq("rule_key", rule.key)
			.eq("is_current", true);
		if (retireError) throw retireError;

		const { error: activateError } = await supabase
			.from("unifilar_diagram_assets")
			.update({ is_current: true })
			.eq("id", asset.id);
		if (activateError) throw activateError;

		return { assetId: asset.id, sha256 };
	} catch (error) {
		await removeObject(path);
		throw new Error(error instanceof Error ? error.message : "No se pudo registrar el PNG.");
	}
}

export async function saveManualUnifilarDiagram({
	trabajoId,
	file,
	userId,
}: {
	trabajoId: string;
	file: File;
	userId: string;
}) {
	const { entry, bytes, sha256 } = await readUnifilarPng(file);
	const supabase = await createSupabaseServerClient();
	const path = `manual/${trabajoId}/${crypto.randomUUID()}.png`;
	await uploadObject(path, bytes);

	try {
		const { data: asset, error: insertError } = await supabase
			.from("unifilar_diagram_assets")
			.insert({
				scope: "manual",
				trabajo_id: trabajoId,
				original_filename: entry.name,
				storage_path: path,
				mime_type: entry.type,
				size_bytes: entry.size,
				sha256,
				version: 1,
				is_current: true,
				created_by: userId,
			})
			.select("id")
			.single();
		if (insertError || !asset) throw insertError ?? new Error("No se pudo registrar el PNG.");

		const { error: assignmentError } = await supabase
			.from("trabajo_unifilar_diagram_assignments")
			.upsert(
				{ trabajo_id: trabajoId, asset_id: asset.id, assigned_by: userId },
				{ onConflict: "trabajo_id" },
			);
		if (assignmentError) throw assignmentError;

		return { assetId: asset.id, sha256 };
	} catch (error) {
		await removeObject(path);
		throw new Error(error instanceof Error ? error.message : "No se pudo asignar el PNG.");
	}
}
