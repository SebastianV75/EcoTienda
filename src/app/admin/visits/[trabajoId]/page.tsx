import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { AgendaItemDetail } from "@/features/agenda/agenda-item-detail";
import { getAgendaItemById } from "@/features/agenda/data";
import { VisitWorkerAssignmentForm } from "@/features/trabajos/components/visit-worker-assignment-form";
import { loadAuthorizedVisitWork } from "@/features/trabajos/visit-access";
import { getActiveWorkers } from "@/features/workers/data";

const formRoutes = [
	{
		title: "Visita Técnica Paneles Solares",
		slug: "visita-paneles",
	},
	{
		title: "Visita Técnica Minisplit",
		slug: "visita-minisplit",
	},
	{
		title: "Paneles Solares",
		slug: "paneles-solares",
	},
	{
		title: "Visita Técnica Ampliar Sistema",
		slug: "visita-ampliar",
	},
	{
		title: "Cambio a 220",
		slug: "cambio-220",
	},
] as const;

export default async function WorkVisitHubPage({
	params,
}: {
	params: Promise<{ trabajoId: string }>;
}) {
	const { trabajoId } = await params;
	const { user, work, shellRole, homeHref } =
		await loadAuthorizedVisitWork(trabajoId);
	let workers = [] as Awaited<ReturnType<typeof getActiveWorkers>>;
	let workersNotice: string | null = null;

	if (shellRole === "admin") {
		try {
			workers = await getActiveWorkers();
		} catch {
			workersNotice =
				"No se pudieron cargar los trabajadores activos. Podés seguir con la visita y volver a asignar después.";
		}
	}

	if (!work) {
		const legacyItem = await getAgendaItemById(trabajoId);

		if (!legacyItem) {
			notFound();
		}

		return (
			<AppShell
				role={shellRole}
				title={legacyItem.titulo}
				description="Este registro todavía vive en la Agenda clásica. Abrilo desde ahí para seguir el flujo de trabajo."
				email={user.email}
			>
				<div className="space-y-4">
					<section className="rounded-[26px] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
						<p className="text-sm leading-7 text-[var(--muted)]">
							Este elemento todavía no tiene un shell de Trabajo. Revisalo en
							Agenda y abrí el flujo desde ahí.
						</p>
						<div className="mt-4 flex flex-wrap gap-3">
							<Link
								href={`/agenda/${legacyItem.id}`}
								className="inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white"
							>
								Abrir en Agenda
							</Link>
							<Link
								href="/admin/visits"
								className="inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)]"
							>
								Volver a visitas
							</Link>
						</div>
					</section>
					<AgendaItemDetail item={legacyItem} role={shellRole} />
				</div>
			</AppShell>
		);
	}

	const visitTitle = work.agenda?.contact_name || work.intake_name;

	return (
		<AppShell
			role={shellRole}
			title={visitTitle}
			description="Elegí el formulario que corresponde para este trabajo."
			email={user.email}
		>
			<div className="space-y-4">
<section className="rounded-panel border border-[var(--border-soft)] bg-white p-5 shadow-panel sm:p-6">
						<p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--brand-strong)]">
						Visita técnica
					</p>
					<div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div className="min-w-0">
							<h1 className="text-2xl font-semibold tracking-display text-[var(--brand-deep)] sm:text-[1.9rem]">
								{visitTitle}
							</h1>
							<p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
								Abrí el formulario que corresponde y cargá esta visita sobre
								este trabajo.
							</p>
							<div className="mt-4 rounded-card border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3">
								<p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--brand-strong)]">
									Asignación actual
								</p>
								<p className="mt-2 text-sm font-medium text-[var(--brand-deep)]">
									{work.agenda?.assignee_worker?.full_name ||
										work.agenda?.assignee_name ||
										"Sin asignación"}
								</p>
							</div>
						</div>

						{shellRole === "admin" ? (
							<Link
								href={`/agenda/${work.id}`}
								className="ui-secondary-action"
							>
								Abrir en Agenda
							</Link>
						) : (
							<Link
								href={homeHref}
								className="ui-secondary-action"
							>
								Volver al listado
							</Link>
						)}
					</div>

					{work.visita ? (
						<p className="mt-4 text-sm font-medium text-[var(--brand-deep)]">
							Visita ya iniciada.
						</p>
					) : null}
				</section>

				<section className="rounded-panel border border-[var(--border-soft)] bg-white p-5 shadow-panel sm:p-6">
					<div className="space-y-4">
						{shellRole === "admin" ? (
							<>
								{workersNotice ? (
									<p className="rounded-soft border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
										{workersNotice}
									</p>
								) : workers.length === 0 ? (
<p className="rounded-soft border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
											Todavía no hay trabajadores activos para asignar. Creá uno

										en Trabajadores y volvé a esta visita.
									</p>
								) : null}

								<VisitWorkerAssignmentForm
									trabajoId={trabajoId}
									workers={workers}
									defaultWorkerId={work.agenda?.assignee_worker_id ?? ""}
								/>
							</>
						) : (
							<div className="rounded-card border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
								Abrí el formulario que corresponda y guardá la visita sobre este
								mismo trabajo.
							</div>
						)}

						<div className="space-y-3">
							{formRoutes.map((route) => (
								<Link
									key={route.slug}
									href={`/admin/visits/${trabajoId}/${route.slug}`}
									aria-label={`Abrir formulario ${route.title}`}
									className="group flex items-center justify-between rounded-card border border-[var(--border-soft)] bg-white p-5 shadow-card transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(13,79,46,0.18)] hover:bg-[rgba(239,246,239,0.96)] hover:shadow-[0_8px_20px_rgba(10,44,21,0.05)] active:scale-[0.96]"
								>
									<span className="text-sm font-medium text-[var(--brand-deep)]">
										{route.title}
									</span>
									<span className="text-[var(--brand)] transition-transform duration-200 ease-out group-hover:translate-x-0.5">
										<svg
											aria-hidden="true"
											className="h-4 w-4"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
												clipRule="evenodd"
											/>
										</svg>
									</span>
								</Link>
							))}
						</div>
					</div>
				</section>
			</div>
		</AppShell>
	);
}
