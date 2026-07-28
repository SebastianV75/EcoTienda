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
				
				{pendingItems.length === 0 ? (
					<section className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
						<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-50">
							<svg
								className="h-10 w-10 text-purple-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900">
							No hay trabajos pendientes de agenda
						</h3>
						<p className="mt-2 text-sm text-gray-600">
							Los trabajos nuevos aparecerán aquí para que les asignes una visita técnica.
						</p>
						<Link
							href="/admin/trabajos"
							className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-purple-700"
						>
							Ver todos los trabajos
						</Link>
					</section>
				) : (
					<AgendaPendingList items={pendingItems} />
				)}
			</div>
		</AppShell>
	);
}
