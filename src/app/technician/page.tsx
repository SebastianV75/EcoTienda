import { AppShell } from "@/components/app-shell";
import { getCurrentUser, requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

export default async function TechnicianPage() {
	const user = hasSupabaseEnv()
		? await requireRole(["admin", "technician"])
		: await getCurrentUser();

	return (
		<AppShell
			role="technician"
			title="Technician mobile area"
			description="This Phase 0 placeholder marks the protected mobile-first area for assigned field work."
			email={user?.email}
		>
			<section className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-sm leading-7 text-slate-300">
				Later phases will connect this area to assigned visits, geolocation
				capture, and field report generation.
			</section>
		</AppShell>
	);
}
