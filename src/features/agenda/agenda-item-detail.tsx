import Link from "next/link";

import {
	agendaItemStateBadgeClasses,
	agendaItemStateLabels,
	agendaItemTypeLabels,
	type AgendaItem,
} from "@/types/agenda";
import type { AppRole } from "@/types/auth";

type AgendaItemDetailProps = {
	item: AgendaItem;
	role: AppRole;
};

function formatAgendaTimestamp(value: string) {
	return new Intl.DateTimeFormat("es-MX", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: "UTC",
	}).format(new Date(value));
}

export function AgendaItemDetail({ item, role }: AgendaItemDetailProps) {
	const hasWorkflowBridge = Boolean(item.trabajo_id && item.estado === "pendiente");

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-3">
				<Link
					href="/agenda"
					className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
				>
					Volver a agenda
				</Link>
				{role === "admin" ? (
					<Link
						href={`/agenda/${item.id}/edit`}
						className="inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
					>
						Editar elemento
					</Link>
				) : null}
					{hasWorkflowBridge ? (
						<Link
							href={`/admin/visits/${item.trabajo_id}`}
							className="inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
						>
							Abrir visita
						</Link>
					) : null}
			</div>

			<section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
				<article className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
					<div className="flex flex-wrap items-start justify-between gap-3">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
								{agendaItemTypeLabels[item.tipo]}
							</p>
							<h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)] sm:text-3xl">
								{item.titulo}
							</h2>
						</div>
						<span
							className={`inline-flex min-h-[34px] items-center rounded-full border px-3 text-sm font-medium ${agendaItemStateBadgeClasses[item.estado]}`}
						>
							{agendaItemStateLabels[item.estado]}
						</span>
					</div>

						<dl className="mt-6 grid gap-5 sm:grid-cols-2">
							<div>
								<dt className="text-sm font-medium text-[var(--brand-deep)]">Fecha programada</dt>
								<dd className="mt-1 text-sm leading-6 text-[var(--muted)]">
									{item.appointment_at ? formatAgendaTimestamp(item.appointment_at) : item.fecha}
								</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-[var(--brand-deep)]">Tipo</dt>
								<dd className="mt-1 text-sm leading-6 text-[var(--muted)]">{agendaItemTypeLabels[item.tipo]}</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-[var(--brand-deep)]">Trabajo solicitado</dt>
								<dd className="mt-1 text-sm leading-6 text-[var(--muted)]">
									{item.work_type?.trim() || "Sin descripción de trabajo."}
								</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-[var(--brand-deep)]">Contacto</dt>
								<dd className="mt-1 text-sm leading-6 text-[var(--muted)]">
									{item.contact_name?.trim() || item.client?.full_name || "Sin contacto"}
								</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-[var(--brand-deep)]">Teléfono</dt>
								<dd className="mt-1 text-sm leading-6 text-[var(--muted)]">
									{item.contact_phone?.trim() || item.client?.phone || "Sin teléfono"}
								</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-[var(--brand-deep)]">Creado</dt>
								<dd className="mt-1 text-sm leading-6 text-[var(--muted)]">{formatAgendaTimestamp(item.created_at)}</dd>
							</div>
						<div>
							<dt className="text-sm font-medium text-[var(--brand-deep)]">Última actualización</dt>
							<dd className="mt-1 text-sm leading-6 text-[var(--muted)]">{formatAgendaTimestamp(item.updated_at)}</dd>
						</div>
					</dl>

						<div className="mt-6 rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
							<p className="text-sm font-medium text-[var(--brand-deep)]">Descripción</p>
							<p className="mt-2 text-sm leading-7 text-[var(--muted)]">
								{item.descripcion?.trim() || "Sin descripción adicional."}
							</p>
						</div>
					</article>

				<article className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
						Vinculación operativa
					</p>
						<dl className="mt-5 space-y-4 text-sm text-[var(--muted)]">
							<div>
								<dt className="font-medium text-[var(--brand-deep)]">Cliente vinculado</dt>
								<dd className="mt-1 leading-6">
									{item.client ? item.client.full_name : "Sin cliente asociado"}
								</dd>
							</div>
							{item.address_text ? (
								<div>
									<dt className="font-medium text-[var(--brand-deep)]">Dirección capturada</dt>
									<dd className="mt-1 leading-6">{item.address_text}</dd>
								</div>
							) : null}
							{item.latitude !== null && item.longitude !== null ? (
								<div>
									<dt className="font-medium text-[var(--brand-deep)]">Coordenadas</dt>
									<dd className="mt-1 leading-6">
										{item.latitude}, {item.longitude}
									</dd>
								</div>
							) : null}
							{item.client ? (
								<>
									<div>
									<dt className="font-medium text-[var(--brand-deep)]">Teléfono</dt>
									<dd className="mt-1">{item.client.phone}</dd>
								</div>
								<div>
									<dt className="font-medium text-[var(--brand-deep)]">RPU</dt>
									<dd className="mt-1">{item.client.rpu}</dd>
								</div>
								</>
							) : null}
							<div>
								<dt className="font-medium text-[var(--brand-deep)]">Trabajo</dt>
								<dd className="mt-1">{item.trabajo_id || item.visit_id || "Sin referencia"}</dd>
							</div>
						</dl>
					</article>
			</section>
		</div>
	);
}
