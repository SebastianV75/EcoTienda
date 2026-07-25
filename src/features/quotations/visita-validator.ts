/**
 * Validación de completitud de datos de visita técnica
 * Alerta si faltan datos críticos para generar una cotización precisa
 */

type VisitaData = {
	interest_package: string;
	quotation_type: string;
	contact_name: string;
	contact_phone: string;
	confirmed_address: string;
	notes: string;
	house_attributes: Record<string, unknown>;
	electrical_attributes: Record<string, unknown>;
	roof_attributes: Record<string, unknown>;
	minisplit_attributes: Record<string, unknown>;
};

export type ValidationWarning = {
	severity: "error" | "warning" | "info";
	field: string;
	message: string;
	suggestion: string;
};

/**
 * Valida la completitud de los datos de visita y retorna advertencias
 */
export function validateVisitaCompleteness(visita: VisitaData): ValidationWarning[] {
	const warnings: ValidationWarning[] = [];
	const pkg = visita.interest_package.toLowerCase();

	// Validaciones generales
	if (!visita.contact_name) {
		warnings.push({
			severity: "error",
			field: "contact_name",
			message: "Falta el nombre del cliente",
			suggestion: "El nombre del cliente es obligatorio para generar la cotización",
		});
	}

	if (!visita.confirmed_address) {
		warnings.push({
			severity: "warning",
			field: "confirmed_address",
			message: "Falta la dirección de instalación",
			suggestion: "La dirección es importante para calcular costos de traslado",
		});
	}

	// Validaciones específicas por tipo de servicio
	if (pkg.includes("panel") || pkg.includes("solar")) {
		warnings.push(...validateSolarVisita(visita));
	} else if (pkg.includes("minisplit")) {
		warnings.push(...validateMinisplitVisita(visita));
	} else if (pkg.includes("bomba") || pkg.includes("bombeo")) {
		warnings.push(...validatePumpVisita(visita));
	}

	return warnings;
}

function validateSolarVisita(visita: VisitaData): ValidationWarning[] {
	const warnings: ValidationWarning[] = [];

	// Verificar fotos del techo
	const roofImage = visita.roof_attributes.roof_image as string | undefined;
	if (!roofImage) {
		warnings.push({
			severity: "warning",
			field: "roof_attributes.roof_image",
			message: "Falta foto del techo",
			suggestion: "La foto del techo ayuda a determinar el tipo de estructura necesaria",
		});
	}

	// Verificar material del techo
	const roofMaterial = visita.roof_attributes.roof_material as string | undefined;
	if (!roofMaterial) {
		warnings.push({
			severity: "info",
			field: "roof_attributes.roof_material",
			message: "No se especificó el material del techo",
			suggestion: "El material del techo afecta el tipo de estructura a utilizar",
		});
	}

	// Verificar orientación
	const orientation = visita.house_attributes.orientation as string | undefined;
	if (!orientation) {
		warnings.push({
			severity: "info",
			field: "house_attributes.orientation",
			message: "No se especificó la orientación del techo",
			suggestion: "La orientación afecta el rendimiento del sistema solar",
		});
	}

	// Verificar sombreado
	const shading1 = visita.roof_attributes.shading_1 as string | undefined;
	const shading2 = visita.roof_attributes.shading_2 as string | undefined;
	if (!shading1 && !shading2) {
		warnings.push({
			severity: "info",
			field: "roof_attributes.shading",
			message: "No se registró información de sombreado",
			suggestion: "El sombreado afecta la producción de energía del sistema",
		});
	}

	// Verificar voltaje
	const voltage = visita.electrical_attributes.voltage as string | undefined;
	if (!voltage) {
		warnings.push({
			severity: "warning",
			field: "electrical_attributes.voltage",
			message: "No se especificó el voltaje actual",
			suggestion: "El voltaje es importante para determinar si se necesita acometida 220v",
		});
	}

	// Verificar recibo de luz
	const utilityBill = visita.house_attributes.utility_bill as string | undefined;
	if (!utilityBill) {
		warnings.push({
			severity: "info",
			field: "house_attributes.utility_bill",
			message: "Falta foto del recibo de luz",
			suggestion: "El recibo de luz ayuda a dimensionar el sistema según consumo",
		});
	}

	return warnings;
}

function validateMinisplitVisita(visita: VisitaData): ValidationWarning[] {
	const warnings: ValidationWarning[] = [];

	// Verificar fotos del lugar
	const evaporatorPhoto = visita.minisplit_attributes.evaporator_photo as string | undefined;
	if (!evaporatorPhoto) {
		warnings.push({
			severity: "warning",
			field: "minisplit_attributes.evaporator_photo",
			message: "Falta foto del lugar del evaporador",
			suggestion: "La foto ayuda a determinar la ubicación y materiales necesarios",
		});
	}

	const compressorPhoto = visita.minisplit_attributes.compressor_photo as string | undefined;
	if (!compressorPhoto) {
		warnings.push({
			severity: "warning",
			field: "minisplit_attributes.compressor_photo",
			message: "Falta foto del lugar del compresor",
			suggestion: "La foto ayuda a determinar la ubicación y distancia de línea",
		});
	}

	// Verificar voltaje
	const voltage = visita.electrical_attributes.voltage as string | undefined;
	if (!voltage) {
		warnings.push({
			severity: "warning",
			field: "electrical_attributes.voltage",
			message: "No se especificó el voltaje",
			suggestion: "Los minisplits requieren 220v. Si hay 110v se necesita acometida",
		});
	}

	// Verificar si tiene mufa
	const hasMufa = visita.electrical_attributes.has_mufa as string | undefined;
	if (!hasMufa) {
		warnings.push({
			severity: "info",
			field: "electrical_attributes.has_mufa",
			message: "No se especificó si hay mufa disponible",
			suggestion: "Si no hay mufa, se necesita instalar centro de carga",
		});
	}

	return warnings;
}

function validatePumpVisita(visita: VisitaData): ValidationWarning[] {
	const warnings: ValidationWarning[] = [];

	// Verificar profundidad del pozo
	const notes = visita.notes.toLowerCase();
	if (!notes.includes("profundidad") && !notes.includes("metro")) {
		warnings.push({
			severity: "warning",
			field: "notes",
			message: "No se especificó la profundidad del pozo",
			suggestion: "La profundidad es crítica para seleccionar la bomba adecuada",
		});
	}

	// Verificar caudal requerido
	if (!notes.includes("litro") && !notes.includes("caudal") && !notes.includes("gpm")) {
		warnings.push({
			severity: "info",
			field: "notes",
			message: "No se especificó el caudal requerido",
			suggestion: "El caudal ayuda a dimensionar correctamente la bomba",
		});
	}

	return warnings;
}

/**
 * Retorna un resumen de las advertencias para mostrar al usuario
 */
export function getValidationSummary(warnings: ValidationWarning[]): string {
	const errors = warnings.filter(w => w.severity === "error").length;
	const warns = warnings.filter(w => w.severity === "warning").length;
	const infos = warnings.filter(w => w.severity === "info").length;

	const parts: string[] = [];
	if (errors > 0) parts.push(`${errors} error${errors > 1 ? "es" : ""}`);
	if (warns > 0) parts.push(`${warns} advertencia${warns > 1 ? "s" : ""}`);
	if (infos > 0) parts.push(`${infos} sugerencia${infos > 1 ? "s" : ""}`);

	if (parts.length === 0) {
		return "✓ Datos completos";
	}

	return `⚠ ${parts.join(", ")}`;
}

/**
 * Determina si la validación permite continuar (no hay errores críticos)
 */
export function canProceedWithQuotation(warnings: ValidationWarning[]): boolean {
	const hasErrors = warnings.some(w => w.severity === "error");
	return !hasErrors;
}
