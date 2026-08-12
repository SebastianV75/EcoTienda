import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { getArchivedProjects } from "@/features/projects/data";
import { RestoreProjectButton } from "@/features/projects/restore-project-button";
import {
	projectStageBadgeClasses,
	projectStageLabels,
} from "@/types/project";

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
	day: "numeric",
	month: "short",
	year: "numeric",
});

function formatDate(value: string | null) {
	if (!value) {
		return "Sin fecha";
	}

	return dateFormatter.format(new Date(value));
}

export default async function ArchivedProjectsPage() {
	const user = await requireRole(["admin", "administrative"]);
	const archivedProjects = await getArchivedProjects();

	return (
		<AppShell
			role={user.role}
			title="Trabajos archivados"
			description="Trabajos vendidos que completaron su activación hace más de un mes."
			email={user.email}
		>
			<div className="space-y-4">
				<div className="flex flex-wrap gap-3">
					<Link
						href="/admin"
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
					>
						Volver al panel
					</Link>
				</div>

				{archivedProjects.length > 0 ? (
					<section className="grid gap-4 lg:grid-cols-2">
						{archivedProjects.map((project) => (
							<article
								key={project.id}
								className="rounded-[24px] border border-[var(--border-soft)] bg-white p-5 shadow-sm"
							>
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div>
										<p className="text-lg font-semibold tracking-[-0.03em] text-[var(--brand-deep)]">
											{"Trabajo sin nombre"}
										</p>
									</div>
									<span
										className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${projectStageBadgeClasses[project.stage]}`}
									>
										{projectStageLabels[project.stage]}
									</span>
								</div>

								<dl className="mt-4 space-y-1.5 text-sm text-[var(--muted)]">
									<div className="flex justify-between gap-3">
										<dt>Venta</dt>
										<dd className="font-medium text-[var(--brand-deep)]">
											{formatDate(project.sold_at)}
										</dd>
									</div>
									<div className="flex justify-between gap-3">
										<dt>Activación</dt>
										<dd className="font-medium text-[var(--brand-deep)]">
											{formatDate(project.activated_at)}
										</dd>
									</div>
								</dl>

								<div className="mt-4">
									<RestoreProjectButton projectId={project.id} />
								</div>
							</article>
						))}
					</section>
				) : (
					<section className="rounded-[26px] border border-[var(--border-soft)] bg-white p-8 text-center shadow-sm">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							Sin archivados
						</p>
						<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
							Los trabajos vendidos se archivan automáticamente un mes después
							de completar la activación.
						</p>
					</section>
				)}
			</div>
		</AppShell>
	);
}
