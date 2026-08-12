"use client";

import { useActionState } from "react";

import { ActionButton } from "@/components/ui/action-button";
import { Alert } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/field";
import {
	updateCompanySettingsAction,
	type CompanySettingsActionState,
} from "@/features/settings/actions";
import type { CompanySettings } from "@/types/quotation";

type CompanySettingsFormProps = {
	defaultValues: CompanySettings;
	canSave: boolean;
};

const initialState: CompanySettingsActionState = {
	error: null,
	success: false,
};

export function CompanySettingsForm({
	defaultValues,
	canSave,
}: CompanySettingsFormProps) {
	const [state, formAction, isPending] = useActionState(
		updateCompanySettingsAction,
		initialState,
	);

	return (
		<form action={formAction} className="space-y-7">
			<div className="grid gap-5 md:grid-cols-2">
				<Field
					className="md:col-span-2"
					htmlFor="company_name"
					label="Nombre de la empresa"
					hint="Aparecerá como encabezado en las cotizaciones."
				>
					<Input
						id="company_name"
						name="company_name"
						defaultValue={defaultValues.company_name}
						required
						placeholder="Ej. EcoTienda"
					/>
				</Field>

				<Field
					htmlFor="slogan"
					label="Eslogan"
					hint="Texto breve de presentación."
				>
					<Input
						id="slogan"
						name="slogan"
						defaultValue={defaultValues.slogan}
						placeholder="Soluciones sustentables para tu hogar"
					/>
				</Field>

				<Field
					htmlFor="contact_name"
					label="Persona de contacto"
					hint="Nombre que se mostrará en los documentos."
				>
					<Input
						id="contact_name"
						name="contact_name"
						defaultValue={defaultValues.contact_name}
						placeholder="Nombre del responsable"
					/>
				</Field>
			</div>

			<div className="border-t border-[var(--border-soft)] pt-7">
				<div className="mb-5">
					<h3 className="text-base font-semibold text-[var(--brand-deep)]">
						Datos de contacto
					</h3>
					<p className="mt-1 text-sm leading-6 text-[var(--muted)]">
						Información que utilizarán tus clientes para comunicarse contigo.
					</p>
				</div>

				<div className="grid gap-5 md:grid-cols-2">
					<Field htmlFor="email" label="Correo electrónico">
						<Input
							id="email"
							name="email"
							type="email"
							defaultValue={defaultValues.email}
							placeholder="contacto@ejemplo.com"
						/>
					</Field>

					<Field htmlFor="phone" label="Teléfono">
						<Input
							id="phone"
							name="phone"
							defaultValue={defaultValues.phone}
							placeholder="(656) 123 4567"
						/>
					</Field>

					<Field htmlFor="fax" label="Fax" hint="Opcional.">
						<Input
							id="fax"
							name="fax"
							defaultValue={defaultValues.fax}
							placeholder="Número de fax"
						/>
					</Field>
				</div>
			</div>

			<div className="border-t border-[var(--border-soft)] pt-7">
				<div className="mb-5">
					<h3 className="text-base font-semibold text-[var(--brand-deep)]">
						Domicilio
					</h3>
					<p className="mt-1 text-sm leading-6 text-[var(--muted)]">
						Se mostrará en el encabezado y pie de tus documentos.
					</p>
				</div>

				<div className="grid gap-5 md:grid-cols-2">
					<Field className="md:col-span-2" htmlFor="address" label="Dirección">
						<Input
							id="address"
							name="address"
							defaultValue={defaultValues.address}
							placeholder="Calle, número y colonia"
						/>
					</Field>

					<Field htmlFor="city" label="Ciudad">
						<Input
							id="city"
							name="city"
							defaultValue={defaultValues.city}
							placeholder="Ciudad"
						/>
					</Field>

					<Field htmlFor="state" label="Estado">
						<Input
							id="state"
							name="state"
							defaultValue={defaultValues.state}
							placeholder="Estado"
						/>
					</Field>

					<Field htmlFor="zip_code" label="Código postal">
						<Input
							id="zip_code"
							name="zip_code"
							inputMode="numeric"
							defaultValue={defaultValues.zip_code}
							placeholder="44100"
						/>
					</Field>
				</div>
			</div>

			<div className="border-t border-[var(--border-soft)] pt-7">
				<Field
					htmlFor="payment_terms_days"
					label="Días de pago"
					hint="Valor predeterminado que se utilizará en futuras cotizaciones."
				>
					<Input
						id="payment_terms_days"
						name="payment_terms_days"
						type="number"
						min={0}
						max={365}
						step={1}
						defaultValue={defaultValues.payment_terms_days}
					/>
				</Field>
			</div>

			{state.error ? <Alert>{state.error}</Alert> : null}
			{state.success ? (
				<p
					role="status"
					className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm leading-6 text-emerald-800"
				>
					Los datos de la empresa se guardaron correctamente.
				</p>
			) : null}

			<div className="flex flex-col gap-3 border-t border-[var(--border-soft)] pt-6 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-xs leading-5 text-[var(--muted)]">
					Los cambios afectarán las próximas cotizaciones que generes.
				</p>
				<ActionButton
					type="submit"
					disabled={!canSave || isPending}
					pendingLabel="Guardando..."
					className="ui-primary-action w-full sm:w-auto"
				>
					Guardar cambios
				</ActionButton>
			</div>
		</form>
	);
}
