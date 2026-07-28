import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { getDescargablesDocumentReadiness } from "@/features/documents/descargables-readiness";
import { DescargablesCompletionForm } from "@/features/trabajos/descargables-completion-form";
import { isTrabajoDescargablesReady } from "@/features/trabajos/rules";
import { getTrabajoDocumentById } from "@/features/trabajos/data";

import { trabajoStageLabels } from "@/types/trabajo";
import { TrabajoTimeline } from "@/features/trabajos/trabajo-timeline";
import { TrabajoStageSection } from "@/features/trabajos/components/trabajo-stage-section";
import { VisitaAttributeGroup } from "@/features/trabajos/components/visita-attribute-group";
import { VentaForm } from "@/features/trabajos/venta-form";

function formatDate(dateString: string | null | undefined) {
	if (!dateString) return "—";
	return new Date(dateString).toLocaleDateString("es-MX", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function formatDateTime(dateString: string | null | undefined) {
	if (!dateString) return "—";
	return new Date(dateString).toLocaleString("es-MX", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function getDisplayValue(value: unknown, fallback = "—") {
	if (value === null || value === undefined) return fallback;
	if (typeof value === "string") return value || fallback;
	return String(value);
}

function formatMissingList(missing: string[]) {
	if (missing.length <= 3) {
		return missing.join(", ");
	}

	return `${missing.slice(0, 3).join(", ")} y ${missing.length - 3} más`;
}

export default async function TrabajoDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const user = await requireRole(["admin"]);
	const { id } = await params;

	const trabajo = await getTrabajoDocumentById(id);

	if (!trabajo) {
		notFound();
	}

	const currentStage = trabajo.current_stage;
	const completedStages = [
		...(trabajo.agenda ? ["agenda"] : []),
		...(trabajo.visita ? ["visita"] : []),
		...(trabajo.cotizacion ? ["cotizacion"] : []),
		...(trabajo.venta ? ["venta"] : []),
		...(trabajo.descargables_completed_at ? ["descargables"] : []),
	];

	const clientName = trabajo.client?.full_name ?? trabajo.intake_name;
	const completedStageCount = completedStages.length;
	const isDescargablesReady = isTrabajoDescargablesReady(trabajo);
	const documentReadiness = getDescargablesDocumentReadiness(trabajo);
	const descargablesDocuments = [
		{
			key: "carta-poder",
			title: "Carta poder",
			description: "Abre la vista previa con los datos de este trabajo.",
			href: `/admin/documents/carta-poder/preview?trabajoId=${trabajo.id}`,
			readiness: documentReadiness["carta-poder"],
		},
		{
			key: "ubicacion-cliente",
			title: "Ubicación del cliente",
			description: "Revisa la ubicación guardada antes de imprimir o compartir.",
			href: `/admin/documents/ubicacion-cliente/preview?trabajoId=${trabajo.id}`,
			readiness: documentReadiness["ubicacion-cliente"],
		},
		{
			key: "diagrama-unifilar",
			title: "Diagrama unifilar",
			description: "Verifica el panel de datos del sistema antes de cerrar la etapa.",
			href: `/admin/documents/diagrama-unifilar/preview?trabajoId=${trabajo.id}`,
			readiness: documentReadiness["diagrama-unifilar"],
		},
	] as const;

	return (
		<AppShell
			role="admin"
			title={clientName}
			description="Vista unificada del trabajo"
			email={user.email}
		>
			<div className="space-y-4 overflow-hidden">
				<section className="rounded-panel border border-[var(--border-soft)] bg-white p-5 shadow-panel sm:p-6">
					<div className="flex flex-col gap-5">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div className="min-w-0 flex-1">
								<p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--brand-strong)]">
									Trabajo en curso
								</p>
								<h1 className="mt-2 text-2xl font-semibold tracking-display text-[var(--brand-deep)] sm:text-[1.9rem]">
									{clientName}
								</h1>
								<div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
									<span>{completedStageCount} de 5 etapas completadas</span>
									<span
										aria-hidden="true"
										className="text-[var(--border-soft)]"
									>
										•
									</span>
									<span className="font-medium text-[var(--brand-deep)]">
										Ahora: {trabajoStageLabels[trabajo.current_stage]}
									</span>
								</div>
							</div>

							<Link href="/admin/trabajos" className="ui-secondary-action shrink-0">
								Volver a Trabajos
							</Link>
						</div>

						<div className="rounded-card border border-[rgba(13,79,46,0.08)] bg-[rgba(244,247,244,0.72)] px-3 py-4 sm:px-4">
							<TrabajoTimeline
								currentStage={currentStage}
								completedStages={completedStages}
							/>
						</div>
					</div>
				</section>

				<div className="space-y-4">
					{/* AGENDA */}
					<TrabajoStageSection
						title="Agenda"
						stage="agenda"
						isCompleted={completedStages.includes("agenda")}
					>
						{!trabajo.agenda ? (
							<p className="text-sm text-[var(--muted)]">
								Sin datos de agenda.
							</p>
						) : (
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-1.5">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Cita programada
									</p>
									<p className="text-sm font-medium text-[var(--foreground)]">
										{formatDateTime(trabajo.agenda.appointment_at)}
									</p>
								</div>
								<div className="space-y-1.5">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Tipo de trabajo
									</p>
									<p className="text-sm font-medium text-[var(--foreground)]">
										{getDisplayValue(trabajo.agenda.work_type)}
									</p>
								</div>
								<div className="space-y-1.5">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Asignado a
									</p>
									<p className="text-sm font-medium text-[var(--foreground)]">
										{getDisplayValue(trabajo.agenda.assignee_name)}
									</p>
								</div>
								<div className="space-y-1.5 md:col-span-2">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Nota
									</p>
									<p className="text-sm font-medium text-[var(--foreground)] whitespace-pre-wrap">
										{getDisplayValue(trabajo.agenda.note)}
									</p>
								</div>
								<div className="space-y-1.5 md:col-span-2">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Contacto
									</p>
									<p className="text-sm font-medium text-[var(--foreground)]">
										{getDisplayValue(trabajo.agenda.contact_name)} —{" "}
										{getDisplayValue(trabajo.agenda.contact_phone)}
									</p>
								</div>
								<div className="space-y-1.5 md:col-span-2">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Dirección
									</p>
									<p className="text-sm font-medium text-[var(--foreground)] whitespace-pre-wrap">
										{getDisplayValue(trabajo.agenda.address_text)}
									</p>
								</div>
								{trabajo.agenda.latitude && trabajo.agenda.longitude && (
									<div className="space-y-1.5">
										<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
											Ubicación
										</p>
										<a
											href={`https://maps.google.com/?q=${trabajo.agenda.latitude},${trabajo.agenda.longitude}`}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-[var(--brand-deep)] transition-colors hover:bg-emerald-100"
										>
											<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
											</svg>
											Ver en Google Maps
										</a>
									</div>
								)}
							</div>
						)}
					</TrabajoStageSection>

					{/* VISITA TÉCNICA */}
					<TrabajoStageSection
						title="Visita Técnica"
						stage="visita"
						isCompleted={completedStages.includes("visita")}
					>
						{!trabajo.visita ? (
							<p className="text-sm text-[var(--muted)]">
								Visita no completada.
							</p>
						) : (
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-1.5">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Fecha de ejecución
									</p>
									<p className="text-sm font-medium text-[var(--foreground)]">
										{formatDate(trabajo.visita.execution_date)}
									</p>
								</div>
								<div className="space-y-1.5">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Contacto
									</p>
									<p className="text-sm font-medium text-[var(--foreground)]">
										{getDisplayValue(trabajo.visita.contact_name)}
									</p>
								</div>
								<div className="space-y-1.5">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Teléfono
									</p>
									<p className="text-sm font-medium text-[var(--foreground)]">
										{getDisplayValue(trabajo.visita.contact_phone)}
									</p>
								</div>
								<div className="space-y-1.5 md:col-span-2">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Dirección confirmada
									</p>
									<p className="text-sm font-medium text-[var(--foreground)] whitespace-pre-wrap">
										{getDisplayValue(trabajo.visita.confirmed_address)}
									</p>
								</div>
								<div className="space-y-1.5">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Paquete de interés
									</p>
									<p className="text-sm font-medium text-[var(--foreground)]">
										{getDisplayValue(trabajo.visita.interest_package)}
									</p>
								</div>
								<div className="space-y-1.5">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Tipo de cotización
									</p>
									<p className="text-sm font-medium text-[var(--foreground)]">
										{getDisplayValue(trabajo.visita.quotation_type)}
									</p>
								</div>
								<div className="space-y-1.5 md:col-span-2">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Notas
									</p>
									<p className="text-sm font-medium text-[var(--foreground)] whitespace-pre-wrap">
										{getDisplayValue(trabajo.visita.notes)}
									</p>
								</div>
								{trabajo.visita.utility_bill_asset_id && (
									<div className="space-y-2">
										<p className="text-xs font-medium text-[var(--brand-strong)]">
											Recibo de luz
										</p>
										<p className="text-sm text-[var(--foreground)]">
											Asset ID: {trabajo.visita.utility_bill_asset_id}
										</p>
									</div>
								)}
								<VisitaAttributeGroup
									group="house"
									attributes={trabajo.visita.house_attributes ?? {}}
									title="Datos de casa"
								/>
								<VisitaAttributeGroup
									group="electrical"
									attributes={trabajo.visita.electrical_attributes ?? {}}
									title="Datos eléctricos"
								/>
								<VisitaAttributeGroup
									group="roof"
									attributes={trabajo.visita.roof_attributes ?? {}}
									title="Datos de techo"
								/>
								<VisitaAttributeGroup
									group="minisplit"
									attributes={trabajo.visita.minisplit_attributes ?? {}}
									title="Datos minisplit"
								/>
							</div>
						)}
					</TrabajoStageSection>

					{/* COTIZACIÓN */}
					<TrabajoStageSection
						title="Cotización"
						stage="cotizacion"
						isCompleted={completedStages.includes("cotizacion")}
					>
						{!trabajo.cotizacion ? (
							<p className="text-sm text-[var(--muted)]">
								Cotización no generada.
							</p>
						) : (
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-1.5">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Alcance
									</p>
									<p className="text-sm font-medium text-[var(--foreground)] whitespace-pre-wrap">
										{getDisplayValue(trabajo.cotizacion.scope_summary)}
									</p>
								</div>
								<div className="space-y-1.5">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Monto
									</p>
									<p className="text-base font-semibold text-[var(--brand-deep)]">
										$
										{Number(trabajo.cotizacion.amount).toLocaleString("es-MX", {
											minimumFractionDigits: 2,
										})}
									</p>
								</div>
								<div className="space-y-1.5 md:col-span-2">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Términos y condiciones
									</p>
									<p className="text-sm font-medium text-[var(--foreground)] whitespace-pre-wrap">
										{getDisplayValue(trabajo.cotizacion.terms_and_conditions)}
									</p>
								</div>
								<div className="space-y-1.5">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Resultado
									</p>
									<p className="text-sm font-medium text-[var(--foreground)]">
										{getDisplayValue(trabajo.cotizacion.outcome)}
									</p>
								</div>
								<div className="space-y-1.5">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Tipo de cotización
									</p>
									<p className="text-sm font-medium text-[var(--foreground)]">
										{getDisplayValue(trabajo.cotizacion.quotation_type)}
									</p>
								</div>
							</div>
						)}
					</TrabajoStageSection>

					{/* VENTA */}
					<TrabajoStageSection
						title="Venta"
						stage="venta"
						isCompleted={completedStages.includes("venta")}
					>
						{!trabajo.venta ? (
							currentStage === "venta" ? (
								<VentaForm
									trabajoId={trabajo.id}
									quotationTrabajoId={
										trabajo.cotizacion?.trabajo_id ?? trabajo.id
									}
								/>
							) : (
								<div className="space-y-4">
									<p className="text-sm text-[var(--muted)]">
										Venta no confirmada.
									</p>
									{currentStage === "cotizacion" && (
										<p className="text-sm text-[var(--muted)]">
											Esta etapa se habilitará cuando se complete la cotización.
										</p>
									)}
								</div>
							)
						) : (
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-1.5">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Fecha de confirmación
									</p>
									<p className="text-sm font-medium text-[var(--foreground)]">
										{formatDate(trabajo.venta.confirmed_on)}
									</p>
								</div>
								<div className="space-y-1.5">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Monto acordado
									</p>
									<p className="text-base font-semibold text-[var(--brand-deep)]">
										$
										{Number(trabajo.venta.agreed_amount).toLocaleString(
											"es-MX",
											{ minimumFractionDigits: 2 },
										)}
									</p>
								</div>
								<div className="space-y-1.5 md:col-span-2">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										Notas
									</p>
									<p className="text-sm font-medium text-[var(--foreground)] whitespace-pre-wrap">
										{getDisplayValue(trabajo.venta.notes)}
									</p>
								</div>
							</div>
						)}
					</TrabajoStageSection>

					{/* DESCARGABLES */}
					<TrabajoStageSection
						title="Descargables"
						stage="descargables"
						isCompleted={completedStages.includes("descargables")}
					>
						<div className="space-y-4">
							<div className="grid gap-3 md:grid-cols-3">
								{descargablesDocuments.map((document) => {
									const isReady = document.readiness.ready;
									const statusText = isReady
										? "Listo para abrir"
										: `Pendiente: ${formatMissingList(document.readiness.missing)}`;

									return (
										<Link
											key={document.key}
											href={document.href}
											target="_blank"
											rel="noopener noreferrer"
											className="group flex h-full flex-col justify-between rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface)] p-4 transition duration-200 ease-out hover:border-emerald-200 hover:bg-white"
										>
											<div className="space-y-3">
												<div className="space-y-1">
													<p className="text-sm font-semibold text-[var(--brand-deep)]">
														{document.title}
													</p>
													<p
														className={`text-xs font-medium ${isReady ? "text-emerald-700" : "text-amber-700"}`}
													>
														{statusText}
													</p>
												</div>
												<p className="text-sm text-[var(--muted)]">
													{document.description}
												</p>
											</div>
											<span className="mt-4 text-sm font-medium text-[var(--brand)]">
												Abrir vista previa
											</span>
										</Link>
									);
								})}
							</div>

							{trabajo.descargables_completed_at ? (
								<div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-4">
									<p className="text-sm font-medium text-emerald-900">Descargables completado</p>
									<p className="mt-1 text-sm text-emerald-800">
										Se marcó el {formatDateTime(trabajo.descargables_completed_at)}.
									</p>
								</div>
							) : (
								<div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-4">
									<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
										<div className="space-y-1">
											<p className="text-sm font-medium text-[var(--brand-deep)]">
												{isDescargablesReady ? "Listo para completar" : "Aún no se puede completar"}
											</p>
											<p className="text-sm text-[var(--muted)]">
												{isDescargablesReady
													? "Revisa los tres documentos y marca la etapa cuando estén correctos."
													: "La etapa se habilita cuando Venta esté completada."}
											</p>
										</div>
										{isDescargablesReady ? <DescargablesCompletionForm trabajoId={trabajo.id} /> : null}
									</div>
								</div>
							)}
						</div>
					</TrabajoStageSection>
				</div>
			</div>
		</AppShell>
	);
}
