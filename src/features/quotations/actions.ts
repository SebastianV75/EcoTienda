"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/features/auth/session";
import { generateQuotationNumber } from "./quotation-number";
import { generateAndSavePDF } from "./pdf-generator";
import {
	calculateQuotationTotals,
	normalizeQuotationItems,
	parseQuotationItems,
	toQuotationItemRows,
} from "./quotation-items";
import type { QuotationItem } from "@/types/quotation";

export type QuotationActionState = {
	error: string | null;
	success?: boolean;
	quotationId?: string;
};

export type DraftSaveState = {
	success: boolean;
	quotationId?: string;
	error?: string;
};

function getString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? "";
}

function logQuotationDatabaseError(
	context: string,
	error: {
		code?: string;
		message?: string;
		details?: string;
		hint?: string;
	} | null,
) {
	if (!error) return;
	console.error("[Quotation database error]", {
		context,
		code: error.code,
		message: error.message,
		details: error.details,
		hint: error.hint,
	});
}

function isUniqueViolation(error: { code?: string } | null) {
	return error?.code === "23505";
}

export async function deleteQuotationAction(
	_previousState: QuotationActionState,
	id: string,
): Promise<QuotationActionState> {
	await requireRole(["admin", "administrative"]);
	const supabase = await createSupabaseServerClient();

	const { error: itemsError } = await supabase
		.from("quotation_items")
		.delete()
		.eq("quotation_id", id);

	if (itemsError) {
		return { error: "No se pudieron eliminar los productos." };
	}

	const { error: quotationError } = await supabase
		.from("quotations")
		.delete()
		.eq("id", id);

	if (quotationError) {
		return { error: "No se pudo eliminar la cotización." };
	}

	revalidatePath("/admin/quotations");
	return { error: null, success: true };
}

export async function confirmQuotationAction(
	_previousState: QuotationActionState,
	formData: FormData,
): Promise<QuotationActionState> {
	await requireRole(["admin", "administrative"]);
	const quotationId = formData.get("quotation_id")?.toString();
	const trabajoId = formData.get("trabajo_id")?.toString();
	const returnToTrabajo = formData.get("return_to")?.toString() === "trabajo";

	if (!quotationId || !trabajoId) {
		return { error: "Faltan datos para confirmar la cotización." };
	}

	const supabase = await createSupabaseServerClient();

	// Obtener el total de la cotización
	const { data: quotation, error: quotationFetchError } = await supabase
		.from("quotations")
		.select("id, subtotal, status")
		.eq("id", quotationId)
		.eq("trabajo_id", trabajoId)
		.single();

	if (quotationFetchError || !quotation) {
		logQuotationDatabaseError(
			"confirmQuotationAction quotation",
			quotationFetchError,
		);
		return { error: "No se pudo obtener la cotización." };
	}

	const { data: quotationItems, error: quotationItemsError } = await supabase
		.from("quotation_items")
		.select("amount")
		.eq("quotation_id", quotationId);

	if (quotationItemsError) {
		logQuotationDatabaseError(
			"confirmQuotationAction items",
			quotationItemsError,
		);
		return { error: "No se pudieron obtener los productos de la cotización." };
	}

	const { total } = calculateQuotationTotals(
		(quotationItems ?? []).map((item) => ({ amount: Number(item.amount) })),
		Number(quotation.subtotal),
	);

	const { data: trabajo, error: trabajoFetchError } = await supabase
		.from("trabajos")
		.select("current_stage, visita_completed_at, cotizacion_completed_at")
		.eq("id", trabajoId)
		.single();

	if (trabajoFetchError || !trabajo) {
		logQuotationDatabaseError(
			"confirmQuotationAction trabajo",
			trabajoFetchError,
		);
		return { error: "No se pudo validar la etapa del trabajo." };
	}

	if (trabajo.current_stage !== "cotizacion") {
		return {
			error:
				"La cotización solo puede confirmarse cuando el trabajo está en la etapa de Cotización.",
		};
	}

	if (!trabajo.visita_completed_at) {
		return {
			error:
				"La visita técnica debe estar completada antes de confirmar la cotización.",
		};
	}

	const { error: quotationStatusError, count: quotationStatusCount } =
		await supabase
			.from("quotations")
			.update({ status: "accepted" }, { count: "exact" })
			.eq("id", quotationId)
			.eq("trabajo_id", trabajoId);

	if (quotationStatusError || quotationStatusCount !== 1) {
		logQuotationDatabaseError(
			"confirmQuotationAction status",
			quotationStatusError,
		);
		if (!quotationStatusError && quotationStatusCount !== 1) {
			console.error("[confirmQuotationAction] Unexpected quotation count", {
				count: quotationStatusCount,
			});
		}
		return { error: "No se pudo confirmar la cotización." };
	}

	// Actualizar el trabajo para avanzar a la etapa de venta
	const { error: trabajoError, count: trabajoUpdateCount } = await supabase
		.from("trabajos")
		.update(
			{
				current_stage: "venta",
				cotizacion_completed_at: new Date().toISOString(),
			},
			{ count: "exact" },
		)
		.eq("id", trabajoId)
		.eq("current_stage", "cotizacion");

	if (trabajoError || trabajoUpdateCount !== 1) {
		logQuotationDatabaseError(
			"confirmQuotationAction trabajo update",
			trabajoError,
		);
		if (!trabajoError && trabajoUpdateCount !== 1) {
			console.error("[confirmQuotationAction] Unexpected trabajo count", {
				count: trabajoUpdateCount,
			});
		}
		await supabase
			.from("quotations")
			.update({ status: quotation.status }, { count: "exact" })
			.eq("id", quotationId);
		return { error: "No se pudo avanzar el trabajo a la etapa de venta." };
	}

	if (!returnToTrabajo) {
		// La confirmación desde el listado también crea la entrada de venta.
		// Desde la vista del trabajo solo se avanza a Venta para mostrar su formulario.
		const today = new Date().toISOString().split("T")[0];
		const { error: saleStageError } = await supabase
			.from("trabajo_sale_stage")
			.upsert(
				{
					trabajo_id: trabajoId,
					quotation_id: quotationId,
					confirmed_on: today,
					agreed_amount: total,
					notes: "Venta confirmada desde cotización",
				},
				{ onConflict: "trabajo_id" },
			);

		if (saleStageError) {
			logQuotationDatabaseError(
				"confirmQuotationAction sale stage",
				saleStageError,
			);
			await supabase
				.from("trabajos")
				.update({
					current_stage: trabajo.current_stage,
					cotizacion_completed_at: trabajo.cotizacion_completed_at,
				})
				.eq("id", trabajoId);
			await supabase
				.from("quotations")
				.update({ status: quotation.status })
				.eq("id", quotationId);
			return { error: "No se pudo crear la etapa de venta." };
		}
	}

	revalidatePath("/admin");
	revalidatePath("/admin/quotations");
	revalidatePath(`/admin/quotations/${quotationId}`);
	revalidatePath("/admin/sales");
	revalidatePath("/admin/trabajos");
	revalidatePath(`/admin/trabajos/${trabajoId}`);

	if (returnToTrabajo) {
		redirect(`/admin/trabajos/${trabajoId}`);
	}

	redirect("/admin/sales");
}

export async function createQuotationAction(
	_previousState: QuotationActionState,
	formData: FormData,
): Promise<QuotationActionState> {
	await requireRole(["admin", "administrative"]);
	const trabajoId = getString(formData, "trabajo_id");
	const supplierName = getString(formData, "supplier_name");
	const project = getString(formData, "project");
	const termsAndConditions = getString(formData, "terms_and_conditions");
	const orderDeadline = getString(formData, "order_deadline");
	const expectedDelivery = getString(formData, "expected_delivery");

	if (!supplierName) {
		return { error: "El proveedor es obligatorio." };
	}

	if (!project) {
		return { error: "El cliente es obligatorio." };
	}

	const itemsResult = parseQuotationItems(getString(formData, "items"));
	if (itemsResult.error) {
		return { error: itemsResult.error };
	}

	const items = itemsResult.items;
	const { subtotal, total } = calculateQuotationTotals(items);
	const supabase = await createSupabaseServerClient();

	if (trabajoId) {
		const { data: trabajo, error: trabajoError } = await supabase
			.from("trabajos")
			.select("id, current_stage, visita_completed_at")
			.eq("id", trabajoId)
			.maybeSingle();

		if (trabajoError || !trabajo) {
			logQuotationDatabaseError("createQuotationAction trabajo", trabajoError);
			return { error: "No se encontró el trabajo vinculado." };
		}

		if (
			trabajo.current_stage !== "cotizacion" ||
			!trabajo.visita_completed_at
		) {
			return {
				error:
					"La visita técnica debe estar completada antes de crear una cotización vinculada.",
			};
		}

		const { data: existingQuotation, error: existingQuotationError } =
			await supabase
				.from("quotations")
				.select("id")
				.eq("trabajo_id", trabajoId)
				.maybeSingle();

		if (existingQuotationError) {
			logQuotationDatabaseError(
				"createQuotationAction existing quotation",
				existingQuotationError,
			);
			return { error: "No se pudo validar la cotización existente." };
		}

		if (existingQuotation) {
			return {
				error: "Este trabajo ya tiene una cotización vinculada.",
			};
		}
	}

	const quotationNumber = await generateQuotationNumber();

	const { data: quotation, error: quotationError } = await supabase
		.from("quotations")
		.insert({
			quotation_number: quotationNumber,
			trabajo_id: trabajoId || null,
			supplier_name: supplierName,
			project: project || null,
			terms_and_conditions: termsAndConditions || null,
			order_deadline: orderDeadline || null,
			expected_delivery: expectedDelivery || null,
			subtotal,
			total,
			status: "draft",
		})
		.select("id")
		.single();

	if (quotationError || !quotation) {
		logQuotationDatabaseError(
			"createQuotationAction quotation",
			quotationError,
		);
		return {
			error:
				trabajoId && isUniqueViolation(quotationError)
					? "Este trabajo ya tiene una cotización vinculada."
					: "No se pudo crear la cotización.",
		};
	}

	if (items.length > 0) {
		const itemsWithQuotationId = toQuotationItemRows(quotation.id, items);

		const { error: itemsError } = await supabase
			.from("quotation_items")
			.insert(itemsWithQuotationId);

		if (itemsError) {
			logQuotationDatabaseError("createQuotationAction items", itemsError);
			await supabase
				.from("quotation_items")
				.delete()
				.eq("quotation_id", quotation.id);
			await supabase.from("quotations").delete().eq("id", quotation.id);
			return { error: "No se pudieron guardar los productos." };
		}
	}

	try {
		console.log(
			"[Actions] Iniciando generación de PDF para cotización:",
			quotation.id,
		);
		await generateAndSavePDF(quotation.id);
		console.log("[Actions] PDF generado y guardado exitosamente");
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Error desconocido";
		const errorStack =
			error instanceof Error ? error.stack : "No stack available";
		console.error("[Actions] Error generando PDF:", errorMessage);
		console.error("[Actions] Stack trace:", errorStack);
		console.error("[Actions] Tipo de error:", error);
	}

	revalidatePath("/admin");
	revalidatePath("/admin/quotations");
	if (trabajoId) {
		revalidatePath(`/agenda/${trabajoId}`);
		revalidatePath(`/admin/visits/${trabajoId}`);
		revalidatePath(`/admin/trabajos/${trabajoId}`);
	}

	return { error: null, success: true, quotationId: quotation.id };
}

export async function updateQuotationAction(
	_previousState: QuotationActionState,
	formData: FormData,
): Promise<QuotationActionState> {
	await requireRole(["admin", "administrative"]);
	const quotationId = getString(formData, "quotation_id");
	const trabajoId = getString(formData, "trabajo_id");
	const supplierName = getString(formData, "supplier_name");
	const project = getString(formData, "project");
	const status = getString(formData, "status");
	const termsAndConditions = getString(formData, "terms_and_conditions");
	const orderDeadline = getString(formData, "order_deadline");
	const expectedDelivery = getString(formData, "expected_delivery");

	if (!supplierName) {
		return { error: "El proveedor es obligatorio." };
	}

	if (!project) {
		return { error: "El cliente es obligatorio." };
	}

	if (!quotationId) {
		return { error: "No se encontró la cotización que se quiere actualizar." };
	}

	const itemsResult = parseQuotationItems(getString(formData, "items"));
	if (itemsResult.error) {
		return { error: itemsResult.error };
	}

	const items = itemsResult.items;
	const { subtotal, total } = calculateQuotationTotals(items);

	const supabase = await createSupabaseServerClient();

	const { error: quotationError, count } = await supabase
		.from("quotations")
		.update(
			{
				trabajo_id: trabajoId || null,
				supplier_name: supplierName,
				project: project || null,
				status: status || null,
				terms_and_conditions: termsAndConditions || null,
				order_deadline: orderDeadline || null,
				expected_delivery: expectedDelivery || null,
				subtotal,
				total,
			},
			{ count: "exact" },
		)
		.eq("id", quotationId);

	if (quotationError || count !== 1) {
		if (quotationError) {
			logQuotationDatabaseError(
				"updateQuotationAction quotation",
				quotationError,
			);
		} else {
			console.error(
				"[updateQuotationAction] No se actualizó exactamente una cotización.",
				{ quotationId, count },
			);
		}
		return {
			error: isUniqueViolation(quotationError)
				? "Este trabajo ya tiene otra cotización vinculada."
				: "No se pudo actualizar la cotización.",
		};
	}

	// Eliminar items existentes
	const { error: deleteError } = await supabase
		.from("quotation_items")
		.delete()
		.eq("quotation_id", quotationId);

	if (deleteError) {
		return { error: "No se pudieron actualizar los productos." };
	}

	// Insertar nuevos items
	if (items.length > 0) {
		const itemsWithQuotationId = toQuotationItemRows(quotationId, items);

		const { error: itemsError } = await supabase
			.from("quotation_items")
			.insert(itemsWithQuotationId);

		if (itemsError) {
			logQuotationDatabaseError("updateQuotationAction items", itemsError);
			return { error: "No se pudieron actualizar los productos." };
		}
	}

	try {
		console.log(
			"[Actions] Iniciando generación de PDF para cotización:",
			quotationId,
		);
		await generateAndSavePDF(quotationId);
		console.log("[Actions] PDF generado y guardado exitosamente");
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Error desconocido";
		const errorStack =
			error instanceof Error ? error.stack : "No stack available";
		console.error("[Actions] Error generando PDF:", errorMessage);
		console.error("[Actions] Stack trace:", errorStack);
		console.error("[Actions] Tipo de error:", error);
	}

	revalidatePath("/admin/quotations");
	revalidatePath("/admin/sales");
	revalidatePath("/admin/trabajos");
	if (trabajoId) {
		revalidatePath(`/agenda/${trabajoId}`);
		revalidatePath(`/admin/visits/${trabajoId}`);
		revalidatePath(`/admin/trabajos/${trabajoId}`);
	}

	return { error: null, success: true, quotationId };
}

export async function saveDraftAction(data: {
	quotationId?: string;
	trabajoId?: string;
	supplierName?: string;
	project?: string;
	status?: string;
	termsAndConditions?: string;
	orderDeadline?: string;
	expectedDelivery?: string;
	items?: QuotationItem[];
}): Promise<DraftSaveState> {
	await requireRole(["admin", "administrative"]);

	if (!data.supplierName?.trim() || !data.project?.trim()) {
		return {
			success: false,
			error: "Completa proveedor y cliente antes de guardar el borrador.",
		};
	}

	const supabase = await createSupabaseServerClient();

	const itemsResult = normalizeQuotationItems(data.items ?? []);
	if (itemsResult.error) {
		return { success: false, error: itemsResult.error };
	}

	const items = itemsResult.items;

	let quotationNumber: string | null = null;
	if (!data.quotationId) {
		if (data.trabajoId) {
			const { data: existingQuotation, error: existingQuotationError } =
				await supabase
					.from("quotations")
					.select("id")
					.eq("trabajo_id", data.trabajoId)
					.maybeSingle();

			if (existingQuotationError) {
				logQuotationDatabaseError(
					"saveDraftAction existing quotation",
					existingQuotationError,
				);
				return {
					success: false,
					error: "No se pudo validar la cotización existente.",
				};
			}

			if (existingQuotation) {
				return {
					success: false,
					error: "Este trabajo ya tiene una cotización vinculada.",
				};
			}
		}

		quotationNumber = await generateQuotationNumber();
	}

	const { data: savedQuotationId, error: draftError } = await supabase.rpc(
		"save_quotation_draft",
		{
			p_quotation_id: data.quotationId ?? null,
			p_trabajo_id: data.trabajoId || null,
			p_quotation_number: quotationNumber,
			p_supplier_name: data.supplierName.trim(),
			p_project: data.project.trim(),
			p_status: data.quotationId ? data.status || "draft" : "draft",
			p_terms_and_conditions: data.termsAndConditions || null,
			p_order_deadline: data.orderDeadline || null,
			p_expected_delivery: data.expectedDelivery || null,
			p_items: items,
		},
	);

	if (draftError || !savedQuotationId) {
		logQuotationDatabaseError("saveDraftAction atomic draft", draftError);
		return {
			success: false,
			error:
				data.trabajoId && isUniqueViolation(draftError)
					? "Este trabajo ya tiene una cotización vinculada."
					: "No se pudo guardar el borrador.",
		};
	}

	return { success: true, quotationId: savedQuotationId };
}
