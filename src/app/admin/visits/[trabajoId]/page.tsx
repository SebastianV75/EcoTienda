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
					<AgendaItemDetail item={legacyItem} role="admin" />
				</div>
			</AppShell>
		);
	}

	return (
		<AppShell
			role={shellRole}
			title={work.agenda?.contact_name || work.intake_name}
			description="Elegí el formulario que corresponde para este trabajo."
			email={user.email}
		>
			<div className="space-y-4">
				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
						Visita técnica
					</p>
					<div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div className="min-w-0">
							<h1 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] sm:text-[1.9rem]">
								Visitas Técnicas
							</h1>
							<p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
								Abrí el formulario que corresponde y cargá esta visita sobre
								este trabajo.
							</p>
							<div className="mt-4 rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3">
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
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
								className="inline-flex min-h-[40px] items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(13,79,46,0.18)] hover:bg-[rgba(239,246,239,0.96)] hover:shadow-[0_8px_20px_rgba(10,44,21,0.05)] active:scale-[0.96]"
							>
								Abrir en Agenda
							</Link>
						) : (
							<Link
								href={homeHref}
								className="inline-flex min-h-[40px] items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(13,79,46,0.18)] hover:bg-[rgba(239,246,239,0.96)] hover:shadow-[0_8px_20px_rgba(10,44,21,0.05)] active:scale-[0.96]"
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

				<section className="rounded-[24px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
					<div className="space-y-4">
						{shellRole === "admin" ? (
							<>
								{workersNotice ? (
									<p className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
										{workersNotice}
									</p>
								) : workers.length === 0 ? (
									<p className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
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
							<div className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
								Abrí el formulario que corresponda y guardá la visita sobre este
								mismo trabajo.
							</div>
						)}

						<div className="space-y-3">
							{formRoutes.map((route) => (
								<Link
									key={route.slug}
									href={`/admin/visits/${trabajoId}/${route.slug}`}
									className="flex items-center justify-between rounded-[24px] border border-[var(--border-soft)] bg-white p-5 shadow-sm transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(13,79,46,0.18)] hover:bg-[rgba(239,246,239,0.96)] hover:shadow-[0_8px_20px_rgba(10,44,21,0.05)] active:scale-[0.96]"
								>
									<span className="text-sm font-medium text-[var(--brand-deep)]">
										{route.title}
									</span>
									<span className="text-sm font-medium text-[var(--brand)]">
										Abrir formulario
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
