import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { AgendaItemForm } from "@/features/agenda/agenda-item-form";
import { getAgendaItemById } from "@/features/agenda/data";
import { requireRole } from "@/features/auth/session";
import { getActiveWorkers } from "@/features/workers/data";
import {
	agendaWorkTypeLabels,
	type AgendaWorkTypeOption,
} from "@/types/agenda";

function splitFullName(fullName: string | null | undefined) {
	const parts = (fullName ?? "")
		.trim()
		.split(/\s+/)
		.filter(Boolean);

	if (parts.length === 0) {
		return {
			firstName: "",
			paternalLastName: "",
			maternalLastName: "",
		};
	}

	if (parts.length === 1) {
		return {
			firstName: parts[0],
			paternalLastName: "",
			maternalLastName: "",
		};
	}

	if (parts.length === 2) {
		return {
			firstName: parts[0],
			paternalLastName: parts[1],
			maternalLastName: "",
		};
	}

	return {
		firstName: parts.slice(0, -2).join(" "),
		paternalLastName: parts.at(-2) ?? "",
		maternalLastName: parts.at(-1) ?? "",
	};
}

function inferWorkTypeChoice(workType: string | null): {
	choice: AgendaWorkTypeOption;
	other: string;
} {
	switch ((workType ?? "").trim()) {
		case agendaWorkTypeLabels.minisplit:
			return { choice: "minisplit", other: "" };
		case agendaWorkTypeLabels.paneles_solares:
			return { choice: "paneles_solares", other: "" };
		case agendaWorkTypeLabels.extension_sistema:
			return { choice: "extension_sistema", other: "" };
		case "":
			return { choice: "paneles_solares", other: "" };
		default:
			return { choice: "otro", other: workType ?? "" };
	}
}

export default async function EditAgendaItemPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const user = await requireRole(["admin"]);
	const { id } = await params;
	const item = await getAgendaItemById(id);

	if (!item) {
		notFound();
	}

	let workers: Awaited<ReturnType<typeof getActiveWorkers>> = [];
	let workersNotice: string | null = null;

	try {
		workers = await getActiveWorkers();
	} catch {
		workersNotice =
			"No hay trabajadores activos disponibles en este momento. Necesitas al menos uno para guardar estos cambios.";
	}

	if (!workersNotice && workers.length === 0) {
		workersNotice =
			"No hay trabajadores activos disponibles en este momento. Necesitas al menos uno para guardar estos cambios.";
	}

	const splitName = splitFullName(item.contact_name ?? item.titulo);
	const workTypeSelection = inferWorkTypeChoice(item.work_type ?? "");

	return (
		<AppShell
			role="admin"
			title={`Editar ${item.titulo}`}
			description="Ajusta el ingreso de Agenda sin cambiar la lógica de etapa ni romper la continuidad del Trabajo."
			email={user.email}
		>
			<div className="space-y-4">
				<Link
					href={`/agenda/${item.id}`}
					className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
				>
					Volver al detalle
				</Link>

				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
						Ajuste de ingreso
					</p>
					<h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] sm:text-3xl">
						Mantén la Agenda alineada con el Trabajo
					</h1>
					<p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
						Corrige el nombre, la ubicación y el tipo de trabajo desde la misma
						superficie de intake. El siguiente paso operativo no cambia aquí.
					</p>
				</section>

				{workersNotice ? (
					<section className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
						{workersNotice}
					</section>
				) : null}

				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
					<AgendaItemForm
						mode="edit"
						agendaItemId={item.id}
						workers={workers}
						defaultValues={{
							fecha: item.fecha,
							hora: item.appointment_at
								? item.appointment_at.slice(11, 16)
								: "08:00",
							tipo: item.tipo,
							estado: item.estado,
							title: item.titulo,
							work_type: item.work_type ?? "",
							work_type_choice: workTypeSelection.choice,
							work_type_other: workTypeSelection.other,
							assignee_worker_id: item.assignee_worker_id ?? "",
							assignee_name:
								item.assignee_worker?.full_name ?? item.assignee_name ?? "",
							first_name: item.first_name ?? splitName.firstName,
							paternal_last_name:
								item.paternal_last_name ?? splitName.paternalLastName,
							maternal_last_name:
								item.maternal_last_name ?? splitName.maternalLastName,
							contact_name: item.contact_name ?? item.titulo,
							contact_phone: item.contact_phone ?? "",
							email: item.email ?? "",
							address_text: item.address_text ?? "",
							latitude: item.latitude?.toString() ?? "",
							longitude: item.longitude?.toString() ?? "",
							descripcion: item.descripcion ?? "",
						}}
					/>
				</section>
			</div>
		</AppShell>
	);
}
