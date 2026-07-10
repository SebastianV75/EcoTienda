import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

export default async function DocumentsPage() {
	if (hasSupabaseEnv()) {
		await requireRole(["admin"]);
	}

	return (
		<AppShell
			role="admin"
			title="Downloadable documents"
			description="Phase 1 will implement the internal template flows and PDF generation here."
		>
			<section className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-sm leading-7 text-slate-300">
				The route is live and protected by the same role guard foundation used
				by the admin area.
			</section>
		</AppShell>
	);
}
