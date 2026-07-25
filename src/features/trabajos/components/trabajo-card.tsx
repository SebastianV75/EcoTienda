"use client";

import Link from "next/link";

import type { TrabajoListItem } from "@/features/trabajos/data";
import {
	trabajoStageLabels,
	trabajoStatusLabels,
	type TrabajoStatus,
} from "@/types/trabajo";

type TrabajoCardProps = {
	trabajo: TrabajoListItem;
};

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	return `${day}/${month}/${year}`;
}

function formatAppointment(dateString: string | null): string | null {
	if (!dateString) {
		return null;
	}

	return new Intl.DateTimeFormat("es-MX", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: "UTC",
	}).format(new Date(dateString));
}

function getStatusConfig(status: TrabajoStatus) {
	switch (status) {
		case "open":
			return {
				label: trabajoStatusLabels[status],
				className: "bg-slate-100 text-slate-700",
			};
		case "won":
			return {
				label: trabajoStatusLabels[status],
				className: "bg-emerald-100 text-emerald-700",
			};
		case "lost":
			return {
				label: trabajoStatusLabels[status],
				className: "bg-rose-100 text-rose-700",
			};
		case "archived":
			return {
				label: trabajoStatusLabels[status],
				className: "bg-amber-100 text-amber-700",
			};
		default:
			return {
				label: status,
				className: "bg-slate-100 text-slate-700",
			};
	}
}

function buildBriefDescription(trabajo: TrabajoListItem): string {
	const parts = [trabajo.client_name ?? trabajo.intake_name]
		.filter(Boolean);

	if (trabajo.agenda_work_type) {
		parts.push(trabajo.agenda_work_type);
	}

	if (parts.length === 0) {
		return "Trabajo sin descripción";
	}

	return parts.join(" · ");
}

export function TrabajoCard({ trabajo }: TrabajoCardProps) {
	const statusConfig = getStatusConfig(trabajo.status);
	const briefDescription = buildBriefDescription(trabajo);
	const createdDate = formatDate(trabajo.created_at);
	const appointmentLabel = formatAppointment(trabajo.appointment_at);
	const assignedWorkerName = trabajo.assigned_worker_name?.trim() || null;
	const primaryCtaLabel =
		trabajo.current_stage === "agenda" ? "Ver agenda" : "Abrir trabajo";

	return (
		<Link
			href={`/admin/trabajos/${trabajo.id}`}
			className="group block rounded-[26px] border border-[var(--border-soft)] bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(13,79,46,0.09)]"
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
						Trabajo
					</p>
					<h3 className="mt-1 truncate text-xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
						{trabajo.client_name ?? "Sin cliente"}
					</h3>
				</div>
				<div className="flex shrink-0 flex-wrap items-center gap-2">
					<span className="inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--surface-strong)] px-2.5 py-1 text-xs font-medium text-[var(--brand-deep)]">
						{trabajoStageLabels[trabajo.current_stage]}
					</span>
					<span
						className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.className}`}
					>
						{statusConfig.label}
					</span>
				</div>
			</div>

			<p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
				{briefDescription}
			</p>

			{assignedWorkerName || appointmentLabel ? (
				<dl className="mt-4 space-y-1.5 text-sm text-[var(--muted)]">
					{assignedWorkerName ? (
						<div className="flex gap-2">
							<dt className="shrink-0 text-[var(--brand-deep)]">Asignado</dt>
							<dd className="truncate">{assignedWorkerName}</dd>
						</div>
					) : null}
					{appointmentLabel ? (
						<div className="flex gap-2">
							<dt className="shrink-0 text-[var(--brand-deep)]">Cita</dt>
							<dd className="truncate">{appointmentLabel}</dd>
						</div>
					) : null}
				</dl>
			) : null}

			<div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
				<span className="truncate">{trabajo.intake_address_text}</span>
				<time dateTime={trabajo.created_at} className="shrink-0">
					{createdDate}
				</time>
			</div>

			<div className="mt-4 flex items-center justify-end border-t border-[var(--border-soft)] pt-3 text-sm font-medium text-[var(--brand-deep)]">
				<span>{primaryCtaLabel}</span>
			</div>
		</Link>
	);
}
