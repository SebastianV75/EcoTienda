import "server-only";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
	getUnifilarRule,
	parseUnifilarPanelCount,
	UNIFILAR_RULES,
	type UnifilarRuleKey,
} from "./unifilar-diagram-rules";

export { UNIFILAR_RULES, getUnifilarRuleByKey } from "./unifilar-diagram-rules";
export const UNIFILAR_BUCKET = "unifilar-diagrams";
export const UNIFILAR_MAX_FILE_SIZE = 10 * 1024 * 1024;

export type UnifilarDiagramResolution = {
	status: "ready" | "manual-required" | "missing-panel-count";
	source: "manual" | "global" | "fallback" | null;
	url: string | null;
	downloadUrl: string | null;
	ruleKey: UnifilarRuleKey | null;
	ruleLabel: string | null;
	originalFilename: string | null;
	message: string;
};

type AssetRow = {
	id: string;
	scope: "global" | "manual";
	rule_key: string | null;
	trabajo_id: string | null;
	original_filename: string;
	storage_path: string;
	version: number;
	created_at: string;
};

async function getSignedAssetUrl(path: string, download = false) {
	try {
		const admin = createSupabaseAdminClient();
		const { data, error } = await admin.storage
			.from(UNIFILAR_BUCKET)
			.createSignedUrl(path, 60 * 60, download ? { download: true } : undefined);
		return error ? null : data?.signedUrl ?? null;
	} catch {
		return null;
	}
}

function fallbackResolution(rule: (typeof UNIFILAR_RULES)[number]): UnifilarDiagramResolution {
	const url = `/diagramas-unifilar/${rule.fallback}`;
	return {
		status: "ready",
		source: "fallback",
		url,
		downloadUrl: url,
		ruleKey: rule.key,
		ruleLabel: rule.label,
		originalFilename: rule.fallback,
		message: `Se usará el diagrama base para ${rule.label}.`,
	};
}

export async function getUnifilarDiagramResolution(
	trabajoId: string,
	panelCount: string | null | undefined,
): Promise<UnifilarDiagramResolution> {
	const count = parseUnifilarPanelCount(panelCount);
	if (count === null) {
		return {
			status: "missing-panel-count",
			source: null,
			url: null,
			downloadUrl: null,
			ruleKey: null,
			ruleLabel: null,
			originalFilename: null,
			message: "Captura la cantidad de paneles para seleccionar el diagrama.",
		};
	}

	const rule = getUnifilarRule(panelCount);
	if (!hasSupabaseEnv()) {
		if (count >= 15) {
			return {
				status: "manual-required",
				source: null,
				url: null,
				downloadUrl: null,
				ruleKey: null,
				ruleLabel: null,
				originalFilename: null,
				message: "Este trabajo requiere que subas manualmente su diagrama.",
			};
		}
		return fallbackResolution(rule!);
	}

	const supabase = await createSupabaseServerClient();
	const { data: assignment } = await supabase
		.from("trabajo_unifilar_diagram_assignments")
		.select("asset_id")
		.eq("trabajo_id", trabajoId)
		.maybeSingle();

	let asset: AssetRow | null = null;
	if (assignment?.asset_id) {
		const { data } = await supabase
			.from("unifilar_diagram_assets")
			.select("id, scope, rule_key, trabajo_id, original_filename, storage_path, version, created_at")
			.eq("id", assignment.asset_id)
			.maybeSingle();
		asset = (data as AssetRow | null) ?? null;
	}

	if (!asset && rule) {
		const { data } = await supabase
			.from("unifilar_diagram_assets")
			.select("id, scope, rule_key, trabajo_id, original_filename, storage_path, version, created_at")
			.eq("scope", "global")
			.eq("rule_key", rule.key)
			.eq("is_current", true)
			.maybeSingle();
		asset = (data as AssetRow | null) ?? null;
	}

	if (!asset) {
		if (count >= 15) {
			return {
				status: "manual-required",
				source: null,
				url: null,
				downloadUrl: null,
				ruleKey: null,
				ruleLabel: null,
				originalFilename: null,
				message: "Este trabajo requiere que subas manualmente su diagrama.",
			};
		}
		return fallbackResolution(rule!);
	}

	const url = await getSignedAssetUrl(asset.storage_path);
	const downloadUrl = await getSignedAssetUrl(asset.storage_path, true);
	if (!url || !downloadUrl) {
		return {
			status: "ready",
			source: asset.scope,
			url: null,
			downloadUrl: null,
			ruleKey: (asset.rule_key as UnifilarRuleKey | null) ?? rule?.key ?? null,
			ruleLabel: rule?.label ?? "Diagrama manual",
			originalFilename: asset.original_filename,
			message: "El diagrama existe, pero no se pudo preparar su descarga segura.",
		};
	}

	return {
		status: "ready",
		source: asset.scope,
		url,
		downloadUrl,
		ruleKey: (asset.rule_key as UnifilarRuleKey | null) ?? rule?.key ?? null,
		ruleLabel: rule?.label ?? "Diagrama manual",
		originalFilename: asset.original_filename,
		message: asset.scope === "manual" ? "Diagrama manual asignado a este trabajo." : `Diagrama global vigente para ${rule?.label ?? "este trabajo"}.`,
	};
}

export async function getCurrentGlobalUnifilarAssets() {
	if (!hasSupabaseEnv()) return [] as AssetRow[];

	const supabase = await createSupabaseServerClient();
	const { data } = await supabase
		.from("unifilar_diagram_assets")
		.select("id, scope, rule_key, trabajo_id, original_filename, storage_path, version, created_at")
		.eq("scope", "global")
		.eq("is_current", true)
		.order("rule_key");

	return (data as AssetRow[] | null) ?? [];
}

export function getUnifilarPanelCount(value: string | null | undefined) {
	return parseUnifilarPanelCount(value);
}
