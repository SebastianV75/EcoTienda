import type { AgendaItem } from "@/types/agenda";

import { agendaItemStateLabels } from "@/types/agenda";

import { AgendaItemCard } from "./agenda-item-card";

type AgendaPendingListProps = {
	items: AgendaItem[];
};

export function AgendaPendingList({ items }: AgendaPendingListProps) {
	return (
		<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
						Pendientes
					</p>
					<h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)]">
						Seguimiento por fecha
					</h2>
				</div>
				<span className="inline-flex min-h-[34px] items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--brand-deep)]">
					{items.length} pendientes
				</span>
			</div>

			{items.length === 0 ? null : (
				<div className="mt-5 space-y-3">
					{items.map((item) => (
						<div key={item.id} className="space-y-2">
							<div className="flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
								<span>{item.fecha}</span>
								<span>{agendaItemStateLabels[item.estado]}</span>
							</div>
							<AgendaItemCard item={item} href={`/agenda/${item.id}`} />
						</div>
					))}
				</div>
			)}
		</section>
	);
}
