import Link from "next/link";

const modules = [
	{
		title: "Downloadable documents",
		priority: "Priority 1",
		description:
			"Internal document templates, autofill flows, and PDF generation for the admin team.",
	},
	{
		title: "Quotations",
		priority: "Priority 2",
		description:
			"Product catalog, price calculations, and professional quotation exports.",
	},
	{
		title: "Technical visits",
		priority: "Priority 3",
		description:
			"Mobile-first visit assignment, field forms, geolocation capture, and PDF reports.",
	},
];

export default function HomePage() {
	return (
		<main className="min-h-screen bg-slate-950 text-white">
			<section className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
				<div className="max-w-3xl space-y-5">
					<p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
						EcoTienda · Phase 0
					</p>
					<h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
						Internal operations platform foundation
					</h1>
					<p className="text-base leading-8 text-slate-300 sm:text-lg">
						This bootstrap delivers the shared base for authentication,
						role-aware access, and the mobile-first shell that later modules
						will build on.
					</p>
				</div>

				<div className="mt-8 flex flex-wrap gap-3">
					<Link
						href="/admin"
						className="rounded-full bg-emerald-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-emerald-300"
					>
						Open admin scaffold
					</Link>
					<Link
						href="/auth/sign-in"
						className="rounded-full border border-white/15 px-5 py-3 font-medium text-white transition hover:border-white/40"
					>
						Review auth scaffold
					</Link>
				</div>

				<section className="mt-12 grid gap-4 md:grid-cols-3">
					{modules.map((module) => (
						<article
							key={module.title}
							className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-950/30"
						>
							<p className="text-sm font-medium text-emerald-300">
								{module.priority}
							</p>
							<h2 className="mt-3 text-xl font-semibold">{module.title}</h2>
							<p className="mt-3 text-sm leading-7 text-slate-300">
								{module.description}
							</p>
						</article>
					))}
				</section>
			</section>
		</main>
	);
}
