import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { AgendaItemForm } from "@/features/agenda/agenda-item-form";
import { getAgendaItemById } from "@/features/agenda/data";
import { requireRole } from "@/features/auth/session";
import { getClients } from "@/features/clients/data";

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

	let clients: Awaited<ReturnType<typeof getClients>> = [];
	let clientsNotice: string | null = null;

	try {
		clients = await getClients();
	} catch {
		clientsNotice =
			"No pudimos cargar la lista de clientes en este momento. Puedes ajustar el resto del ingreso y reintentar la vinculación más tarde.";
	}

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
						Corrige título, contacto y ubicación desde la misma superficie de
						intake. El siguiente paso operativo no cambia aquí.
					</p>
				</section>

				{clientsNotice ? (
					<section className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
						{clientsNotice}
					</section>
				) : null}

				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
					<AgendaItemForm
						mode="edit"
						agendaItemId={item.id}
						clients={clients.map((client) => ({
							id: client.id,
							full_name: client.full_name,
							rpu: client.rpu,
						}))}
						defaultValues={{
							fecha: item.fecha,
							hora: item.appointment_at
								? item.appointment_at.slice(11, 16)
								: "08:00",
							tipo: item.tipo,
							estado: item.estado,
							title: item.titulo,
							work_type: item.work_type ?? "",
							assignee_name: item.assignee_name ?? "",
							contact_name:
								item.contact_name ?? item.client?.full_name ?? item.titulo,
							contact_phone: item.contact_phone ?? item.client?.phone ?? "",
							address_text: item.address_text ?? "",
							latitude: item.latitude?.toString() ?? "",
							longitude: item.longitude?.toString() ?? "",
							descripcion: item.descripcion ?? "",
							client_id: item.client_id ?? "",
						}}
					/>
				</section>
			</div>
		</AppShell>
	);
}
