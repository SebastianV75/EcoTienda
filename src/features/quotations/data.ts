import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
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
	tax_rate: number;
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
	
	// Primero obtener los trabajos en etapa cotizacion
	const { data: trabajosData, error: trabajosError } = await supabase
		.from("trabajos")
		.select("id")
		.eq("current_stage", "cotizacion");

	if (trabajosError) {
		throw new Error("No se pudieron cargar los trabajos en etapa de cotización.");
	}

	const trabajoIds = (trabajosData ?? []).map((t) => t.id);

	let request = supabase
		.from("quotations")
		.select(
			"id, quotation_number, trabajo_id, supplier_name, project, subtotal, total, status, created_at, pdf_url",
		)
		.in("trabajo_id", trabajoIds.length > 0 ? trabajoIds : ["00000000-0000-0000-0000-000000000000"])
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

	return (data ?? []) as QuotationListItem[];
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

	return {
		...quotation,
		items: (items ?? []) as QuotationItem[],
	} as QuotationDetail;
});

export const getQuotationByTrabajoId = cache(async (trabajoId: string) => {
	const supabase = await createSupabaseServerClient();

	const { data: quotation, error } = await supabase
		.from("quotations")
		.select("id, quotation_number, status, total")
		.eq("trabajo_id", trabajoId)
		.order("created_at", { ascending: false })
		.limit(1)
		.maybeSingle();

	if (error || !quotation) {
		return null;
	}

	return quotation as { id: string; quotation_number: string | null; status: string; total: number };
});
