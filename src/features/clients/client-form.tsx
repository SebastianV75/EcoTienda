"use client";

import { useActionState } from "react";

import {
	createClientAction,
	type ClientActionState,
	updateClientAction,
} from "@/features/clients/actions";
import type { ClientFormValues } from "@/types/client";

type ClientFormProps = {
	mode: "create" | "edit";
	clientId?: string;
	defaultValues?: Partial<ClientFormValues>;
};

const initialState: ClientActionState = {
	error: null,
};

export function ClientForm({ mode, clientId, defaultValues }: ClientFormProps) {
	const action = mode === "create" ? createClientAction : updateClientAction;
	const [state, formAction, isPending] = useActionState(action, initialState);

	return (
		<form action={formAction} className="space-y-5">
			{mode === "edit" ? (
				<input type="hidden" name="id" value={clientId} />
			) : null}

			<div className="grid gap-5 md:grid-cols-2">
				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="full_name"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Nombre del cliente
					</label>
					<input
						id="full_name"
						name="full_name"
						defaultValue={defaultValues?.full_name ?? ""}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Nombre completo"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="phone"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Teléfono
					</label>
					<input
						id="phone"
						name="phone"
						defaultValue={defaultValues?.phone ?? ""}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="10 dígitos o teléfono de contacto"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="rpu"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						RPU
					</label>
					<input
						id="rpu"
						name="rpu"
						defaultValue={defaultValues?.rpu ?? ""}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Registro Permanente de Usuario"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="rfc"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						RFC
					</label>
					<input
						id="rfc"
						name="rfc"
						defaultValue={defaultValues?.rfc ?? ""}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="RFC del cliente"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="neighborhood"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Colonia
					</label>
					<input
						id="neighborhood"
						name="neighborhood"
						defaultValue={defaultValues?.neighborhood ?? ""}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Colonia o fraccionamiento"
					/>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="address"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Dirección
					</label>
					<textarea
						id="address"
						name="address"
						defaultValue={defaultValues?.address ?? ""}
						required
						rows={4}
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Dirección completa del cliente"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="latitude"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Latitud
					</label>
					<input
						id="latitude"
						name="latitude"
						type="number"
						step="any"
						defaultValue={defaultValues?.latitude ?? ""}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Ej. 20.6736"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="longitude"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Longitud
					</label>
					<input
						id="longitude"
						name="longitude"
						type="number"
						step="any"
						defaultValue={defaultValues?.longitude ?? ""}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Ej. -103.344"
					/>
				</div>
			</div>

			<p className="rounded-[18px] border border-emerald-100 bg-[var(--surface-strong)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
				Por ahora la ubicación se captura con dirección y coordenadas manuales.
				La integración visual con Google Maps puede entrar después sin romper
				este registro.
			</p>

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
						? "Guardando..."
						: "Actualizando..."
					: mode === "create"
						? "Guardar cliente"
						: "Actualizar cliente"}
			</button>
		</form>
	);
}
