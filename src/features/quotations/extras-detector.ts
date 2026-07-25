/**
 * Detección automática de extras necesarios basado en datos de la visita
 */

import type { QuotationItem } from "@/types/quotation";
import { REFERENCE_PRICES } from "./reference-prices";

type VisitaData = {
	interest_package: string;
	quotation_type: string;
	house_attributes: Record<string, unknown>;
	electrical_attributes: Record<string, unknown>;
	roof_attributes: Record<string, unknown>;
	minisplit_attributes: Record<string, unknown>;
};

type ExtraSuggestion = {
	product_name: string;
	quantity: number;
	unit_price: number;
	reason: string;
};

/**
 * Detecta extras necesarios basado en los datos de la visita
 */
export function detectRequiredExtras(visita: VisitaData): ExtraSuggestion[] {
	const extras: ExtraSuggestion[] = [];
	const pkg = visita.interest_package.toLowerCase();

	// Detectar acometida 220v necesaria
	if (needsAcometida220(visita)) {
		extras.push({
			product_name: "Acometida 220 v",
			quantity: 1,
			unit_price: REFERENCE_PRICES.ACOMETIDA_220V,
			reason: "Voltaje actual insuficiente para el servicio solicitado",
		});
	}

	// Detectar centro de carga necesario
	if (needsCentroCarga(visita)) {
		extras.push({
			product_name: "Centro de carga de minisplit",
			quantity: 1,
			unit_price: REFERENCE_PRICES.CENTRO_CARGA,
			reason: "No se detectó mufa o centro de carga existente",
		});
	}

	// Detectar estructura de 2 niveles
	if (needsDoubleStructure(visita)) {
		extras.push({
			product_name: "Estructura de 2 niveles",
			quantity: 1,
			unit_price: REFERENCE_PRICES.ESTRUCTURA_2_NIVELES,
			reason: "Techo con múltiples niveles detectado",
		});
	}

	// Detectar doble perforación
	if (needsDoublePerforacion(visita)) {
		extras.push({
			product_name: "Doble perforacion",
			quantity: 1,
			unit_price: REFERENCE_PRICES.PERFORACION_EXTRA,
			reason: "Casa de 2 pisos requiere perforación adicional",
		});
	}

	// Detectar base para minisplit
	if (needsBaseMinisplit(visita, pkg)) {
		extras.push({
			product_name: "Base de minisplit",
			quantity: 1,
			unit_price: REFERENCE_PRICES.BASE_MINISPLIT,
			reason: "Instalación de minisplit requiere base",
		});
	}

	// Detectar línea de refrigerante extra
	if (needsExtraRefrigerant(visita)) {
		extras.push({
			product_name: "Aumento de linea refrigerante",
			quantity: 1,
			unit_price: REFERENCE_PRICES.LINEA_REFRIGERANTE_EXTRA,
			reason: "Distancia entre unidades requiere línea adicional",
		});
	}

	// Detectar bomba de condensado
	if (needsCondensatePump(visita)) {
		extras.push({
			product_name: "Bomba de condensado",
			quantity: 1,
			unit_price: REFERENCE_PRICES.BOMBA_CONDENSADO,
			reason: "Ubicación requiere bombeo de condensado",
		});
	}

	// Detectar cableado extra
	if (needsExtraWiring(visita)) {
		extras.push({
			product_name: "Aumento de cableado electrico minisplit",
			quantity: 1,
			unit_price: REFERENCE_PRICES.CABLEADO_EXTRA,
			reason: "Distancia al centro de carga requiere cableado adicional",
		});
	}

	// Detectar impermeabilizante
	if (needsWaterproofing(visita)) {
		extras.push({
			product_name: "Impermeabilizante m2",
			quantity: 1,
			unit_price: REFERENCE_PRICES.IMPERMEABILIZANTE_M2,
			reason: "Techo requiere impermeabilización",
		});
	}

	return extras;
}

/**
 * Convierte las sugerencias de extras en items de cotización
 */
export function extrasToQuotationItems(extras: ExtraSuggestion[], startOrder: number): QuotationItem[] {
	return extras.map((extra, index) => ({
		product_name: extra.product_name,
		quantity: extra.quantity,
		unit: "pz",
		unit_price: extra.unit_price,
		tax_rate: 16,
		amount: extra.unit_price * extra.quantity,
		sort_order: startOrder + index,
	}));
}

// === Funciones de detección ===

function needsAcometida220(visita: VisitaData): boolean {
	const voltage = visita.electrical_attributes.voltage as string | undefined;
	const pkg = visita.interest_package.toLowerCase();

	// Si el voltaje actual es 110v y se necesita 220v
	if (voltage === "110v" && (pkg.includes("minisplit") || pkg.includes("solar"))) {
		return true;
	}

	// Si es cambio a 220
	if (pkg.includes("220")) {
		return true;
	}

	return false;
}

function needsCentroCarga(visita: VisitaData): boolean {
	const hasMufa = visita.electrical_attributes.has_mufa as string | undefined;
	const pkg = visita.interest_package.toLowerCase();

	// Si no hay mufa y se instala minisplit
	if (hasMufa === "No" && pkg.includes("minisplit")) {
		return true;
	}

	return false;
}

function needsDoubleStructure(visita: VisitaData): boolean {
	const structureType = visita.roof_attributes.structure_type as string | undefined;
	const floors = visita.house_attributes.floors as string | undefined;

	// Si hay 2 niveles o estructura de 2 niveles
	if (structureType?.includes("2") || floors === "2") {
		return true;
	}

	return false;
}

function needsDoublePerforacion(visita: VisitaData): boolean {
	const floors = visita.house_attributes.floors as string | undefined;

	// Si hay 2 pisos
	if (floors === "2") {
		return true;
	}

	return false;
}

function needsBaseMinisplit(visita: VisitaData, pkg: string): boolean {
	// Si se instala minisplit y no hay base existente
	if (pkg.includes("minisplit")) {
		return true;
	}

	return false;
}

function needsExtraRefrigerant(visita: VisitaData): boolean {
	const location = visita.house_attributes.location as string | undefined;

	// Heurística: si la ubicación menciona distancias grandes
	if (location && (location.includes("lejos") || location.includes("distancia"))) {
		return true;
	}

	return false;
}

function needsCondensatePump(visita: VisitaData): boolean {
	const location = visita.minisplit_attributes.location as string | undefined;

	// Heurística: si la ubicación del minisplit requiere bombeo
	if (location && (location.includes("arriba") || location.includes("alto"))) {
		return true;
	}

	return false;
}

function needsExtraWiring(visita: VisitaData): boolean {
	const location = visita.house_attributes.location as string | undefined;

	// Heurística: si el centro de carga está lejos
	if (location && (location.includes("lejos") || location.includes("distancia"))) {
		return true;
	}

	return false;
}

function needsWaterproofing(visita: VisitaData): boolean {
	const roofMaterial = visita.roof_attributes.roof_material as string | undefined;

	// Si el techo es de lámina o madera, puede necesitar impermeabilizante
	if (roofMaterial === "Lámina" || roofMaterial === "Madera") {
		return true;
	}

	return false;
}
