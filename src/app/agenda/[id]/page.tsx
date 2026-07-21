import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { AgendaItemDetail } from "@/features/agenda/agenda-item-detail";
import { getAgendaItemById } from "@/features/agenda/data";
import { getCurrentUser, requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

const defaultRole = "admin" as const;

export default async function AgendaItemPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const user = hasSupabaseEnv()
		? await requireRole(["admin", "technician"])
		: await getCurrentUser();
	const { id } = await params;
	const item = await getAgendaItemById(id);

	if (!item) {
		notFound();
	}

	const role = user?.role ?? defaultRole;

	return (
		<AppShell
			role={role}
			title={item.titulo}
			description="Consulta el detalle operativo del trabajo, su contacto y su estado de seguimiento."
			email={user?.email}
		>
			<AgendaItemDetail item={item} role={role} />
		</AppShell>
	);
}
