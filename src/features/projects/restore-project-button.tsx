"use client";

import { useActionState } from "react";

import {
	restoreProjectAction,
	type ProjectActionState,
} from "@/features/projects/actions";

const initialState: ProjectActionState = {
	error: null,
};

type RestoreProjectButtonProps = {
	projectId: string;
};

export function RestoreProjectButton({ projectId }: RestoreProjectButtonProps) {
	const [state, formAction, isPending] = useActionState(
		restoreProjectAction,
		initialState,
	);

	return (
		<form action={formAction} className="space-y-2">
			<input type="hidden" name="project_id" value={projectId} />
			<button
				type="submit"
				disabled={isPending}
				className="inline-flex min-h-[40px] items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
			>
				{isPending ? "Restaurando..." : "Restaurar al panel"}
			</button>
			{state.error ? (
				<p className="rounded-[16px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
					{state.error}
				</p>
			) : null}
		</form>
	);
}
