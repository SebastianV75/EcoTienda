import Link from "next/link";

import {
	agendaItemStateBadgeClasses,
	agendaItemStateLabels,
	agendaItemTypeLabels,
	type AgendaItem,
} from "@/types/agenda";

type AgendaItemCardProps = {
	item: AgendaItem;
	compact?: boolean;
	href?: string;
};

export function AgendaItemCard({ item, compact = false, href }: AgendaItemCardProps) {
	const content = (
		<article
			className={
				compact
					? "rounded-[18px] border border-[var(--border-soft)] bg-white/95 px-3 py-2.5 shadow-[0_10px_24px_rgba(10,44,21,0.05)]"
					: "rounded-[20px] border border-[var(--border-soft)] bg-white px-4 py-4 shadow-sm"
			}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
						{agendaItemTypeLabels[item.tipo]}
					</p>
					<h3
						className={compact ? "mt-1 text-[13px] font-semibold leading-5 text-[var(--brand-deep)]" : "mt-2 text-base font-semibold text-[var(--brand-deep)]"}
					>
						{item.titulo}
					</h3>
					{item.appointment_at ? (
						<p className={compact ? "mt-1 text-[11px] leading-4 text-[var(--muted)]" : "mt-1 text-sm leading-5 text-[var(--muted)]"}>
							{new Intl.DateTimeFormat("es-MX", {
								dateStyle: compact ? undefined : "medium",
								timeStyle: "short",
								timeZone: "UTC",
							}).format(new Date(item.appointment_at))}
						</p>
					) : null}
					{item.client ? (
						<p className={compact ? "mt-1 text-[11px] leading-4 text-[var(--muted)]" : "mt-2 text-sm leading-6 text-[var(--muted)]"}>
							{item.client.full_name}
						</p>
					) : null}
					{item.assignee_worker?.full_name || item.assignee_name ? (
						<p className={compact ? "mt-1 text-[11px] leading-4 text-[var(--muted)]" : "mt-1 text-sm leading-5 text-[var(--muted)]"}>
							{item.assignee_worker?.full_name || item.assignee_name}
						</p>
					) : null}
				</div>
				<span
					className={`inline-flex min-h-[28px] shrink-0 items-center rounded-full border px-2.5 text-[11px] font-medium ${agendaItemStateBadgeClasses[item.estado]}`}
				>
					{agendaItemStateLabels[item.estado]}
				</span>
			</div>
		</article>
	);

	if (!href) {
		return content;
	}

	return (
		<Link href={href} className="block transition duration-200 ease-out hover:-translate-y-0.5">
			{content}
		</Link>
	);
}
