import Image from "next/image";
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
		<main className="px-3 py-3 sm:px-5 sm:py-5">
			<section className="mx-auto grid min-h-[calc(100vh-24px)] w-full max-w-6xl overflow-hidden rounded-[34px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.84)] shadow-[var(--shadow)] backdrop-blur-sm lg:grid-cols-[0.95fr_1.05fr]">
				<div className="relative overflow-hidden bg-[linear-gradient(155deg,#0d4f2e,#1b6b12_55%,#2fb314)] p-6 text-white sm:p-8 lg:p-10">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%)]" />
					<div className="relative">
						<div className="inline-flex rounded-[26px] bg-white p-3 shadow-xl shadow-black/15">
							<Image
								src="/ecotienda-logo-temp.png"
								alt="Logo temporal de EcoTienda"
								width={120}
								height={88}
								className="h-auto w-[96px] object-contain"
								priority
							/>
						</div>

						<p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/85">
							Acceso seguro
						</p>
						<h1 className="mt-4 max-w-md text-4xl font-semibold tracking-[-0.06em] text-balance sm:text-5xl">
							Entra al centro operativo de EcoTienda
						</h1>
						<p className="mt-5 max-w-lg text-sm leading-7 text-emerald-50/90 sm:text-base">
							Esta base ya conecta autenticación, permisos y navegación principal.
							 Desde aquí cada usuario entra al área que le corresponde.
						</p>
					</div>
				</div>

				<div className="flex items-center p-6 sm:p-8 lg:p-10">
					<div className="w-full rounded-[30px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							Iniciar sesión
						</p>
						<h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)]">
							Accede con tu cuenta asignada
						</h2>
						<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
							Los administradores entran al panel principal y los técnicos al área
							móvil de trabajo.
						</p>

						<div className="mt-6 rounded-[24px] border border-emerald-100 bg-[var(--surface-strong)] p-4 text-sm text-[var(--brand-deep)]">
							<p>
								Estado del entorno:{" "}
								<span className="font-medium">
									{isConfigured ? "configurado" : "faltan claves"}
								</span>
							</p>
							<p className="mt-2 text-[13px] leading-6 text-[var(--muted)]">
								Claves requeridas: <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>
							</p>
						</div>

						{isConfigured ? (
							<SignInForm />
						) : (
							<p className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
								Todavía faltan las claves de Supabase en este entorno.
							</p>
						)}

						<div className="mt-6 flex flex-wrap gap-3">
							<Link
								href="/"
								className="rounded-full border border-[var(--border-soft)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
							>
								Volver al inicio
							</Link>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
