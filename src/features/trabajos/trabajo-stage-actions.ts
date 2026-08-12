"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
	canAdvanceTrabajoStage,
	canCompleteTrabajoVenta,
	isTrabajoDescargablesReady,
	isTrabajoQuotationStageComplete,
	isTrabajoSaleStageComplete,
} from "./rules";

export type CotizacionActionState = {
	error: string | null;
	success: string | null;
};

export type CotizacionFormValues = {
	trabajo_id: string;
	scope_summary: string;
	amount: number;
	terms_and_conditions: string;
	outcome: string;
	quotation_type: string;
	rfc: string;
	rpu: string;
};

type CotizacionStagePayload = {
	trabajo_id: string;
	scope_summary: string;
	amount: number;
	terms_and_conditions: string;
	outcome: string;
	quotation_type: string;
	rfc: string;
	rpu: string;
	completed_at: string | null;
};

type ValidCotizacionInput =
	| {
			error: null;
			values: CotizacionFormValues;
			stagePayload: CotizacionStagePayload;
	  }
	| { error: string; values: null; stagePayload?: never };

function getString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? "";
}

function getNumber(formData: FormData, key: string) {
	const value = formData.get(key)?.toString().trim() ?? "";
	return value ? Number(value) : NaN;
}

function validateCotizacionInput(formData: FormData): ValidCotizacionInput {
	const values: CotizacionFormValues = {
		trabajo_id: getString(formData, "trabajo_id"),
		scope_summary: getString(formData, "scope_summary"),
		amount: getNumber(formData, "amount"),
		terms_and_conditions: getString(formData, "terms_and_conditions"),
		outcome: getString(formData, "outcome"),
		quotation_type: getString(formData, "quotation_type"),
		rfc: getString(formData, "rfc"),
		rpu: getString(formData, "rpu"),
	};

	const missing: string[] = [];

	if (!values.trabajo_id) missing.push("trabajo");
	if (!values.scope_summary) missing.push("alcance");
	if (!Number.isFinite(values.amount) || values.amount < 0)
		missing.push("monto válido");
	if (!values.terms_and_conditions) missing.push("términos y condiciones");
	if (!values.outcome) missing.push("resultado");
	if (!values.quotation_type) missing.push("tipo de cotización");
	if (!values.rfc) missing.push("RFC");
	if (!values.rpu) missing.push("RPU");

	if (missing.length > 0) {
		return { error: `Completa ${missing.join(", ")}.`, values: null };
	}

	const stagePayload: CotizacionStagePayload = {
		trabajo_id: values.trabajo_id,
		scope_summary: values.scope_summary,
		amount: values.amount,
		terms_and_conditions: values.terms_and_conditions,
		outcome: values.outcome,
		quotation_type: values.quotation_type,
		rfc: values.rfc,
		rpu: values.rpu,
		completed_at: new Date().toISOString(),
	};

	if (!isTrabajoQuotationStageComplete(stagePayload)) {
		return {
			error: "La cotización no cumple todos los datos obligatorios.",
			values: null,
		};
	}

	return { error: null, values, stagePayload };
}

export type VentaActionState = {
	error: string | null;
	success: string | null;
};

export type VentaFormValues = {
	trabajo_id: string;
	quotation_trabajo_id: string;
	confirmed_on: string;
	agreed_amount: number;
	notes: string;
};

export type DescargablesActionState = {
	error: string | null;
	success: string | null;
};

export type DescargablesFormValues = {
	trabajo_id: string;
};

type VentaStagePayload = {
	trabajo_id: string;
	quotation_trabajo_id: string;
	confirmed_on: string;
	agreed_amount: number;
	notes: string;
	completed_at: string | null;
};

type ValidVentaInput =
	| { error: null; values: VentaFormValues; stagePayload: VentaStagePayload }
	| { error: string; values: null; stagePayload?: never };

function validateVentaInput(formData: FormData): ValidVentaInput {
	const values: VentaFormValues = {
		trabajo_id: getString(formData, "trabajo_id"),
		quotation_trabajo_id: getString(formData, "quotation_trabajo_id"),
		confirmed_on: getString(formData, "confirmed_on"),
		agreed_amount: getNumber(formData, "agreed_amount"),
		notes: getString(formData, "notes"),
	};

	const missing: string[] = [];

	if (!values.trabajo_id) missing.push("trabajo");
	if (!values.quotation_trabajo_id) missing.push("cotización vinculada");
	if (!values.confirmed_on) missing.push("fecha de confirmación");
	if (!Number.isFinite(values.agreed_amount) || values.agreed_amount < 0)
		missing.push("monto acordado válido");

	if (missing.length > 0) {
		return { error: `Completa ${missing.join(", ")}.`, values: null };
	}

	if (!/^\d{4}-\d{2}-\d{2}$/.test(values.confirmed_on)) {
		return {
			error: "La fecha de confirmación debe usar el formato YYYY-MM-DD.",
			values: null,
		};
	}

	const stagePayload: VentaStagePayload = {
		trabajo_id: values.trabajo_id,
		quotation_trabajo_id: values.quotation_trabajo_id,
		confirmed_on: values.confirmed_on,
		agreed_amount: values.agreed_amount,
		notes: values.notes,
		completed_at: new Date().toISOString(),
	};

	if (!isTrabajoSaleStageComplete(stagePayload)) {
		return {
			error: "La venta no cumple todos los datos obligatorios.",
			values: null,
		};
	}

	return { error: null, values, stagePayload };
}

type TrabajoSnapshot = {
	id: string;
	current_stage: "agenda" | "visita" | "cotizacion" | "venta" | "descargables";
	visita_completed_at: string | null;
	cotizacion_completed_at: string | null;
	venta_completed_at: string | null;
	descargables_completed_at: string | null;
};

type QuotationStageSnapshot = CotizacionStagePayload;

type SaleStageSnapshot = {
	trabajo_id: string;
	quotation_trabajo_id: string;
	confirmed_on: string;
	agreed_amount: number;
	notes: string;
	completed_at: string | null;
};

async function restoreTrabajo(
	supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
	snapshot: TrabajoSnapshot | null,
) {
	if (!snapshot) return;
	await supabase.from("trabajos").upsert(snapshot, { onConflict: "id" });
}

async function restoreQuotationStage(
	supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
	snapshot: QuotationStageSnapshot | null,
) {
	if (!snapshot) return;
	await supabase
		.from("trabajo_quotation_stage")
		.upsert(snapshot, { onConflict: "trabajo_id" });
}

async function restoreSaleStage(
	supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
	snapshot: SaleStageSnapshot | null,
) {
	if (!snapshot) return;
	await supabase
		.from("trabajo_sale_stage")
		.upsert(snapshot, { onConflict: "trabajo_id" });
}

type LegacyQuotationSnapshot = {
	total: number | string | null;
	project: string | null;
	terms_and_conditions: string | null;
};

async function ensureTrabajoQuotationStage(
	supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
	trabajoId: string,
	completedAt: string | null,
): Promise<{
	stage: QuotationStageSnapshot | null;
	created: boolean;
	error: string | null;
}> {
	const { data: existingStage, error: existingStageError } = await supabase
		.from("trabajo_quotation_stage")
		.select(
			"trabajo_id, scope_summary, amount, terms_and_conditions, outcome, quotation_type, rfc, rpu, completed_at",
		)
		.eq("trabajo_id", trabajoId)
		.maybeSingle();

	if (existingStageError) {
		return {
			stage: null,
			created: false,
			error: existingStageError.message,
		};
	}

	if (existingStage) {
		return {
			stage: existingStage as QuotationStageSnapshot,
			created: false,
			error: null,
		};
	}

	const { data: legacyQuotation, error: legacyQuotationError } = await supabase
		.from("quotations")
		.select("total, project, terms_and_conditions")
		.eq("trabajo_id", trabajoId)
		.order("created_at", { ascending: false })
		.limit(1)
		.maybeSingle();

	if (legacyQuotationError || !legacyQuotation) {
		return {
			stage: null,
			created: false,
			error:
				legacyQuotationError?.message ??
				"No existe una cotización vinculada al trabajo.",
		};
	}

	const quotation = legacyQuotation as LegacyQuotationSnapshot;
	const amount = Number(quotation.total);
	if (!Number.isFinite(amount) || amount < 0) {
		return {
			stage: null,
			created: false,
			error: "La cotización vinculada no tiene un total válido.",
		};
	}

	const payload: QuotationStageSnapshot = {
		trabajo_id: trabajoId,
		scope_summary: quotation.project?.trim() || "Cotización aceptada",
		amount,
		terms_and_conditions: quotation.terms_and_conditions?.trim() ?? "",
		outcome: "approved",
		quotation_type: "Cotización general",
		rfc: "",
		rpu: "",
		completed_at: completedAt,
	};

	const { data: createdStage, error: createStageError } = await supabase
		.from("trabajo_quotation_stage")
		.upsert(payload, { onConflict: "trabajo_id" })
		.select(
			"trabajo_id, scope_summary, amount, terms_and_conditions, outcome, quotation_type, rfc, rpu, completed_at",
		)
		.single();

	if (createStageError || !createdStage) {
		return {
			stage: null,
			created: false,
			error:
				createStageError?.message ?? "No se pudo crear la etapa de cotización.",
		};
	}

	return {
		stage: createdStage as QuotationStageSnapshot,
		created: true,
		error: null,
	};
}

async function removeCreatedQuotationStage(
	supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
	trabajoId: string,
) {
	await supabase
		.from("trabajo_quotation_stage")
		.delete()
		.eq("trabajo_id", trabajoId);
}

export async function saveTrabajoCotizacionAction(
	_previousState: CotizacionActionState,
	formData: FormData,
): Promise<CotizacionActionState> {
	if (hasSupabaseEnv()) {
		await requireRole(["admin", "administrative"]);
	}

	const result = validateCotizacionInput(formData);

	if (result.error || !result.values) {
		return { error: result.error, success: null };
	}

	const supabase = await createSupabaseServerClient();
	const completionIso = result.stagePayload.completed_at;

	const [trabajoSnapshotResult, quotationStageSnapshotResult] =
		await Promise.all([
			supabase
				.from("trabajos")
				.select(
					"id, current_stage, visita_completed_at, cotizacion_completed_at, venta_completed_at, descargables_completed_at",
				)
				.eq("id", result.values.trabajo_id)
				.maybeSingle(),
			supabase
				.from("trabajo_quotation_stage")
				.select(
					"trabajo_id, scope_summary, amount, terms_and_conditions, outcome, quotation_type, rfc, rpu, completed_at",
				)
				.eq("trabajo_id", result.values.trabajo_id)
				.maybeSingle(),
		]);

	if (trabajoSnapshotResult.error || quotationStageSnapshotResult.error) {
		return {
			error: "No se pudo preparar la cotización para guardarse.",
			success: null,
		};
	}

	const trabajoSnapshot =
		(trabajoSnapshotResult.data as TrabajoSnapshot | null) ?? null;
	const quotationStageSnapshot =
		(quotationStageSnapshotResult.data as QuotationStageSnapshot | null) ??
		null;

	if (
		!trabajoSnapshot ||
		!trabajoSnapshot.visita_completed_at ||
		!canAdvanceTrabajoStage(
			trabajoSnapshot.current_stage,
			"venta",
			!!result.stagePayload.completed_at,
		)
	) {
		return {
			error:
				"La visita debe estar completada y el trabajo debe estar en la etapa de Cotización.",
			success: null,
		};
	}

	const { error: cotizacionError } = await supabase
		.from("trabajo_quotation_stage")
		.upsert(result.stagePayload, { onConflict: "trabajo_id" });

	if (cotizacionError) {
		console.error("[saveTrabajoCotizacionAction] Error al guardar etapa", {
			trabajoId: result.values.trabajo_id,
			code: cotizacionError.code,
			message: cotizacionError.message,
			details: cotizacionError.details,
			hint: cotizacionError.hint,
		});
		return { error: "No se pudo guardar la cotización.", success: null };
	}

	const { error: trabajoError, count: trabajoUpdateCount } = await supabase
		.from("trabajos")
		.update(
			{
				current_stage: "venta",
				cotizacion_completed_at: completionIso,
			},
			{ count: "exact" },
		)
		.eq("id", result.values.trabajo_id)
		.eq("current_stage", "cotizacion");

	if (trabajoError || trabajoUpdateCount !== 1) {
		await restoreTrabajo(supabase, trabajoSnapshot);
		await restoreQuotationStage(supabase, quotationStageSnapshot);
		return {
			error: "Se guardó la cotización, pero no se pudo avanzar el trabajo.",
			success: null,
		};
	}

	revalidatePath("/admin/trabajos");
	revalidatePath(`/admin/trabajos/${result.values.trabajo_id}`);
	revalidatePath(`/admin/visits/${result.values.trabajo_id}`);
	revalidatePath("/admin/documents");
	revalidatePath("/admin/documents/trabajos");
	revalidatePath("/admin/documents/carta-poder/preview");
	revalidatePath("/admin/documents/ubicacion-cliente/preview");
	revalidatePath("/admin/documents/diagrama-unifilar/preview");

	return {
		error: null,
		success: "Cotización confirmada y trabajo avanzado a Venta.",
	};
}

export async function saveTrabajoVentaAction(
	_previousState: VentaActionState,
	formData: FormData,
): Promise<VentaActionState> {
	if (hasSupabaseEnv()) {
		await requireRole(["admin", "administrative"]);
	}

	const result = validateVentaInput(formData);

	if (result.error || !result.values) {
		return { error: result.error, success: null };
	}

	const supabase = await createSupabaseServerClient();

	const [trabajoSnapshotResult, saleStageSnapshotResult] = await Promise.all([
		supabase
			.from("trabajos")
			.select(
				"id, current_stage, visita_completed_at, cotizacion_completed_at, venta_completed_at, descargables_completed_at",
			)
			.eq("id", result.values.trabajo_id)
			.maybeSingle(),
		supabase
			.from("trabajo_sale_stage")
			.select(
				"trabajo_id, quotation_trabajo_id, confirmed_on, agreed_amount, notes, completed_at",
			)
			.eq("trabajo_id", result.values.trabajo_id)
			.maybeSingle(),
	]);

	if (trabajoSnapshotResult.error || saleStageSnapshotResult.error) {
		console.error("[saveTrabajoVentaAction] Error al preparar venta", {
			trabajoError: trabajoSnapshotResult.error?.message,
			saleStageError: saleStageSnapshotResult.error?.message,
		});
		return {
			error: "No se pudo preparar la venta para guardarse.",
			success: null,
		};
	}

	const trabajoSnapshot =
		(trabajoSnapshotResult.data as TrabajoSnapshot | null) ?? null;
	const saleStageSnapshot =
		(saleStageSnapshotResult.data as SaleStageSnapshot | null) ?? null;

	if (
		!trabajoSnapshot ||
		!canCompleteTrabajoVenta(
			trabajoSnapshot.current_stage,
			trabajoSnapshot.cotizacion_completed_at,
		)
	) {
		return {
			error: "La cotización debe estar completada antes de confirmar la venta.",
			success: null,
		};
	}

	const quotationStageResult = await ensureTrabajoQuotationStage(
		supabase,
		trabajoSnapshot.id,
		trabajoSnapshot.cotizacion_completed_at,
	);

	if (quotationStageResult.error || !quotationStageResult.stage) {
		console.error(
			"[saveTrabajoVentaAction] Error al preparar cotización vinculada",
			{
				trabajoId: trabajoSnapshot.id,
				message: quotationStageResult.error,
			},
		);
		return {
			error: "No existe una cotización vinculada válida para guardar la venta.",
			success: null,
		};
	}

	const salePayload: VentaStagePayload = {
		...result.stagePayload,
		quotation_trabajo_id: quotationStageResult.stage.trabajo_id,
	};

	const { error: ventaError } = await supabase
		.from("trabajo_sale_stage")
		.upsert(salePayload, { onConflict: "trabajo_id" });

	if (ventaError) {
		console.error("[saveTrabajoVentaAction] Error al guardar etapa de venta", {
			trabajoId: result.values.trabajo_id,
			code: ventaError.code,
			message: ventaError.message,
			details: ventaError.details,
			hint: ventaError.hint,
		});
		if (quotationStageResult.created) {
			await removeCreatedQuotationStage(supabase, trabajoSnapshot.id);
		}
		return { error: "No se pudo guardar la venta.", success: null };
	}

	const ventaCompletedAt = result.stagePayload.completed_at;

	const { error: trabajoError, count: trabajoUpdateCount } = await supabase
		.from("trabajos")
		.update(
			{
				current_stage: "descargables",
				venta_completed_at: ventaCompletedAt,
			},
			{ count: "exact" },
		)
		.eq("id", result.values.trabajo_id)
		.eq("current_stage", "venta");

	if (trabajoError || trabajoUpdateCount !== 1) {
		console.error("[saveTrabajoVentaAction] Error al completar trabajo", {
			trabajoId: result.values.trabajo_id,
			code: trabajoError?.code,
			message: trabajoError?.message,
			details: trabajoError?.details,
			hint: trabajoError?.hint,
			count: trabajoUpdateCount,
		});
		await restoreTrabajo(supabase, trabajoSnapshot);
		await restoreSaleStage(supabase, saleStageSnapshot);
		if (quotationStageResult.created) {
			await removeCreatedQuotationStage(supabase, trabajoSnapshot.id);
		}
		return {
			error: "Se guardó la venta, pero no se pudo avanzar el trabajo.",
			success: null,
		};
	}

	revalidatePath("/admin/trabajos");
	revalidatePath(`/admin/trabajos/${result.values.trabajo_id}`);
	revalidatePath(`/admin/visits/${result.values.trabajo_id}`);
	revalidatePath("/admin/descargables");

	return {
		error: null,
		success: "Venta confirmada y trabajo avanzado a Descargables.",
	};
}

function validateDescargablesInput(formData: FormData):
	| {
			error: null;
			values: DescargablesFormValues;
			stagePayload: { trabajo_id: string; completed_at: string | null };
	  }
	| { error: string; values: null; stagePayload?: never } {
	const values: DescargablesFormValues = {
		trabajo_id: getString(formData, "trabajo_id"),
	};

	if (!values.trabajo_id) {
		return { error: "Selecciona un trabajo.", values: null };
	}

	return {
		error: null,
		values,
		stagePayload: {
			trabajo_id: values.trabajo_id,
			completed_at: new Date().toISOString(),
		},
	};
}

export async function saveTrabajoDescargablesAction(
	_previousState: DescargablesActionState,
	formData: FormData,
): Promise<DescargablesActionState> {
	if (hasSupabaseEnv()) {
		await requireRole(["admin", "administrative"]);
	}

	const result = validateDescargablesInput(formData);

	if (result.error || !result.values) {
		return { error: result.error, success: null };
	}

	const supabase = await createSupabaseServerClient();
	const completionIso = result.stagePayload.completed_at;

	const { data: trabajoData, error: trabajoSnapshotError } = await supabase
		.from("trabajos")
		.select(
			"id, current_stage, visita_completed_at, cotizacion_completed_at, venta_completed_at, descargables_completed_at",
		)
		.eq("id", result.values.trabajo_id)
		.maybeSingle();

	if (trabajoSnapshotError) {
		return {
			error: "No se pudo preparar Descargables para guardarse.",
			success: null,
		};
	}

	const trabajoSnapshot = (trabajoData as TrabajoSnapshot | null) ?? null;

	if (!trabajoSnapshot || !isTrabajoDescargablesReady(trabajoSnapshot)) {
		return {
			error:
				"La etapa anterior (Venta) debe estar completada antes de avanzar.",
			success: null,
		};
	}

	if (trabajoSnapshot.descargables_completed_at) {
		return { error: null, success: "Descargables ya estaba completado." };
	}

	if (
		!canAdvanceTrabajoStage(
			trabajoSnapshot.current_stage,
			"descargables",
			!!trabajoSnapshot.venta_completed_at,
		)
	) {
		return {
			error:
				"La etapa anterior (Venta) debe estar completada antes de avanzar.",
			success: null,
		};
	}

	const { error: trabajoError } = await supabase
		.from("trabajos")
		.update({
			current_stage: "descargables",
			descargables_completed_at: completionIso,
		})
		.eq("id", result.values.trabajo_id);

	if (trabajoError) {
		await restoreTrabajo(supabase, trabajoSnapshot);
		return { error: "No se pudo completar Descargables.", success: null };
	}

	revalidatePath("/admin/trabajos");
	revalidatePath(`/admin/trabajos/${result.values.trabajo_id}`);
	revalidatePath("/admin/documents");
	revalidatePath("/admin/documents/trabajos");
	revalidatePath("/admin/documents/carta-poder/preview");
	revalidatePath("/admin/documents/ubicacion-cliente/preview");
	revalidatePath("/admin/documents/diagrama-unifilar/preview");

	return {
		error: null,
		success: "Descargables completado y trabajo avanzado a Descargables.",
	};
}
