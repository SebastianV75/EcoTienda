import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SaleListItem = {
	id: string;
	trabajo_id: string;
	client_name: string | null;
	intake_address_text: string | null;
	work_type: string | null;
	intake_phone: string | null;
	quotation_number: string | null;
	quotation_id: string | null;
	quotation_amount: number;
	confirmed_on: string | null;
	completed: boolean;
};

type SaleTrabajoRow = {
	id: string;
	intake_name: string | null;
	intake_address_text: string | null;
	work_type: string | null;
	intake_phone: string | null;
	quotations: Array<{
		id: string;
		quotation_number: string;
		total: number;
	}> | null;
	trabajo_sale_stage: Array<{
		id: string;
		confirmed_on: string | null;
		agreed_amount: number | null;
		completed_at: string | null;
		notes: string | null;
	}> | null;
};

export const getSales = cache(
	async (query?: string): Promise<SaleListItem[]> => {
		const supabase = await createSupabaseServerClient();

		const { data: trabajosData, error: trabajosError } = await supabase
			.from("trabajos")
			.select(`
			id,
			intake_name,
			intake_address_text,
			work_type,
			intake_phone,
			quotations (
				id,
				quotation_number,
				total
			),
			trabajo_sale_stage (
				id,
				confirmed_on,
				agreed_amount,
				completed_at,
				notes
			)
		`)
			.eq("current_stage", "venta")
			.order("created_at", { ascending: false });

		if (trabajosError) {
			console.error(
				"[getSales] Error al obtener trabajos en etapa venta:",
				trabajosError,
			);
			return [];
		}

		const sales: SaleListItem[] = (
			(trabajosData || []) as SaleTrabajoRow[]
		).map((row) => {
			const saleStage = row.trabajo_sale_stage?.[0];
			const quotation = row.quotations?.[0];

			return {
				id: saleStage?.id || row.id,
				trabajo_id: row.id,
				client_name: row.intake_name || "Sin nombre",
				intake_address_text: row.intake_address_text || null,
				work_type: row.work_type || null,
				intake_phone: row.intake_phone || null,
				quotation_number: quotation?.quotation_number || null,
				quotation_id: quotation?.id || null,
				quotation_amount: saleStage?.agreed_amount || quotation?.total || 0,
				confirmed_on: saleStage?.confirmed_on || null,
				completed: !!saleStage?.completed_at,
			};
		});

		if (query) {
			const normalized = query.toLowerCase().trim();
			return sales.filter(
				(sale) =>
					sale.client_name?.toLowerCase().includes(normalized) ||
					sale.trabajo_id.toLowerCase().includes(normalized),
			);
		}

		return sales;
	},
);
