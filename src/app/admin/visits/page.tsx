import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

export default async function VisitsPage() {
	if (hasSupabaseEnv()) {
		await requireRole(["admin"]);
	}

	return (
		<AppShell
			role="admin"
			title="Technical visits"
			description="Phase 3 will implement scheduling, field forms, and visit reporting here."
		>
			<section className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-sm leading-7 text-slate-300">
				The route exists now so the future module lands inside the correct
				protected structure.
			</section>
		</AppShell>
	);
}
