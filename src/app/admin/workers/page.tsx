import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
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
			<div className="space-y-4">
				<section className="flex flex-col gap-3 rounded-[26px] border border-[var(--border-soft)] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
					<form className="flex w-full flex-col gap-3 sm:flex-row">
						<input
							name="q"
							defaultValue={query}
							placeholder="Buscar por nombre, rol o teléfono"
							className="w-full rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						/>
						<button
							type="submit"
							className="rounded-full bg-[var(--surface-strong)] px-4 py-3 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:bg-emerald-100"
						>
							Buscar
						</button>
					</form>

					<Link
						href="/admin/workers/new"
						className="inline-flex rounded-full bg-[var(--brand)] px-4 py-3 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
					>
						Nuevo trabajador
					</Link>
				</section>

				{workers.length > 0 ? (
					<section className="grid gap-4 lg:grid-cols-2">
						{workers.map((worker) => (
							<WorkerCard key={worker.id} worker={worker} />
						))}
					</section>
				) : (
					<section className="rounded-[26px] border border-[var(--border-soft)] bg-white p-8 text-center shadow-sm">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							Sin resultados
						</p>
						<h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
							Todavía no hay trabajadores registrados
						</h2>
						<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
							Empieza con el primer trabajador para usarlo después en la
							operación interna.
						</p>
					</section>
				)}
			</div>
		</AppShell>
	);
}
