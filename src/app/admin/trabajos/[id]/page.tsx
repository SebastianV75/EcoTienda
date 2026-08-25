import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "reicon-react";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { buildTrabajoPreviewSubject } from "@/features/documents/preview-data";
import { getDescargablesDocumentReadiness } from "@/features/documents/descargables-readiness";
import { UnifilarDiagramUploadForm } from "@/features/documents/unifilar-diagram-upload-form";
import {
	getUnifilarDiagramResolution,
	getUnifilarPanelCount,
} from "@/features/documents/unifilar-diagrams";
import { composeTrabajoDocumentDefaults } from "@/features/trabajos/defaults";
import { DescargablesCompletionForm } from "@/features/trabajos/descargables-completion-form";
import { CotizacionForm } from "@/features/trabajos/cotizacion-form";
import { isTrabajoDescargablesReady } from "@/features/trabajos/rules";
import { getTrabajoDocumentById } from "@/features/trabajos/data";
import { getQuotationByTrabajoId } from "@/features/quotations/data";
import { DeleteTrabajoButton } from "@/features/trabajos/delete-trabajo-button";
import { ArchiveTrabajoButton } from "@/features/trabajos/archive-buttons";
import { TrabajoDetailRealtimeListener } from "@/features/trabajos/components/trabajo-detail-realtime-listener";

import { trabajoStageLabels } from "@/types/trabajo";
import { TrabajoTimeline } from "@/features/trabajos/trabajo-timeline";
import { TrabajoStageSection } from "@/features/trabajos/components/trabajo-stage-section";
import { VisitaAttributeGroup } from "@/features/trabajos/components/visita-attribute-group";
import { VisitaAttributeImage } from "@/features/trabajos/components/visita-attribute-image";
import { VentaForm } from "@/features/trabajos/venta-form";
import { ConfirmQuotationButton } from "@/features/trabajos/components/confirm-quotation-button";
import { DocumentInfoForm } from "@/features/trabajos/document-info-form";

import { DropdownSelect } from "@/features/trabajos/components/dropdown-select";
const clientDownloadGroups = [
	{
		key: "inversores",
		title: "Inversores",
		description: "Fichas técnicas y certificaciones de los inversores.",
		documents: [
			{
				title: "MIC 1000–3300TL-X2",
				description: "Ficha técnica del inversor MIC 1000–3300TL-X2.",
				href: "/descargables/inversores/mic-1000-3300tl-x2.pdf",
			},
			{
				title: "NEO 1600–2500M-X2",
				description: "Ficha técnica del inversor NEO 1600–2500M-X2.",
				href: "/descargables/inversores/neo-1600-2500m-x2.pdf",
			},
			{
				title: "NEO 1600–2500M-X2 · IEEE 1547 / UL 1741",
				description: "Certificación IEEE 1547 y UL 1741 para NEO.",
				href: "/descargables/inversores/neo-1600-2500m-x2-ieee1547-ul1741.pdf",
			},
			{
				title: "UL 1741",
				description: "Certificación UL 1741 para inversores.",
				href: "/descargables/inversores/ul1741.pdf",
			},
			{
				title: "MIN 2500–6000 TL-X2",
				description: "Ficha técnica del inversor MIN 2500–6000 TL-X2.",
				href: "/descargables/inversores/min-2500-6000-tl-x2.pdf",
			},
			{
				title: "MIN 2500–6000 TL-X2 · UL 1741 / IEEE 1547A",
				description: "Certificación UL 1741 e IEEE 1547A para MIN.",
				href: "/descargables/inversores/min-2500-6000tl-x2-ul1741-ieee1547a.pdf",
			},
		],
	},
	{
		key: "paneles",
		title: "Paneles",
		description: "Certificaciones y ficha técnica de los paneles.",
		documents: [
			{
				title: "IEC 61701 · Salt mist",
				description: "Certificación de resistencia a niebla salina.",
				href: "/descargables/paneles/iec61701-salt-mist.pdf",
			},
			{
				title: "IEC 62804 · PID",
				description: "Certificación de resistencia a degradación PID.",
				href: "/descargables/paneles/iec628041-pid.pdf",
			},
			{
				title: "LP182199M72NB 620–630",
				description: "Ficha técnica del panel LP182199M72NB 620–630.",
				href: "/descargables/paneles/lp182199m72nb-620630.pdf",
			},
		],
	},
] as const;

function formatDate(dateString: string | null | undefined) {
	if (!dateString) return "—";
	// Date-only values represent a calendar day, not UTC midnight.
	const date = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
		? new Date(`${dateString}T12:00:00`)
		: new Date(dateString);
	return date.toLocaleDateString("es-MX", {
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
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams?: Promise<{ diagramSuccess?: string; diagramError?: string }>;
}) {
	const user = await requireRole(["admin", "administrative"]);
	const { id } = await params;
	const pageParams = searchParams ? await searchParams : undefined;

	const [trabajo, linkedQuotation] = await Promise.all([
		getTrabajoDocumentById(id),
		getQuotationByTrabajoId(id),
	]);

	if (!trabajo) {
		notFound();
	}

	const currentStage = trabajo.current_stage;
	const completedStages = [
		...(trabajo.agenda_completed_at ? ["agenda"] : []),
		...(trabajo.visita_completed_at ? ["visita"] : []),
		...(trabajo.cotizacion_completed_at ? ["cotizacion"] : []),
		...(trabajo.venta_completed_at ? ["venta"] : []),
		...(trabajo.descargables_completed_at ? ["descargables"] : []),
	];

	const documentDefaults = composeTrabajoDocumentDefaults(trabajo);
	const clientName = documentDefaults.client_name;
	const completedStageCount = completedStages.length;
	const quotationDefaults = documentDefaults.quotation;
	const isCotizacionEditable =
		currentStage === "cotizacion" && !trabajo.cotizacion?.completed_at;
	const isDescargablesReady = isTrabajoDescargablesReady(trabajo);
	const documentPreviewSubject = buildTrabajoPreviewSubject(
		trabajo,
		"diagrama-unifilar",
	);
	const documentReadiness = getDescargablesDocumentReadiness(trabajo);
	const unifilarDiagram = await getUnifilarDiagramResolution(
		trabajo.id,
		documentPreviewSubject.panel_count,
	);
	const unifilarPanelCount = getUnifilarPanelCount(
		documentPreviewSubject.panel_count,
	);
	const diagramaReadiness =
		unifilarDiagram.status === "ready" && unifilarDiagram.url
			? documentReadiness["diagrama-unifilar"]
			: {
					ready: false,
					missing: [
						...documentReadiness["diagrama-unifilar"].missing,
						"diagrama unifilar disponible",
					],
				};
	const effectiveDocumentReadiness = {
			...documentReadiness,
			"diagrama-unifilar": diagramaReadiness,
		};
	const documentMissingFields = Array.from(
		new Set(
			Object.values(effectiveDocumentReadiness).flatMap(
				(readiness) => readiness.missing,
			),
		),
	);
	const cfePreviewSubject = buildTrabajoPreviewSubject(trabajo, "cfe");
	const cfeReadiness = trabajo.venta
		? effectiveDocumentReadiness.cfe
		: { ready: false, missing: ["venta confirmada"] };
	const descargablesDocuments = [
		{
			key: "carta-poder",
			title: "Carta poder",
			description: "Abre la vista previa con los datos de este trabajo.",
			href: `/admin/documents/carta-poder/preview?trabajoId=${trabajo.id}`,
			readiness: effectiveDocumentReadiness["carta-poder"],
		},
		{
			key: "ubicacion-cliente",
			title: "Ubicación del cliente",
			description:
				"Revisa la ubicación guardada antes de imprimir o compartir.",
			href: `/admin/documents/ubicacion-cliente/preview?trabajoId=${trabajo.id}`,
			readiness: effectiveDocumentReadiness["ubicacion-cliente"],
		},
		{
			key: "diagrama-unifilar",
			title: "Diagrama unifilar",
			description:
				"Verifica el panel de datos del sistema antes de cerrar la etapa.",
			href: `/admin/documents/diagrama-unifilar/preview?trabajoId=${trabajo.id}`,
			readiness: effectiveDocumentReadiness["diagrama-unifilar"],
		},
		{
			key: "cfe",
			title: "Solicitud CFE",
			description:
				"Descarga el formato de solicitud de interconexión con los datos disponibles.",
			href: `/api/trabajos/${trabajo.id}/cfe`,
			readiness: cfeReadiness,
		},
	] as const;

	return (
		<AppShell
			role={user.role}
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

								<div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
									<ArchiveTrabajoButton trabajoId={trabajo.id} />
								{user.role === "admin" ? (
									<DeleteTrabajoButton trabajoId={trabajo.id} />
								) : null}
									<Link
										href="/admin/trabajos"
										className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--brand-deep)] shadow-sm transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--brand-strong)]/30 hover:bg-[var(--surface)] hover:shadow-md active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none"
					>
						<ArrowLeft size={18} weight="Outline" className="transition-transform duration-200 group-hover:-translate-x-0.5" />
						<span>Trabajos</span>
								</Link>
							</div>
							<TrabajoDetailRealtimeListener trabajoId={trabajo.id} />
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
						isCurrentStage={currentStage === "agenda"}
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
											<svg
												className="h-4 w-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
												/>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
												/>
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
						isCurrentStage={currentStage === "visita"}
					>
						{!trabajo.visita ? (
							<p className="text-sm text-[var(--muted)]">
								Visita no completada.
							</p>
						) : (
							<div className="grid gap-4 md:grid-cols-2">
								<div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3">
									<div>
										<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
											Reporte de visita
										</p>
										<p className="mt-1 text-sm text-[var(--foreground)]">
											Descarga una copia clara de la información capturada.
										</p>
									</div>
									<a
										href={`/api/trabajos/${trabajo.id}/visita`}
										className="inline-flex items-center rounded-full bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-strong)]"
										download
									>
										Descargar reporte PDF
									</a>
								</div>
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
										{/^https?:\/\/|^data:image\//i.test(
											trabajo.visita.utility_bill_asset_id,
										) ? (
											<VisitaAttributeImage
												src={trabajo.visita.utility_bill_asset_id}
												alt="Recibo de luz"
											/>
										) : (
											<p className="text-sm text-[var(--foreground)]">
												Asset ID: {trabajo.visita.utility_bill_asset_id}
											</p>
										)}
									</div>
								)}
								{trabajo.visita.signature_asset_id && (
									<div className="space-y-2 md:col-span-2">
										<p className="text-xs font-medium text-[var(--brand-strong)]">
											Firma
										</p>
										<VisitaAttributeImage
											src={trabajo.visita.signature_asset_id}
											alt="Firma del cliente"
										/>
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
						isCurrentStage={currentStage === "cotizacion"}
					>
						{linkedQuotation ? (
							<div className="space-y-3">
								<div className="flex items-center justify-between rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3">
									<div>
										<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
											Cotización activa
										</p>
										<p className="mt-1 text-sm font-medium text-[var(--foreground)]">
											{linkedQuotation.quotation_number ?? "Sin número"}
											<span className="ml-2 text-xs text-[var(--muted)]">
												{linkedQuotation.status === "draft"
													? "Borrador"
													: linkedQuotation.status === "sent"
														? "Enviada"
														: linkedQuotation.status === "accepted"
															? "Aceptada"
															: linkedQuotation.status}
											</span>
										</p>
										<p className="mt-0.5 text-sm text-[var(--brand-deep)] font-semibold">
											${linkedQuotation.total.toFixed(2)} MXN
										</p>
									</div>
									<div className="flex gap-2">
										{linkedQuotation.pdf_url && (
											<a
												href={`/api/quotations/${linkedQuotation.id}/pdf`}
												className="rounded-full border border-[var(--brand)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand)] transition duration-200 ease-out hover:bg-[var(--surface)]"
											>
												Descargar PDF
											</a>
										)}
										<Link
											href={`/admin/quotations/${linkedQuotation.id}/edit`}
											className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
										>
											Editar cotización
										</Link>
									</div>
								</div>
								{currentStage === "cotizacion" ? (
									<div className="flex justify-end">
										<ConfirmQuotationButton
											quotationId={linkedQuotation.id}
											trabajoId={trabajo.id}
										/>
									</div>
								) : null}
							</div>
						) : isCotizacionEditable && !trabajo.cotizacion ? (
							<div className="space-y-4 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-4">
								<div>
									<p className="text-sm font-semibold text-amber-900">
										Cotización pendiente de crear
									</p>
									<p className="mt-1 text-sm leading-6 text-amber-800">
										Las cotizaciones nuevas se gestionan desde el módulo de
										Cotizaciones para mantener un solo registro, PDF y estado.
									</p>
								</div>
								<Link
									href={`/admin/quotations/new?trabajoId=${encodeURIComponent(trabajo.id)}`}
									className="ui-primary-action w-full justify-center sm:w-auto"
								>
									Crear cotización vinculada
								</Link>
							</div>
						) : isCotizacionEditable ? (
							<CotizacionForm
								trabajoId={trabajo.id}
								defaultValues={quotationDefaults}
							/>
						) : !trabajo.cotizacion ? (
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
								<div className="space-y-1.5">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										RFC
									</p>
									<p className="text-sm font-medium text-[var(--foreground)]">
										{getDisplayValue(trabajo.cotizacion.rfc)}
									</p>
								</div>
								<div className="space-y-1.5">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
										RPU
									</p>
									<p className="text-sm font-medium text-[var(--foreground)]">
										{getDisplayValue(trabajo.cotizacion.rpu)}
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
						isCurrentStage={currentStage === "venta"}
					>
						{!trabajo.venta ? (
							currentStage === "venta" ? (
								<VentaForm
									trabajoId={trabajo.id}
									quotationId={linkedQuotation?.id ?? ""}
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
							<div className="space-y-4">
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
								<a
									href={`/api/trabajos/${trabajo.id}/contrato`}
									className="ui-primary-action w-full justify-center sm:w-auto"
									download
								>
									Descargar contrato
								</a>
							</div>
						)}
						{currentStage === "venta" ? (
							<DocumentInfoForm
								trabajoId={trabajo.id}
								defaults={documentPreviewSubject}
								cfeDefaults={cfePreviewSubject}
								missing={documentMissingFields}
							/>
						) : null}
					</TrabajoStageSection>

					{/* DESCARGABLES */}
					<TrabajoStageSection
						title="Descargables"
						stage="descargables"
						isCompleted={completedStages.includes("descargables")}
						isCurrentStage={currentStage === "descargables"}
					>
						<div className="space-y-4">
							{unifilarPanelCount !== null && unifilarPanelCount > 4 ? (
								<UnifilarDiagramUploadForm
									trabajoId={trabajo.id}
									resolution={unifilarDiagram}
									success={pageParams?.diagramSuccess}
									error={pageParams?.diagramError}
								/>
							) : null}
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
												{document.key === "cfe"
													? "Descargar PDF"
													: "Abrir vista previa"}
											</span>
										</Link>
									);
								})}
								{clientDownloadGroups.map((group) => (
									<section
										key={group.key}
										className="h-full overflow-visible rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface)] p-4"
									>
										<div className="space-y-1">
											<h3 className="text-base font-semibold text-[var(--brand-deep)]">
												{group.title}
											</h3>
											<p className="text-sm text-[var(--muted)]">
												{group.description}
											</p>
										</div>
										<div className="mt-4">
											<DropdownSelect
												name={`${group.key}_document`}
												options={group.documents.map((document) => ({
													label: document.title,
													href: document.href,
													download: true,
												}))}
												placeholder="Selecciona un archivo"
												placement="top"
											/>
										</div>
									</section>
								))}
							</div>

							{trabajo.descargables_completed_at ? (
								<div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-4">
									<p className="text-sm font-medium text-emerald-900">
										Descargables completado
									</p>
									<p className="mt-1 text-sm text-emerald-800">
										Se marcó el{" "}
										{formatDateTime(trabajo.descargables_completed_at)}.
									</p>
								</div>
							) : (
								<div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-4">
									<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
										<div className="space-y-1">
											<p className="text-sm font-medium text-[var(--brand-deep)]">
												{isDescargablesReady
													? "Listo para completar"
													: "Aún no se puede completar"}
											</p>
											<p className="text-sm text-[var(--muted)]">
												{isDescargablesReady
													? "Revisa los tres documentos y marca la etapa cuando estén correctos."
													: "La etapa se habilita cuando Venta esté completada."}
											</p>
										</div>
										{isDescargablesReady ? (
											<DescargablesCompletionForm trabajoId={trabajo.id} />
										) : null}
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
