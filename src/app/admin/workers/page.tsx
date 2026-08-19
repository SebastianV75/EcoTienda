import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { EmptyState } from "@/components/empty-state";
import { WorkerCard } from "@/features/workers/worker-card";
import { getWorkers } from "@/features/workers/data";

export default async function WorkersPage({
	searchParams,
}: {
	searchParams?: Promise<{ q?: string }>;
}) {
	const user = await requireRole(["admin"]);
	const params = searchParams ? await searchParams : undefined;
	const query = params?.q ?? "";
	const workers = await getWorkers(query);

	return (
		<AppShell
			role="admin"
			title="Trabajadores"
			description="Administra al equipo interno, sus roles y si siguen activos para el trabajo operativo."
			email={user.email}
		>
				<div className="space-y-6">
					<section className="flex flex-col gap-3 border-b border-[var(--border-soft)] pb-5 md:flex-row md:items-center md:justify-between">
						<form className="flex min-w-0 flex-1 gap-2">
							<input
								name="q"
								defaultValue={query}
								placeholder="Buscar por nombre, correo, rol o teléfono"
								className="h-11 min-w-0 flex-1 rounded-xl border border-[var(--border-soft)] bg-white px-3.5 text-sm text-[var(--foreground)] outline-none transition duration-200 ease-out placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-4 focus:ring-emerald-100/60"
							/>
							<button
								type="submit"
								className="h-11 rounded-xl bg-[var(--brand-deep)] px-4 text-sm font-medium text-white transition duration-200 ease-out hover:bg-[var(--brand)] active:scale-[0.98]"
							>
								Buscar
						</button>
					</form>

						<Link
							href="/admin/workers/new"
							className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--brand)] px-4 text-sm font-semibold text-[var(--brand-deep)] transition duration-200 ease-out hover:bg-emerald-50 active:scale-[0.98] md:shrink-0"
						>
							<span aria-hidden="true" className="mr-2 text-lg leading-none">+</span>
							Nuevo trabajador
					</Link>
				</section>

				{workers.length > 0 ? (
						<section className="grid gap-3 lg:grid-cols-2">
						{workers.map((worker) => (
							<WorkerCard key={worker.id} worker={worker} />
						))}
					</section>
				) : (
					<EmptyState
						eyebrow="Sin resultados"
						title={query ? "No se encontraron trabajadores" : "Todavía no hay trabajadores registrados"}
						description={query ? "Intenta con otra búsqueda." : "Empieza con el primer trabajador para usarlo después en la operación interna."}
					/>
					)}
			</div>
		</AppShell>
	);
}
