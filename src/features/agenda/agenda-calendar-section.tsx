"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { AgendaItem } from "@/types/agenda";

import { AgendaCalendar } from "./agenda-calendar";
import { AgendaItemPeek } from "./agenda-item-peek";
import {
	formatMonthHeading,
	formatMonthParam,
	groupAgendaItemsByDate,
	shiftMonth,
} from "./calendar-utils";

type AgendaCalendarSectionProps = {
	year: number;
	month: number;
	items: AgendaItem[];
};

export function AgendaCalendarSection({
	year,
	month,
	items,
}: AgendaCalendarSectionProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const previousMonth = shiftMonth(year, month, -1);
	const nextMonth = shiftMonth(year, month, 1);
	const itemsByDate = useMemo(() => groupAgendaItemsByDate(items), [items]);
	const selectedItems = selectedDate ? (itemsByDate[selectedDate] ?? []) : [];
	const selectedItem =
		selectedItemId === null
			? null
			: (items.find((item) => item.id === selectedItemId) ?? null);
	const peekItems =
		selectedItems.length > 0
			? selectedItems
			: selectedItem
				? [selectedItem]
				: [];
	const peekDate =
		selectedItems.length > 0
			? selectedDate
			: selectedItem
				? selectedItem.fecha
				: null;

	return (
		<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-4 shadow-sm sm:p-5 lg:p-6">
			<div className="flex flex-col gap-4 border-b border-[var(--border-soft)] pb-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0">
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
						Calendario de agenda
					</p>
					<div className="mt-2 flex flex-wrap items-center gap-2">
						<h2 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] capitalize sm:text-3xl">
							{formatMonthHeading(year, month)}
						</h2>
						<button
							type="button"
							onClick={() => setIsCollapsed((value) => !value)}
							aria-label={
								isCollapsed ? "Mostrar calendario" : "Ocultar calendario"
							}
							aria-expanded={!isCollapsed}
							className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--brand-deep)] transition duration-200 ease-out hover:border-[rgba(13,79,46,0.18)] hover:bg-[rgba(243,247,243,0.92)] active:scale-[0.96]"
						>
							<svg
								aria-hidden="true"
								viewBox="0 0 16 16"
								fill="none"
								className={`h-3.5 w-3.5 transition-transform duration-200 ease-out ${isCollapsed ? "rotate-180" : "rotate-0"}`}
							>
								<path
									d="M4 6l4 4 4-4"
									stroke="currentColor"
									strokeWidth="1.6"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2.5">
					<Link
						href={`/agenda?month=${formatMonthParam(previousMonth.year, previousMonth.month)}`}
						className="inline-flex min-h-[40px] items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-[var(--brand-strong)] hover:text-[var(--brand-strong)] active:scale-[0.98]"
					>
						Mes anterior
					</Link>
					<Link
						href={`/agenda?month=${formatMonthParam(nextMonth.year, nextMonth.month)}`}
						className="inline-flex min-h-[40px] items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-[var(--brand-strong)] hover:text-[var(--brand-strong)] active:scale-[0.98]"
					>
						Mes siguiente
					</Link>
					<Link
						href="/agenda/new"
						className="inline-flex min-h-[40px] items-center rounded-full bg-[var(--brand)] px-4 text-sm font-medium text-white transition duration-200 ease-out hover:bg-[var(--brand-strong)] active:scale-[0.98]"
					>
						Nuevo trabajo
					</Link>
				</div>
			</div>

			{isCollapsed ? null : (
				<div
					className={`mt-4 grid gap-4 ${peekItems.length > 0 ? "lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6 lg:items-stretch" : "grid-cols-1"}`}
				>
					<AgendaCalendar
						year={year}
						month={month}
						items={items}
						selectedItemId={selectedItem ? selectedItem.id : null}
						selectedDate={selectedDate}
						onSelectItem={(item) => {
							setSelectedDate(null);
							setSelectedItemId(item.id);
						}}
						onSelectDate={(isoDate) => {
							setSelectedItemId(null);
							setSelectedDate(isoDate);
						}}
					/>
					<AgendaItemPeek
						items={peekItems}
						selectedDate={peekDate}
						onClear={() => {
							setSelectedItemId(null);
							setSelectedDate(null);
						}}
					/>
				</div>
			)}
		</section>
	);
}
