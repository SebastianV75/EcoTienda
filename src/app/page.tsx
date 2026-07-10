import Image from "next/image";
import Link from "next/link";

const modules = [
	{
		title: "Descargables",
		priority: "Prioridad 1",
		description:
			"Plantillas internas, autollenado y exportación profesional para los flujos administrativos.",
	},
	{
		title: "Cotizaciones",
		priority: "Prioridad 2",
		description:
			"Catálogo, armado de propuestas y salida PDF con una estructura más clara para ventas.",
	},
	{
		title: "Visitas técnicas",
		priority: "Prioridad 3",
		description:
			"Agenda móvil, captura de datos en campo y reportes listos para seguimiento operativo.",
	},
];

const highlights = [
	"Autenticación con Supabase",
	"Permisos por rol",
	"Base mobile first",
	"Rutas protegidas",
];

export default function HomePage() {
	return (
		<main className="px-3 py-3 sm:px-5 sm:py-5">
			<section className="mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-7xl flex-col gap-4 rounded-[34px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.8)] p-4 shadow-[var(--shadow)] backdrop-blur-sm sm:p-6 lg:p-8">
				<div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
					<div className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#0d4f2e,#1c6f14_58%,#2fb314)] p-6 text-white shadow-[0_28px_70px_rgba(13,79,46,0.28)] sm:p-8 lg:p-10">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/85">
									EcoTienda · Fase 0
								</p>
								<h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.06em] text-balance sm:text-5xl lg:text-6xl">
									Una base más profesional para la operación interna
								</h1>
							</div>
							<div className="rounded-[26px] bg-white p-3 shadow-xl shadow-black/15">
								<Image
									src="/ecotienda-logo-temp.png"
									alt="Logo temporal de EcoTienda"
									width={108}
									height={80}
									className="h-auto w-[84px] object-contain sm:w-[108px]"
									priority
								/>
							</div>
						</div>

						<p className="mt-6 max-w-2xl text-sm leading-7 text-emerald-50/90 sm:text-base">
							Esta versión ya deja atrás la pantalla genérica. Toma el verde y el
							logo como referencia visual, pero orienta la experiencia a algo más
							limpio, serio y útil para administración y trabajo técnico.
						</p>

						<div className="mt-8 flex flex-wrap gap-3">
							<Link
								href="/admin"
								className="rounded-full bg-white px-5 py-3 text-sm font-medium text-[var(--brand-deep)] shadow-[0_20px_35px_rgba(255,255,255,0.18)] transition duration-200 ease-out hover:bg-emerald-50"
							>
								Entrar al panel
							</Link>
							<Link
								href="/auth/sign-in"
								className="rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-medium text-white transition duration-200 ease-out hover:bg-white/12"
							>
								Iniciar sesión
							</Link>
						</div>
					</div>

					<div className="grid gap-4">
						<div className="rounded-[30px] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(239,247,236,0.9))] p-6 shadow-sm">
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
								Dirección visual
							</p>
							<h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
								Interfaz más moderna y con identidad
							</h2>
							<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
								La referencia actual aporta color y marca. La app interna debe tomar
								esa base, pero con mejores jerarquías, superficies más limpias y una
								navegación que se sienta más confiable.
							</p>
						</div>

						<div className="rounded-[30px] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
								Fundación activa
							</p>
							<div className="mt-4 grid gap-3 sm:grid-cols-2">
								{highlights.map((item) => (
									<div
										key={item}
										className="rounded-2xl border border-emerald-100 bg-[var(--surface-strong)] px-4 py-3 text-sm font-medium text-[var(--brand-deep)]"
									>
										{item}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				<section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
					<div className="rounded-[30px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							Lo que sigue
						</p>
						<h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)]">
							Construir valor sin perder orden
						</h2>
						<p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)] sm:text-base">
							La base ya está conectada. El siguiente avance importante es llevar
							la experiencia de marca a los módulos reales, empezando por
							descargables.
						</p>
					</div>

					<div className="grid gap-4 md:grid-cols-3">
						{modules.map((module, index) => (
							<article
								key={module.title}
								className="group rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(13,79,46,0.10)]"
							>
								<div className="flex items-center justify-between gap-3">
									<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
										{module.priority}
									</p>
									<span className="rounded-full bg-[var(--surface-strong)] px-2.5 py-1 text-xs font-medium text-[var(--brand-deep)]">
										0{index + 1}
									</span>
								</div>
								<h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
									{module.title}
								</h3>
								<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
									{module.description}
								</p>
							</article>
						))}
					</div>
				</section>
			</section>
		</main>
	);
}
