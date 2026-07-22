"use client";

import { useActionState, useState } from "react";

import {
	saveTrabajoVisitaAction,
	type VisitaActionState,
	type VisitaFormValues,
} from "./actions";
import { requiresMinisplitBranch } from "./rules";

type VisitaFormProps = {
	trabajoId: string;
	defaultValues: VisitaFormValues;
};

const initialState: VisitaActionState = {
	error: null,
	success: null,
};

function sectionFieldClass() {
	return "w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300";
}

export function VisitaForm({ trabajoId, defaultValues }: VisitaFormProps) {
	const [quotationType, setQuotationType] = useState(
		defaultValues.quotation_type,
	);
	const [state, formAction, isPending] = useActionState(
		saveTrabajoVisitaAction,
		initialState,
	);
	const showMinisplit = requiresMinisplitBranch(quotationType);

	return (
		<form action={formAction} className="space-y-5">
			<input type="hidden" name="trabajo_id" value={trabajoId} />

			<div className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
				<p>
					<span className="font-medium text-[var(--brand-deep)]">
						Etapa actual:
					</span>{" "}
					Visita.{" "}
					<span className="font-medium text-[var(--brand-deep)]">
						Siguiente etapa:
					</span>{" "}
					Cotización.
				</p>
				<p className="mt-1">
					Completá fecha, contacto, dirección confirmada, paquete, tipo de
					cotización, notas y datos de casa, eléctrico y techo.
					{showMinisplit
						? " Si el tipo pide minisplit, esa rama también es obligatoria."
						: ""}
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-2.5">
					<label
						htmlFor="execution_date"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Fecha de ejecución
					</label>
					<input
						id="execution_date"
						name="execution_date"
						type="date"
						defaultValue={defaultValues.execution_date}
						required
						className={sectionFieldClass()}
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="quotation_type"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Tipo de cotización
					</label>
					<input
						id="quotation_type"
						name="quotation_type"
						defaultValue={defaultValues.quotation_type}
						required
						onChange={(event) => setQuotationType(event.target.value)}
						className={sectionFieldClass()}
						placeholder="Residencial, minisplit, comercial"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="contact_name"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Contacto
					</label>
					<input
						id="contact_name"
						name="contact_name"
						defaultValue={defaultValues.contact_name}
						required
						className={sectionFieldClass()}
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="contact_phone"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Teléfono
					</label>
					<input
						id="contact_phone"
						name="contact_phone"
						defaultValue={defaultValues.contact_phone}
						required
						className={sectionFieldClass()}
					/>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="confirmed_address"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Dirección confirmada
					</label>
					<textarea
						id="confirmed_address"
						name="confirmed_address"
						defaultValue={defaultValues.confirmed_address}
						required
						rows={3}
						className={sectionFieldClass()}
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="interest_package"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Paquete de interés
					</label>
					<input
						id="interest_package"
						name="interest_package"
						defaultValue={defaultValues.interest_package}
						required
						className={sectionFieldClass()}
						placeholder="Residencial, comercial, respaldo"
					/>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="house_notes"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Datos de casa
					</label>
					<textarea
						id="house_notes"
						name="house_notes"
						defaultValue={defaultValues.house_notes}
						required
						rows={3}
						className={sectionFieldClass()}
					/>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="electrical_notes"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Datos eléctricos
					</label>
					<textarea
						id="electrical_notes"
						name="electrical_notes"
						defaultValue={defaultValues.electrical_notes}
						required
						rows={3}
						className={sectionFieldClass()}
					/>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="roof_notes"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Datos de techo
					</label>
					<textarea
						id="roof_notes"
						name="roof_notes"
						defaultValue={defaultValues.roof_notes}
						required
						rows={3}
						className={sectionFieldClass()}
					/>
				</div>

				{showMinisplit ? (
					<div className="space-y-2.5 md:col-span-2">
						<label
							htmlFor="minisplit_notes"
							className="text-sm font-medium text-[var(--brand-deep)]"
						>
							Datos minisplit
						</label>
						<textarea
							id="minisplit_notes"
							name="minisplit_notes"
							defaultValue={defaultValues.minisplit_notes}
							required
							rows={3}
							className={sectionFieldClass()}
						/>
					</div>
				) : null}

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
				{isPending ? "Guardando visita..." : "Guardar visita"}
			</button>
		</form>
	);
}
