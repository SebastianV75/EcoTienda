import { AppShell } from "@/components/app-shell";
import { SetupNotice } from "@/components/setup-notice";
import { getCurrentUser, requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

const adminHighlights = [
	"La autenticación y la protección por roles ya están listas para integrarse con los módulos reales.",
	"Descargables se mantiene como el primer módulo a liberar después de la Fase 0.",
	"Cotizaciones y visitas técnicas ya cuentan con rutas base para conservar la estructura del sistema.",
];

export default async function AdminPage() {
	const user = hasSupabaseEnv()
		? await requireRole(["admin"])
		: await getCurrentUser();

	return (
		<AppShell
			role="admin"
			title="Base de administración"
			description="Estructura compartida para descargables, cotizaciones, visitas y configuración."
			email={user?.email}
		>
			{!hasSupabaseEnv() ? <SetupNotice /> : null}

			<section className="grid gap-4 md:grid-cols-3">
				{adminHighlights.map((item) => (
					<article
						key={item}
						className="rounded-3xl border border-white/10 bg-white/5 p-5"
					>
						<p className="text-sm leading-7 text-slate-300">{item}</p>
					</article>
				))}
			</section>
		</AppShell>
	);
}
