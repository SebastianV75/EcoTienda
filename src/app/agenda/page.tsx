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
			description="Ingreso mensual de trabajos. Calendario arriba, pendientes abajo."
			email={user?.email}
		>
			<div className="space-y-4">
				{monthNotice ? (
					<section className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
						{monthNotice}
					</section>
				) : null}
				{loadingNotice ? (
					<section className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
						{loadingNotice}
					</section>
				) : null}
				<AgendaCalendarSection year={year} month={month} items={monthItems} />
				<AgendaPendingList items={pendingItems} />
			</div>
		</AppShell>
	);
}
