"use client";

import { useActionState } from "react";

import { type AuthActionState, signInAction } from "@/features/auth/actions";

const initialState: AuthActionState = {
	error: null,
};

export function SignInForm() {
	const [state, formAction, isPending] = useActionState(
		signInAction,
		initialState,
	);

	return (
		<form action={formAction} className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
			<div className="space-y-2.5">
				<label
					htmlFor="email"
					className="text-sm font-medium text-[var(--brand-deep)]"
				>
					Correo electrónico
				</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					autoComplete="email"
					className="w-full rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out placeholder:text-[var(--muted)]/70 focus:border-emerald-300 focus:bg-white sm:rounded-[20px] sm:py-3.5"
					placeholder="tu-correo@ecotienda.com"
				/>
			</div>

			<div className="space-y-2.5">
				<label
					htmlFor="password"
					className="text-sm font-medium text-[var(--brand-deep)]"
				>
					Contraseña
				</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					autoComplete="current-password"
					className="w-full rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out placeholder:text-[var(--muted)]/70 focus:border-emerald-300 focus:bg-white sm:rounded-[20px] sm:py-3.5"
					placeholder="Ingresa tu contraseña"
				/>
			</div>

			{state.error ? (
				<p className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:rounded-[20px]">
					{state.error}
				</p>
			) : null}

			<button
				type="submit"
				disabled={isPending}
				className="w-full rounded-full bg-[var(--brand)] px-5 py-3.5 font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70"
			>
				{isPending ? "Ingresando..." : "Entrar al sistema"}
			</button>
		</form>
	);
}
