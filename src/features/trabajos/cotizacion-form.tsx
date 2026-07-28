"use client";

import { useActionState } from "react";

import {
	saveTrabajoCotizacionAction,
	type CotizacionActionState,
	type CotizacionFormValues,
} from "./trabajo-stage-actions";

type CotizacionFormProps = {
	trabajoId: string;
	defaultValues: Partial<Omit<CotizacionFormValues, "amount">> & { amount?: number | null };
};

const initialState: CotizacionActionState = {
	error: null,
	success: null,
};

function sectionFieldClass() {
	return "w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300";
}

export function CotizacionForm({ trabajoId, defaultValues }: CotizacionFormProps) {
	const [state, formAction, isPending] = useActionState(
		saveTrabajoCotizacionAction,
		initialState,
	);

	return (
		<form action={formAction} className="space-y-5">
			<input type="hidden" name="trabajo_id" value={trabajoId} />

			<div className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
				<p>
					<span className="font-medium text-[var(--brand-deep)]">Etapa actual:</span>{" "}
					Cotización. <span className="font-medium text-[var(--brand-deep)]">Siguiente etapa:</span>{" "}
					Venta.
				</p>
				<p className="mt-1">
					Completa el alcance, monto, términos, resultado, tipo de cotización y los datos fiscales del trabajo.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-2.5">
					<label htmlFor="rfc" className="text-sm font-medium text-[var(--brand-deep)]">
						RFC
					</label>
					<input
						id="rfc"
						name="rfc"
						defaultValue={defaultValues.rfc ?? ""}
						required
						className={sectionFieldClass()}
						placeholder="RFC del trabajo"
					/>
				</div>

				<div className="space-y-2.5">
					<label htmlFor="rpu" className="text-sm font-medium text-[var(--brand-deep)]">
						RPU
					</label>
					<input
						id="rpu"
						name="rpu"
						defaultValue={defaultValues.rpu ?? ""}
						required
						className={sectionFieldClass()}
						placeholder="Número de servicio"
					/>
				</div>

				<div className="space-y-2.5">
					<label htmlFor="quotation_type" className="text-sm font-medium text-[var(--brand-deep)]">
						Tipo de cotización
					</label>
					<input
						id="quotation_type"
						name="quotation_type"
						defaultValue={defaultValues.quotation_type ?? ""}
						required
						className={sectionFieldClass()}
						placeholder="Residencial, minisplit, comercial"
					/>
				</div>

				<div className="space-y-2.5">
					<label htmlFor="amount" className="text-sm font-medium text-[var(--brand-deep)]">
						Monto
					</label>
					<input
						id="amount"
						name="amount"
						type="number"
						step="0.01"
						min="0"
						defaultValue={defaultValues.amount ?? ""}
						required
						className={sectionFieldClass()}
						placeholder="0.00"
					/>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label htmlFor="scope_summary" className="text-sm font-medium text-[var(--brand-deep)]">
						Alcance
					</label>
					<textarea
						id="scope_summary"
						name="scope_summary"
						defaultValue={defaultValues.scope_summary ?? ""}
						required
						rows={4}
						className={sectionFieldClass()}
						placeholder="Describe el alcance de la cotización"
					/>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label htmlFor="terms_and_conditions" className="text-sm font-medium text-[var(--brand-deep)]">
						Términos y condiciones
					</label>
					<textarea
						id="terms_and_conditions"
						name="terms_and_conditions"
						defaultValue={defaultValues.terms_and_conditions ?? ""}
						required
						rows={4}
						className={sectionFieldClass()}
						placeholder="Condiciones comerciales y de pago"
					/>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label htmlFor="outcome" className="text-sm font-medium text-[var(--brand-deep)]">
						Resultado
					</label>
					<textarea
						id="outcome"
						name="outcome"
						defaultValue={defaultValues.outcome ?? ""}
						required
						rows={3}
						className={sectionFieldClass()}
						placeholder="Resultado esperado de la cotización"
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
				{isPending ? "Guardando..." : "Guardar cotización"}
			</button>
		</form>
	);
}
