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
};

type SaleStageRow = {
	id: string;
	trabajo_id: string;
	confirmed_on: string | null;
	agreed_amount: number | null;
	completed_at: string | null;
	notes: string | null;
};

export const getSales = cache(
	async (query?: string): Promise<SaleListItem[]> => {
		const supabase = await createSupabaseServerClient();

		const { data: trabajosData } = await supabase
			.from("trabajos")
			.select(`
			id,
			intake_name,
			intake_address_text,
			work_type,
			intake_phone
		`)
			.eq("current_stage", "venta")
			.neq("status", "archived")
			.order("created_at", { ascending: false });

		const trabajos = (trabajosData || []) as SaleTrabajoRow[];
		const trabajoIds = trabajos.map((trabajo) => trabajo.id);
		const saleStageByTrabajoId = new Map<string, SaleStageRow>();
		const quotationByTrabajoId = new Map<
			string,
			{ id: string; quotation_number: string; total: number }
		>();

		if (trabajoIds.length > 0) {
			const { data: saleStagesData } = await supabase
				.from("trabajo_sale_stage")
				.select(
					"id, trabajo_id, confirmed_on, agreed_amount, completed_at, notes",
				)
				.in("trabajo_id", trabajoIds);

			for (const saleStage of (saleStagesData ?? []) as SaleStageRow[]) {
				saleStageByTrabajoId.set(saleStage.trabajo_id, saleStage);
			}

			const { data: quotationsData } = await supabase
				.from("quotations")
				.select("id, trabajo_id, quotation_number, total")
				.in("trabajo_id", trabajoIds);

			for (const quotation of quotationsData ?? []) {
				if (quotation.trabajo_id) {
					quotationByTrabajoId.set(quotation.trabajo_id, quotation);
				}
			}
		}

		const sales: SaleListItem[] = trabajos.map((row) => {
			const saleStage = saleStageByTrabajoId.get(row.id);
			const quotation = quotationByTrabajoId.get(row.id);

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
				completed: Boolean(saleStage?.completed_at),
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
