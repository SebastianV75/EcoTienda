"use client";

import type { AgendaItem } from "@/types/agenda";

import {
	buildMonthGrid,
	groupAgendaItemsByDate,
	type CalendarDay,
} from "./calendar-utils";

const weekdayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MAX_VISIBLE_ITEMS_PER_DAY = 2;

type AgendaCalendarProps = {
	year: number;
	month: number;
	items: AgendaItem[];
	selectedItemId: string | null;
	selectedDate: string | null;
	onSelectItem: (item: AgendaItem) => void;
	onSelectDate: (isoDate: string) => void;
};

type AgendaCalendarDayCardProps = {
	day: CalendarDay;
	items: AgendaItem[];
	variant: "mobile" | "desktop";
	selectedItemId: string | null;
	selectedDate: string | null;
	onSelectItem: (item: AgendaItem) => void;
	onSelectDate: (isoDate: string) => void;
};

function getDayContainerClass(
	day: CalendarDay,
	variant: AgendaCalendarDayCardProps["variant"],
) {
	const baseSurface = day.inCurrentMonth
		? "border-[var(--border-soft)] bg-[rgba(255,255,255,0.92)]"
		: "border-[rgba(13,79,46,0.06)] bg-[rgba(247,249,246,0.7)]";
	const sizeClass =
		variant === "mobile"
			? "aspect-square min-h-0 min-w-0 overflow-hidden rounded-[14px] px-1 py-1.5"
			: "min-h-[108px] rounded-[18px] p-2.5 lg:min-h-[156px] xl:min-h-[172px]";

	return `border ${baseSurface} ${sizeClass}`;
}

function getDayNumberClass(
	day: CalendarDay,
	variant: AgendaCalendarDayCardProps["variant"],
) {
	const sizeClass =
		variant === "mobile" ? "h-6 w-6 text-[11px]" : "h-7 w-7 text-[11px]";
	const toneClass = day.isToday
		? "bg-[var(--brand-deep)] text-white"
		: day.inCurrentMonth
			? "text-[var(--brand-deep)]"
			: "text-[var(--muted)]";

	return `inline-flex items-center justify-center rounded-full font-semibold ${sizeClass} ${toneClass}`;
}

function formatAgendaTime(item: AgendaItem) {
	if (!item.appointment_at) {
		return "Sin hora";
	}

	return new Intl.DateTimeFormat("es-MX", {
		timeStyle: "short",
		timeZone: "UTC",
	}).format(new Date(item.appointment_at));
}

function AgendaCalendarDayCard({
	day,
	items,
	variant,
	selectedItemId,
	selectedDate,
	onSelectItem,
	onSelectDate,
}: AgendaCalendarDayCardProps) {
	if (variant === "mobile") {
		const isSelected = selectedDate === day.isoDate;
		const visibleDots = Math.min(items.length, 3);

		return (
			<button
				key={day.isoDate}
				type="button"
				onClick={() => {
					if (items.length > 0) {
						onSelectDate(day.isoDate);
					}
				}}
				disabled={items.length === 0}
				className={`${getDayContainerClass(day, variant)} text-left transition duration-200 ease-out ${items.length > 0 ? "cursor-pointer active:scale-[0.98]" : "cursor-default"} ${isSelected ? "border-[rgba(13,79,46,0.22)] bg-[rgba(243,247,243,0.96)] shadow-[0_0_0_1px_rgba(13,79,46,0.08)]" : ""}`}
				aria-pressed={items.length > 0 ? isSelected : undefined}
			>
				<div className="flex h-full flex-col">
					<div className="flex items-center justify-between gap-1">
						<span className={getDayNumberClass(day, variant)}>
							{day.date.getUTCDate()}
						</span>
					</div>
					<div className="mt-auto flex min-h-[18px] items-center justify-center gap-1 pb-1">
						{Array.from({ length: visibleDots }).map((_, index) => (
							<span
								key={`${day.isoDate}-dot-${index}`}
								className="h-1.5 w-1.5 rounded-full bg-emerald-500"
							/>
						))}
					</div>
				</div>
			</button>
		);
	}

	return (
		<div key={day.isoDate} className={getDayContainerClass(day, variant)}>
			<div className="flex items-center justify-start gap-2">
				<span className={getDayNumberClass(day, variant)}>
					{day.date.getUTCDate()}
				</span>
				{items.length > 0 ? (
					<span className="text-[11px] font-medium text-[var(--muted)]">
						{items.length} item{items.length > 1 ? "s" : ""}
					</span>
				) : null}
			</div>

			<div className="mt-2 space-y-1.5">
				{items.slice(0, MAX_VISIBLE_ITEMS_PER_DAY).map((item) => {
					const isSelected = selectedItemId === item.id;

					return (
						<button
							key={item.id}
							type="button"
							onClick={() => onSelectItem(item)}
							aria-pressed={isSelected}
							className={`block w-full rounded-[12px] border px-2.5 py-2 text-left transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(13,79,46,0.18)] hover:bg-[rgba(243,247,243,0.92)] active:translate-y-0 active:scale-[0.99] ${isSelected ? "border-[rgba(13,79,46,0.22)] bg-[rgba(243,247,243,0.96)] shadow-[0_0_0_1px_rgba(13,79,46,0.08)]" : "border-[var(--border-soft)] bg-white"}`}
						>
							<div className="flex items-start gap-2">
								<span
									className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.estado === "pendiente" ? "bg-amber-400" : item.estado === "en_proceso" ? "bg-sky-400" : "bg-emerald-400"}`}
								/>
								<div className="min-w-0 flex-1">
									<p className="truncate text-[12px] font-semibold leading-4 text-[var(--brand-deep)]">
										{item.titulo}
									</p>
									<p className="mt-1 truncate text-[11px] leading-4 text-[var(--muted)]">
										{formatAgendaTime(item)}
									</p>
								</div>
							</div>
						</button>
					);
				})}
				{items.length > MAX_VISIBLE_ITEMS_PER_DAY ? (
					<p className="px-1 text-xs font-medium text-[var(--muted)]">
						+{items.length - MAX_VISIBLE_ITEMS_PER_DAY} más
					</p>
				) : null}
			</div>
		</div>
	);
}

export function AgendaCalendar({
	year,
	month,
	items,
	selectedItemId,
	selectedDate,
	onSelectItem,
	onSelectDate,
}: AgendaCalendarProps) {
	const days = buildMonthGrid(year, month);
	const itemsByDate = groupAgendaItemsByDate(items);

	return (
		<div className="min-w-0">
			<div className="grid grid-cols-7 gap-1 border-b border-[var(--border-soft)] pb-2 lg:hidden">
				{weekdayLabels.map((label) => (
					<p
						key={label}
						className="min-w-0 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-strong)]"
					>
						{label}
					</p>
				))}
			</div>

			<div className="mt-3 grid max-h-[50vh] grid-cols-7 gap-1 overflow-hidden lg:hidden">
				{days.map((day) => (
					<AgendaCalendarDayCard
						key={day.isoDate}
						day={day}
						items={itemsByDate[day.isoDate] ?? []}
						variant="mobile"
						selectedItemId={selectedItemId}
						selectedDate={selectedDate}
						onSelectItem={onSelectItem}
						onSelectDate={onSelectDate}
					/>
				))}
			</div>

			<div className="hidden pb-2 lg:block">
				<div className="w-full">
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

					<div className="mt-4 grid grid-cols-7 gap-2">
						{days.map((day) => (
							<AgendaCalendarDayCard
								key={day.isoDate}
								day={day}
								items={itemsByDate[day.isoDate] ?? []}
								variant="desktop"
								selectedItemId={selectedItemId}
								selectedDate={selectedDate}
								onSelectItem={onSelectItem}
								onSelectDate={onSelectDate}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
