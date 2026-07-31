import Link from "next/link";

import { MotionSafe } from "@/components/ui/motion-safe";

export function SetupNotice() {
	return (
		<MotionSafe>
			<section className="overflow-hidden rounded-[28px] border border-amber-200 bg-[linear-gradient(135deg,rgba(255,247,221,0.95),rgba(255,255,255,0.98))] p-6 text-[var(--foreground)] shadow-[0_20px_60px_rgba(120,74,0,0.08)]">
				<div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
					<div className="max-w-2xl">
						<p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-700">
							Configuración pendiente
						</p>
						<h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
							Conecta Supabase antes de habilitar los accesos protegidos
						</h2>
						<p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
							Agrega las claves del proyecto en{" "}
							<code className="rounded bg-white px-1.5 py-0.5 text-[var(--brand-deep)]">
								.env.local
							</code>{" "}
							y configura los usuarios iniciales en Supabase Auth. En cuanto el
							entorno esté completo, la validación del servidor protegerá la
							sesión automáticamente.
						</p>
					</div>

					<div className="flex flex-wrap gap-3">
						<Link
							href="/auth/sign-in"
							className="rounded-full bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_16px_30px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
						>
							Ir al acceso
						</Link>
						<Link
							href="/"
							className="rounded-full border border-amber-200 bg-white px-4 py-2.5 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-amber-300"
						>
							Volver al inicio
						</Link>
					</div>
				</div>
			</section>
		</MotionSafe>
	);
}
