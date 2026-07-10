import Link from "next/link";

export default function UnauthorizedPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
			<div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-xl shadow-slate-950/40">
				<p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
					Access denied
				</p>
				<h1 className="mt-3 text-3xl font-semibold tracking-tight">
					You do not have permission to open this area.
				</h1>
				<p className="mt-4 text-sm leading-7 text-slate-300">
					Phase 0 already separates protected areas by role. Update the
					authenticated user role in Supabase metadata or profile data before
					testing restricted flows.
				</p>
				<Link
					href="/"
					className="mt-6 inline-flex rounded-full bg-white px-4 py-2 font-medium text-slate-950 transition hover:bg-slate-100"
				>
					Back to home
				</Link>
			</div>
		</main>
	);
}
