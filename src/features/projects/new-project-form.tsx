"use client";

import { useActionState } from "react";

import {
	createProjectAction,
	type ProjectActionState,
} from "@/features/projects/actions";

const initialState: ProjectActionState = {
	error: null,
};

export function NewProjectForm() {
	const [state, formAction, isPending] = useActionState(
		createProjectAction,
		initialState,
	);

	return (
		<form action={formAction} className="space-y-3">
			<div className="flex flex-col gap-3 sm:flex-row">
				<button
					type="submit"
					disabled={isPending}
					className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70"
				>
					{isPending ? "Creando..." : "Nuevo trabajo"}
				</button>
			</div>

			{state.error ? (
				<p className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
					{state.error}
				</p>
			) : null}
		</form>
	);
}
