import { AppShell } from "@/components/app-shell";
import { getCurrentUser, requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

export default async function TechnicianPage() {
	const user = hasSupabaseEnv()
		? await requireRole(["admin", "technician"])
		: await getCurrentUser();

	return (
		<AppShell
			role="technician"
			title="Área móvil del técnico"
			description="Este espacio base de la Fase 0 marca la zona protegida para el trabajo de campo desde celular."
			email={user?.email}
		>
			<section className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-sm leading-7 text-slate-300">
				En las siguientes fases esta área se conectará con visitas asignadas,
				captura de geolocalización y reportes de trabajo.
			</section>
		</AppShell>
	);
}
