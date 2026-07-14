import type { AgendaItem } from "@/types/agenda";

export type CalendarDay = {
	date: Date;
	isoDate: string;
	inCurrentMonth: boolean;
	isToday: boolean;
};

const CALENDAR_GRID_CELLS = 42;

function toUtcDate(year: number, monthIndex: number, day: number) {
	return new Date(Date.UTC(year, monthIndex, day));
}

export function getMonthRange(year: number, month: number) {
	const firstDay = toUtcDate(year, month - 1, 1);
	const lastDay = toUtcDate(year, month, 0);

	return {
		firstDay,
		lastDay,
		firstDayIso: toIsoDate(firstDay),
		lastDayIso: toIsoDate(lastDay),
	};
}

export function toIsoDate(date: Date) {
	return date.toISOString().slice(0, 10);
}

export function parseMonthParam(monthParam?: string | null) {
	if (!monthParam) {
		const today = new Date();
		return {
			year: today.getUTCFullYear(),
			month: today.getUTCMonth() + 1,
		};
	}

	const match = /^(\d{4})-(\d{2})$/.exec(monthParam.trim());
	if (!match) {
		throw new Error("El mes debe usar el formato YYYY-MM.");
	}

	const year = Number(match[1]);
	const month = Number(match[2]);

	if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
		throw new Error("El mes solicitado no es válido.");
	}

	return { year, month };
}

export function buildMonthGrid(year: number, month: number): CalendarDay[] {
	const firstDay = toUtcDate(year, month - 1, 1);
	const firstWeekday = firstDay.getUTCDay();
	const gridStart = toUtcDate(year, month - 1, 1 - firstWeekday);
	const todayIso = toIsoDate(new Date());

	return Array.from({ length: CALENDAR_GRID_CELLS }, (_, index) => {
		const date = toUtcDate(
			gridStart.getUTCFullYear(),
			gridStart.getUTCMonth(),
			gridStart.getUTCDate() + index,
		);
		const isoDate = toIsoDate(date);

		return {
			date,
			isoDate,
			inCurrentMonth: date.getUTCMonth() === month - 1,
			isToday: isoDate === todayIso,
		};
	});
}

export function formatMonthParam(year: number, month: number) {
	return `${year}-${String(month).padStart(2, "0")}`;
}

export function shiftMonth(year: number, month: number, offset: number) {
	const date = toUtcDate(year, month - 1 + offset, 1);
	return {
		year: date.getUTCFullYear(),
		month: date.getUTCMonth() + 1,
	};
}

export function formatMonthHeading(year: number, month: number, locale = "es-MX") {
	return new Intl.DateTimeFormat(locale, {
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	}).format(toUtcDate(year, month - 1, 1));
}

export function groupAgendaItemsByDate(items: AgendaItem[]) {
	return items.reduce<Record<string, AgendaItem[]>>((acc, item) => {
		if (!acc[item.fecha]) {
			acc[item.fecha] = [];
		}
		acc[item.fecha].push(item);
		return acc;
	}, {});
}
