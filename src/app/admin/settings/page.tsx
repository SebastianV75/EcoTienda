import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/features/auth/session";
import { AccountSettingsForm } from "@/features/settings/account-settings-form";
import { CompanySettingsForm } from "@/features/settings/company-settings-form";
import { getCompanySettings } from "@/features/settings/data";
import { SettingsSections } from "@/features/settings/settings-sections";

export default async function SettingsPage() {
	const user = await requireUser();
	const accountValues = {
		username: user.username,
		fullName: user.fullName,
		email: user.email ?? "",
		phone: user.phone,
		personalData: user.personalData,
	};
	const companyResult =
		user.role === "admin"
			? await getCompanySettings()
			: { settings: null, error: null };
	const canSave = Boolean(companyResult.settings) && !companyResult.error;

	return (
		<AppShell
			role={user.role}
			title="Configuración"
			description="Administra la identidad de tu empresa y la información que aparecerá en tus documentos."
			email={user.email}
		>
			<SettingsSections
				account={
					<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
						<div className="mb-7 max-w-2xl">
							<p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--brand-strong)]">
								Configuración de la cuenta
							</p>
							<h1 className="mt-2 text-2xl font-semibold tracking-display text-[var(--brand-deep)]">
								Mis datos
							</h1>
							<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
								Actualiza la información personal de la cuenta con la que estás usando EcoTienda.
							</p>
						</div>
						<AccountSettingsForm defaultValues={accountValues} />
					</section>
				}
				company={
					user.role === "admin" ? (
						<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-8">
							<div className="mb-7 max-w-2xl">
								<p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--brand-strong)]">
									Configuración general
								</p>
								<h1 className="mt-2 text-2xl font-semibold tracking-display text-[var(--brand-deep)]">
									Mi empresa
								</h1>
								<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
									Mantén actualizados los datos que tus clientes verán en las cotizaciones y documentos generados desde EcoTienda.
								</p>
							</div>
							{companyResult.error ? (
								<div className="mb-6 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm leading-6 text-amber-900">
									{companyResult.error}
								</div>
							) : null}
							{companyResult.settings ? (
								<CompanySettingsForm defaultValues={companyResult.settings} canSave={canSave} />
							) : (
								<div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm leading-6 text-rose-800">
									No se puede mostrar el formulario hasta resolver el problema de configuración.
								</div>
							)}
						</section>
					) : undefined
				}
			/>
		</AppShell>
	);
}
