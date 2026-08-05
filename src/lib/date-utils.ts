const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseDisplayDate(value: string | null | undefined) {
	if (!value) return null;

	const date = DATE_ONLY_PATTERN.test(value)
		? new Date(`${value}T12:00:00`)
		: new Date(value);

	return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDisplayDate(
	value: string | null | undefined,
	options: Intl.DateTimeFormatOptions = {},
) {
	const date = parseDisplayDate(value);
	if (!date) return "—";

	return new Intl.DateTimeFormat("es-MX", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		...options,
	}).format(date);
}
