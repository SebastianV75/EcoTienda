import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CompanySettings } from "@/types/quotation";

export const defaultCompanySettings: CompanySettings = {
	id: "",
	company_name: "EcoTienda",
	slogan: "Soluciones sustentables para tu hogar",
	address: "Av. Principal 123",
	city: "Guadalajara",
	state: "Jalisco",
	zip_code: "44100",
	phone: "(33) 1234-5678",
	fax: "",
	email: "contacto@ecotienda.com",
	contact_name: "Administrador EcoTienda",
	payment_terms_days: 30,
	updated_at: new Date(0).toISOString(),
};

type CompanySettingsResult = {
	settings: CompanySettings | null;
	error: string | null;
};

function normalizeCompanySettings(value: CompanySettings): CompanySettings {
	return {
		...defaultCompanySettings,
		...value,
		payment_terms_days: Number.isFinite(Number(value.payment_terms_days))
			? Number(value.payment_terms_days)
			: defaultCompanySettings.payment_terms_days,
	};
}

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
			settings: null,
			error: "No se pudieron cargar los datos de la empresa.",
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
			settings: null,
			error:
				"Hay más de una configuración de empresa. Debe existir un único registro.",
		};
	}

	return {
		settings: normalizeCompanySettings(data[0] as CompanySettings),
		error: null,
	};
}
