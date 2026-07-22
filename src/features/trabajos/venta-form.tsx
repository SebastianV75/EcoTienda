"use client";

import { useActionState } from "react";

import { saveTrabajoVentaAction, type VentaActionState, type VentaFormValues } from "@/features/trabajos/trabajo-stage-actions";

type VentaFormProps = {
	trabajoId: string;
	quotationTrabajoId: string;
	defaultValues?: Partial<VentaFormValues>;
};

const initialState: VentaActionState = {
	error: null,
	success: null,
};

function sectionFieldClass() {
	return "w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300";
}

export function VentaForm({ trabajoId, quotationTrabajoId, defaultValues = {} }: VentaFormProps) {
	const [state, formAction, isPending] = useActionState(saveTrabajoVentaAction, initialState);

	return (
		<form action={formAction} className="space-y-4">
			<input type="hidden" name="trabajo_id" value={trabajoId} />
			<input type="hidden" name="quotation_trabajo_id" value={quotationTrabajoId} />

			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-2.5">
					<label
						htmlFor="confirmed_on"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Fecha de confirmación
					</label>
					<input
						id="confirmed_on"
						name="confirmed_on"
						type="date"
						defaultValue={defaultValues.confirmed_on}
						required
						className={sectionFieldClass()}
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="agreed_amount"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Monto acordado
					</label>
					<input
						id="agreed_amount"
						name="agreed_amount"
						type="number"
						step="0.01"
						min="0"
						defaultValue={defaultValues.agreed_amount}
						required
						className={sectionFieldClass()}
					/>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="notes"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Notas
					</label>
					<textarea
						id="notes"
						name="notes"
						defaultValue={defaultValues.notes}
						required
						rows={4}
						className={sectionFieldClass()}
					/>
				</div>
			</div>

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

			<button
				type="submit"
				disabled={isPending}
				className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--brand)] px-5 py-3.5 text-sm font-medium text-white transition duration-200 ease-out hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70"
			>
				{isPending ? "Guardando..." : "Confirmar venta"}
			</button>
		</form>
	);
}