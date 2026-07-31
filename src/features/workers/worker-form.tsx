"use client";

import { useActionState } from "react";

import { ActionButton } from "@/components/ui/action-button";
import { Input, Select } from "@/components/ui/field";

import {
	createWorkerAction,
	type WorkerActionState,
	updateWorkerAction,
} from "@/features/workers/actions";
import { workerRoleLabels, type WorkerFormValues } from "@/types/worker";

type WorkerFormProps = {
	mode: "create" | "edit";
	workerId?: string;
	defaultValues?: Partial<WorkerFormValues>;
};

const initialState: WorkerActionState = {
	error: null,
};

export function WorkerForm({ mode, workerId, defaultValues }: WorkerFormProps) {
	const action = mode === "create" ? createWorkerAction : updateWorkerAction;
	const [state, formAction] = useActionState(action, initialState);

	return (
		<form action={formAction} className="space-y-5">
			{mode === "edit" ? (
				<input type="hidden" name="id" value={workerId} />
			) : null}

			<div className="grid gap-5 md:grid-cols-2">
				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="full_name"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Nombre completo
					</label>
					<Input
						id="full_name"
						name="full_name"
						defaultValue={defaultValues?.full_name ?? ""}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Nombre completo del trabajador"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="phone"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Teléfono
					</label>
					<Input
						id="phone"
						name="phone"
						defaultValue={defaultValues?.phone ?? ""}
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Opcional"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="role"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Rol
					</label>
					<Select
						id="role"
						name="role"
						defaultValue={defaultValues?.role ?? "staff"}
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
					>
						{Object.entries(workerRoleLabels).map(([value, label]) => (
							<option key={value} value={value}>
								{label}
							</option>
						))}
					</Select>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="auth_user_id"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						ID de auth
					</label>
					<Input
						id="auth_user_id"
						name="auth_user_id"
						defaultValue={defaultValues?.auth_user_id ?? ""}
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Opcional"
					/>
					<p className="text-xs leading-5 text-[var(--muted)]">
						Puedes vincular el trabajador con un usuario de auth más adelante
						sin bloquear el alta.
					</p>
				</div>
			</div>

			<label className="flex items-start gap-3 rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface)] p-4 text-sm text-[var(--brand-deep)]">
				<Input
					type="checkbox"
					name="active"
					value="true"
					defaultChecked={defaultValues?.active ?? true}
					className="mt-1 h-4 w-4 rounded border-[var(--border-soft)] text-[var(--brand)] focus:ring-[var(--brand-strong)]"
				/>
				<span>
					<strong className="block font-medium">Trabajador activo</strong>
					<span className="mt-1 block text-sm leading-6 text-[var(--muted)]">
						Si lo desmarcas, seguirá en el historial pero no se mostrará como
						opción activa.
					</span>
				</span>
			</label>

			{state.error ? (
				<p className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
					{state.error}
				</p>
			) : null}

			<ActionButton
				type="submit"
				pendingLabel={mode === "create" ? "Guardando..." : "Actualizando..."}
				className="w-full rounded-full bg-[var(--brand)] px-5 py-3.5 font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
			>
				{mode === "create" ? "Guardar trabajador" : "Actualizar trabajador"}
			</ActionButton>
		</form>
	);
}
