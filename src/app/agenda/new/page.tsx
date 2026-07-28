import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { AgendaItemForm } from "@/features/agenda/agenda-item-form";
import { requireRole } from "@/features/auth/session";
import { getActiveWorkers } from "@/features/workers/data";
import {
	agendaWorkTypeLabels,
	type AgendaItemFormValues,
} from "@/types/agenda";

function buildAgendaTitle(workType: string, contactName: string) {
	const baseTitle = workType.trim() || "Visita técnica";
	const contactLabel = contactName.trim() || "Nuevo trabajo";

	return `${baseTitle} · ${contactLabel}`;
}

function buildDefaultValues(date?: string): AgendaItemFormValues {
	const values = {
		fecha:
			date && /^\d{4}-\d{2}-\d{2}$/.test(date)
				? date
				: new Date().toISOString().slice(0, 10),
		hora: "08:00",
		tipo: "visita_tecnica",
		estado: "pendiente",
		work_type: agendaWorkTypeLabels.paneles_solares,
		work_type_choice: "paneles_solares",
		work_type_other: "",
		assignee_worker_id: "",
		assignee_name: "",
		first_name: "",
		paternal_last_name: "",
		maternal_last_name: "",
		contact_name: "",
		contact_phone: "",
		address_text: "",
		latitude: "",
		longitude: "",
		descripcion: "",
	} satisfies Omit<AgendaItemFormValues, "title">;

	return {
		...values,
		title: buildAgendaTitle(values.work_type, values.contact_name),
	};
}

type NewAgendaItemPageProps = {
	searchParams?: Promise<{
		source?: string;
		date?: string;
	}>;
};

export default async function NewAgendaItemPage({
	searchParams,
}: NewAgendaItemPageProps) {
	const user = await requireRole(["admin"]);
	const resolvedSearchParams = searchParams ? await searchParams : undefined;
	const fromDashboard = resolvedSearchParams?.source === "admin-dashboard";
	const defaultValues = buildDefaultValues(resolvedSearchParams?.date);

	let workers: Awaited<ReturnType<typeof getActiveWorkers>> = [];
	let workersNotice: string | null = null;

	try {
		workers = await getActiveWorkers();
	} catch {
		workersNotice =
			"No hay trabajadores activos disponibles en este momento. Necesitas al menos uno para crear este ingreso.";
	}

	if (!workersNotice && workers.length === 0) {
		workersNotice =
			"No hay trabajadores activos disponibles en este momento. Necesitas al menos uno para crear este ingreso.";
	}

	return (
		<AppShell
			role="admin"
			title="Nuevo trabajo de Agenda"
			description="Crea el ingreso inicial del Trabajo desde Agenda con una sola superficie sobria y continua."
			email={user.email}
		>
			<div className="space-y-4">
				<Link
					href="/agenda"
					className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
				>
					Volver a agenda
				</Link>

				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
						Inicio de Trabajo
					</p>
					<h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] sm:text-3xl">
						Abrir un ingreso desde Agenda
					</h1>
					<p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
						Captura el trabajo en una sola pasada. El título se arma con tipo de
						trabajo y nombre completo mientras no lo cambies a mano.
					</p>
				</section>

				<div className="space-y-3">
					{fromDashboard ? (
						<section className="rounded-[22px] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
							Abriste este ingreso desde el tablero. Revisa el título antes de
							guardar.
						</section>
					) : null}

					{workersNotice ? (
						<section className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
							{workersNotice}
						</section>
					) : null}

					{resolvedSearchParams?.date ? (
						<section className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
							Este trabajo se abrirá para la fecha {defaultValues.fecha}.
						</section>
					) : null}
				</div>

				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
					<AgendaItemForm
						mode="create"
						workers={workers}
						defaultValues={defaultValues}
					/>
				</section>
			</div>
		</AppShell>
	);
}
