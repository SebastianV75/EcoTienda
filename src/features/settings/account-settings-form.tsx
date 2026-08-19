"use client";

import { useActionState } from "react";

import { ActionButton } from "@/components/ui/action-button";
import { Alert } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/field";
import {
	updateAccountSettingsAction,
	requestPasswordResetAction,
	type AccountSettingsActionState,
	type PasswordResetRequestState,
} from "@/features/settings/account-actions";

type AccountSettingsFormProps = {
	defaultValues: {
		username: string;
		fullName: string;
		email: string;
		phone: string;
		personalData: string;
	};
};

const initialState: AccountSettingsActionState = {
	error: null,
	success: false,
	emailConfirmationPending: false,
};

const initialPasswordResetState: PasswordResetRequestState = {
	error: null,
	success: false,
};

export function AccountSettingsForm({ defaultValues }: AccountSettingsFormProps) {
	const [state, formAction, isPending] = useActionState(
		updateAccountSettingsAction,
		initialState,
	);
	const [passwordResetState, passwordResetAction, isPasswordResetPending] =
		useActionState(requestPasswordResetAction, initialPasswordResetState);

	return (
		<form action={formAction} className="space-y-7">
			<div className="grid gap-5 md:grid-cols-2">
				<Field
					htmlFor="username"
					label="Nombre de usuario"
					hint="Es el nombre con el que identificarás tu cuenta dentro de EcoTienda."
				>
					<Input
						id="username"
						name="username"
						defaultValue={defaultValues.username}
						required
						autoComplete="username"
						placeholder="Ej. Darian"
					/>
				</Field>

				<Field
					className="md:col-span-2"
					htmlFor="full_name"
					label="Nombre completo"
					hint="Se sincroniza con tu perfil operativo."
				>
					<Input
						id="full_name"
						name="full_name"
						defaultValue={defaultValues.fullName}
						required
						autoComplete="name"
						placeholder="Nombre y apellidos"
					/>
				</Field>

				<Field
					htmlFor="email"
					label="Correo electrónico"
					hint="Si lo cambias, recibirás un correo para confirmarlo."
				>
					<Input
						id="email"
						name="email"
						type="email"
						defaultValue={defaultValues.email}
						required
						autoComplete="email"
						placeholder="tu-correo@ecotienda.com"
					/>
				</Field>

				<Field htmlFor="phone" label="Teléfono / celular" hint="Opcional.">
					<Input
						id="phone"
						name="phone"
						defaultValue={defaultValues.phone}
						type="tel"
						autoComplete="tel"
						placeholder="614 123 4567"
					/>
				</Field>
			</div>

			<div className="border-t border-[var(--border-soft)] pt-7">
				<Field
					htmlFor="personal_data"
					label="Datos personales adicionales"
					hint="Opcional. Puedes agregar información personal útil para tu cuenta, como ciudad o contacto alterno. No incluyes contraseñas."
				>
					<Textarea
						id="personal_data"
						name="personal_data"
						defaultValue={defaultValues.personalData}
						maxLength={1000}
						placeholder="Escribe aquí información adicional…"
					/>
				</Field>
			</div>

			{state.error ? <Alert>{state.error}</Alert> : null}
			{state.success ? (
				<div className="space-y-2" role="status" aria-live="polite">
					<p className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm leading-6 text-emerald-800">
						Los datos de tu cuenta se guardaron correctamente.
					</p>
					{state.emailConfirmationPending ? (
						<p className="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm leading-6 text-amber-900">
							Revisa tu nuevo correo y confirma el cambio para activar la nueva dirección de acceso.
						</p>
					) : null}
				</div>
			) : null}

			<div className="flex flex-col gap-3 border-t border-[var(--border-soft)] pt-6 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-xs leading-5 text-[var(--muted)]">
					Tu rol de acceso solo puede cambiarlo un administrador.
				</p>
				<ActionButton
					type="submit"
					disabled={isPending}
					pendingLabel="Guardando..."
					className="ui-primary-action w-full sm:w-auto"
				>
					Guardar datos de cuenta
				</ActionButton>
			</div>

			<div className="border-t border-[var(--border-soft)] pt-7">
				<div className="mb-5">
					<h3 className="text-base font-semibold text-[var(--brand-deep)]">
						Seguridad de la cuenta
					</h3>
					<p className="mt-1 text-sm leading-6 text-[var(--muted)]">
						Te enviaremos un enlace al correo actual para crear una nueva contraseña.
					</p>
				</div>

				<div className="space-y-4">
					{passwordResetState.error ? <Alert>{passwordResetState.error}</Alert> : null}
					{passwordResetState.success ? (
						<p
							role="status"
							className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm leading-6 text-emerald-800"
						>
							Revisa tu correo actual. El enlace para restablecer la contraseña ya fue enviado.
						</p>
					) : null}
					<ActionButton
						type="submit"
						formAction={passwordResetAction}
						disabled={isPasswordResetPending}
						pendingLabel="Enviando..."
						className="ui-secondary-action w-full sm:w-auto"
					>
						Restablecer contraseña
					</ActionButton>
				</div>
			</div>
		</form>
	);
}
