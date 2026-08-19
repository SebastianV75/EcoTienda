import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CompanySettings } from "@/types/quotation";
import {
	defaultCompanySettings,
	normalizeCompanySettings,
} from "./defaults";

export { defaultCompanySettings, normalizeCompanySettings } from "./defaults";

type CompanySettingsResult = {
	settings: CompanySettings | null;
	error: string | null;
};

export async function getCompanySettings(): Promise<CompanySettingsResult> {
	if (!hasSupabaseEnv()) {
		return { settings: defaultCompanySettings, error: null };
	}

	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("company_settings")
		.select("*")
		.limit(2);

	if (error) {
		return {
			settings: defaultCompanySettings,
			error: "No se pudieron cargar los datos de la empresa; se usarán valores predeterminados.",
		};
	}

	if (!data || data.length === 0) {
		return {
			settings: defaultCompanySettings,
			error:
				"Todavía no existe una configuración de empresa en la base de datos.",
		};
	}

	if (data.length > 1) {
		return {
			settings: defaultCompanySettings,
			error:
				"Hay más de una configuración de empresa; se usarán valores predeterminados.",
		};
	}

	return {
		settings: normalizeCompanySettings(data[0] as Partial<CompanySettings>),
		error: null,
	};
}
