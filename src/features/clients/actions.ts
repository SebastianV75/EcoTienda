"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ClientActionState = {
	error: string | null;
};

function getString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? "";
}

function getNumber(value: string) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function validateClientInput(formData: FormData) {
	const fullName = getString(formData, "full_name");
	const phone = getString(formData, "phone");
	const address = getString(formData, "address");
	const neighborhood = getString(formData, "neighborhood");
	const rfc = getString(formData, "rfc");
	const rpu = getString(formData, "rpu");
	const latitude = getNumber(getString(formData, "latitude"));
	const longitude = getNumber(getString(formData, "longitude"));

	if (
		!fullName ||
		!phone ||
		!address ||
		!neighborhood ||
		!rfc ||
		!rpu ||
		latitude === null ||
		longitude === null
	) {
		return {
			error:
				"Completa nombre, teléfono, dirección, colonia, RFC, RPU y coordenadas.",
			values: null,
		};
	}

	return {
		error: null,
		values: {
			full_name: fullName,
			phone,
			address,
			neighborhood,
			rfc,
			rpu,
			latitude,
			longitude,
		},
	};
}

export async function createClientAction(
	_previousState: ClientActionState,
	formData: FormData,
): Promise<ClientActionState> {
	const { error, values } = validateClientInput(formData);

	if (error || !values) {
		return { error };
	}

	const supabase = await createSupabaseServerClient();
	const { data, error: insertError } = await supabase
		.from("clients")
		.insert(values)
		.select("id")
		.single();

	if (insertError || !data) {
		return { error: "No se pudo guardar el cliente." };
	}

	revalidatePath("/admin/clients");
	revalidatePath("/admin/documents");
	redirect(`/admin/clients/${data.id}`);
}

export async function updateClientAction(
	_previousState: ClientActionState,
	formData: FormData,
): Promise<ClientActionState> {
	const clientId = getString(formData, "id");
	const { error, values } = validateClientInput(formData);

	if (!clientId) {
		return { error: "Falta el identificador del cliente." };
	}

	if (error || !values) {
		return { error };
	}

	const supabase = await createSupabaseServerClient();
	const { error: updateError } = await supabase
		.from("clients")
		.update(values)
		.eq("id", clientId);

	if (updateError) {
		return { error: "No se pudo actualizar el cliente." };
	}

	revalidatePath("/admin/clients");
	revalidatePath(`/admin/clients/${clientId}`);
	revalidatePath("/admin/documents");
	redirect(`/admin/clients/${clientId}`);
}
