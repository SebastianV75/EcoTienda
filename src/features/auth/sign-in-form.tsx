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
		<form action={formAction} className="mt-6 space-y-4">
			<div className="space-y-2">
				<label htmlFor="email" className="text-sm font-medium text-slate-200">
					Correo electrónico
				</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					autoComplete="email"
					className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400"
					placeholder="admin@ecotienda.com"
				/>
			</div>

			<div className="space-y-2">
				<label
					htmlFor="password"
					className="text-sm font-medium text-slate-200"
				>
					Contraseña
				</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					autoComplete="current-password"
					className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400"
					placeholder="••••••••"
				/>
			</div>

			{state.error ? (
				<p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
					{state.error}
				</p>
			) : null}

			<button
				type="submit"
				disabled={isPending}
				className="w-full rounded-full bg-emerald-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
			>
				{isPending ? "Ingresando..." : "Entrar"}
			</button>
		</form>
	);
}
