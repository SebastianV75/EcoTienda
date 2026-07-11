import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

export default async function VisitsPage() {
	if (hasSupabaseEnv()) {
		await requireRole(["admin"]);
	}

	return (
		<AppShell
			role="admin"
			title="Visitas técnicas"
			description="La Fase 3 implementará aquí la agenda, los formularios de campo y los reportes de visita."
		>
			<section className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-sm leading-7 text-slate-300">
				Esta ruta ya existe para que el módulo futuro caiga dentro de la
				estructura protegida correcta.
			</section>
		</AppShell>
	);
}
