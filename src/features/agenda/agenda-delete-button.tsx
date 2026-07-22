"use client";

import { useFormStatus } from "react-dom";

function DeleteButtonInner() {
	const { pending } = useFormStatus();

	return (
		<button
			type="submit"
			disabled={pending}
			className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition duration-200 ease-out hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{pending ? "Borrando..." : "Borrar"}
		</button>
	);
}

type AgendaDeleteButtonProps = {
	agendaItemId: string;
	action: (formData: FormData) => void | Promise<void>;
};

export function AgendaDeleteButton({
	agendaItemId,
	action,
}: AgendaDeleteButtonProps) {
	return (
		<form
			action={action}
			onSubmit={(event) => {
				if (!window.confirm("¿Borrar esta cita o trabajo de agenda?")) {
					event.preventDefault();
				}
			}}
		>
			<input type="hidden" name="id" value={agendaItemId} />
			<DeleteButtonInner />
		</form>
	);
}
