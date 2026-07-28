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

	// Obtener todos los trabajos en etapa venta con sus datos de venta (si existen)
	const { data: trabajosData, error: trabajosError } = await supabase
		.from("trabajos")
		.select(`
			id,
			intake_name,
			client_id,
			clients (
				full_name
			),
			trabajo_sale_stage (
				id,
				confirmed_on,
				agreed_amount,
				completed_at
			)
		`)
		.eq("current_stage", "venta")
		.order("created_at", { ascending: false });

	if (trabajosError) {
		console.error("Error fetching trabajos en etapa venta:", trabajosError);
		return [];
	}

	const sales: SaleListItem[] = (trabajosData || []).map((row: any) => {
		const client = row.clients?.[0];
		const saleStage = row.trabajo_sale_stage?.[0];
		
		return {
			id: saleStage?.id || row.id,
			trabajo_id: row.id,
			client_name: client?.full_name || row.intake_name || "Sin nombre",
			quotation_amount: saleStage?.agreed_amount || 0,
			confirmed_on: saleStage?.confirmed_on || null,
			completed: !!saleStage?.completed_at,
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
