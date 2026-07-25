"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import type { TrabajoListFilters } from "@/features/trabajos/data";
import {
	trabajoStageLabels,
	trabajoStages,
	trabajoStatusLabels,
	trabajoStatuses,
} from "@/types/trabajo";
import type { WorkerSummary } from "@/types/worker";

const inputClassName =
	"w-full rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition duration-200 ease-out placeholder:text-[var(--muted)]/70 focus:border-emerald-300";

const buttonClassName =
	"rounded-full bg-[var(--surface-strong)] px-4 py-3 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:bg-emerald-100";

type TrabajoListFiltersProps = {
	initialFilters: TrabajoListFilters;
	workers: WorkerSummary[];
};

function buildFilterParams(
	current: URLSearchParams,
	update: Partial<TrabajoListFilters>,
): URLSearchParams {
	const next = new URLSearchParams(current);

	for (const [key, value] of Object.entries(update)) {
		if (value) {
			next.set(key, value);
		} else {
			next.delete(key);
		}
	}

	return next;
}

function hasActiveFilters(params: URLSearchParams): boolean {
	const keys = ["stage", "status", "from", "to", "q", "assignee_worker_id"];
	return keys.some((key) => params.has(key));
}

export function TrabajoListFilters({
	initialFilters,
	workers,
}: TrabajoListFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();

	function updateFilters(update: Partial<TrabajoListFilters>) {
		startTransition(() => {
			const next = buildFilterParams(
				new URLSearchParams(searchParams.toString()),
				update,
			);
			router.replace(`/admin/trabajos?${next.toString()}`, {
				scroll: false,
			});
		});
	}

	function clearFilters() {
		startTransition(() => {
			router.replace("/admin/trabajos", { scroll: false });
		});
	}

	return (
		<section className="flex flex-col gap-3 rounded-[26px] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
			<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
				<div className="flex-1 sm:min-w-[200px]">
					<label
						htmlFor="trabajo-search"
						className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
					>
						Buscar
					</label>
					<input
						id="trabajo-search"
						type="text"
						defaultValue={initialFilters.q ?? ""}
						placeholder="Cliente, dirección o número"
						className={inputClassName}
						onChange={(event) =>
							updateFilters({ q: event.target.value.trim() || undefined })
						}
					/>
				</div>

				<div className="flex-1 sm:min-w-[160px]">
					<label
						htmlFor="trabajo-stage"
						className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
					>
						Etapa
					</label>
					<select
						id="trabajo-stage"
						value={initialFilters.stage ?? ""}
						className={inputClassName}
						onChange={(event) =>
							updateFilters({
								stage: (event.target.value || undefined) as
									| TrabajoListFilters["stage"]
									| undefined,
							})
						}
					>
						<option value="">Todas</option>
						{trabajoStages.map((stage) => (
							<option key={stage} value={stage}>
								{trabajoStageLabels[stage]}
							</option>
						))}
					</select>
				</div>

				<div className="flex-1 sm:min-w-[160px]">
					<label
						htmlFor="trabajo-status"
						className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
					>
						Estado
					</label>
					<select
						id="trabajo-status"
						value={initialFilters.status ?? ""}
						className={inputClassName}
						onChange={(event) =>
							updateFilters({
								status: (event.target.value || undefined) as
									| TrabajoListFilters["status"]
									| undefined,
							})
						}
					>
						<option value="">Todos</option>
						{trabajoStatuses.map((status) => (
							<option key={status} value={status}>
								{trabajoStatusLabels[status]}
							</option>
						))}
					</select>
				</div>

				<div className="flex-1 sm:min-w-[220px]">
					<label
						htmlFor="trabajo-assignee-worker"
						className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
					>
						Trabajador
					</label>
					<select
						id="trabajo-assignee-worker"
						value={initialFilters.assignee_worker_id ?? ""}
						className={inputClassName}
						onChange={(event) =>
							updateFilters({
								assignee_worker_id: event.target.value || undefined,
							})
						}
					>
						<option value="">Todos</option>
						{workers.map((worker) => (
							<option key={worker.id} value={worker.id}>
								{worker.full_name}
							</option>
						))}
					</select>
				</div>

				<div className="flex-1 sm:min-w-[160px]">
					<label
						htmlFor="trabajo-from"
						className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
					>
						Desde
					</label>
					<input
						id="trabajo-from"
						type="date"
						value={initialFilters.from ?? ""}
						className={inputClassName}
						onChange={(event) =>
							updateFilters({ from: event.target.value || undefined })
						}
					/>
				</div>

				<div className="flex-1 sm:min-w-[160px]">
					<label
						htmlFor="trabajo-to"
						className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
					>
						Hasta
					</label>
					<input
						id="trabajo-to"
						type="date"
						value={initialFilters.to ?? ""}
						className={inputClassName}
						onChange={(event) =>
							updateFilters({ to: event.target.value || undefined })
						}
					/>
				</div>

				{hasActiveFilters(new URLSearchParams(searchParams.toString())) ? (
					<div className="flex-1 sm:min-w-[120px] sm:flex-none">
						<button
							type="button"
							onClick={clearFilters}
							disabled={isPending}
							className={buttonClassName}
						>
							Limpiar
						</button>
					</div>
				) : null}
			</div>
		</section>
	);
}
