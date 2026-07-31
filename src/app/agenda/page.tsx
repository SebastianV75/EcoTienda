import { EmptyState } from "@/components/empty-state";
import { Alert } from "@/components/ui/feedback";
import { AppShell } from "@/components/app-shell";
import { AgendaCalendarSection } from "@/features/agenda/agenda-calendar-section";
import { AgendaPendingList } from "@/features/agenda/agenda-pending-list";
import { parseMonthParam } from "@/features/agenda/calendar-utils";
import {
	getAgendaItemsForMonth,
	getPendingAgendaItems,
} from "@/features/agenda/data";
import { getCurrentUser, requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";
import Link from "next/link";

const defaultRole = "admin" as const;

type AgendaPageProps = {
	searchParams?: Promise<{
		month?: string;
	}>;
};

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
	const user = hasSupabaseEnv()
		? await requireRole(["admin"])
		: await getCurrentUser();
	const resolvedSearchParams = searchParams ? await searchParams : undefined;

	let monthNotice: string | null = null;
	let parsedMonth = parseMonthParam();

	if (resolvedSearchParams?.month) {
		try {
			parsedMonth = parseMonthParam(resolvedSearchParams.month);
		} catch {
			monthNotice =
				"El mes pedido no es válido. Mostramos la agenda del mes actual para seguir trabajando.";
		}
	}

	const { year, month } = parsedMonth;
	const [monthItemsResult, pendingItemsResult] = await Promise.allSettled([
		getAgendaItemsForMonth(year, month),
		getPendingAgendaItems(),
	]);

	const monthItems =
		monthItemsResult.status === "fulfilled" ? monthItemsResult.value : [];
	const pendingItems =
		pendingItemsResult.status === "fulfilled" ? pendingItemsResult.value : [];
	const loadingNotice =
		monthItemsResult.status === "rejected" ||
		pendingItemsResult.status === "rejected"
			? "Parte de la agenda no cargó. Mostramos lo disponible para no cortar el flujo operativo."
			: null;

	return (
		<AppShell
			role={user?.role ?? defaultRole}
			title="Agenda"
			description="Trabajos en etapa de agenda. Programa visitas técnicas desde aquí."
			email={user?.email}
		>
			<div className="space-y-4">
				{monthNotice ? <Alert variant="warning">{monthNotice}</Alert> : null}
				{loadingNotice ? (
					<Alert variant="warning">{loadingNotice}</Alert>
				) : null}
				<AgendaCalendarSection year={year} month={month} items={monthItems} />

				{pendingItems.length === 0 ? (
					<EmptyState
						eyebrow="Agenda despejada"
						title="No hay trabajos pendientes de agenda"
						description="Los trabajos nuevos aparecerán aquí para que les asignes una visita técnica."
						action={
							<Link href="/admin/trabajos" className="ui-secondary-action">
								Ver todos los trabajos
							</Link>
						}
					/>
				) : (
					<AgendaPendingList items={pendingItems} />
				)}
			</div>
		</AppShell>
	);
}
