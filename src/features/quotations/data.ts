import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculateQuotationTotals } from "./quotation-items";
import type { Supplier } from "@/types/quotation";

export type QuotationListItem = {
	id: string;
	quotation_number: string | null;
	trabajo_id: string | null;
	supplier_name: string;
	project: string | null;
	subtotal: number;
	total: number;
	status: string;
	current_stage: string | null;
	created_at: string;
	pdf_url: string | null;
};

export type QuotationItem = {
	id: string;
	quotation_id: string;
	type: "product" | "section" | "note";
	product_name: string;
	quantity: number;
	unit: string;
	unit_price: number;
	amount: number;
	sort_order: number;
};

export type QuotationDetail = {
	id: string;
	quotation_number: string | null;
	trabajo_id: string | null;
	supplier_name: string;
	project: string | null;
	terms_and_conditions: string | null;
	order_deadline: string | null;
	expected_delivery: string | null;
	subtotal: number;
	total: number;
	status: string;
	created_at: string;
	pdf_url: string | null;
	items: QuotationItem[];
};

export const getSuppliers = cache(async (query?: string) => {
	const supabase = await createSupabaseServerClient();
	let request = supabase
		.from("suppliers")
		.select("id, name, nif, email, phone, reference, created_at, updated_at")
		.order("name", { ascending: true });

	if (query) {
		const normalized = query.trim();
		if (normalized) {
			request = request.or(
				`name.ilike.%${normalized}%,nif.ilike.%${normalized}%,email.ilike.%${normalized}%,reference.ilike.%${normalized}%`,
			);
		}
	}

	const { data, error } = await request;

	if (error) {
		throw new Error("No se pudieron cargar los proveedores.");
	}

	return (data ?? []) as Supplier[];
});

export const getSupplierById = cache(async (id: string) => {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("suppliers")
		.select("id, name, nif, email, phone, reference, created_at, updated_at")
		.eq("id", id)
		.single();

	if (error) {
		throw new Error("No se pudo cargar el proveedor.");
	}

	return data as Supplier;
});

export const getQuotations = cache(async (query?: string) => {
	const supabase = await createSupabaseServerClient();

	// `quotations` es la fuente canónica. Incluimos tanto cotizaciones
	// vinculadas como independientes para no ocultar históricos aceptados.
	let request = supabase
		.from("quotations")
		.select(
			"id, quotation_number, trabajo_id, supplier_name, project, subtotal, total, status, created_at, pdf_url, trabajo:trabajos(current_stage)",
		)
		.order("created_at", { ascending: false });

	if (query) {
		const normalized = query.trim();
		if (normalized) {
			request = request.or(
				`quotation_number.ilike.%${normalized}%,supplier_name.ilike.%${normalized}%,project.ilike.%${normalized}%`,
			);
		}
	}

	const { data, error } = await request;

	if (error) {
		throw new Error("No se pudieron cargar las cotizaciones.");
	}

	const quotations = (data ?? []).map((quotation) => {
		const linkedTrabajo = Array.isArray(quotation.trabajo)
			? quotation.trabajo[0]
			: quotation.trabajo;

		return {
			...quotation,
			current_stage: linkedTrabajo?.current_stage ?? null,
		};
	}) as QuotationListItem[];
	if (quotations.length === 0) {
		return quotations;
	}

	const quotationIds = quotations.map((quotation) => quotation.id);
	const { data: itemRows, error: itemRowsError } = await supabase
		.from("quotation_items")
		.select("quotation_id, amount")
		.in("quotation_id", quotationIds);

	if (itemRowsError) {
		throw new Error("No se pudieron cargar los productos de las cotizaciones.");
	}

	const itemsByQuotation = new Map<string, Array<{ amount: number }>>();
	for (const item of itemRows ?? []) {
		const items = itemsByQuotation.get(item.quotation_id) ?? [];
		items.push({ amount: Number(item.amount) });
		itemsByQuotation.set(item.quotation_id, items);
	}

	return quotations.map((quotation) => ({
		...quotation,
		...calculateQuotationTotals(
			itemsByQuotation.get(quotation.id) ?? [],
			Number(quotation.subtotal),
		),
	}));
});

export const getQuotationById = cache(async (id: string) => {
	const supabase = await createSupabaseServerClient();

	const { data: quotation, error: quotationError } = await supabase
		.from("quotations")
		.select("*")
		.eq("id", id)
		.single();

	if (quotationError || !quotation) {
		throw new Error("No se pudo cargar la cotización.");
	}

	const { data: items, error: itemsError } = await supabase
		.from("quotation_items")
		.select("*")
		.eq("quotation_id", id)
		.order("sort_order", { ascending: true });

	if (itemsError) {
		throw new Error("No se pudieron cargar los productos.");
	}

	const quotationItems = (items ?? []) as QuotationItem[];
	return {
		...quotation,
		...calculateQuotationTotals(quotationItems, Number(quotation.subtotal)),
		items: quotationItems,
	} as QuotationDetail;
});

export const getQuotationByTrabajoId = cache(async (trabajoId: string) => {
	const supabase = await createSupabaseServerClient();

	const { data: quotation, error } = await supabase
		.from("quotations")
		.select("id, quotation_number, status, subtotal, total, pdf_url")
		.eq("trabajo_id", trabajoId)
		.order("created_at", { ascending: false })
		.limit(1)
		.maybeSingle();

	if (error || !quotation) {
		return null;
	}

	const { data: items, error: itemsError } = await supabase
		.from("quotation_items")
		.select("amount")
		.eq("quotation_id", quotation.id);

	if (itemsError) {
		return quotation as {
			id: string;
			quotation_number: string | null;
			status: string;
			total: number;
			pdf_url: string | null;
		};
	}

	const { total } = calculateQuotationTotals(
		(items ?? []).map((item) => ({ amount: Number(item.amount) })),
		Number(quotation.subtotal),
	);

	return {
		...quotation,
		total,
	} as {
		id: string;
		quotation_number: string | null;
		status: string;
		total: number;
		pdf_url: string | null;
	};
});
