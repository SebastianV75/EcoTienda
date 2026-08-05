"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
	agendaItemStates,
	agendaItemTypes,
	agendaWorkTypeLabels,
	type AgendaItemFormValues,
	type AgendaWorkTypeOption,
} from "@/types/agenda";

import { buildAppointmentAt } from "./appointment-utils";

export type AgendaActionState = {
	error: string | null;
};

type AgendaBridgeSnapshot = {
	id: string;
	fecha: string;
	titulo: string;
	tipo: AgendaItemFormValues["tipo"];
	estado: AgendaItemFormValues["estado"];
	descripcion: string | null;

	visit_id: string | null;
	assignee_worker_id: string | null;
	assignee_name: string | null;
	created_at?: string;
	updated_at?: string;
};

type TrabajoSnapshot = {
	id: string;
	current_stage?: string;
	status?: string;
	intake_name: string | null;
	intake_first_name: string | null;
	intake_paternal_last_name: string | null;
	intake_maternal_last_name: string | null;
	intake_phone: string | null;
	intake_address_text: string | null;
	intake_latitude: number | null;
	intake_longitude: number | null;
	work_type: string | null;

	agenda_completed_at?: string | null;
	visita_completed_at?: string | null;
	created_at?: string;
	updated_at?: string;
};

type AgendaStageSnapshot = {
	trabajo_id: string;
	appointment_at: string;
	work_type: string;
	first_name: string;
	paternal_last_name: string;
	maternal_last_name: string | null;
	assignee_worker_id: string | null;
	assignee_name: string | null;
	note: string;
	contact_name: string;
	contact_phone: string;
	address_text: string;
	latitude: number;
	longitude: number;

	completed_at: string | null;
	created_at?: string;
	updated_at?: string;
};

function revalidateAgendaPaths(agendaItemId?: string) {
	revalidatePath("/agenda");
	revalidatePath("/admin");
	revalidatePath("/admin/visits");

	if (!agendaItemId) {
		return;
	}

	revalidatePath(`/agenda/${agendaItemId}`);
	revalidatePath(`/agenda/${agendaItemId}/edit`);
}

function getString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? "";
}

function isAgendaType(value: string): value is AgendaItemFormValues["tipo"] {
	return agendaItemTypes.includes(value as AgendaItemFormValues["tipo"]);
}

function isAgendaState(value: string): value is AgendaItemFormValues["estado"] {
	return agendaItemStates.includes(value as AgendaItemFormValues["estado"]);
}

function isAgendaWorkTypeOption(value: string): value is AgendaWorkTypeOption {
	return Object.prototype.hasOwnProperty.call(agendaWorkTypeLabels, value);
}

function resolveWorkTypeLabel(choice: AgendaWorkTypeOption, otherValue: string) {
	if (choice === "otro") {
		return otherValue.trim() || agendaWorkTypeLabels.otro;
	}

	return agendaWorkTypeLabels[choice];
}

function buildFullName(
	firstName: string,
	paternalLastName: string,
	maternalLastName: string,
) {
	return [firstName.trim(), paternalLastName.trim(), maternalLastName.trim()]
		.filter(Boolean)
		.join(" ");
}

function parseFiniteNumber(value: string) {
	if (!value) {
		return null;
	}

	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function validateAgendaItemInput(formData: FormData) {
	const fecha = getString(formData, "fecha");
	const hora = getString(formData, "hora");
	const tipo = getString(formData, "tipo");
	const estado = getString(formData, "estado");
	const title = getString(formData, "title");
	const workTypeChoice = getString(formData, "work_type_choice");
	const workTypeOther = getString(formData, "work_type_other");
	const assigneeWorkerId = getString(formData, "assignee_worker_id");
	const assigneeName = getString(formData, "assignee_name");
	const firstName = getString(formData, "first_name");
	const paternalLastName = getString(formData, "paternal_last_name");
	const maternalLastName = getString(formData, "maternal_last_name");
	const contactName = buildFullName(firstName, paternalLastName, maternalLastName);
	const contactPhone = getString(formData, "contact_phone");
	const addressText = getString(formData, "address_text");
	const latitude = getString(formData, "latitude");
	const longitude = getString(formData, "longitude");
	const descripcion = getString(formData, "descripcion");

	const missing: string[] = [];

	if (!fecha) missing.push("fecha");
	if (!hora) missing.push("hora");
	if (!tipo) missing.push("tipo");
	if (!estado) missing.push("estado");
	if (!workTypeChoice) missing.push("tipo de trabajo");
	if (!assigneeWorkerId) missing.push("trabajador asignado");
	if (!firstName) missing.push("nombre");
	if (!paternalLastName) missing.push("apellido paterno");
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

	if (!isAgendaWorkTypeOption(workTypeChoice)) {
		return { error: "El tipo de trabajo no es válido.", values: null };
	}

	if (!title) {
		return { error: "El título del trabajo es obligatorio.", values: null };
	}

	const appointmentAt = buildAppointmentAt(fecha, hora);
	const latitudeValue = parseFiniteNumber(latitude);
	const longitudeValue = parseFiniteNumber(longitude);

	if (!appointmentAt) {
		return {
			error: "La fecha y hora programadas no son válidas.",
			values: null,
		};
	}

	if (latitudeValue === null || longitudeValue === null) {
		return {
			error: "La ubicación debe incluir latitud y longitud válidas.",
			values: null,
		};
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
			work_type: resolveWorkTypeLabel(workTypeChoice, workTypeOther),
			work_type_choice: workTypeChoice,
			work_type_other: workTypeOther,
			assigneeWorkerId,
			assigneeName,
			first_name: firstName,
			paternal_last_name: paternalLastName,
			maternal_last_name: maternalLastName,
			contactName,
			contactPhone,
			addressText,
			latitude: latitudeValue,
			longitude: longitudeValue,
			descripcion,
		},
	};
}

function getWorkflowStagePayload(
	values: NonNullable<ReturnType<typeof validateAgendaItemInput>["values"]>,
	assigneeName: string,
) {
	return {
		appointment_at: values.appointmentAt,
		work_type: values.work_type,
		first_name: values.first_name,
		paternal_last_name: values.paternal_last_name,
		maternal_last_name: values.maternal_last_name || null,
		assignee_worker_id: values.assigneeWorkerId,
		assignee_name: assigneeName,
		note: values.descripcion,
		contact_name: values.contactName,
		contact_phone: values.contactPhone,
		address_text: values.addressText,
		latitude: values.latitude,
		longitude: values.longitude,
		
		completed_at: null,
	};
}

async function rollbackAgendaShell(
	supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
	trabajoId: string,
) {
	await supabase.from("agenda_items").delete().eq("id", trabajoId);
	await supabase.from("trabajo_agenda_stage").delete().eq("trabajo_id", trabajoId);
	await supabase.from("trabajos").delete().eq("id", trabajoId);
}

async function restoreAgendaBridge(
	supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
	snapshot: AgendaBridgeSnapshot | null,
) {
	if (!snapshot) {
		return;
	}

	await supabase.from("agenda_items").upsert(snapshot, { onConflict: "id" });
}

async function restoreAgendaStage(
	supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
	snapshot: AgendaStageSnapshot | null,
) {
	if (!snapshot) {
		return;
	}

	await supabase
		.from("trabajo_agenda_stage")
		.upsert(snapshot, { onConflict: "trabajo_id" });
}

async function restoreTrabajo(
	supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
	snapshot: TrabajoSnapshot | null,
) {
	if (!snapshot) {
		return;
	}

	await supabase.from("trabajos").upsert(snapshot, { onConflict: "id" });
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
	const { data: assigneeWorker, error: assigneeWorkerError } = await supabase
		.from("workers")
		.select("id, full_name, active")
		.eq("id", values.assigneeWorkerId)
		.eq("active", true)
		.maybeSingle();

	if (assigneeWorkerError || !assigneeWorker) {
		return { error: "El trabajador asignado no está activo." };
	}

	const trabajoId = globalThis.crypto.randomUUID();
	const now = new Date().toISOString();

	const { error: trabajoError } = await supabase.from("trabajos").insert({
		id: trabajoId,
		current_stage: "agenda",
		status: "open",
		intake_name: values.contactName,
		intake_first_name: values.first_name,
		intake_paternal_last_name: values.paternal_last_name,
		intake_maternal_last_name: values.maternal_last_name || null,
		intake_phone: values.contactPhone,
		intake_address_text: values.addressText,
		intake_latitude: values.latitude,
		intake_longitude: values.longitude,
		work_type: values.work_type,
		agenda_completed_at: now,
	});

	if (trabajoError) {
		return { error: "No se pudo crear el trabajo inicial." };
	}

	const { error: agendaStageError } = await supabase
		.from("trabajo_agenda_stage")
		.insert({
			trabajo_id: trabajoId,
			...getWorkflowStagePayload(values, assigneeWorker.full_name),
		});

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
		
		visit_id: trabajoId,
		assignee_worker_id: values.assigneeWorkerId,
		assignee_name: assigneeWorker.full_name,
	});

	if (agendaBridgeError) {
		await rollbackAgendaShell(supabase, trabajoId);
		return { error: "No se pudo crear el puente de compatibilidad de agenda." };
	}

	revalidateAgendaPaths(trabajoId);
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
	const { data: assigneeWorker, error: assigneeWorkerError } = await supabase
		.from("workers")
		.select("id, full_name, active")
		.eq("id", values.assigneeWorkerId)
		.eq("active", true)
		.maybeSingle();

	if (assigneeWorkerError || !assigneeWorker) {
		return { error: "El trabajador asignado no está activo." };
	}

	const { data: workflowStage } = await supabase
		.from("trabajo_agenda_stage")
		.select("trabajo_id, completed_at")
		.eq("trabajo_id", agendaItemId)
		.maybeSingle();

	const agendaBridgePayload = {
		fecha: values.fecha,
		titulo: values.title,
		tipo: values.tipo,
		estado: values.estado,
		descripcion: values.descripcion,
		
		visit_id: agendaItemId,
		assignee_worker_id: values.assigneeWorkerId,
		assignee_name: assigneeWorker.full_name,
	};

	const workflowPayload = {
		...getWorkflowStagePayload(values, assigneeWorker.full_name),
		completed_at: workflowStage?.completed_at ?? null,
	};

	if (workflowStage) {
		const [trabajoSnapshotResult, agendaStageSnapshotResult, bridgeSnapshotResult] =
			await Promise.all([
				supabase
					.from("trabajos")
					.select(
						"id, current_stage, status, intake_name, intake_first_name, intake_paternal_last_name, intake_maternal_last_name, intake_phone, intake_address_text, intake_latitude, intake_longitude, work_type, agenda_completed_at, visita_completed_at",
					)
					.eq("id", agendaItemId)
					.maybeSingle(),
				supabase
					.from("trabajo_agenda_stage")
					.select(
						"trabajo_id, appointment_at, work_type, first_name, paternal_last_name, maternal_last_name, assignee_worker_id, assignee_name, note, contact_name, contact_phone, address_text, latitude, longitude, completed_at",
					)
					.eq("trabajo_id", agendaItemId)
					.maybeSingle(),
				supabase
					.from("agenda_items")
					.select(
						"id, fecha, titulo, tipo, estado, descripcion, visit_id, assignee_worker_id, assignee_name",
					)
					.eq("id", agendaItemId)
					.maybeSingle(),
			]);

		if (
			trabajoSnapshotResult.error ||
			agendaStageSnapshotResult.error ||
			bridgeSnapshotResult.error
		) {
			return { error: "No se pudo preparar la actualización del trabajo." };
		}

		const trabajoSnapshot =
			(trabajoSnapshotResult.data as TrabajoSnapshot | null) ?? null;
		const agendaStageSnapshot =
			(agendaStageSnapshotResult.data as AgendaStageSnapshot | null) ?? null;
		const bridgeSnapshot =
			(bridgeSnapshotResult.data as AgendaBridgeSnapshot | null) ?? null;

		const { error: trabajoError } = await supabase
			.from("trabajos")
			.update({
				intake_name: values.contactName,
				intake_first_name: values.first_name,
				intake_paternal_last_name: values.paternal_last_name,
				intake_maternal_last_name: values.maternal_last_name || null,
				intake_phone: values.contactPhone,
				intake_address_text: values.addressText,
				intake_latitude: values.latitude,
				intake_longitude: values.longitude,
				work_type: values.work_type,
				
			})
			.eq("id", agendaItemId);

		if (trabajoError) {
			return { error: "No se pudo actualizar el trabajo de agenda." };
		}

		const { error: agendaStageError } = await supabase
			.from("trabajo_agenda_stage")
			.update(workflowPayload)
			.eq("trabajo_id", agendaItemId);

		if (agendaStageError) {
			await restoreTrabajo(supabase, trabajoSnapshot);
			return { error: "No se pudo actualizar la etapa de agenda." };
		}

		const { error: bridgeError } = await supabase
			.from("agenda_items")
			.update(agendaBridgePayload)
			.eq("id", agendaItemId);

		if (bridgeError) {
			await restoreAgendaStage(supabase, agendaStageSnapshot);
			await restoreTrabajo(supabase, trabajoSnapshot);
			await restoreAgendaBridge(supabase, bridgeSnapshot);
			return { error: "No se pudo actualizar el puente de agenda." };
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

	revalidateAgendaPaths(agendaItemId);
	redirect(`/agenda/${agendaItemId}`);
}

export async function deleteAgendaItemAction(formData: FormData) {
	if (hasSupabaseEnv()) {
		await requireRole(["admin"]);
	}

	const agendaItemId = getString(formData, "id");

	if (!agendaItemId) {
		throw new Error("Falta el identificador del elemento de agenda.");
	}

	const supabase = await createSupabaseServerClient();
	const { data: workflowStage, error: workflowLookupError } = await supabase
		.from("trabajo_agenda_stage")
		.select("trabajo_id")
		.eq("trabajo_id", agendaItemId)
		.maybeSingle();

	if (workflowLookupError) {
		throw new Error("No se pudo revisar la continuidad del trabajo de agenda.");
	}

	if (workflowStage) {
		const [trabajoSnapshotResult, agendaStageSnapshotResult, bridgeSnapshotResult] =
			await Promise.all([
				supabase.from("trabajos").select("*").eq("id", agendaItemId).maybeSingle(),
				supabase
					.from("trabajo_agenda_stage")
					.select("*")
					.eq("trabajo_id", agendaItemId)
					.maybeSingle(),
				supabase.from("agenda_items").select("*").eq("id", agendaItemId).maybeSingle(),
			]);

		if (
			trabajoSnapshotResult.error ||
			agendaStageSnapshotResult.error ||
			bridgeSnapshotResult.error
		) {
			throw new Error("No se pudo preparar el borrado del trabajo de agenda.");
		}

		const trabajoSnapshot =
			(trabajoSnapshotResult.data as TrabajoSnapshot | null) ?? null;
		const agendaStageSnapshot =
			(agendaStageSnapshotResult.data as AgendaStageSnapshot | null) ?? null;
		const bridgeSnapshot =
			(bridgeSnapshotResult.data as AgendaBridgeSnapshot | null) ?? null;

		const { error: bridgeError } = await supabase
			.from("agenda_items")
			.delete()
			.eq("id", agendaItemId);

		if (bridgeError) {
			throw new Error("No se pudo borrar el puente de agenda.");
		}

		const { error: agendaStageError } = await supabase
			.from("trabajo_agenda_stage")
			.delete()
			.eq("trabajo_id", agendaItemId);

		if (agendaStageError) {
			await restoreAgendaBridge(supabase, bridgeSnapshot);
			throw new Error("No se pudo borrar la etapa de agenda.");
		}

		const { error: trabajoError } = await supabase
			.from("trabajos")
			.delete()
			.eq("id", agendaItemId);

		if (trabajoError) {
			await restoreAgendaStage(supabase, agendaStageSnapshot);
			await restoreAgendaBridge(supabase, bridgeSnapshot);
			await restoreTrabajo(supabase, trabajoSnapshot);
			throw new Error("No se pudo borrar el trabajo de agenda.");
		}
	} else {
		const { error: deleteError } = await supabase
			.from("agenda_items")
			.delete()
			.eq("id", agendaItemId);

		if (deleteError) {
			throw new Error("No se pudo borrar la cita de agenda.");
		}
	}

	revalidateAgendaPaths(agendaItemId);
	redirect("/agenda");
}
