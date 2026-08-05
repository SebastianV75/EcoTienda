import Link from "next/link";

import {
	agendaItemStateBadgeClasses,
	agendaItemStateLabels,
	type AgendaItem,
} from "@/types/agenda";

type AgendaPendingListProps = {
	items: AgendaItem[];
};

function formatPendingTimestamp(item: AgendaItem) {
	if (!item.appointment_at) {
		return item.fecha;
	}

	return new Intl.DateTimeFormat("es-MX", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: "UTC",
	}).format(new Date(item.appointment_at));
}

export function AgendaPendingList({ items }: AgendaPendingListProps) {
	return (
		<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-4 shadow-sm sm:p-5">
			<div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border-soft)] pb-4">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
						Pendientes
					</p>
					<h2 className="mt-2 text-xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] sm:text-2xl">
						Lo que sigue abajo del calendario
					</h2>
				</div>
				<span className="inline-flex min-h-[34px] items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--brand-deep)]">
					{items.length} pendientes
				</span>
			</div>

			{items.length === 0 ? (
				<p className="pt-4 text-sm text-[var(--muted)]">
					No hay pendientes abiertos en agenda.
				</p>
			) : (
				<div className="divide-y divide-[var(--border-soft)] pt-2">
					{items.map((item) => (
						<div
							key={item.id}
							className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
						>
							<div className="min-w-0">
								<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
									{formatPendingTimestamp(item)}
								</p>
								<p className="mt-1 truncate text-sm font-semibold text-[var(--brand-deep)] sm:text-base">
									{item.titulo}
								</p>
								<p className="mt-1 truncate text-sm text-[var(--muted)]">
									{item.contact_name?.trim() || "Sin contacto"}
								</p>
								{item.assignee_worker?.full_name || item.assignee_name ? (
									<p className="mt-1 truncate text-xs text-[var(--muted)]">
										{item.assignee_worker?.full_name || item.assignee_name}
									</p>
								) : null}
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<span
									className={`inline-flex min-h-[30px] items-center rounded-full border px-3 text-xs font-medium ${agendaItemStateBadgeClasses[item.estado]}`}
								>
									{agendaItemStateLabels[item.estado]}
								</span>
								<Link
									href={`/agenda/${item.id}`}
									className="inline-flex min-h-[34px] items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-[rgba(13,79,46,0.18)] hover:bg-[rgba(243,247,243,0.92)]"
								>
									Abrir
								</Link>
							</div>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
