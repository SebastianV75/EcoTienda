"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/features/auth/session";
import {
	agendaItemStates,
	agendaItemTypes,
	type AgendaItemFormValues,
} from "@/types/agenda";

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

function parseFiniteNumber(value: string) {
	if (!value) {
		return null;
	}

	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function buildAppointmentAt(fecha: string, hora: string) {
	const [year, month, day] = fecha.split("-").map(Number);
	const [hours, minutes] = hora.split(":").map(Number);

	if (
		!year ||
		!month ||
		!day ||
		Number.isNaN(hours) ||
		Number.isNaN(minutes)
	) {
		return null;
	}

	return new Date(Date.UTC(year, month - 1, day, hours, minutes)).toISOString();
}

function validateAgendaItemInput(formData: FormData) {
	const fecha = getString(formData, "fecha");
	const hora = getString(formData, "hora");
		const tipo = getString(formData, "tipo");
		const estado = getString(formData, "estado");
		const title = getString(formData, "title");
		const workType = getString(formData, "work_type");
		const assigneeName = getString(formData, "assignee_name");
		const contactName = getString(formData, "contact_name");
	const contactPhone = getString(formData, "contact_phone");
	const addressText = getString(formData, "address_text");
	const latitude = getString(formData, "latitude");
	const longitude = getString(formData, "longitude");
	const descripcion = getString(formData, "descripcion");
	const clientId = getString(formData, "client_id");

	const missing: string[] = [];

	if (!fecha) missing.push("fecha");
	if (!hora) missing.push("hora");
	if (!tipo) missing.push("tipo");
	if (!estado) missing.push("estado");
	if (!workType) missing.push("tipo de trabajo");
	if (!assigneeName) missing.push("asignado a");
	if (!contactName) missing.push("nombre de contacto");
	if (!contactPhone) missing.push("teléfono");
	if (!addressText) missing.push("dirección");
	if (!latitude) missing.push("latitud");
	if (!longitude) missing.push("longitud");
	if (!descripcion) missing.push("nota");

	if (missing.length > 0) {
		return {
			error: `Completa ${missing.join(", ")}.`,
			values: null,
		};
	}

	if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
		return { error: "La fecha debe usar el formato YYYY-MM-DD.", values: null };
	}

	if (!/^\d{2}:\d{2}$/.test(hora)) {
		return { error: "La hora debe usar el formato HH:MM.", values: null };
	}

	if (!isAgendaType(tipo)) {
		return { error: "El tipo de agenda no es válido.", values: null };
	}

	if (!isAgendaState(estado)) {
		return { error: "El estado de agenda no es válido.", values: null };
	}

	if (!title) {
		return { error: "El título del trabajo es obligatorio.", values: null };
	}

	const appointmentAt = buildAppointmentAt(fecha, hora);
	const latitudeValue = parseFiniteNumber(latitude);
	const longitudeValue = parseFiniteNumber(longitude);

	if (!appointmentAt) {
		return { error: "No se pudo construir la fecha y hora programadas.", values: null };
	}

	if (latitudeValue === null || longitudeValue === null) {
		return { error: "La ubicación debe incluir latitud y longitud válidas.", values: null };
	}

	return {
		error: null,
		values: {
			fecha,
			hora,
			appointmentAt,
			tipo,
			estado,
			title,
			workType,
			assigneeName,
			contactName,
			contactPhone,
			addressText,
			latitude: latitudeValue,
			longitude: longitudeValue,
			descripcion,
			clientId: clientId || null,
		},
	};
}

function getWorkflowStagePayload(values: NonNullable<ReturnType<typeof validateAgendaItemInput>["values"]>) {
	return {
		appointment_at: values.appointmentAt,
		work_type: values.workType,
		assignee_name: values.assigneeName,
		note: values.descripcion,
		contact_name: values.contactName,
		contact_phone: values.contactPhone,
		address_text: values.addressText,
		latitude: values.latitude,
		longitude: values.longitude,
		client_id: values.clientId,
		completed_at: null,
	};
}

async function rollbackAgendaShell(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, trabajoId: string) {
	await supabase.from("agenda_items").delete().eq("id", trabajoId);
	await supabase.from("trabajo_agenda_stage").delete().eq("trabajo_id", trabajoId);
	await supabase.from("trabajos").delete().eq("id", trabajoId);
}

export async function createAgendaItemAction(
	_previousState: AgendaActionState,
	formData: FormData,
): Promise<AgendaActionState> {
	if (hasSupabaseEnv()) {
		await requireRole(["admin"]);
	}

	const { error, values } = validateAgendaItemInput(formData);

	if (error || !values) {
		return { error };
	}

	const supabase = await createSupabaseServerClient();
	const trabajoId = globalThis.crypto.randomUUID();

	const { error: trabajoError } = await supabase.from("trabajos").insert({
		id: trabajoId,
		current_stage: "agenda",
		status: "open",
		intake_name: values.contactName,
		intake_phone: values.contactPhone,
		intake_address_text: values.addressText,
		intake_latitude: values.latitude,
		intake_longitude: values.longitude,
		client_id: values.clientId,
	});

	if (trabajoError) {
		return { error: "No se pudo crear el trabajo inicial." };
	}

	const { error: agendaStageError } = await supabase
		.from("trabajo_agenda_stage")
		.insert({ trabajo_id: trabajoId, ...getWorkflowStagePayload(values) });

	if (agendaStageError) {
		await rollbackAgendaShell(supabase, trabajoId);
		return { error: "No se pudo guardar el ingreso de agenda." };
	}

	const { error: agendaBridgeError } = await supabase.from("agenda_items").insert({
		id: trabajoId,
		fecha: values.fecha,
		titulo: values.title,
		tipo: values.tipo,
		estado: values.estado,
		descripcion: values.descripcion,
		client_id: values.clientId,
		visit_id: trabajoId,
	});

	if (agendaBridgeError) {
		await rollbackAgendaShell(supabase, trabajoId);
		return { error: "No se pudo crear el puente de compatibilidad de agenda." };
	}

	revalidatePath("/agenda");
	revalidatePath("/admin");
	revalidatePath("/admin/visits");
	redirect(`/agenda/${trabajoId}`);
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
	const { data: workflowStage } = await supabase
		.from("trabajo_agenda_stage")
		.select("trabajo_id")
		.eq("trabajo_id", agendaItemId)
		.maybeSingle();
	const { data: currentWorkflowStage } = await supabase
		.from("trabajo_agenda_stage")
		.select("completed_at")
		.eq("trabajo_id", agendaItemId)
		.maybeSingle();

	const agendaBridgePayload = {
		fecha: values.fecha,
		titulo: values.title,
		tipo: values.tipo,
		estado: values.estado,
		descripcion: values.descripcion,
		client_id: values.clientId,
		visit_id: agendaItemId,
	};

	const workflowPayload = {
		...getWorkflowStagePayload(values),
		completed_at: currentWorkflowStage?.completed_at ?? null,
	};

	if (workflowStage) {
		const [{ error: trabajoError }, { error: agendaStageError }, { error: bridgeError }] =
			await Promise.all([
				supabase
					.from("trabajos")
					.update({
						intake_name: values.contactName,
						intake_phone: values.contactPhone,
						intake_address_text: values.addressText,
						intake_latitude: values.latitude,
						intake_longitude: values.longitude,
						client_id: values.clientId,
					})
					.eq("id", agendaItemId),
				supabase
					.from("trabajo_agenda_stage")
					.update(workflowPayload)
					.eq("trabajo_id", agendaItemId),
				supabase.from("agenda_items").update(agendaBridgePayload).eq("id", agendaItemId),
			]);

		if (trabajoError || agendaStageError || bridgeError) {
			return { error: "No se pudo actualizar el trabajo de agenda." };
		}
	} else {
		const { error: bridgeError } = await supabase
			.from("agenda_items")
			.update(agendaBridgePayload)
			.eq("id", agendaItemId);

		if (bridgeError) {
			return { error: "No se pudo actualizar el elemento de agenda." };
		}
	}

	revalidatePath("/agenda");
	revalidatePath("/admin");
	revalidatePath(`/agenda/${agendaItemId}`);
	revalidatePath(`/agenda/${agendaItemId}/edit`);
	revalidatePath("/admin/visits");
	redirect(`/agenda/${agendaItemId}`);
}
