"use client";

import { useActionState } from "react";

import {
	updateProjectStageAction,
	type ProjectActionState,
} from "@/features/projects/actions";
import {
	projectStageLabels,
	projectStages,
	type ProjectStage,
} from "@/types/project";

const initialState: ProjectActionState = {
	error: null,
};

type ProjectStageFormProps = {
	projectId: string;
	currentStage: ProjectStage;
};

export function ProjectStageForm({
	projectId,
	currentStage,
}: ProjectStageFormProps) {
	const [state, formAction, isPending] = useActionState(
		updateProjectStageAction,
		initialState,
	);

	return (
		<form action={formAction} className="space-y-2">
			<input type="hidden" name="project_id" value={projectId} />
			<div className="flex flex-wrap items-center gap-2">
				<select
					name="stage"
					defaultValue={currentStage}
					aria-label="Etapa del trabajo"
					className="min-h-[40px] rounded-full border border-[var(--border-soft)] bg-white px-3 py-1.5 text-sm text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
				>
					{projectStages.map((stage) => (
						<option key={stage} value={stage}>
							{projectStageLabels[stage]}
						</option>
					))}
				</select>
				<button
					type="submit"
					disabled={isPending}
					className="inline-flex min-h-[40px] items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-1.5 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
				>
					{isPending ? "Guardando..." : "Mover etapa"}
				</button>
			</div>

			{state.error ? (
				<p className="rounded-[16px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
					{state.error}
				</p>
			) : null}
		</form>
	);
}
