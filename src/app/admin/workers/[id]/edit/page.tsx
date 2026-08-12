import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { getWorkerById } from "@/features/workers/data";
import { WorkerForm } from "@/features/workers/worker-form";

export default async function EditWorkerPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const user = await requireRole(["admin"]);
	const { id } = await params;
	const worker = await getWorkerById(id);

	return (
		<AppShell
			role="admin"
			title={`Editar ${worker.full_name}`}
			description="Actualiza el perfil, el rol y el estado activo. El vínculo de acceso se conserva automáticamente."
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
					<WorkerForm
						mode="edit"
						workerId={worker.id}
						workerUpdatedAt={worker.updated_at}
						defaultValues={{
							full_name: worker.full_name,
							email: worker.email ?? "",
							phone: worker.phone ?? "",
							role: worker.role,
							active: worker.active,
						}}
					/>
				</section>
			</div>
		</AppShell>
	);
}
