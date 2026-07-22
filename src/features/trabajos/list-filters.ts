import type { TrabajoListFilters } from "./data";
import type { TrabajoStage, TrabajoStatus } from "@/types/trabajo";

const trabajoStages = [
	"agenda",
	"visita",
	"cotizacion",
	"venta",
	"descargables",
] as const satisfies readonly TrabajoStage[];

const trabajoStatuses = ["open", "won", "lost", "archived"] as const satisfies readonly TrabajoStatus[];

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function isValidISODate(value: string | undefined): value is string {
	if (!value) {
		return false;
	}

	if (!isoDatePattern.test(value)) {
		return false;
	}

	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(year, month - 1, day);

	return (
		!Number.isNaN(date.getTime()) &&
		date.getFullYear() === year &&
		date.getMonth() === month - 1 &&
		date.getDate() === day
	);
}

function toSearchParams(
	raw: URLSearchParams | Record<string, string | string[] | undefined>,
): URLSearchParams {
	if (raw instanceof URLSearchParams) {
		return raw;
	}

	const params = new URLSearchParams();

	for (const [key, value] of Object.entries(raw)) {
		if (value === undefined) {
			continue;
		}

		const normalized = Array.isArray(value) ? value[0] : value;
		if (normalized) {
			params.set(key, normalized);
		}
	}

	return params;
}

export function parseTrabajoListFilters(
	raw: URLSearchParams | Record<string, string | string[] | undefined>,
): TrabajoListFilters {
	const params = toSearchParams(raw);

	const rawStage = params.get("stage") ?? undefined;
	const rawStatus = params.get("status") ?? undefined;
	const rawFrom = params.get("from") ?? undefined;
	const rawTo = params.get("to") ?? undefined;
	const rawQuery = params.get("q")?.trim() ?? undefined;

	const stage = trabajoStages.includes(rawStage as TrabajoStage)
		? (rawStage as TrabajoStage)
		: undefined;
	const status = trabajoStatuses.includes(rawStatus as TrabajoStatus)
		? (rawStatus as TrabajoStatus)
		: undefined;

	return {
		stage,
		status,
		from: isValidISODate(rawFrom) ? rawFrom : undefined,
		to: isValidISODate(rawTo) ? rawTo : undefined,
		q: rawQuery || undefined,
	};
}
