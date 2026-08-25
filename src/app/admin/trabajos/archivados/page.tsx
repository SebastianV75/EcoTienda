import Link from "next/link";
import { ArchiveBox, ArrowLeft } from "reicon-react";

import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { requireRole } from "@/features/auth/session";
import { RestoreTrabajoButton } from "@/features/trabajos/archive-buttons";
import { getArchivedTrabajos } from "@/features/trabajos/data";
import { trabajoStageLabels } from "@/types/trabajo";

function formatDate(value: string | null) {
	if (!value) return "Sin fecha";
	return new Intl.DateTimeFormat("es-MX", {
		dateStyle: "medium",
		timeZone: "America/Chihuahua",
	}).format(new Date(value));
}

export default async function ArchivedTrabajosPage() {
	const user = await requireRole(["admin", "administrative"]);
	const trabajos = await getArchivedTrabajos();

	return (
		<AppShell
			role={user.role}
			title="Trabajos archivados"
			description="Consulta y restaura trabajos archivados en modo solo lectura."
			email={user.email}
		>
			<div className="space-y-4">
				<div className="flex flex-wrap gap-3">
					<Link href="/admin/trabajos" className="group inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--brand-deep)] shadow-sm transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--brand-strong)]/30 hover:bg-[var(--surface)] hover:shadow-md active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none">
						<ArrowLeft size={18} weight="Outline" className="transition-transform duration-200 group-hover:-translate-x-0.5" />
						Volver a trabajos
					</Link>
				</div>

				{trabajos.length === 0 ? (
					<EmptyState
						eyebrow="Sin archivados"
						title="No hay trabajos archivados"
						description="Los trabajos que archives aparecerán aquí sin perder sus datos ni archivos."
						action={<Link href="/admin/trabajos" className="ui-secondary-action">Abrir trabajos</Link>}
					/>
				) : (
					<section className="grid gap-4 lg:grid-cols-2">
						{trabajos.map((trabajo) => (
							<article key={trabajo.id} className="group rounded-[24px] border border-amber-200/80 bg-white p-5 shadow-sm transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none">
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div>
										<p className="text-lg font-semibold text-[var(--brand-deep)]">{trabajo.intake_name || "Sin cliente"}</p>
										<p className="mt-1 text-xs text-[var(--muted)]">{trabajo.id}</p>
									</div>
									<span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800"><ArchiveBox size={14} weight="Outline" />Archivado</span>
								</div>
								<dl className="mt-4 grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
									<div><dt>Etapa original</dt><dd className="font-medium text-[var(--brand-deep)]">{trabajoStageLabels[trabajo.current_stage]}</dd></div>
									<div><dt>Archivado</dt><dd className="font-medium text-[var(--brand-deep)]">{formatDate(trabajo.archived_at)}</dd></div>
								</dl>
								{trabajo.archive_reason ? <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">Motivo: {trabajo.archive_reason}</p> : null}
								<div className="mt-4 flex flex-wrap items-center gap-3">
									<Link href={`/admin/trabajos/archivados/${trabajo.id}`} className="ui-secondary-action">Ver detalle</Link>
									<RestoreTrabajoButton trabajoId={trabajo.id} />
								</div>
							</article>
						))}
					</section>
				)}
			</div>
		</AppShell>
	);
}
