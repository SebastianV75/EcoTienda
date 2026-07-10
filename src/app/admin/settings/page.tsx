import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

export default async function SettingsPage() {
	if (hasSupabaseEnv()) {
		await requireRole(["admin"]);
	}

	return (
		<AppShell
			role="admin"
			title="Configuración"
			description="La configuración general, la gestión de usuarios y el control de la plataforma crecerán desde esta área."
		>
			<section className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-sm leading-7 text-slate-300">
				La Fase 0 solo deja lista la estructura, los permisos y la guía base de
				configuración.
			</section>
		</AppShell>
	);
}
