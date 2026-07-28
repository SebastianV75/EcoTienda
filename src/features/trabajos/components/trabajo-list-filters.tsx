"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";

import type { TrabajoListFilters } from "@/features/trabajos/data";
import {
	trabajoStageLabels,
	trabajoStages,
	trabajoStatusLabels,
	trabajoStatuses,
} from "@/types/trabajo";
import type { WorkerSummary } from "@/types/worker";

const inputClassName =
	"w-full rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-[border-color,background-color,opacity,box-shadow] duration-200 ease-out placeholder:text-[var(--muted)]/70 focus:border-emerald-300 disabled:cursor-wait disabled:opacity-75";

const buttonClassName =
	"rounded-full bg-[var(--surface-strong)] px-4 py-3 text-sm font-medium text-[var(--brand-deep)] transition-[background-color,opacity,transform] duration-200 ease-out hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-75";

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
	const [isExpanded, setIsExpanded] = useState(false);

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

	const activeFilterCount = [
		initialFilters.stage,
		initialFilters.status,
		initialFilters.from,
		initialFilters.to,
		initialFilters.assignee_worker_id,
	].filter(Boolean).length;

	return (
		<section
			aria-busy={isPending}
			className="space-y-3"
		>
			{/* Barra de búsqueda siempre visible */}
			<div className="relative">
				<div className="flex items-center gap-2">
					<div className="relative flex-1">
						<svg
							className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]/60"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
						<input
							id="trabajo-search"
							type="text"
							defaultValue={initialFilters.q ?? ""}
							placeholder="Buscar trabajos..."
							className="w-full rounded-full border border-[var(--border-soft)] bg-white py-3 pl-11 pr-4 text-sm text-[var(--foreground)] outline-none transition duration-200 ease-out placeholder:text-[var(--muted)]/70 focus:border-emerald-300 focus:shadow-sm disabled:cursor-wait disabled:opacity-75"
							disabled={isPending}
							onFocus={() => setIsExpanded(true)}
							onChange={(event) =>
								updateFilters({ q: event.target.value.trim() || undefined })
							}
						/>
					</div>
					<button
						type="button"
						onClick={() => setIsExpanded(!isExpanded)}
						className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--border-soft)] bg-white text-[var(--muted)] transition duration-200 ease-out hover:border-emerald-300 hover:text-emerald-600 disabled:cursor-wait disabled:opacity-75"
						aria-label="Mostrar filtros"
						disabled={isPending}
					>
						<svg
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
							/>
						</svg>
						{activeFilterCount > 0 && (
							<span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white">
								{activeFilterCount}
							</span>
						)}
					</button>
				</div>
			</div>

			{/* Panel de filtros expandible */}
			<div
				className={`grid transition-all duration-300 ease-out ${
					isExpanded
						? "grid-rows-[1fr] opacity-100"
						: "grid-rows-[0fr] opacity-0"
				}`}
			>
				<div className="overflow-hidden">
					<div className="space-y-3 rounded-[26px] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
						<div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3">
							<div>
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
									disabled={isPending}
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

							<div>
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
									disabled={isPending}
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

							<div>
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
									disabled={isPending}
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

							<div>
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
									disabled={isPending}
									onChange={(event) =>
										updateFilters({ from: event.target.value || undefined })
									}
								/>
							</div>

							<div>
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
									disabled={isPending}
									onChange={(event) =>
										updateFilters({ to: event.target.value || undefined })
									}
								/>
							</div>

							{hasActiveFilters(new URLSearchParams(searchParams.toString())) && (
								<div className="flex items-end">
									<button
										type="button"
										onClick={clearFilters}
										disabled={isPending}
										className={buttonClassName}
									>
										Limpiar filtros
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
