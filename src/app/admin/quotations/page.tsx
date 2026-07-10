import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

export default async function QuotationsPage() {
	if (hasSupabaseEnv()) {
		await requireRole(["admin"]);
	}

	return (
		<AppShell
			role="admin"
			title="Cotizaciones"
			description="La Fase 2 implementará aquí la navegación del catálogo, los cálculos y la exportación de cotizaciones."
		>
			<section className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-sm leading-7 text-slate-300">
				Este espacio reservado mantiene el futuro módulo de Darian dentro de la
				estructura compartida de la Fase 0.
			</section>
		</AppShell>
	);
}
