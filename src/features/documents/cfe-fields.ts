export function getCfeApplicationDate(now = new Date()): string {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: "America/Chihuahua",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(now);
	const part = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find((value) => value.type === type)?.value;
	return `${part("year")}-${part("month")}-${part("day")}`;
}

export function isValidCfeDate(value: unknown): value is string {
	if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const date = new Date(`${value}T12:00:00Z`);
	return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export type CfeCoordinates = {
	latitude: number;
	longitude: number;
};

/** Latitud/longitud WGS84 en grados decimales, con los mismos rangos válidos que UTM. */
export function toCfeCoordinates(
	latitude: number | null,
	longitude: number | null,
): CfeCoordinates | null {
	if (latitude === null || longitude === null || !toUtmCoordinates(latitude, longitude)) return null;
	return { latitude, longitude };
}

export type UtmCoordinates = {
	easting: number;
	northing: number;
	zone: number;
	hemisphere: "N" | "S";
};

/** WGS84 Transverse Mercator (Snyder series), metres, UTM false origins. */
export function toUtmCoordinates(
	latitude: number | null,
	longitude: number | null,
): UtmCoordinates | null {
	if (latitude === null || longitude === null ||
		!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
		latitude < -80 || latitude > 84 || longitude < -180 || longitude > 180 ||
		(latitude === 0 && longitude === 0)) return null;

	let zone = Math.min(60, Math.floor((longitude + 180) / 6) + 1);
	// UTM exceptions in Norway and Svalbard.
	if (latitude >= 56 && latitude < 64 && longitude >= 3 && longitude < 12) zone = 32;
	if (latitude >= 72 && latitude < 84 && longitude >= 0 && longitude < 42) {
		zone = longitude < 9 ? 31 : longitude < 21 ? 33 : longitude < 33 ? 35 : 37;
	}
	const radians = Math.PI / 180;
	const phi = latitude * radians;
	const lambda = longitude * radians;
	const central = ((zone - 1) * 6 - 177) * radians;
	const a = 6378137;
	const eccentricity = 0.0066943799901413165;
	const secondEccentricity = eccentricity / (1 - eccentricity);
	const k = 0.9996;
	const sin = Math.sin(phi);
	const cos = Math.cos(phi);
	const tan = Math.tan(phi);
	const n = a / Math.sqrt(1 - eccentricity * sin * sin);
	const t = tan * tan;
	const c = secondEccentricity * cos * cos;
	const angle = cos * (lambda - central);
	const e2 = eccentricity ** 2;
	const e3 = eccentricity ** 3;
	const m = a * (
		(1 - eccentricity / 4 - 3 * e2 / 64 - 5 * e3 / 256) * phi -
		(3 * eccentricity / 8 + 3 * e2 / 32 + 45 * e3 / 1024) * Math.sin(2 * phi) +
		(15 * e2 / 256 + 45 * e3 / 1024) * Math.sin(4 * phi) -
		(35 * e3 / 3072) * Math.sin(6 * phi)
	);
	const easting = 500000 + k * n * (
		angle + (1 - t + c) * angle ** 3 / 6 +
		(5 - 18 * t + t * t + 72 * c - 58 * secondEccentricity) * angle ** 5 / 120
	);
	const northing = k * (m + n * tan * (
		angle ** 2 / 2 + (5 - t + 9 * c + 4 * c * c) * angle ** 4 / 24 +
		(61 - 58 * t + t * t + 600 * c - 330 * secondEccentricity) * angle ** 6 / 720
	)) + (latitude < 0 ? 10000000 : 0);
	return { easting, northing, zone, hemisphere: latitude < 0 ? "S" : "N" };
}
