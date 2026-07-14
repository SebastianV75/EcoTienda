import Link from "next/link";
import { redirect } from "next/navigation";

import { PreloginShell } from "@/features/auth/components/prelogin-shell";
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
		<PreloginShell
			eyebrow="Acceso interno"
			title="Inicia sesión con tu cuenta"
			description="Accede al espacio operativo de EcoTienda para continuar con documentos, cotizaciones y seguimiento técnico."
			primaryCta={
				<Link
					href="/"
					className="inline-flex items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-[var(--brand-strong)] hover:text-[var(--brand-strong)]"
				>
					Volver al inicio
				</Link>
			}
			secondaryContent={
				<p>Acceso serio, rápido y claro para administración y operación técnica.</p>
			}
		>
			<div className="rounded-[28px] border border-[var(--border-soft)] bg-white/95 p-5 shadow-[0_16px_50px_rgba(13,79,46,0.06)] sm:p-6 lg:p-7">
				<div className="space-y-2">
					<p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--brand-strong)]">
						Acceso de usuarios
					</p>
					<h2 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] sm:text-[2rem]">
						Ingresa tus credenciales
					</h2>
					<p className="max-w-md text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7">
						Usa tu correo y contraseña registrados. Si el entorno todavía no
						está configurado, verás un aviso aquí mismo.
					</p>
				</div>

				{isConfigured ? (
					<div className="mt-6">
						<SignInForm />
					</div>
				) : (
					<div className="mt-6 rounded-[20px] border border-amber-200 bg-amber-50/95 px-4 py-4 text-sm leading-6 text-amber-900">
						El acceso no está disponible temporalmente. Completa la
						configuración del entorno para habilitar el inicio de sesión.
					</div>
				)}
			</div>
		</PreloginShell>
	);
}
