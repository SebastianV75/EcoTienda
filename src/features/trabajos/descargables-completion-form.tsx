"use client";

import { useActionState } from "react";

import {
	saveTrabajoDescargablesAction,
	type DescargablesActionState,
} from "@/features/trabajos/trabajo-stage-actions";

type DescargablesCompletionFormProps = {
	trabajoId: string;
};

const initialState: DescargablesActionState = {
	error: null,
	success: null,
};

export function DescargablesCompletionForm({ trabajoId }: DescargablesCompletionFormProps) {
	const [state, formAction, isPending] = useActionState(
		saveTrabajoDescargablesAction,
		initialState,
	);

	return (
		<form action={formAction} className="space-y-3">
			<input type="hidden" name="trabajo_id" value={trabajoId} />

			<button
				type="submit"
				disabled={isPending}
				className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white transition duration-200 ease-out hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70"
			>
				{isPending ? "Completando..." : "Marcar descargables como completado"}
			</button>

			{state.error ? (
				<p className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
					{state.error}
				</p>
			) : null}

			{state.success ? (
				<p className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
					{state.success}
				</p>
			) : null}
		</form>
	);
}
