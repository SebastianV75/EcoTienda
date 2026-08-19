"use client";

import { useActionState } from "react";

import { ActionButton } from "@/components/ui/action-button";
import {
	deleteWorkerAction,
	type WorkerActionState,
} from "@/features/workers/actions";

const initialState: WorkerActionState = { error: null };

export function WorkerDeleteButton({
	workerId,
	menuItem = false,
}: {
	workerId: string;
	menuItem?: boolean;
}) {
	const [state, formAction] = useActionState(deleteWorkerAction, initialState);

	return (
		<form
			action={formAction}
			onSubmit={(event) => {
				if (
					!window.confirm(
						"¿Eliminar este trabajador y su cuenta de acceso? Esta acción no se puede deshacer.",
					)
				) {
					event.preventDefault();
				}
			}}
			className="space-y-2"
		>
			<input type="hidden" name="id" value={workerId} />
			<ActionButton
				type="submit"
				pendingLabel="Eliminando..."
				className={
					menuItem
						? "block w-full rounded-[10px] px-3 py-2 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
						: "inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition duration-200 ease-out hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
				}
			>
				Eliminar
			</ActionButton>
			{state.error ? (
				<p className="max-w-md text-xs leading-5 text-rose-700">{state.error}</p>
			) : null}
		</form>
	);
}
