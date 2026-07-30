import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DescargableItem = {
	id: string;
	client_name: string | null;
	completed_at: string | null;
	created_at: string;
};

type DescargableRow = {
	id: string;
	descargables_completed_at: string | null;
	created_at: string;
	intake_name: string | null;
};

export const getDescargables = cache(async (): Promise<DescargableItem[]> => {
	const supabase = await createSupabaseServerClient();

	const { data, error } = await supabase
		.from("trabajos")
		.select(`
			id,
			descargables_completed_at,
			created_at,
			intake_name
		`)
		.eq("current_stage", "descargables")
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching descargables:", error);
		return [];
	}

	return ((data || []) as DescargableRow[]).map((row) => ({
		id: row.id,
		client_name: row.intake_name || "Sin nombre",
		completed_at: row.descargables_completed_at,
		created_at: row.created_at,
	}));
});
