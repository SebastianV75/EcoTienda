import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

export default async function SettingsPage() {
	if (hasSupabaseEnv()) {
		await requireRole(["admin"]);
	}

	return (
		<AppShell
			role="admin"
			title="Settings"
			description="Configuration, user management, and platform governance will expand from this area."
		>
			<section className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-sm leading-7 text-slate-300">
				Phase 0 only establishes the shell, role guards, and setup guidance.
			</section>
		</AppShell>
	);
}
