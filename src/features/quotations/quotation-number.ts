import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateQuotationNumber(): Promise<string> {
	const supabase = await createSupabaseServerClient();

	// Obtener todas las cotizaciones ordenadas por fecha de creación
	const { data: allQuotations, error } = await supabase
		.from("quotations")
		.select("quotation_number")
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error al obtener cotizaciones:", error);
		// Si hay error, generar un número basado en timestamp para evitar duplicados
		const timestamp = Date.now();
		return `EcoCotizacion-${timestamp}`;
	}

	if (!allQuotations || allQuotations.length === 0) {
		return "EcoCotizacion-001";
	}

	// Extraer todos los números existentes
	const existingNumbers = new Set<string>();
	for (const q of allQuotations) {
		if (q.quotation_number) {
			existingNumbers.add(q.quotation_number);
		}
	}

	// Encontrar el siguiente número disponible
	let nextNumber = 1;
	while (true) {
		const candidateNumber = `EcoCotizacion-${String(nextNumber).padStart(3, "0")}`;
		if (!existingNumbers.has(candidateNumber)) {
			return candidateNumber;
		}
		nextNumber++;
		
		// Safety check para evitar bucle infinito
		if (nextNumber > 9999) {
			const timestamp = Date.now();
			return `EcoCotizacion-${timestamp}`;
		}
	}
}
