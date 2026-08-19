"use client";

import { useActionState } from "react";

import { Alert } from "@/components/ui/feedback";
import { ActionButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/field";
import { type AuthActionState, signInAction } from "@/features/auth/actions";

const initialState: AuthActionState = {
	error: null,
};

export function SignInForm() {
	const [state, formAction] = useActionState(signInAction, initialState);

	return (
		<form action={formAction} className="space-y-5 sm:space-y-6">
			<div className="space-y-2">
				<label
					htmlFor="email"
						className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-deep)]"
				>
					Correo electrónico
				</label>
				<Input
					id="email"
					name="email"
					type="email"
					required
					autoComplete="email"
						className="w-full rounded-[4px] border border-[rgba(13,79,46,0.18)] bg-white px-4 py-3.5 text-[var(--foreground)] shadow-[0_8px_22px_rgba(10,44,21,0.03)] outline-none transition-[border-color,box-shadow,background-color] duration-200 ease-out placeholder:text-[var(--muted)]/65 focus:border-[var(--brand-strong)] focus:bg-white focus-visible:ring-4 focus-visible:ring-emerald-100 sm:py-4"
					placeholder="tu-correo@ecotienda.com"
				/>
			</div>

			<div className="space-y-2">
				<label
					htmlFor="password"
						className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-deep)]"
				>
					Contraseña
				</label>
				<Input
					id="password"
					name="password"
					type="password"
					required
					autoComplete="current-password"
						className="w-full rounded-[4px] border border-[rgba(13,79,46,0.18)] bg-white px-4 py-3.5 text-[var(--foreground)] shadow-[0_8px_22px_rgba(10,44,21,0.03)] outline-none transition-[border-color,box-shadow,background-color] duration-200 ease-out placeholder:text-[var(--muted)]/65 focus:border-[var(--brand-strong)] focus:bg-white focus-visible:ring-4 focus-visible:ring-emerald-100 sm:py-4"
					placeholder="Ingresa tu contraseña"
				/>
			</div>

			{state.error ? <Alert>{state.error}</Alert> : null}

			<ActionButton
				type="submit"
				pendingLabel="Ingresando..."
				className="w-full rounded-[4px] bg-[var(--brand-deep)] px-5 py-3.5 font-semibold text-white shadow-[0_18px_35px_rgba(13,79,46,0.2)] transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[var(--brand-strong)] hover:shadow-[0_22px_40px_rgba(13,79,46,0.24)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
			>
				Entrar al sistema
			</ActionButton>
		</form>
	);
}
