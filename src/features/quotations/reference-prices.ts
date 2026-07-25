/**
 * Precios de referencia para productos y servicios
 * Estos precios son sugeridos y pueden ser ajustados manualmente
 */

export const REFERENCE_PRICES = {
	// Minisplits
	MINISPLIT_1TON_CONVENCIONAL: 8500,
	MINISPLIT_1TON_INVERTER: 11500,
	MINISPLIT_1_5TON_CONVENCIONAL: 10500,
	MINISPLIT_1_5TON_INVERTER: 13500,
	MINISPLIT_2TON_CONVENCIONAL: 14500,
	MINISPLIT_2TON_INVERTER: 17500,
	MINISPLIT_3TON_CONVENCIONAL: 19500,
	MINISPLIT_3TON_INVERTER: 23500,

	// Instalación minisplit
	INSTALACION_MINISPLIT_1TON: 2500,
	INSTALACION_MINISPLIT_2TON: 3500,
	INSTALACION_MINISPLIT_3TON: 4500,

	// Paneles solares (por panel)
	PANEL_SOLAR_330W: 2800,
	PANEL_SOLAR_410W: 3200,
	PANEL_SOLAR_550W: 4200,

	// Inversores solares
	INVERSOR_1KW: 8500,
	INVERSOR_2KW: 12500,
	INVERSOR_3KW: 16500,
	INVERSOR_5KW: 22500,
	INVERSOR_6KW: 26500,
	INVERSOR_10KW: 38500,

	// Estructura para paneles
	ESTRUCTURA_1_NIVEL: 3500,
	ESTRUCTURA_2_NIVELES: 5500,

	// Bombas solares
	BOMBA_SUMERGIBLE_75W: 6500,
	BOMBA_SUMERGIBLE_180W: 9500,
	BOMBA_SUMERGIBLE_370W: 12500,
	MOTOBOMBA_CENTRIFUGA: 8500,
	MOTOBOMBA_ALBERCA: 7500,

	// Extras comunes
	ACOMETIDA_220V: 3500,
	CENTRO_CARGA: 1800,
	CABLEADO_EXTRA: 450,
	PERFORACION_EXTRA: 1200,
	BASE_MINISPLIT: 800,
	LINEA_REFRIGERANTE_EXTRA: 650,
	BOMBA_CONDENSADO: 1500,
	IMPERMEABILIZANTE_M2: 180,
	MANTENIMIENTO_MINISPLIT: 800,
	MANTENIMIENTO_PANELES_8: 1200,
	MANTENIMIENTO_PANELES_16: 1800,
} as const;

/**
 * Obtiene el precio de referencia para un producto
 */
export function getReferencePrice(productKey: keyof typeof REFERENCE_PRICES): number {
	return REFERENCE_PRICES[productKey];
}

/**
 * Busca el precio de referencia por nombre de producto (matching aproximado)
 */
export function findReferencePrice(productName: string): number | null {
	const normalizedName = productName.toLowerCase();

	// Mapeo de patrones a precios
	const priceMap: Array<{ pattern: RegExp; price: number }> = [
		{ pattern: /minisplit.*1\s*ton.*convencional/i, price: REFERENCE_PRICES.MINISPLIT_1TON_CONVENCIONAL },
		{ pattern: /minisplit.*1\s*ton.*inverter/i, price: REFERENCE_PRICES.MINISPLIT_1TON_INVERTER },
		{ pattern: /minisplit.*1\.5\s*ton.*convencional/i, price: REFERENCE_PRICES.MINISPLIT_1_5TON_CONVENCIONAL },
		{ pattern: /minisplit.*1\.5\s*ton.*inverter/i, price: REFERENCE_PRICES.MINISPLIT_1_5TON_INVERTER },
		{ pattern: /minisplit.*2\s*ton.*convencional/i, price: REFERENCE_PRICES.MINISPLIT_2TON_CONVENCIONAL },
		{ pattern: /minisplit.*2\s*ton.*inverter/i, price: REFERENCE_PRICES.MINISPLIT_2TON_INVERTER },
		{ pattern: /minisplit.*3\s*ton.*convencional/i, price: REFERENCE_PRICES.MINISPLIT_3TON_CONVENCIONAL },
		{ pattern: /minisplit.*3\s*ton.*inverter/i, price: REFERENCE_PRICES.MINISPLIT_3TON_INVERTER },
		{ pattern: /instalacion.*minisplit.*1\s*ton/i, price: REFERENCE_PRICES.INSTALACION_MINISPLIT_1TON },
		{ pattern: /instalacion.*minisplit.*2\s*ton/i, price: REFERENCE_PRICES.INSTALACION_MINISPLIT_2TON },
		{ pattern: /instalacion.*minisplit.*3\s*ton/i, price: REFERENCE_PRICES.INSTALACION_MINISPLIT_3TON },
		{ pattern: /panel.*330\s*w/i, price: REFERENCE_PRICES.PANEL_SOLAR_330W },
		{ pattern: /panel.*410\s*w/i, price: REFERENCE_PRICES.PANEL_SOLAR_410W },
		{ pattern: /panel.*550\s*w/i, price: REFERENCE_PRICES.PANEL_SOLAR_550W },
		{ pattern: /inversor.*1\s*kw/i, price: REFERENCE_PRICES.INVERSOR_1KW },
		{ pattern: /inversor.*2\s*kw/i, price: REFERENCE_PRICES.INVERSOR_2KW },
		{ pattern: /inversor.*3\s*kw/i, price: REFERENCE_PRICES.INVERSOR_3KW },
		{ pattern: /inversor.*5\s*kw/i, price: REFERENCE_PRICES.INVERSOR_5KW },
		{ pattern: /inversor.*6\s*kw/i, price: REFERENCE_PRICES.INVERSOR_6KW },
		{ pattern: /inversor.*10\s*kw/i, price: REFERENCE_PRICES.INVERSOR_10KW },
		{ pattern: /estructura.*2\s*nivel/i, price: REFERENCE_PRICES.ESTRUCTURA_2_NIVELES },
		{ pattern: /estructura/i, price: REFERENCE_PRICES.ESTRUCTURA_1_NIVEL },
		{ pattern: /acometida.*220/i, price: REFERENCE_PRICES.ACOMETIDA_220V },
		{ pattern: /centro.*carga/i, price: REFERENCE_PRICES.CENTRO_CARGA },
		{ pattern: /cableado.*extra/i, price: REFERENCE_PRICES.CABLEADO_EXTRA },
		{ pattern: /doble.*perforacion/i, price: REFERENCE_PRICES.PERFORACION_EXTRA },
		{ pattern: /base.*minisplit/i, price: REFERENCE_PRICES.BASE_MINISPLIT },
		{ pattern: /linea.*refrigerante/i, price: REFERENCE_PRICES.LINEA_REFRIGERANTE_EXTRA },
		{ pattern: /bomba.*condensado/i, price: REFERENCE_PRICES.BOMBA_CONDENSADO },
		{ pattern: /impermeabilizante/i, price: REFERENCE_PRICES.IMPERMEABILIZANTE_M2 },
		{ pattern: /mantenimiento.*minisplit/i, price: REFERENCE_PRICES.MANTENIMIENTO_MINISPLIT },
		{ pattern: /mantenimiento.*paneles.*8/i, price: REFERENCE_PRICES.MANTENIMIENTO_PANELES_8 },
		{ pattern: /mantenimiento.*paneles.*16/i, price: REFERENCE_PRICES.MANTENIMIENTO_PANELES_16 },
	];

	for (const { pattern, price } of priceMap) {
		if (pattern.test(normalizedName)) {
			return price;
		}
	}

	return null;
}
