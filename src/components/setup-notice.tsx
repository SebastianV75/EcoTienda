import Link from "next/link";

export function SetupNotice() {
	return (
		<section className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-50 shadow-lg shadow-amber-950/20">
			<p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
				Setup required
			</p>
			<h2 className="mt-2 text-2xl font-semibold text-white">
				Connect Supabase before enabling protected flows
			</h2>
			<p className="mt-3 max-w-2xl leading-7 text-amber-50/90">
				Add the project keys in{" "}
				<code className="rounded bg-black/30 px-1.5 py-0.5">.env.local</code>{" "}
				and then configure the initial users in Supabase Auth. Once the
				environment is present, the server-side guard helpers will start
				enforcing session checks.
			</p>
			<div className="mt-4 flex flex-wrap gap-3">
				<Link
					href="/auth/sign-in"
					className="rounded-full bg-white px-4 py-2 font-medium text-slate-950 transition hover:bg-amber-100"
				>
					Review sign-in scaffold
				</Link>
				<Link
					href="/"
					className="rounded-full border border-white/15 px-4 py-2 font-medium text-white transition hover:border-white/40"
				>
					Back to home
				</Link>
			</div>
		</section>
	);
}
