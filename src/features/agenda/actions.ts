"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import {
	agendaItemStates,
	agendaItemTypes,
	type AgendaItemFormValues,
} from "@/types/agenda";
import { requireRole } from "@/features/auth/session";

export type AgendaActionState = {
	error: string | null;
};

function getString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? "";
}

function isAgendaType(value: string): value is AgendaItemFormValues["tipo"] {
	return agendaItemTypes.includes(value as AgendaItemFormValues["tipo"]);
}

function isAgendaState(value: string): value is AgendaItemFormValues["estado"] {
	return agendaItemStates.includes(value as AgendaItemFormValues["estado"]);
}

function validateAgendaItemInput(formData: FormData) {
	const fecha = getString(formData, "fecha");
	const titulo = getString(formData, "titulo");
	const tipo = getString(formData, "tipo");
	const estado = getString(formData, "estado");
	const descripcion = getString(formData, "descripcion");
	const clientId = getString(formData, "client_id");

	if (!fecha || !titulo || !tipo) {
		return {
			error: "Completa fecha, título y tipo.",
			values: null,
		};
	}

	if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
		return {
			error: "La fecha debe usar el formato YYYY-MM-DD.",
			values: null,
		};
	}

	if (!isAgendaType(tipo)) {
		return {
			error: "El tipo de agenda no es válido.",
			values: null,
		};
	}

	if (!isAgendaState(estado)) {
		return {
			error: "El estado de agenda no es válido.",
			values: null,
		};
	}

	return {
		error: null,
		values: {
			fecha,
			titulo,
			tipo,
			estado,
			descripcion: descripcion || null,
			client_id: clientId || null,
		},
	};
}

export async function updateAgendaItemAction(
	_previousState: AgendaActionState,
	formData: FormData,
): Promise<AgendaActionState> {
	if (hasSupabaseEnv()) {
		await requireRole(["admin"]);
	}

	const agendaItemId = getString(formData, "id");
	const { error, values } = validateAgendaItemInput(formData);

	if (!agendaItemId) {
		return { error: "Falta el identificador del elemento de agenda." };
	}

	if (error || !values) {
		return { error };
	}

	const supabase = await createSupabaseServerClient();
	const { error: updateError } = await supabase
		.from("agenda_items")
		.update(values)
		.eq("id", agendaItemId);

	if (updateError) {
		return { error: "No se pudo actualizar el elemento de agenda." };
	}

	revalidatePath("/agenda");
	revalidatePath(`/agenda/${agendaItemId}`);
	revalidatePath(`/agenda/${agendaItemId}/edit`);
	revalidatePath("/admin/visits");
	redirect(`/agenda/${agendaItemId}`);
}
