"use client";

import Link from "next/link";

import {
	agendaItemStateBadgeClasses,
	agendaItemStateLabels,
	agendaItemTypeLabels,
	type AgendaItem,
} from "@/types/agenda";

type AgendaItemPeekProps = {
	items: AgendaItem[];
	selectedDate: string | null;
	onClear: () => void;
};

function formatAgendaTimestamp(value: string) {
	return new Intl.DateTimeFormat("es-MX", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: "UTC",
	}).format(new Date(value));
}

function formatSelectedDate(value: string | null) {
	if (!value) {
		return "";
	}

	return new Intl.DateTimeFormat("es-MX", {
		weekday: "short",
		day: "numeric",
		month: "short",
		timeZone: "UTC",
	}).format(new Date(`${value}T00:00:00.000Z`));
}

export function AgendaItemPeek({
	items,
	selectedDate,
	onClear,
}: AgendaItemPeekProps) {
	if (items.length === 0) {
		return null;
	}

	return (
		<aside className="rounded-[24px] border border-[var(--border-soft)] bg-white p-4 shadow-sm lg:h-full lg:min-h-[520px] lg:rounded-[28px] lg:p-6 lg:shadow-none">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
						Vista previa
					</p>
					<h3 className="mt-2 text-lg font-semibold tracking-[-0.04em] text-[var(--brand-deep)] sm:text-xl">
						{formatSelectedDate(selectedDate)}
					</h3>
					<p className="mt-1 text-sm text-[var(--muted)]">
						{items.length} trabajo{items.length === 1 ? "" : "s"}
					</p>
				</div>
				<button
					type="button"
					onClick={onClear}
					className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--muted)] transition duration-200 ease-out hover:text-[var(--brand-deep)] active:scale-[0.96]"
					aria-label="Cerrar vista previa"
				>
					<span aria-hidden="true">×</span>
				</button>
			</div>

			<div className="mt-4 space-y-3 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-1">
				{items.map((item) => (
					<article
						key={item.id}
						className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface)] p-4"
					>
						<div className="flex flex-wrap items-center gap-2">
							<span
								className={`inline-flex min-h-[30px] items-center rounded-full border px-3 text-xs font-medium ${agendaItemStateBadgeClasses[item.estado]}`}
							>
								{agendaItemStateLabels[item.estado]}
							</span>
							<span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
								{agendaItemTypeLabels[item.tipo]}
							</span>
						</div>

						<h4 className="mt-3 text-base font-semibold text-[var(--brand-deep)]">
							{item.titulo}
						</h4>

						<dl className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
							<div>
								<dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
									Fecha
								</dt>
								<dd className="mt-1 leading-6">
									{item.appointment_at
										? formatAgendaTimestamp(item.appointment_at)
										: item.fecha}
								</dd>
							</div>
							<div>
								<dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
									Contacto
								</dt>
								<dd className="mt-1 leading-6">
									{item.contact_name?.trim() ||
										item.client?.full_name ||
										"Sin contacto"}
								</dd>
							</div>
							{item.work_type ? (
								<div>
									<dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
										Trabajo
									</dt>
									<dd className="mt-1 leading-6">{item.work_type}</dd>
								</div>
							) : null}
						</dl>

						<div className="mt-4 flex flex-wrap gap-2">
							<Link
								href={`/agenda/${item.id}`}
								className="inline-flex min-h-[38px] items-center rounded-full bg-[var(--brand)] px-4 text-sm font-medium text-white transition duration-200 ease-out hover:bg-[var(--brand-strong)] active:scale-[0.98]"
							>
								Ver detalles
							</Link>
						</div>
					</article>
				))}
			</div>
		</aside>
	);
}
