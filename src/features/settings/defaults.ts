import type { CompanySettings } from "@/types/quotation";

export const defaultCompanySettings: CompanySettings = {
	id: "",
	company_name: "EcoTienda",
	slogan: "Soluciones sustentables para tu hogar",
	address: "Tecnológico 5109",
	city: "Chihuahua",
	state: "Chihuahua",
	zip_code: "31100",
	phone: "6144511555",
	fax: "",
	email: "ecotecnologias1@gmail.com",
	contact_name: "Ricardo Lopez Beall",
	payment_terms_days: 30,
	updated_at: new Date(0).toISOString(),
};

export function normalizeCompanySettings(
	value: Partial<CompanySettings> | null | undefined,
): CompanySettings {
	const candidate = value ?? {};
	return {
		...defaultCompanySettings,
		...candidate,
		id:
			typeof candidate.id === "string" ? candidate.id : defaultCompanySettings.id,
		payment_terms_days: Number.isFinite(Number(candidate.payment_terms_days))
			? Number(candidate.payment_terms_days)
			: defaultCompanySettings.payment_terms_days,
		updated_at:
			typeof candidate.updated_at === "string"
				? candidate.updated_at
				: defaultCompanySettings.updated_at,
	};
}
