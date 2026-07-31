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
					className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--brand-strong)]"
				>
					Correo electrónico
				</label>
				<Input
					id="email"
					name="email"
					type="email"
					required
					autoComplete="email"
					className="w-full rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3.5 text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition duration-200 ease-out placeholder:text-[var(--muted)]/70 focus:border-emerald-300 focus:bg-white focus-visible:ring-4 focus-visible:ring-emerald-100 sm:py-4"
					placeholder="tu-correo@ecotienda.com"
				/>
			</div>

			<div className="space-y-2">
				<label
					htmlFor="password"
					className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--brand-strong)]"
				>
					Contraseña
				</label>
				<Input
					id="password"
					name="password"
					type="password"
					required
					autoComplete="current-password"
					className="w-full rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3.5 text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition duration-200 ease-out placeholder:text-[var(--muted)]/70 focus:border-emerald-300 focus:bg-white focus-visible:ring-4 focus-visible:ring-emerald-100 sm:py-4"
					placeholder="Ingresa tu contraseña"
				/>
			</div>

			{state.error ? <Alert>{state.error}</Alert> : null}

			<ActionButton
				type="submit"
				pendingLabel="Ingresando..."
				className="w-full rounded-full bg-[linear-gradient(180deg,var(--brand),var(--brand-strong))] px-5 py-3.5 font-semibold text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
			>
				Entrar al sistema
			</ActionButton>
		</form>
	);
}
