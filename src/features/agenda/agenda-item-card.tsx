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

function getCompactAccentClass(state: AgendaItem["estado"]) {
	switch (state) {
		case "en_proceso":
			return "border-l-[3px] border-l-[rgba(47,179,20,0.24)]";
		case "pendiente":
			return "border-l-[3px] border-l-[rgba(234,179,8,0.24)]";
		default:
			return "border-l-[3px] border-l-transparent";
	}
}

export function AgendaItemCard({
	item,
	compact = false,
	href,
}: AgendaItemCardProps) {
	const content = (
		<article
			className={
				compact
					? `rounded-[18px] border border-[var(--border-soft)] bg-white/95 px-3 py-2.5 shadow-[0_10px_24px_rgba(10,44,21,0.05)] transition-[border-color,box-shadow] duration-200 ease-out group-hover:border-[rgba(13,79,46,0.12)] group-hover:shadow-[0_10px_24px_rgba(10,44,21,0.08)] ${getCompactAccentClass(item.estado)}`
					: "rounded-[20px] border border-[var(--border-soft)] bg-white px-4 py-4 shadow-sm"
			}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
						{agendaItemTypeLabels[item.tipo]}
					</p>
					<h3
						className={
							compact
								? "mt-1 text-[13px] font-semibold leading-5 text-[var(--brand-deep)]"
								: "mt-2 text-base font-semibold text-[var(--brand-deep)]"
						}
					>
						{item.titulo}
					</h3>
					{item.appointment_at ? (
						<p
							className={
								compact
									? "mt-1 text-[11px] leading-4 text-[var(--muted)]"
									: "mt-1 text-sm leading-5 text-[var(--muted)]"
							}
						>
							{new Intl.DateTimeFormat("es-MX", {
								dateStyle: compact ? "short" : "medium",
								timeStyle: "short",
								timeZone: "UTC",
							}).format(new Date(item.appointment_at))}
						</p>
					) : null}
					{item.assignee_worker?.full_name || item.assignee_name ? (
						<p
							className={
								compact
									? "mt-1 text-[11px] leading-4 text-[var(--muted)]"
									: "mt-1 text-sm leading-5 text-[var(--muted)]"
							}
						>
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
		<Link
			href={href}
			className="group block transition-[transform] duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.99]"
		>
			{content}
		</Link>
	);
}
