import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { WorkerForm } from "@/features/workers/worker-form";

export default async function NewWorkerPage() {
	const user = await requireRole(["admin"]);

	return (
		<AppShell
			role="admin"
			title="Nuevo trabajador"
			description="Registra a una persona del equipo con su rol operativo y vínculo de auth opcional."
			email={user.email}
		>
			<div className="space-y-4">
				<Link
					href="/admin/workers"
					className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
				>
					Volver a trabajadores
				</Link>

				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
					<WorkerForm mode="create" />
				</section>
			</div>
		</AppShell>
	);
}
