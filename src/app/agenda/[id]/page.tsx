import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { deleteAgendaItemAction } from "@/features/agenda/actions";
import { AgendaDeleteButton } from "@/features/agenda/agenda-delete-button";
import { AgendaItemDetail } from "@/features/agenda/agenda-item-detail";
import { getAgendaItemById } from "@/features/agenda/data";
import { getCurrentUser, requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

const defaultRole = "admin" as const;

function getStageCopy(hasWorkflowBridge: boolean, hasCompletedVisit: boolean) {
	if (!hasWorkflowBridge) {
		return {
			kicker: "Registro legado",
			title: "Agenda sigue siendo comprensible sin un Trabajo vinculado",
			description:
				"Este elemento no tiene puente a Visitas. Sigue sirviendo como referencia histórica de Agenda sin romper el contexto.",
			nextStep: "Sin continuidad a Visitas",
		};
	}

	if (hasCompletedVisit) {
		return {
			kicker: "Continuidad de Trabajo",
			title: "La visita ya está cerrada",
			description:
				"La información de Agenda y la visita ya están guardadas. Continúa en el Trabajo para revisar o completar la cotización.",
			nextStep: "Abrir trabajo",
		};
	}

	return {
		kicker: "Continuidad de Trabajo",
		title: "Agenda ya está enlazada con Visitas",
		description:
			"Este registro ya vive dentro del flujo operativo. Agenda capturó el ingreso y el siguiente paso está en Visitas.",
		nextStep: "Abrir visita",
	};
}

export default async function AgendaItemPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const user = hasSupabaseEnv()
		? await requireRole(["admin"])
		: await getCurrentUser();
	const { id } = await params;
	const item = await getAgendaItemById(id);

	if (!item) {
		notFound();
	}

	const role = user?.role ?? defaultRole;
	const hasWorkflowBridge = Boolean(item.trabajo_id);
	const hasCompletedVisit = hasWorkflowBridge && Boolean(item.visit_id);
	const stageCopy = getStageCopy(hasWorkflowBridge, hasCompletedVisit);

	return (
		<AppShell
			role={role}
			title={item.titulo}
			description="Detalle de Agenda con claridad de etapa, continuidad y siguiente acción operativa."
			email={user?.email}
		>
			<div className="space-y-4">
				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
						{stageCopy.kicker}
					</p>
					<h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] sm:text-3xl">
						{stageCopy.title}
					</h1>
					<p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
						{stageCopy.description}
					</p>

					<div className="mt-5 grid gap-3 sm:grid-cols-2">
						<div className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3">
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
								Etapa actual
							</p>
							<p className="mt-2 text-sm font-medium text-[var(--brand-deep)]">
								Agenda
							</p>
						</div>
						<div className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3">
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
								Siguiente paso
							</p>
							{hasWorkflowBridge ? (
								<Link
									href={
										hasCompletedVisit
											? `/admin/trabajos/${item.trabajo_id}`
											: `/admin/visits/${item.trabajo_id}`
									}
									className="mt-2 inline-flex text-sm font-medium text-[var(--brand-deep)] underline decoration-emerald-300 underline-offset-4 transition hover:text-[var(--brand-strong)]"
								>
									{hasCompletedVisit ? "Abrir trabajo" : "Abrir visita"}
								</Link>
							) : (
								<p className="mt-2 text-sm font-medium text-[var(--brand-deep)]">
									Sin continuidad a Visitas
								</p>
							)}
						</div>
					</div>

					{role === "admin" ? (
						<div className="mt-4 flex justify-end">
							<AgendaDeleteButton
								agendaItemId={item.id}
								action={deleteAgendaItemAction}
							/>
						</div>
					) : null}
				</section>

				<AgendaItemDetail item={item} role={role} />
			</div>
		</AppShell>
	);
}
