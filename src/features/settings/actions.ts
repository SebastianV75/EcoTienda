"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CompanySettingsActionState = {
	error: string | null;
	success: boolean;
};

function getString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? "";
}

function validateCompanySettings(formData: FormData) {
	const companyName = getString(formData, "company_name");
	const email = getString(formData, "email");
	const paymentTermsDays = Number(getString(formData, "payment_terms_days"));

	if (!companyName) {
		return { error: "El nombre de la empresa es obligatorio.", values: null };
	}

	if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return { error: "Escribe un correo electrónico válido.", values: null };
	}

	if (
		!Number.isInteger(paymentTermsDays) ||
		paymentTermsDays < 0 ||
		paymentTermsDays > 365
	) {
		return {
			error: "Los días de pago deben ser un número entero entre 0 y 365.",
			values: null,
		};
	}

	return {
		error: null,
		values: {
			company_name: companyName,
			slogan: getString(formData, "slogan"),
			address: getString(formData, "address"),
			city: getString(formData, "city"),
			state: getString(formData, "state"),
			zip_code: getString(formData, "zip_code"),
			phone: getString(formData, "phone"),
			fax: getString(formData, "fax"),
			email: email,
			contact_name: getString(formData, "contact_name"),
			payment_terms_days: paymentTermsDays,
		},
	};
}

export async function updateCompanySettingsAction(
	_previousState: CompanySettingsActionState,
	formData: FormData,
): Promise<CompanySettingsActionState> {
	if (!hasSupabaseEnv()) {
		return {
			error:
				"La base de datos no está configurada; los cambios no se pueden guardar todavía.",
			success: false,
		};
	}

	await requireRole(["admin"]);

	const { error, values } = validateCompanySettings(formData);
	if (error || !values) {
		return { error, success: false };
	}

	const supabase = await createSupabaseServerClient();
	const { data: rows, error: lookupError } = await supabase
		.from("company_settings")
		.select("id")
		.limit(2);

	if (lookupError || !rows) {
		return {
			error: "No se pudo localizar la configuración de la empresa.",
			success: false,
		};
	}

	if (rows.length === 0) {
		return {
			error:
				"No existe un registro de configuración de empresa para actualizar.",
			success: false,
		};
	}

	if (rows.length > 1) {
		return {
			error:
				"Hay más de una configuración de empresa. Debe existir un único registro.",
			success: false,
		};
	}

	const { error: updateError } = await supabase
		.from("company_settings")
		.update({ ...values, updated_at: new Date().toISOString() })
		.eq("id", rows[0].id);

	if (updateError) {
		return {
			error: "No se pudieron guardar los datos de la empresa.",
			success: false,
		};
	}

	revalidatePath("/admin/settings");

	return { error: null, success: true };
}
