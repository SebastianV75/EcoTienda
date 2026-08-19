import Link from "next/link";
import { redirect } from "next/navigation";

import { PreloginShell } from "@/features/auth/components/prelogin-shell";
import { SignInForm } from "@/features/auth/sign-in-form";
import {
	getCurrentUser,
	getDefaultRouteForRole,
} from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

export default async function SignInPage({
	searchParams,
}: {
	searchParams?: Promise<{ activated?: string; reset?: string }>;
}) {
	const isConfigured = hasSupabaseEnv();
	const user = isConfigured ? await getCurrentUser() : null;
	const params = searchParams ? await searchParams : undefined;

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
				<div className="border-t border-[rgba(13,79,46,0.14)] pt-7">
				<div className="space-y-2">
						<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
						Acceso de usuarios
					</p>
						<h2 className="text-3xl font-semibold tracking-[-0.07em] text-[var(--brand-deep)] sm:text-[2.65rem]">
						Ingresa tus credenciales
					</h2>
						<p className="max-w-md text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7">
						Usa tu correo y contraseña registrados. Si el entorno todavía no
						está configurado, verás un aviso aquí mismo.
					</p>
				</div>

				{isConfigured ? (
					<div className="mt-6">
							{params?.activated === "1" ? (
								<p className="mb-4 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
									Contraseña creada. Inicia sesión con el correo invitado y tu nueva contraseña.
								</p>
							) : null}
							{params?.reset === "1" ? (
								<p className="mb-4 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
									Contraseña restablecida. Inicia sesión con tu nueva contraseña.
								</p>
							) : null}
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
