"use client";

import { useActionState } from "react";

import { ActionButton } from "@/components/ui/action-button";
import { Alert } from "@/components/ui/feedback";
import { Input } from "@/components/ui/field";
import {
	resetPasswordAction,
	type ResetPasswordActionState,
} from "@/features/auth/reset-password-actions";

const initialState: ResetPasswordActionState = { error: null };

export function ResetPasswordForm() {
	const [state, formAction] = useActionState(resetPasswordAction, initialState);

	return (
		<form action={formAction} className="space-y-5 sm:space-y-6">
			<div className="space-y-2">
				<label
					htmlFor="reset-password"
					className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--brand-strong)]"
				>
					Nueva contraseña
				</label>
				<Input
					id="reset-password"
					name="password"
					type="password"
					required
					minLength={8}
					maxLength={72}
					autoComplete="new-password"
					placeholder="Mínimo 8 caracteres"
				/>
			</div>

			<div className="space-y-2">
				<label
					htmlFor="reset-password-confirmation"
					className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--brand-strong)]"
				>
					Confirmar contraseña
				</label>
				<Input
					id="reset-password-confirmation"
					name="password_confirmation"
					type="password"
					required
					minLength={8}
					maxLength={72}
					autoComplete="new-password"
					placeholder="Repite la contraseña"
				/>
			</div>

			{state.error ? <Alert>{state.error}</Alert> : null}

			<ActionButton
				type="submit"
				pendingLabel="Guardando..."
				className="w-full rounded-full bg-[linear-gradient(180deg,var(--brand),var(--brand-strong))] px-5 py-3.5 font-semibold text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
			>
				Guardar nueva contraseña
			</ActionButton>
		</form>
	);
}
