import Link from "next/link";

const modules = [
	{
		title: "Descargables",
		priority: "Prioridad 1",
		description:
			"Plantillas internas, flujos de autollenado y generación de PDF para el equipo administrativo.",
	},
	{
		title: "Cotizaciones",
		priority: "Prioridad 2",
		description:
			"Catálogo de productos, cálculos de precios y exportación profesional de cotizaciones.",
	},
	{
		title: "Visitas técnicas",
		priority: "Prioridad 3",
		description:
			"Asignación de visitas, formularios móviles, captura de geolocalización y reportes PDF.",
	},
];

export default function HomePage() {
	return (
		<main className="min-h-screen bg-slate-950 text-white">
			<section className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
				<div className="max-w-3xl space-y-5">
					<p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
						EcoTienda · Fase 0
					</p>
					<h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
						Base de la plataforma interna de operaciones
					</h1>
					<p className="text-base leading-8 text-slate-300 sm:text-lg">
						Este arranque deja lista la base compartida para autenticación,
						acceso por roles y la estructura mobile first sobre la que se
						construirán los módulos siguientes.
					</p>
				</div>

				<div className="mt-8 flex flex-wrap gap-3">
					<Link
						href="/admin"
						className="rounded-full bg-emerald-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-emerald-300"
					>
						Abrir base de administración
					</Link>
					<Link
						href="/auth/sign-in"
						className="rounded-full border border-white/15 px-5 py-3 font-medium text-white transition hover:border-white/40"
					>
						Ir al acceso
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
