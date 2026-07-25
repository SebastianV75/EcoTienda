/**
 * Diccionario superset de etiquetas en español para los atributos JSONB de la
 * Visita Técnica. Cubre las claves usadas por las tres acciones de visita
 * (paneles, minisplit y ampliar) y debe extenderse cuando se agreguen nuevos
 * campos a los formularios.
 */

export type AttributeGroup = "house" | "electrical" | "roof" | "minisplit";

export const VISITA_ATTRIBUTE_GROUP_TITLES: Record<AttributeGroup, string> = {
	house: "Datos de casa",
	electrical: "Datos eléctricos",
	roof: "Datos de techo",
	minisplit: "Datos minisplit",
};

export const VISITA_MEDIA_KEY_SUFFIXES = ["_image", "_photo", "_video"] as const;

export const VISITA_BOOLEAN_KEYS = new Set([
	"has_minisplit",
	"has_mufa",
	"has_marine_ladder",
]);

/** Sufijos que identifican claves cuyo valor es una imagen o video. */
export function isVisitaMediaKey(key: string): boolean {
	return VISITA_MEDIA_KEY_SUFFIXES.some((suffix) => key.endsWith(suffix));
}

/** Convierte una clave snake_case a un título legible en Title Case. */
export function toTitleCase(key: string): string {
	return key
		.split("_")
		.map((word) => (word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ""))
		.join(" ");
}

/** Etiquetas curadas por grupo para los atributos de visita. */
export const visitaAttributeLabels: Record<AttributeGroup, Record<string, string>> = {
	house: {
		hojas_visita: "Hojas de visita",
		house_image: "Imagen de casa",
		house_photo: "Foto de casa",
		orientation: "Orientación",
		floors: "Pisos",
		email: "Correo electrónico",
		location: "Ubicación",
		inverter_capacity: "Capacidad del inversor",
		inverter_photo: "Foto del inversor",
		inverter_label: "Etiqueta del inversor",
		previous_panels: "Paneles previos",
		panels_photo: "Foto de paneles",
		panels_label: "Etiqueta de paneles",
		panels_condition: "Condición de paneles",
		panels_to_install: "Paneles a instalar",
	},
	electrical: {
		meter_far: "Imagen del medidor de lejos",
		meter_close: "Imagen del medidor de cerca",
		voltage: "Voltaje",
		meter_position: "Posición del medidor",
		has_mufa: "Tiene mufa",
		load_center: "Centro de carga",
		electrical_rise: "Subida eléctrica",
		meter_photo: "Foto del medidor",
		meter_video: "Video del medidor",
		terminal_photo: "Foto de terminales",
	},
	roof: {
		has_marine_ladder: "Tiene escalera marina",
		roof_image: "Imagen del techo",
		roof_material: "Material del techo",
		insulation_type: "Tipo de aislamiento",
		shading_1: "Sombra 1",
		shading_2: "Sombra 2",
		roof_measurements: "Medidas del techo",
		structure_type: "Tipo de estructura",
		area_photos: "Fotos del área",
		area_video: "Video del área",
		measurements: "Medidas",
	},
	minisplit: {
		has_minisplit: "Tiene minisplit",
		minisplit_specs: "Especificaciones del minisplit",
		minisplit_photo: "Foto del minisplit",
		evaporator_photo: "Foto del evaporador",
		compressor_photo: "Foto del compresor",
		extra: "Extra",
	},
};

/** Devuelve la etiqueta curada o un Title Case generado como fallback. */
export function getVisitaAttributeLabel(group: AttributeGroup, key: string): string {
	return visitaAttributeLabels[group][key] ?? toTitleCase(key);
}

export type VisitaAttributeValue =
	| { kind: "empty"; text: "—" }
	| { kind: "boolean"; text: "Sí" | "No" }
	| { kind: "media"; text: string }
	| { kind: "text"; text: string };

/**
 * Clasifica y normaliza un valor de atributo de visita según su tipo.
 * - null/undefined/"" → "—"
 * - boolean o "Si"/"No"/"true"/"false" → "Sí" / "No"
 * - claves de media con valor → preview de imagen
 * - resto → texto
 */
export function getVisitaAttributeValue(value: unknown, key: string): VisitaAttributeValue {
	if (value === null || value === undefined || value === "") {
		return { kind: "empty", text: "—" };
	}

	if (typeof value === "boolean") {
		return { kind: "boolean", text: value ? "Sí" : "No" };
	}

	if (typeof value === "string") {
		const normalized = value.trim();
		if (normalized === "") {
			return { kind: "empty", text: "—" };
		}

		const isBooleanLike =
			normalized === "Si" ||
			normalized === "Sí" ||
			normalized === "si" ||
			normalized === "sí" ||
			normalized === "No" ||
			normalized === "no" ||
			normalized === "true" ||
			normalized === "True" ||
			normalized === "false" ||
			normalized === "False";

		if (isBooleanLike) {
			const isAffirmative =
				normalized === "Si" ||
				normalized === "Sí" ||
				normalized === "si" ||
				normalized === "sí" ||
				normalized === "true" ||
				normalized === "True";
			return { kind: "boolean", text: isAffirmative ? "Sí" : "No" };
		}

		if (isVisitaMediaKey(key)) {
			return { kind: "media", text: normalized };
		}

		return { kind: "text", text: normalized };
	}

	if (typeof value === "number" || typeof value === "bigint") {
		return { kind: "text", text: String(value) };
	}

	return { kind: "text", text: String(value) };
}

/** Claves conocidas para un grupo en el orden curado del diccionario. */
export function getVisitaAttributeKeys(group: AttributeGroup): readonly string[] {
	return Object.keys(visitaAttributeLabels[group]);
}
