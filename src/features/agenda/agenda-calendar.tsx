import type { AgendaItem } from "@/types/agenda";

import { buildMonthGrid, groupAgendaItemsByDate, type CalendarDay } from "./calendar-utils";
import { AgendaItemCard } from "./agenda-item-card";

const weekdayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MAX_VISIBLE_ITEMS_PER_DAY = 3;

type AgendaCalendarProps = {
	year: number;
	month: number;
	items: AgendaItem[];
};

type AgendaCalendarDayCardProps = {
	day: CalendarDay;
	items: AgendaItem[];
	variant: "mobile" | "desktop";
};

function getDayContainerClass(day: CalendarDay, variant: AgendaCalendarDayCardProps["variant"]) {
	const baseSurface = day.inCurrentMonth
		? "border-[var(--border-soft)] bg-[rgba(255,255,255,0.92)]"
		: "border-[rgba(13,79,46,0.06)] bg-[rgba(247,249,246,0.7)]";
	const sizeClass =
		variant === "mobile"
			? "min-h-[72px] rounded-[16px] px-1.5 py-2"
			: "min-h-[132px] rounded-[22px] p-3 md:min-h-[160px] lg:min-h-[180px] xl:min-h-[210px]";

	return `border ${baseSurface} ${sizeClass}`;
}

function getDayNumberClass(day: CalendarDay, variant: AgendaCalendarDayCardProps["variant"]) {
	const sizeClass = variant === "mobile" ? "h-7 w-7 text-xs" : "h-8 w-8 text-sm";
	const toneClass = day.isToday
		? "bg-[var(--brand-deep)] text-white"
		: day.inCurrentMonth
			? "text-[var(--brand-deep)]"
			: "text-[var(--muted)]";

	return `inline-flex items-center justify-center rounded-full font-semibold ${sizeClass} ${toneClass}`;
}

function AgendaCalendarDayCard({ day, items, variant }: AgendaCalendarDayCardProps) {
	if (variant === "mobile") {
		return (
			<div key={day.isoDate} className={getDayContainerClass(day, variant)}>
				<div className="flex items-center justify-center">
					<span className={getDayNumberClass(day, variant)}>{day.date.getUTCDate()}</span>
				</div>

				{items.length > 0 ? (
					<div className="mt-2 flex justify-center">
						<span className="inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[var(--brand-strong)]/12 px-1.5 text-[10px] font-semibold text-[var(--brand-deep)]">
							{items.length}
						</span>
					</div>
				) : null}
			</div>
		);
	}

	return (
		<div key={day.isoDate} className={getDayContainerClass(day, variant)}>
			<div className="flex items-center justify-between gap-2">
				<span className={getDayNumberClass(day, variant)}>{day.date.getUTCDate()}</span>
				{items.length > 0 ? (
					<span className="text-[11px] font-medium text-[var(--muted)]">
						{items.length} item{items.length > 1 ? "s" : ""}
					</span>
				) : null}
			</div>

			<div className="mt-3 space-y-2.5">
				{items.slice(0, MAX_VISIBLE_ITEMS_PER_DAY).map((item) => (
					<AgendaItemCard key={item.id} item={item} compact href={`/agenda/${item.id}`} />
				))}
				{items.length > MAX_VISIBLE_ITEMS_PER_DAY ? (
					<p className="text-xs text-[var(--muted)]">
						+{items.length - MAX_VISIBLE_ITEMS_PER_DAY} más
					</p>
				) : null}
			</div>
		</div>
	);
}

export function AgendaCalendar({ year, month, items }: AgendaCalendarProps) {
	const days = buildMonthGrid(year, month);
	const itemsByDate = groupAgendaItemsByDate(items);

	return (
		<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-4 shadow-sm sm:p-6 xl:p-7">
			<div className="grid grid-cols-7 gap-1.5 border-b border-[var(--border-soft)] pb-3 md:hidden">
				{weekdayLabels.map((label) => (
					<p
						key={label}
						className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]"
					>
						{label}
					</p>
				))}
			</div>

			<div className="mt-3 grid grid-cols-7 gap-1.5 md:hidden">
				{days.map((day) => (
					<AgendaCalendarDayCard
						key={day.isoDate}
						day={day}
						items={itemsByDate[day.isoDate] ?? []}
						variant="mobile"
					/>
				))}
			</div>

			<div className="hidden overflow-x-auto pb-2 md:block">
				<div className="min-w-[720px]">
					<div className="grid grid-cols-7 gap-2 border-b border-[var(--border-soft)] pb-4">
						{weekdayLabels.map((label) => (
							<p
								key={label}
								className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]"
							>
								{label}
							</p>
						))}
					</div>

					<div className="mt-4 grid grid-cols-7 gap-3">
						{days.map((day) => (
							<AgendaCalendarDayCard
								key={day.isoDate}
								day={day}
								items={itemsByDate[day.isoDate] ?? []}
								variant="desktop"
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
