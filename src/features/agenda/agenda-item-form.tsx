"use client";

import { useActionState } from "react";

import {
	createAgendaItemAction,
	updateAgendaItemAction,
	type AgendaActionState,
} from "@/features/agenda/actions";
import {
	agendaItemStateLabels,
	agendaItemStates,
	agendaItemTypeLabels,
	agendaItemTypes,
	type AgendaItemFormValues,
} from "@/types/agenda";

type AgendaFormClientOption = {
	id: string;
	full_name: string;
	rpu: string;
};

type AgendaItemFormProps = {
	mode: "create" | "edit";
	agendaItemId?: string;
	clients: AgendaFormClientOption[];
	defaultValues: AgendaItemFormValues;
};

const initialState: AgendaActionState = {
	error: null,
};

export function AgendaItemForm({
	mode,
	agendaItemId,
	clients,
	defaultValues,
}: AgendaItemFormProps) {
	const action = mode === "create" ? createAgendaItemAction : updateAgendaItemAction;
	const [state, formAction, isPending] = useActionState(action, initialState);

	return (
		<form action={formAction} className="space-y-5">
			{mode === "edit" && agendaItemId ? (
				<input type="hidden" name="id" value={agendaItemId} />
			) : null}

			<div className="grid gap-5 md:grid-cols-2">
				<div className="space-y-2.5">
					<label htmlFor="fecha" className="text-sm font-medium text-[var(--brand-deep)]">
						Fecha
					</label>
					<input
						id="fecha"
						name="fecha"
						type="date"
						defaultValue={defaultValues.fecha}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
					/>
				</div>

				<div className="space-y-2.5">
					<label htmlFor="estado" className="text-sm font-medium text-[var(--brand-deep)]">
						Estado
					</label>
					<select
						id="estado"
						name="estado"
						defaultValue={defaultValues.estado}
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
					>
						{agendaItemStates.map((stateValue) => (
							<option key={stateValue} value={stateValue}>
								{agendaItemStateLabels[stateValue]}
							</option>
						))}
					</select>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label htmlFor="titulo" className="text-sm font-medium text-[var(--brand-deep)]">
						Título
					</label>
					<input
						id="titulo"
						name="titulo"
						defaultValue={defaultValues.titulo}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Título operativo"
					/>
				</div>

				<div className="space-y-2.5">
					<label htmlFor="tipo" className="text-sm font-medium text-[var(--brand-deep)]">
						Tipo
					</label>
					<select
						id="tipo"
						name="tipo"
						defaultValue={defaultValues.tipo}
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
					>
						{agendaItemTypes.map((typeValue) => (
							<option key={typeValue} value={typeValue}>
								{agendaItemTypeLabels[typeValue]}
							</option>
						))}
					</select>
				</div>

				<div className="space-y-2.5">
					<label htmlFor="client_id" className="text-sm font-medium text-[var(--brand-deep)]">
						Cliente vinculado
					</label>
					<select
						id="client_id"
						name="client_id"
						defaultValue={defaultValues.client_id}
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
					>
						<option value="">Sin cliente asociado</option>
						{clients.map((client) => (
							<option key={client.id} value={client.id}>
								{client.full_name} · {client.rpu}
							</option>
						))}
					</select>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label htmlFor="descripcion" className="text-sm font-medium text-[var(--brand-deep)]">
						Descripción
					</label>
					<textarea
						id="descripcion"
						name="descripcion"
						defaultValue={defaultValues.descripcion}
						rows={5}
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Notas útiles para el seguimiento interno"
					/>
				</div>
			</div>

			{state.error ? (
				<p className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
					{state.error}
				</p>
			) : null}

			<button
				type="submit"
				disabled={isPending}
				className="w-full rounded-full bg-[var(--brand)] px-5 py-3.5 font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
			>
				{isPending
					? mode === "create"
						? "Creando..."
						: "Actualizando..."
					: mode === "create"
						? "Crear elemento"
						: "Guardar cambios"}
			</button>
		</form>
	);
}
