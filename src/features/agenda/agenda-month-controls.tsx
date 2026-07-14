import Link from "next/link";

import {
	formatMonthHeading,
	formatMonthParam,
	shiftMonth,
} from "@/features/agenda/calendar-utils";

type AgendaMonthControlsProps = {
	year: number;
	month: number;
};

export function AgendaMonthControls({ year, month }: AgendaMonthControlsProps) {
	const previousMonth = shiftMonth(year, month, -1);
	const nextMonth = shiftMonth(year, month, 1);

	return (
		<div className="flex flex-col gap-4 rounded-[24px] border border-[var(--border-soft)] bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
			<div>
				<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
					Calendario mensual
				</p>
				<h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] capitalize">
					{formatMonthHeading(year, month)}
				</h2>
			</div>

			<div className="flex items-center gap-3">
				<Link
					href={`/agenda?month=${formatMonthParam(previousMonth.year, previousMonth.month)}`}
					className="inline-flex min-h-[42px] items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-[var(--brand-strong)] hover:text-[var(--brand-strong)]"
				>
					Mes anterior
				</Link>
				<Link
					href={`/agenda?month=${formatMonthParam(nextMonth.year, nextMonth.month)}`}
					className="inline-flex min-h-[42px] items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-[var(--brand-strong)] hover:text-[var(--brand-strong)]"
				>
					Mes siguiente
				</Link>
			</div>
		</div>
	);
}
