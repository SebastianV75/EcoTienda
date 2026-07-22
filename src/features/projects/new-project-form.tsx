"use client";

import { useActionState } from "react";

import {
	createProjectAction,
	type ProjectActionState,
} from "@/features/projects/actions";

const initialState: ProjectActionState = {
	error: null,
};

type NewProjectFormProps = {
	clients: {
		id: string;
		full_name: string;
		rpu: string;
	}[];
};

export function NewProjectForm({ clients }: NewProjectFormProps) {
	const [state, formAction, isPending] = useActionState(
		createProjectAction,
		initialState,
	);

	return (
		<form action={formAction} className="space-y-3">
			<div className="flex flex-col gap-3 sm:flex-row">
				<select
					name="client_id"
					defaultValue=""
					required
					aria-label="Cliente del nuevo trabajo"
					className="min-h-[48px] flex-1 rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
				>
					<option value="" disabled>
						Selecciona un cliente
					</option>
					{clients.map((client) => (
						<option key={client.id} value={client.id}>
							{client.full_name} · {client.rpu}
						</option>
					))}
				</select>
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
