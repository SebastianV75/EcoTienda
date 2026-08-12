import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { CompanySettingsForm } from "@/features/settings/company-settings-form";
import { getCompanySettings } from "@/features/settings/data";
import { hasSupabaseEnv } from "@/lib/env";

export default async function SettingsPage() {
	const user = hasSupabaseEnv() ? await requireRole(["admin"]) : null;
	const { settings, error } = await getCompanySettings();
	const canSave = Boolean(settings) && hasSupabaseEnv() && !error;

	return (
		<AppShell
			role="admin"
			title="Configuración"
			description="Administra la identidad de tu empresa y la información que aparecerá en tus documentos."
			email={user?.email}
		>
			<div className="space-y-5">
				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
					<div className="mb-7 max-w-2xl">
						<p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--brand-strong)]">
							Configuración general
						</p>
						<h1 className="mt-2 text-2xl font-semibold tracking-display text-[var(--brand-deep)]">
							Mi empresa
						</h1>
						<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
							Mantén actualizados los datos que tus clientes verán en las
							cotizaciones y documentos generados desde EcoTienda.
						</p>
					</div>

					{error ? (
						<div className="mb-6 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm leading-6 text-amber-900">
							{error}
						</div>
					) : null}

					{settings ? (
						<CompanySettingsForm defaultValues={settings} canSave={canSave} />
					) : (
						<div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm leading-6 text-rose-800">
							No se puede mostrar el formulario hasta resolver el problema de
							configuración.
						</div>
					)}
				</section>
			</div>
		</AppShell>
	);
}
