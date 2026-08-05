/**
 * Generación dinámica de términos y condiciones basado en el servicio
 */

type VisitaData = {
	interest_package: string;
	quotation_type: string;
	contact_name: string;
	confirmed_address: string;
	notes: string;
	house_attributes: Record<string, unknown>;
	electrical_attributes: Record<string, unknown>;
	roof_attributes: Record<string, unknown>;
	minisplit_attributes: Record<string, unknown>;
};

/**
 * Genera términos y condiciones dinámicos según el tipo de servicio
 */
export function generateDynamicTerms(visita: VisitaData): string {
	const pkg = visita.interest_package.toLowerCase();
	const sections: string[] = [];

	// Encabezado
	sections.push("TÉRMINOS Y CONDICIONES");
	sections.push("");

	// Información del proyecto
	sections.push("1. INFORMACIÓN DEL PROYECTO");
	sections.push(`   Cliente: ${visita.contact_name || "No especificado"}`);
	sections.push(
		`   Ubicación: ${visita.confirmed_address || "No especificada"}`,
	);
	sections.push(`   Tipo de servicio: ${visita.interest_package}`);
	sections.push("");

	// Condiciones específicas por tipo de servicio
	if (pkg.includes("panel") || pkg.includes("solar")) {
		sections.push(...getSolarTerms());
	} else if (pkg.includes("minisplit")) {
		sections.push(...getMinisplitTerms());
	} else if (pkg.includes("bomba") || pkg.includes("bombeo")) {
		sections.push(...getPumpTerms());
	} else if (pkg.includes("220") || pkg.includes("cambio")) {
		sections.push(...getCambio220Terms());
	}

	// Condiciones generales
	sections.push(...getGeneralTerms());

	// Notas de la visita
	if (visita.notes) {
		sections.push("");
		sections.push("NOTAS ADICIONALES DE LA VISITA:");
		sections.push(visita.notes);
	}

	// Vigencia
	sections.push("");
	sections.push("VIGENCIA:");
	sections.push(
		"Esta cotización tiene una vigencia de 15 días a partir de su emisión.",
	);
	sections.push("Los precios pueden variar después de este período.");

	return sections.join("\n");
}

function getSolarTerms(): string[] {
	return [
		"",
		"2. CONDICIONES ESPECÍFICAS - SISTEMA SOLAR",
		"   - Garantía de paneles: 25 años de potencia lineal",
		"   - Garantía de inversor: 5 años",
		"   - Garantía de instalación: 2 años",
		"   - Incluye: paneles, inversor, estructura, cableado e instalación",
		"   - No incluye: permisos CFE (si aplica)",
		"   - Tiempo estimado de instalación: 2-3 días hábiles",
		"   - Se requiere acceso al techo para instalación",
		"   - El sistema será dimensionado según consumo histórico",
	];
}

function getMinisplitTerms(): string[] {
	return [
		"",
		"2. CONDICIONES ESPECÍFICAS - MINISPLIT",
		"   - Garantía del equipo: 1 año (compresor: 5 años)",
		"   - Garantía de instalación: 6 meses",
		"   - Incluye: equipo, instalación estándar, base",
		"   - No incluye: adecuaciones eléctricas especiales",
		"   - No incluye: obra civil (perforaciones adicionales)",
		"   - Tiempo estimado de instalación: 4-6 horas",
		"   - Se requiere toma eléctrica cercana (220v)",
		"   - Incluye 3 metros de línea frigorífica",
		"   - Metros adicionales se cobran por separado",
	];
}

function getPumpTerms(): string[] {
	return [
		"",
		"2. CONDICIONES ESPECÍFICAS - BOMBEO SOLAR",
		"   - Garantía de bomba: 2 años",
		"   - Garantía de paneles: 25 años",
		"   - Garantía de instalación: 1 año",
		"   - Incluye: bomba, paneles, estructura, cableado",
		"   - No incluye: tubería de succión ni de descarga",
		"   - No incluye: tanque de almacenamiento",
		"   - Tiempo estimado de instalación: 1-2 días",
		"   - Se requiere pozo o fuente de agua",
		"   - El dimensionamiento se basa en profundidad y caudal requerido",
	];
}

function getCambio220Terms(): string[] {
	return [
		"",
		"2. CONDICIONES ESPECÍFICAS - CAMBIO A 220V",
		"   - Garantía de instalación: 1 año",
		"   - Incluye: acometida, centro de carga, cableado básico",
		"   - No incluye: trámite con CFE (si aplica)",
		"   - No incluye: cambio de medidor (lo realiza CFE)",
		"   - Tiempo estimado: 4-6 horas",
		"   - Se requiere acceso al medidor",
		"   - Incluye pruebas de funcionamiento",
	];
}

function getGeneralTerms(): string[] {
	return [
		"",
		"3. CONDICIONES GENERALES",
		"   - Forma de pago: 50% anticipo, 50% contra entrega",
		"   - Método de pago: transferencia, efectivo o tarjeta",
		"   - Los precios pueden cambiar sin previo aviso después de la vigencia",
		"   - El cliente debe proporcionar acceso al lugar de instalación",
		"   - El cliente debe proporcionar punto de agua y luz para la instalación",
		"   - No nos hacemos responsables por daños preexistentes",
		"   - Cualquier trabajo adicional no contemplado se cotiza por separado",
		"   - La cancelación después de iniciar el trabajo genera cargos proporcionales",
	];
}

/**
 * Genera un resumen ejecutivo para la cotización
 */
export function generateExecutiveSummary(
	visita: VisitaData,
	totalAmount: number,
): string {
	const pkg = visita.interest_package;
	const clientName = visita.contact_name || "Cliente";

	return `Cotización para ${clientName} - ${pkg}\nTotal: $${totalAmount.toFixed(2)} MXN`;
}
