import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateQuotationNumber(): Promise<string> {
	const supabase = await createSupabaseServerClient();

	const { data, error } = await supabase
		.from("quotations")
		.select("quotation_number")
		.order("created_at", { ascending: false })
		.limit(1)
		.single();

	if (error || !data) {
		return "EcoCotizacion-001";
	}

	const lastNumber = data.quotation_number;
	if (!lastNumber) {
		return "EcoCotizacion-001";
	}

	const match = lastNumber.match(/EcoCotizacion-(\d+)/);
	if (!match) {
		return "EcoCotizacion-001";
	}

	const nextNumber = parseInt(match[1], 10) + 1;
	return `EcoCotizacion-${String(nextNumber).padStart(3, "0")}`;
}
