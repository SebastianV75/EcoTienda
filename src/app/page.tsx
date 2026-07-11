import Image from "next/image";
import Link from "next/link";

const modules = [
	{
		title: "Descargables",
		description:
			"Genera documentos internos, completa plantillas y descarga archivos listos para compartir.",
	},
	{
		title: "Cotizaciones",
		description:
			"Prepara propuestas comerciales con productos, precios y salida profesional en PDF.",
	},
	{
		title: "Visitas técnicas",
		description:
			"Consulta asignaciones, captura datos de campo y da seguimiento a cada servicio.",
	},
];

const benefits = [
	"Acceso seguro para administración y operación técnica",
	"Experiencia optimizada para escritorio y celular",
	"Información centralizada para seguimiento interno",
	"Diseño claro para trabajar con menos fricción",
];

export default function HomePage() {
	return (
		<main className="px-3 py-3 sm:px-5 sm:py-5">
			<section className="mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-7xl flex-col gap-4 rounded-[34px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.8)] p-4 shadow-[var(--shadow)] backdrop-blur-sm sm:p-6 lg:p-8">
				<div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
					<div className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#0d4f2e,#1c6f14_58%,#2fb314)] p-6 text-white shadow-[0_28px_70px_rgba(13,79,46,0.28)] sm:p-8 lg:p-10">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/85">
									EcoTienda
								</p>
								<h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.06em] text-balance sm:text-5xl lg:text-6xl">
									Control interno para operación, ventas y servicio técnico
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
							Una sola plataforma para organizar documentos, preparar
							cotizaciones y dar seguimiento al trabajo técnico desde un entorno
							más claro, moderno y profesional.
						</p>

						<div className="mt-8 flex flex-wrap gap-3">
							<Link
								href="/auth/sign-in"
								className="rounded-full bg-white px-5 py-3 text-sm font-medium text-[var(--brand-deep)] shadow-[0_20px_35px_rgba(255,255,255,0.18)] transition duration-200 ease-out hover:bg-emerald-50"
							>
								Iniciar sesión
							</Link>
							<Link
								href="/admin"
								className="rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-medium text-white transition duration-200 ease-out hover:bg-white/12"
							>
								Ir al panel
							</Link>
						</div>
					</div>

					<div className="grid gap-4">
						<div className="rounded-[30px] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(239,247,236,0.9))] p-6 shadow-sm">
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
								Acceso centralizado
							</p>
							<h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
								Todo en un mismo sistema
							</h2>
							<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
								La plataforma reúne procesos administrativos y operación técnica
								en un solo lugar para trabajar con mayor orden y mejor control.
							</p>
						</div>

						<div className="rounded-[30px] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
								Beneficios
							</p>
							<div className="mt-4 grid gap-3 sm:grid-cols-2">
								{benefits.map((item) => (
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

				<section className="grid gap-4 md:grid-cols-3">
					{modules.map((module) => (
						<article
							key={module.title}
							className="group rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(13,79,46,0.10)]"
						>
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
								Módulo
							</p>
							<h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
								{module.title}
							</h2>
							<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
								{module.description}
							</p>
						</article>
					))}
				</section>
			</section>
		</main>
	);
}
