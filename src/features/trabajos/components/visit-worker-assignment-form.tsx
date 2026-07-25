"use client";

import { useActionState } from "react";

import {
	type TrabajoAssignmentActionState,
	updateTrabajoAssignmentAction,
} from "@/features/trabajos/actions";
import type { WorkerSummary } from "@/types/worker";

type VisitWorkerAssignmentFormProps = {
	trabajoId: string;
	workers: WorkerSummary[];
	defaultWorkerId: string;
};

const initialState: TrabajoAssignmentActionState = {
	error: null,
};

export function VisitWorkerAssignmentForm({
	trabajoId,
	workers,
	defaultWorkerId,
}: VisitWorkerAssignmentFormProps) {
	const [state, formAction, isPending] = useActionState(
		updateTrabajoAssignmentAction,
		initialState,
	);

	return (
		<form action={formAction} className="space-y-3">
			<input type="hidden" name="trabajo_id" value={trabajoId} />
			<div className="space-y-2.5">
				<label
					htmlFor="assignee_worker_id"
					className="text-sm font-medium text-[var(--brand-deep)]"
				>
					Asignar técnico
				</label>
				<select
					id="assignee_worker_id"
					name="assignee_worker_id"
					defaultValue={defaultWorkerId}
					disabled={isPending || workers.length === 0}
					className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300 disabled:cursor-not-allowed disabled:bg-[var(--surface)]"
				>
					<option value="">Seleccionar técnico...</option>
					{workers.map((worker) => (
						<option key={worker.id} value={worker.id}>
							{worker.full_name}
						</option>
					))}
				</select>
			</div>

			{state.error ? (
				<p className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
					{state.error}
				</p>
			) : null}

			<div className="flex flex-wrap items-center gap-3">
				<button
					type="submit"
					disabled={isPending || workers.length === 0}
					className="inline-flex min-h-[40px] items-center rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white transition duration-200 ease-out hover:bg-[var(--brand-strong)] active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-70"
				>
					{isPending ? "Guardando..." : "Guardar asignación"}
				</button>
				<p className="text-xs leading-5 text-[var(--muted)]">
					Esto actualiza Agenda y la etapa de Trabajo para que ambos queden
					alineados.
				</p>
			</div>
		</form>
	);
}
