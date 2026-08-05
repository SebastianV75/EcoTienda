import Link from "next/link";

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
			<section className="rounded-panel border border-[var(--border-soft)] bg-white p-6 shadow-panel sm:p-8">
				<div className="max-w-2xl">
					<p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--brand-strong)]">
						Próximamente
					</p>
					<h1 className="mt-2 text-2xl font-semibold tracking-display text-[var(--brand-deep)]">
						Configuración en preparación
					</h1>
					<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
						Esta sección reunirá las preferencias de la operación, usuarios y
						permisos. Por ahora, la administración diaria ya está disponible
						desde las áreas principales del panel.
					</p>
					<div className="mt-5 flex flex-wrap gap-2">
						<Link href="/admin" className="ui-primary-action">
							Volver al tablero
						</Link>
						<Link href="/admin/workers" className="ui-secondary-action">
							Gestionar trabajadores
						</Link>
					</div>
				</div>
			</section>
		</AppShell>
	);
}
