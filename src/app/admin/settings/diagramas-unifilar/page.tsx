import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import {
	getCurrentGlobalUnifilarAssets,
	UNIFILAR_RULES,
} from "@/features/documents/unifilar-diagrams";
import { requireRole } from "@/features/auth/session";

export default async function UnifilarDiagramsSettingsPage({
	searchParams,
}: {
	searchParams?: Promise<{ success?: string; error?: string }>;
}) {
	const user = await requireRole(["admin"]);
	const params = searchParams ? await searchParams : undefined;
	const assets = await getCurrentGlobalUnifilarAssets();
	const assetByRule = new Map(assets.map((asset) => [asset.rule_key, asset]));

	return (
		<AppShell
			role={user.role}
			title="Diagramas unifilares"
			description="Reemplaza globalmente los diagramas que utilizarán los trabajos según su cantidad de paneles."
			email={user.email}
		>
			<div className="space-y-4">
				<div className="flex flex-wrap gap-3">
					<Link href="/admin/descargables" className="ui-secondary-action">
						Volver a descargables
					</Link>
				</div>

				{params?.success ? (
					<p className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
						Diagrama global reemplazado correctamente.
					</p>
				) : null}
				{params?.error ? (
					<p className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
						{params.error}
					</p>
				) : null}

				<section className="grid gap-4 md:grid-cols-2">
					{UNIFILAR_RULES.map((rule) => {
						const asset = assetByRule.get(rule.key);
						return (
							<article
								key={rule.key}
								className="rounded-[24px] border border-[var(--border-soft)] bg-white p-5 shadow-sm"
							>
								<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-strong)]">
									Regla global
								</p>
								<h2 className="mt-2 text-xl font-semibold text-[var(--brand-deep)]">
									{rule.label}
								</h2>
								<p className="mt-2 text-sm text-[var(--muted)]">
									{asset
										? `Versión ${asset.version}: ${asset.original_filename}`
										: `Base local: ${rule.fallback}`}
								</p>
								<form
									className="mt-4 space-y-3"
									method="post"
									encType="multipart/form-data"
									action={`/api/admin/diagramas-unifilar/${rule.key}`}
								>
									<label className="block text-sm font-medium text-[var(--brand-deep)]">
										<span className="mb-2 block">Nuevo PNG</span>
										<input
											type="file"
											name="diagram"
											accept="image/png"
											required
											className="block w-full rounded-[16px] border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2 text-sm"
										/>
									</label>
									<button type="submit" className="ui-primary-action">
										Reemplazar globalmente
									</button>
								</form>
							</article>
						);
					})}
				</section>
			</div>
		</AppShell>
	);
}
