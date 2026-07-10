import { AppShell } from "@/components/app-shell";
import { SetupNotice } from "@/components/setup-notice";
import { getCurrentUser, requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

const adminHighlights = [
	{
		title: "Permisos listos",
		description:
			"La autenticación y la separación por roles ya están preparadas para los módulos reales.",
	},
	{
		title: "Prioridad clara",
		description:
			"Descargables sigue siendo el primer módulo a liberar después de la Fase 0.",
	},
	{
		title: "Ruta de crecimiento",
		description:
			"Cotizaciones y visitas técnicas ya tienen una estructura base estable dentro del sistema.",
	},
];

export default async function AdminPage() {
	const user = hasSupabaseEnv()
		? await requireRole(["admin"])
		: await getCurrentUser();

	return (
		<AppShell
			role="admin"
			title="Base de administración"
			description="Una entrada más clara y profesional para operar descargables, cotizaciones, visitas y configuración."
			email={user?.email}
		>
			<div className="space-y-4">
				{!hasSupabaseEnv() ? <SetupNotice /> : null}

				<section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
					<div className="rounded-[28px] bg-[linear-gradient(135deg,#0d4f2e,#2fb314)] p-6 text-white shadow-[0_24px_60px_rgba(13,79,46,0.22)] sm:p-7">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100/80">
							Vista general
						</p>
						<h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-balance">
							La operación interna ya tiene una base mucho más seria
						</h3>
						<p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/90 sm:text-base">
							Esta pantalla ya no es solo un placeholder. Ahora marca la línea
							visual y funcional desde la que crecerán los módulos del sistema.
						</p>
					</div>

					<div className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							Estado
						</p>
						<h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
							Fase 0 activa
						</h3>
						<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
							La base técnica, la autenticación y la estructura visual ya están
							conectadas para dar el siguiente paso.
						</p>
					</div>
				</section>

				<section className="grid gap-4 md:grid-cols-3">
					{adminHighlights.map((item) => (
						<article
							key={item.title}
							className="rounded-[26px] border border-[var(--border-soft)] bg-white p-6 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(13,79,46,0.09)]"
						>
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
								{item.title}
							</p>
							<p className="mt-4 text-sm leading-7 text-[var(--muted)]">
								{item.description}
							</p>
						</article>
					))}
				</section>
			</div>
		</AppShell>
	);
}
