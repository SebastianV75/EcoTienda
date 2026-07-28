import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SaleListItem = {
	id: string;
	trabajo_id: string;
	client_name: string | null;
	quotation_amount: number;
	confirmed_on: string | null;
	completed: boolean;
};

type SaleRow = {
	id: string;
	trabajo_id: string;
	confirmed_on: string | null;
	agreed_amount: number;
	completed_at: string | null;
	trabajos: Array<{
		intake_name: string | null;
		client_id: string | null;
		clients: Array<{
			full_name: string | null;
		}> | null;
	}> | null;
};

export const getSales = cache(async (query?: string): Promise<SaleListItem[]> => {
	const supabase = await createSupabaseServerClient();

	// Primero obtener los trabajos en etapa venta
	const { data: trabajosData, error: trabajosError } = await supabase
		.from("trabajos")
		.select("id")
		.eq("current_stage", "venta");

	if (trabajosError) {
		console.error("Error fetching trabajos en etapa venta:", trabajosError);
		return [];
	}

	const trabajoIds = (trabajosData ?? []).map((t) => t.id);

	if (trabajoIds.length === 0) {
		return [];
	}

	let saleQuery = supabase
		.from("trabajo_sale_stage")
		.select(`
			id,
			trabajo_id,
			confirmed_on,
			agreed_amount,
			completed_at,
			trabajos!inner (
				intake_name,
				client_id,
				clients (
					full_name
				)
			)
		`)
		.in("trabajo_id", trabajoIds)
		.order("created_at", { ascending: false });

	const { data, error } = await saleQuery;

	if (error) {
		console.error("Error fetching sales:", error);
		return [];
	}

	const sales: SaleListItem[] = (data || []).map((row: SaleRow) => {
		const trabajo = row.trabajos?.[0];
		const client = trabajo?.clients?.[0];
		return {
			id: row.id,
			trabajo_id: row.trabajo_id,
			client_name: client?.full_name || trabajo?.intake_name || "Sin nombre",
			quotation_amount: row.agreed_amount,
			confirmed_on: row.confirmed_on,
			completed: !!row.completed_at,
		};
	});

	if (query) {
		const normalized = query.toLowerCase().trim();
		return sales.filter(
			(sale) =>
				sale.client_name?.toLowerCase().includes(normalized) ||
				sale.trabajo_id.toLowerCase().includes(normalized)
		);
	}

	return sales;
});
