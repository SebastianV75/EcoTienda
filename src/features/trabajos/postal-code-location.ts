export type PostalCodeLocation = {
	municipality: string;
	state: string;
};

// Catálogo local confirmado. Los códigos no incluidos requieren captura manual
// para no asignar un municipio incorrecto en un documento oficial.
const postalCodeLocations: Record<string, PostalCodeLocation> = {
	"31100": { municipality: "Chihuahua", state: "Chihuahua" },
};

export function getPostalCodeLocation(
	postalCode: string,
): PostalCodeLocation | null {
	return postalCodeLocations[postalCode] ?? null;
}
