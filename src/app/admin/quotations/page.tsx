import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

export default async function QuotationsPage() {
	if (hasSupabaseEnv()) {
		await requireRole(["admin"]);
	}

	return (
		<AppShell
			role="admin"
			title="Quotations"
			description="Phase 2 will implement catalog browsing, calculations, and quotation exports here."
		>
			<section className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-sm leading-7 text-slate-300">
				This placeholder keeps Darian&apos;s future module inside the shared
				Phase 0 shell.
			</section>
		</AppShell>
	);
}
