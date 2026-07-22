import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { AgendaItemDetail } from "@/features/agenda/agenda-item-detail";
import { getAgendaItemById } from "@/features/agenda/data";
import { requireRole } from "@/features/auth/session";

import { getTrabajoVisitaById } from "@/features/trabajos/data";
import { VisitaForm } from "@/features/trabajos/visita-form";
import type { VisitaFormValues } from "@/features/trabajos/actions";

function pickText(...values: Array<string | null | undefined>) {
	return (
		values
			.find((value) => typeof value === "string" && value.trim().length > 0)
			?.trim() ?? ""
	);
}

function pickJsonNotes(value: unknown) {
	if (!value || typeof value !== "object") {
		return "";
	}

	const record = value as Record<string, unknown>;
	const note = record.notes;
	return typeof note === "string" ? note : "";
}

function buildDefaultValues(
	work: NonNullable<Awaited<ReturnType<typeof getTrabajoVisitaById>>>,
) {
	const agenda = work.agenda;
	const visita = work.visita;

	return {
		trabajo_id: work.id,
		execution_date: visita?.execution_date ?? "",
		contact_name: pickText(
			visita?.contact_name,
			agenda?.contact_name,
			work.intake_name,
		),
		contact_phone: pickText(
			visita?.contact_phone,
			agenda?.contact_phone,
			work.intake_phone,
		),
		confirmed_address: pickText(
			visita?.confirmed_address,
			agenda?.address_text,
			work.intake_address_text,
		),
		utility_bill_asset_id: visita?.utility_bill_asset_id ?? "",
		interest_package: visita?.interest_package ?? "",
		quotation_type: visita?.quotation_type ?? agenda?.work_type ?? "",
		house_notes: pickJsonNotes(visita?.house_attributes),
		electrical_notes: pickJsonNotes(visita?.electrical_attributes),
		roof_notes: pickJsonNotes(visita?.roof_attributes),
		minisplit_notes: pickJsonNotes(visita?.minisplit_attributes),
		notes: visita?.notes ?? "",
		signature_asset_id: visita?.signature_asset_id ?? "",
	} satisfies VisitaFormValues;
}

export default async function WorkVisitPage({
	params,
}: {
	params: Promise<{ trabajoId: string }>;
}) {
	const user = await requireRole(["admin"]);
	const { trabajoId } = await params;
	const work = await getTrabajoVisitaById(trabajoId);

	if (!work) {
		const legacyItem = await getAgendaItemById(trabajoId);

		if (!legacyItem) {
			notFound();
		}

		return (
			<AppShell
				role="admin"
				title={legacyItem.titulo}
				description="Este registro todavía vive en la Agenda clásica. Ábrelo desde Agenda para seguir el flujo de trabajo."
				email={user.email}
			>
				<div className="space-y-4">
					<section className="rounded-[26px] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
						<p className="text-sm leading-7 text-[var(--muted)]">
							Este elemento todavía no tiene un shell de Trabajo. Podés
							revisarlo en Agenda y abrir el flujo desde allí.
						</p>
						<div className="mt-4 flex flex-wrap gap-3">
							<Link
								href={`/agenda/${legacyItem.id}`}
								className="inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white"
							>
								Ver detalle en Agenda
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
			role="admin"
			title={work.agenda?.contact_name || work.intake_name}
			description="La visita es la etapa actual. Completa el campo y deja lista la transición a Cotización."
			email={user.email}
		>
			<div className="space-y-4">
				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
						Etapa actual
					</p>
					<div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div className="min-w-0">
							<h1 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] sm:text-[1.9rem]">
								Visita de campo
							</h1>
							<p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
								Este trabajo ya salió de Agenda. Completa la visita y, al
								guardar, el flujo avanza a Cotización.
							</p>
						</div>

						<Link
							href={`/agenda/${work.id}`}
							className="inline-flex min-h-[40px] items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(13,79,46,0.18)] hover:bg-[rgba(239,246,239,0.96)] hover:shadow-[0_8px_20px_rgba(10,44,21,0.05)] active:scale-[0.96]"
						>
							Ver en Agenda
						</Link>
					</div>

					<div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
						<span>Origen: Agenda</span>
						<span>Siguiente etapa: Cotización</span>
					</div>

					{work.visita ? (
						<p className="mt-4 text-sm font-medium text-[var(--brand-deep)]">
							Visita ya iniciada.
						</p>
					) : null}
				</section>

				<section className="rounded-[24px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
					<VisitaForm
						trabajoId={work.id}
						defaultValues={buildDefaultValues(work)}
					/>
				</section>
			</div>
		</AppShell>
	);
}
