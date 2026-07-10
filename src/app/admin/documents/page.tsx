import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

export default async function DocumentsPage() {
	if (hasSupabaseEnv()) {
		await requireRole(["admin"]);
	}

	return (
		<AppShell
			role="admin"
			title="Descargables"
			description="La Fase 1 implementará aquí los flujos de plantillas internas y generación de PDF."
		>
			<section className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-sm leading-7 text-slate-300">
				Esta ruta ya está activa y protegida con la misma base de permisos del
				área administrativa.
			</section>
		</AppShell>
	);
}
