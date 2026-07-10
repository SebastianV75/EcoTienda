import { AppShell } from "@/components/app-shell";
import { SetupNotice } from "@/components/setup-notice";
import { getCurrentUser, requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

const adminHighlights = [
	"Authentication and role-aware route foundations are ready for integration.",
	"Downloadable documents stays the first module to ship after Phase 0.",
	"Quotations and technical visits already have placeholder routes to preserve structure.",
];

export default async function AdminPage() {
	const user = hasSupabaseEnv()
		? await requireRole(["admin"])
		: await getCurrentUser();

	return (
		<AppShell
			role="admin"
			title="Admin foundation"
			description="Shared shell for documents, quotations, visits, and settings."
			email={user?.email}
		>
			{!hasSupabaseEnv() ? <SetupNotice /> : null}

			<section className="grid gap-4 md:grid-cols-3">
				{adminHighlights.map((item) => (
					<article
						key={item}
						className="rounded-3xl border border-white/10 bg-white/5 p-5"
					>
						<p className="text-sm leading-7 text-slate-300">{item}</p>
					</article>
				))}
			</section>
		</AppShell>
	);
}
