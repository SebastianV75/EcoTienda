import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { getTrabajoDocumentById } from "@/features/trabajos/data";

import { trabajoStageLabels } from "@/types/trabajo";
import { TrabajoTimeline } from "@/features/trabajos/trabajo-timeline";
import { TrabajoStageSection } from "@/features/trabajos/components/trabajo-stage-section";
import { VisitaAttributeGroup } from "@/features/trabajos/components/visita-attribute-group";
import { VentaForm } from "@/features/trabajos/venta-form";

function formatDate(dateString: string | null | undefined) {
	if (!dateString) return "—";
	return new Date(dateString).toLocaleDateString("es-AR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function formatDateTime(dateString: string | null | undefined) {
	if (!dateString) return "—";
	return new Date(dateString).toLocaleString("es-AR", {
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

export default async function TrabajoDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

	return (
		<AppShell
			role="admin"
			title={clientName}
			description="Vista unificada del trabajo"
			email={user.email}
		>
			<div className="space-y-4">
				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div className="min-w-0">
							<h1 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] sm:text-[1.9rem]">
								{clientName}
							</h1>
							<p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
								Etapa actual: <span className="font-medium text-[var(--brand-deep)]">{trabajoStageLabels[trabajo.current_stage]}</span>
							</p>
						</div>

						<Link
							href="/admin/trabajos"
							className="inline-flex min-h-[40px] items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(13,79,46,0.18)] hover:bg-[rgba(239,246,239,0.96)] hover:shadow-[0_8px_20px_rgba(10,44,21,0.05)] active:scale-[0.96]"
						>
							Volver a Trabajos
						</Link>
					</div>
				</section>

				<TrabajoTimeline currentStage={currentStage} completedStages={completedStages} />

				<div className="space-y-4">
					{/* AGENDA */}
					<TrabajoStageSection title="Agenda" stage="agenda" isCompleted={completedStages.includes("agenda")}>
						{!trabajo.agenda ? (
							<p className="text-sm text-[var(--muted)]">Sin datos de agenda.</p>
						) : (
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Cita programada</p>
									<p className="text-sm text-[var(--foreground)]">{formatDateTime(trabajo.agenda.appointment_at)}</p>
								</div>
								<div className="space-y-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Tipo de trabajo</p>
									<p className="text-sm text-[var(--foreground)]">{getDisplayValue(trabajo.agenda.work_type)}</p>
								</div>
								<div className="space-y-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Asignado a</p>
									<p className="text-sm text-[var(--foreground)]">{getDisplayValue(trabajo.agenda.assignee_name)}</p>
								</div>
								<div className="space-y-2 md:col-span-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Nota</p>
									<p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{getDisplayValue(trabajo.agenda.note)}</p>
								</div>
								<div className="space-y-2 md:col-span-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Contacto</p>
									<p className="text-sm text-[var(--foreground)]">
										{getDisplayValue(trabajo.agenda.contact_name)} — {getDisplayValue(trabajo.agenda.contact_phone)}
									</p>
								</div>
								<div className="space-y-2 md:col-span-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Dirección</p>
									<p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{getDisplayValue(trabajo.agenda.address_text)}</p>
								</div>
								{trabajo.agenda.latitude && trabajo.agenda.longitude && (
									<div className="space-y-2">
										<p className="text-xs font-medium text-[var(--brand-strong)]">Ubicación</p>
										<a
											href={`https://maps.google.com/?q=${trabajo.agenda.latitude},${trabajo.agenda.longitude}`}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1.5 text-sm text-[var(--brand)] hover:underline"
										>
											Ver en Google Maps
										</a>
									</div>
								)}
							</div>
						)}
					</TrabajoStageSection>

					{/* VISITA TÉCNICA */}
					<TrabajoStageSection title="Visita Técnica" stage="visita" isCompleted={completedStages.includes("visita")}>
						{!trabajo.visita ? (
							<p className="text-sm text-[var(--muted)]">Visita no completada.</p>
						) : (
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Fecha de ejecución</p>
									<p className="text-sm text-[var(--foreground)]">{formatDate(trabajo.visita.execution_date)}</p>
								</div>
								<div className="space-y-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Contacto</p>
									<p className="text-sm text-[var(--foreground)]">{getDisplayValue(trabajo.visita.contact_name)}</p>
								</div>
								<div className="space-y-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Teléfono</p>
									<p className="text-sm text-[var(--foreground)]">{getDisplayValue(trabajo.visita.contact_phone)}</p>
								</div>
								<div className="space-y-2 md:col-span-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Dirección confirmada</p>
									<p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{getDisplayValue(trabajo.visita.confirmed_address)}</p>
								</div>
								<div className="space-y-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Paquete de interés</p>
									<p className="text-sm text-[var(--foreground)]">{getDisplayValue(trabajo.visita.interest_package)}</p>
								</div>
								<div className="space-y-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Tipo de cotización</p>
									<p className="text-sm text-[var(--foreground)]">{getDisplayValue(trabajo.visita.quotation_type)}</p>
								</div>
								<div className="space-y-2 md:col-span-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Notas</p>
									<p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{getDisplayValue(trabajo.visita.notes)}</p>
								</div>
								{trabajo.visita.utility_bill_asset_id && (
									<div className="space-y-2">
										<p className="text-xs font-medium text-[var(--brand-strong)]">Recibo de luz</p>
										<p className="text-sm text-[var(--foreground)]">Asset ID: {trabajo.visita.utility_bill_asset_id}</p>
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
					<TrabajoStageSection title="Cotización" stage="cotizacion" isCompleted={completedStages.includes("cotizacion")}>
						{!trabajo.cotizacion ? (
							<p className="text-sm text-[var(--muted)]">Cotización no generada.</p>
						) : (
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Alcance</p>
									<p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{getDisplayValue(trabajo.cotizacion.scope_summary)}</p>
								</div>
								<div className="space-y-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Monto</p>
									<p className="text-sm font-semibold text-[var(--brand-deep)]">
										${Number(trabajo.cotizacion.amount).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
									</p>
								</div>
								<div className="space-y-2 md:col-span-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Términos y condiciones</p>
									<p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{getDisplayValue(trabajo.cotizacion.terms_and_conditions)}</p>
								</div>
								<div className="space-y-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Resultado</p>
									<p className="text-sm text-[var(--foreground)]">{getDisplayValue(trabajo.cotizacion.outcome)}</p>
								</div>
								<div className="space-y-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Tipo de cotización</p>
									<p className="text-sm text-[var(--foreground)]">{getDisplayValue(trabajo.cotizacion.quotation_type)}</p>
								</div>
							</div>
						)}
					</TrabajoStageSection>

					{/* VENTA */}
					<TrabajoStageSection title="Venta" stage="venta" isCompleted={completedStages.includes("venta")}>
						{!trabajo.venta ? (
							currentStage === "venta" ? (
								<VentaForm
									trabajoId={trabajo.id}
									quotationTrabajoId={trabajo.cotizacion?.trabajo_id ?? trabajo.id}
								/>
							) : (
								<div className="space-y-4">
									<p className="text-sm text-[var(--muted)]">Venta no confirmada.</p>
									{currentStage === "cotizacion" && (
										<p className="text-sm text-[var(--muted)]">
											Esta etapa se habilitará cuando se complete la cotización.
										</p>
									)}
								</div>
							)
						) : (
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Fecha de confirmación</p>
									<p className="text-sm text-[var(--foreground)]">{formatDate(trabajo.venta.confirmed_on)}</p>
								</div>
								<div className="space-y-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Monto acordado</p>
									<p className="text-sm font-semibold text-[var(--brand-deep)]">
										${Number(trabajo.venta.agreed_amount).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
									</p>
								</div>
								<div className="space-y-2 md:col-span-2">
									<p className="text-xs font-medium text-[var(--brand-strong)]">Notas</p>
									<p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{getDisplayValue(trabajo.venta.notes)}</p>
								</div>
							</div>
						)}
					</TrabajoStageSection>

					{/* DESCARGABLES */}
					<TrabajoStageSection title="Descargables" stage="descargables" isCompleted={completedStages.includes("descargables")}>
						{!trabajo.media_assets || trabajo.media_assets.length === 0 ? (
							<p className="text-sm text-[var(--muted)]">Sin documentos descargables.</p>
						) : (
							<div className="space-y-3">
								{trabajo.media_assets.map((asset) => (
									<div key={asset.id} className="flex items-center justify-between rounded-[16px] border border-[var(--border-soft)] bg-white p-4">
										<div className="flex items-center gap-3 min-w-0">
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)]">
												<svg className="h-5 w-5 text-[var(--brand)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
												</svg>
											</div>
											<div>
												<p className="text-sm font-medium text-[var(--foreground)]">{asset.kind || "Documento"}</p>
												<p className="text-xs text-[var(--muted)]">{asset.kind} · {Math.round(asset.size_bytes / 1024)} KB</p>
											</div>
										</div>
										<a
											href={asset.storage_path}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-strong)]"
										>
											Descargar
										</a>
									</div>
								))}
							</div>
						)}
					</TrabajoStageSection>
				</div>
			</div>
		</AppShell>
	);
}