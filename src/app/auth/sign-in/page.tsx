import Link from "next/link";
import { redirect } from "next/navigation";

import { SignInForm } from "@/features/auth/sign-in-form";
import {
	getCurrentUser,
	getDefaultRouteForRole,
} from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

export default async function SignInPage() {
	const isConfigured = hasSupabaseEnv();
	const user = isConfigured ? await getCurrentUser() : null;

	if (user) {
		redirect(getDefaultRouteForRole(user.role));
	}

	return (
		<main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
			<div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/40 sm:p-8">
				<p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
					Acceso
				</p>
				<h1 className="mt-3 text-3xl font-semibold tracking-tight">Iniciar sesión</h1>
				<p className="mt-3 text-sm leading-7 text-slate-300">
					Usa una cuenta con correo y contraseña de Supabase para entrar a la
					plataforma. Los administradores entran al panel principal y los
					écnicos al área móvil de trabajo.
				</p>

				<div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
					<p>
						Estado del entorno:{" "}
						<span className="font-medium text-white">
							{isConfigured ? "configurado" : "faltan claves"}
						</span>
					</p>
					<p className="mt-2">
						Claves requeridas: <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
						<code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>
					</p>
				</div>

				{isConfigured ? (
					<SignInForm />
				) : (
					<p className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
						Todavía faltan las claves de Supabase en este entorno.
					</p>
				)}

				<div className="mt-6 flex flex-wrap gap-3">
					<Link
						href="/"
						className="rounded-full border border-white/15 px-4 py-2 font-medium text-white transition hover:border-white/40"
					>
						Volver al inicio
					</Link>
				</div>
			</div>
		</main>
	);
}
