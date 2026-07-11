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
		<main className="px-2 py-2 sm:px-4 sm:py-4">
			<section className="mx-auto flex min-h-[calc(100vh-16px)] w-full max-w-md items-center justify-center rounded-[28px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.9)] p-3 shadow-[var(--shadow)] backdrop-blur-sm sm:max-w-lg sm:p-4 lg:min-h-[calc(100vh-32px)] lg:max-w-5xl lg:p-6">
				<div className="grid w-full overflow-hidden rounded-[24px] bg-white lg:grid-cols-[0.92fr_1.08fr] lg:rounded-[32px]">
					<div className="hidden bg-[linear-gradient(160deg,#0d4f2e_0%,#166122_45%,#2fb314_100%)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
						<div>
							<div className="inline-flex rounded-[24px] bg-white p-3 shadow-xl shadow-black/15">
								<Image
									src="/ecotienda-logo-temp.png"
									alt="Logo temporal de EcoTienda"
									width={112}
									height={84}
									className="h-auto w-[96px] object-contain"
									priority
								/>
							</div>
							<p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/85">
								EcoTienda
							</p>
							<h1 className="mt-4 max-w-sm text-4xl font-semibold tracking-[-0.06em] text-balance lg:text-[3.1rem] lg:leading-[1.02]">
								Acceso interno simple, claro y seguro
							</h1>
							<p className="mt-5 max-w-md text-sm leading-7 text-emerald-50/90 sm:text-base">
								Entra con tu cuenta para continuar con documentos, cotizaciones
								y seguimiento técnico desde una sola plataforma.
							</p>
						</div>

						<p className="max-w-sm text-sm leading-6 text-emerald-50/80">
							Diseñado para administración y operación técnica con una
							experiencia más limpia y enfocada.
						</p>
					</div>

					<div className="flex items-center p-4 sm:p-6 lg:p-10">
						<div className="w-full rounded-[22px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:rounded-[26px] sm:p-7 lg:border-0 lg:p-0 lg:shadow-none">
							<div className="lg:hidden">
								<div className="flex items-center gap-3">
									<div className="inline-flex rounded-[18px] bg-[var(--surface-strong)] p-2.5">
										<Image
											src="/ecotienda-logo-temp.png"
											alt="Logo temporal de EcoTienda"
											width={80}
											height={60}
											className="h-auto w-[64px] object-contain"
											priority
										/>
									</div>
									<div>
										<p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--brand-strong)]">
											EcoTienda
										</p>
										<p className="mt-1 text-sm text-[var(--muted)]">
											Acceso interno
										</p>
									</div>
								</div>
								<h1 className="mt-5 text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] sm:text-3xl">
									Inicia sesión con tu cuenta
								</h1>
								<p className="mt-3 text-sm leading-6 text-[var(--muted)]">
									Continúa con tus tareas desde una plataforma centralizada.
								</p>
							</div>

							<div className="hidden lg:block">
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
									Acceso de usuarios
								</p>
								<h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)]">
									Inicia sesión con tu cuenta asignada
								</h2>
								<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
									Usa tus credenciales para entrar al área administrativa o al
									espacio móvil de trabajo según tu perfil.
								</p>
							</div>

							{isConfigured ? (
								<SignInForm />
							) : (
								<div className="mt-6 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900 sm:mt-8 sm:rounded-[20px]">
									El acceso no está disponible temporalmente. Completa la
									configuración del entorno para habilitar el inicio de sesión.
								</div>
							)}

							<div className="mt-6 flex flex-col gap-3 text-sm text-[var(--muted)] sm:flex-row sm:flex-wrap sm:items-center">
								<Link
									href="/"
									className="font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:text-[var(--brand-strong)]"
								>
									Volver al inicio
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
