"use client";

import Link from "next/link";

import type { TrabajoListItem } from "@/features/trabajos/data";
import {
	trabajoStageLabels,
	trabajoStatusLabels,
	type TrabajoStatus,
} from "@/types/trabajo";
import { StageProgressIndicator } from "@/components/stage-progress-indicator";

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
				kind: "subtle" as const,
				dotClassName: "bg-sky-500/70",
				className: "text-slate-600",
			};
		case "won":
			return {
				label: trabajoStatusLabels[status],
				kind: "pill" as const,
				className: "bg-emerald-100 text-emerald-700",
			};
		case "lost":
			return {
				label: trabajoStatusLabels[status],
				kind: "pill" as const,
				className: "bg-rose-100 text-rose-700",
			};
		case "archived":
			return {
				label: trabajoStatusLabels[status],
				kind: "pill" as const,
				className: "bg-amber-100 text-amber-700",
			};
		default:
			return {
				label: status,
				kind: "subtle" as const,
				dotClassName: "bg-slate-400",
				className: "text-slate-600",
			};
	}
}

function buildBriefDescription(trabajo: TrabajoListItem): string {
	const parts = [trabajo.client_name ?? trabajo.intake_name].filter(Boolean);

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

	return (
		<Link
			href={`/admin/trabajos/${trabajo.id}`}
			className="group block rounded-[26px] border border-[var(--border-soft)] bg-white p-5 shadow-sm transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(13,79,46,0.12)] hover:shadow-[0_10px_24px_rgba(10,44,21,0.08)] active:scale-[0.99]"
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<span className="inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--surface-strong)] px-2.5 py-1 text-xs font-medium text-[var(--brand-deep)]">
							{trabajoStageLabels[trabajo.current_stage]}
						</span>
						{statusConfig.kind === "pill" ? (
							<span
								className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.className}`}
							>
								{statusConfig.label}
							</span>
						) : (
							<span
								className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusConfig.className}`}
							>
								<span
									aria-hidden="true"
									className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClassName}`}
								/>
								{statusConfig.label}
							</span>
						)}
					</div>
					<h3 className="mt-3 truncate text-xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
						{trabajo.client_name ?? "Sin cliente"}
					</h3>
				</div>
				<span className="mt-1 text-[var(--muted)] transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-[var(--brand-deep)]">
					<svg
						aria-hidden="true"
						className="h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fillRule="evenodd"
							d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
							clipRule="evenodd"
						/>
					</svg>
				</span>
			</div>

			<p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
				{briefDescription}
			</p>

			{/* Indicador de progreso de etapas */}
			<div className="mt-4">
				<StageProgressIndicator currentStage={trabajo.current_stage} size="sm" />
			</div>

			{assignedWorkerName || appointmentLabel ? (
				<dl className="mt-4 space-y-2 text-sm text-[var(--muted)]">
					{assignedWorkerName ? (
						<div className="flex items-start gap-2">
							<dt className="shrink-0 text-[var(--brand-deep)]">Asignado</dt>
							<dd className="truncate">{assignedWorkerName}</dd>
						</div>
					) : null}
					{appointmentLabel ? (
						<div className="flex items-start gap-2">
							<dt className="shrink-0 text-[var(--brand-deep)]">Cita</dt>
							<dd className="truncate">{appointmentLabel}</dd>
						</div>
					) : null}
				</dl>
			) : null}

			<div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border-soft)] pt-3 text-sm text-[var(--muted)]">
				<span className="truncate">{trabajo.intake_address_text}</span>
				<time
					dateTime={trabajo.created_at}
					className="shrink-0 text-xs font-medium text-[var(--brand-strong)]"
				>
					{createdDate}
				</time>
			</div>
		</Link>
	);
}
