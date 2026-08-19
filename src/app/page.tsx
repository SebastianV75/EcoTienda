import Link from "next/link";
import {
	Activity,
	Ac,
	BatteryCharging,
	Bolt,
	ChartLine,
	CloudSun,
	Sun,
	Temperature,
	Thermometer,
	Wind,
	type IconComponent,
} from "reicon-react";

type IconTileProps = {
	icon: IconComponent;
	label: string;
	className?: string;
};

function IconTile({ icon: Icon, label, className = "" }: IconTileProps) {
	return (
		<div
			className={`flex items-center gap-3 border border-[rgba(13,79,46,0.12)] bg-white/70 px-3 py-3 shadow-[0_12px_28px_rgba(10,44,21,0.05)] backdrop-blur-sm transition-[transform,background-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_34px_rgba(10,44,21,0.08)] ${className}`}
		>
			<span className="grid h-9 w-9 shrink-0 place-items-center border border-[rgba(13,79,46,0.12)] bg-[rgba(238,247,234,0.78)] text-[var(--brand-deep)]">
				<Icon aria-hidden="true" size={19} weight="Outline" />
			</span>
			<span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-deep)]">
				{label}
			</span>
		</div>
	);
}

function ConsoleSignal({
	icon: Icon,
	label,
	detail,
	accent = false,
}: {
	icon: IconComponent;
	label: string;
	detail: string;
	accent?: boolean;
}) {
	return (
		<div className="flex items-start gap-3 border-t border-[rgba(13,79,46,0.12)] pt-4">
			<span
				className={`grid h-9 w-9 shrink-0 place-items-center border ${accent ? "border-[rgba(224,178,71,0.35)] bg-[#f6e5ae] text-[#715514]" : "border-[rgba(13,79,46,0.12)] bg-white/70 text-[var(--brand-deep)]"}`}
			>
				<Icon aria-hidden="true" size={18} weight="Outline" />
			</span>
			<div className="min-w-0">
				<p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-deep)]">
					{label}
				</p>
				<p className="mt-1 text-xs leading-5 text-[var(--muted)]">{detail}</p>
			</div>
		</div>
	);
}

export default function HomePage() {
	return (
		<main className="relative min-h-screen overflow-hidden bg-[#f4f0e7] px-4 py-4 text-[var(--foreground)] sm:px-6 sm:py-6 lg:px-8 lg:py-7">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(47,179,20,0.13),transparent_23%),radial-gradient(circle_at_92%_8%,rgba(224,178,71,0.15),transparent_19%),linear-gradient(135deg,rgba(255,255,255,0.24),transparent_48%)]" />
			<div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(13,79,46,0.14)_0.65px,transparent_0.65px)] [background-size:17px_17px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
			<div className="pointer-events-none absolute inset-x-[9%] top-0 hidden h-px bg-[linear-gradient(90deg,transparent,rgba(13,79,46,0.22),transparent)] lg:block" />

			<section className="relative mx-auto flex min-h-[calc(100vh-32px)] w-full max-w-[1440px] flex-col border border-[rgba(13,79,46,0.14)] bg-[rgba(255,253,247,0.74)] px-5 py-5 shadow-[0_28px_90px_rgba(10,44,21,0.09)] backdrop-blur-[2px] motion-safe:animate-[home-reveal_700ms_var(--ease-out)_both] sm:min-h-[calc(100vh-48px)] sm:px-8 sm:py-7 lg:px-12 lg:py-8">
				<header className="flex items-center justify-between gap-6 border-b border-[rgba(13,79,46,0.12)] pb-5 sm:pb-6">
					<Link
						href="/"
						className="group flex items-center gap-3"
						aria-label="EcoTienda, inicio"
					>
						<span className="grid h-10 w-10 place-items-center border border-[var(--brand-deep)] bg-[var(--brand-deep)] text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-transform duration-200 ease-out group-hover:-rotate-3 group-active:scale-95">
							ET
						</span>
						<span>
							<span className="block text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--brand-deep)]">
								EcoTienda
							</span>
							<span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
								Centro operativo
							</span>
						</span>
					</Link>

					<div className="flex items-center gap-3 sm:gap-5">
						<span className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] sm:flex">
							<span className="h-1.5 w-1.5 bg-[var(--brand)] motion-safe:animate-[home-pulse_2.8s_ease-in-out_infinite]" />
							Sistema operativo
						</span>
						<Link
							href="/admin"
							className="inline-flex min-h-10 items-center justify-center border border-[rgba(13,79,46,0.16)] bg-white/60 px-3.5 text-xs font-semibold text-[var(--brand-deep)] transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--brand-deep)] hover:bg-white hover:shadow-[0_8px_18px_rgba(10,44,21,0.06)] active:scale-[0.97]"
						>
							Admin
						</Link>
					</div>
				</header>

				<div className="grid flex-1 gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1.04fr)_minmax(360px,0.96fr)] lg:items-center lg:gap-16 lg:py-16">
					<section
						className="flex flex-col justify-center"
						aria-labelledby="home-title"
					>
						<div className="mb-7 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--brand-strong)] motion-safe:animate-[home-reveal_650ms_120ms_var(--ease-out)_both]">
							<span className="h-px w-8 bg-[var(--brand-strong)]" />
							Energía · climatización · operación
						</div>
						<h1
							id="home-title"
							className="max-w-[12ch] text-[clamp(3.5rem,7.8vw,7.6rem)] font-semibold leading-[0.88] tracking-[-0.095em] text-[var(--brand-deep)] text-balance motion-safe:animate-[home-reveal_700ms_180ms_var(--ease-out)_both]"
						>
							Operación eficiente para instalaciones que trabajan contigo.
						</h1>
						<p className="mt-7 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8 motion-safe:animate-[home-reveal_700ms_260ms_var(--ease-out)_both]">
							Un centro de trabajo claro para coordinar soluciones solares,
							climatización e instalaciones técnicas con el ritmo de tu empresa.
						</p>

						<div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center motion-safe:animate-[home-reveal_700ms_340ms_var(--ease-out)_both]">
							<Link
								href="/auth/sign-in"
								className="group inline-flex min-h-12 w-full items-center justify-center gap-3 bg-[#f6d979] px-5 text-sm font-semibold text-[var(--brand-deep)] shadow-[0_18px_34px_rgba(113,85,20,0.16)] transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#ffe69b] hover:shadow-[0_22px_40px_rgba(113,85,20,0.2)] active:scale-[0.98] sm:w-auto"
							>
								Entrar al sistema
								<span
									aria-hidden="true"
									className="transition-transform duration-200 ease-out group-hover:translate-x-1"
								>
									→
								</span>
							</Link>
							<Link
								href="/admin"
								className="inline-flex min-h-12 items-center justify-center border-b border-[rgba(13,79,46,0.28)] px-1 text-sm font-semibold text-[var(--brand-deep)] transition-[border-color,color] duration-200 ease-out hover:border-[var(--brand)] hover:text-[var(--brand-strong)]"
							>
								Acceso de administración
							</Link>
						</div>

						<div
							id="soluciones"
							className="mt-12 grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-4 motion-safe:animate-[home-reveal_700ms_420ms_var(--ease-out)_both]"
						>
							<IconTile icon={Sun} label="Solar" />
							<IconTile icon={Ac} label="Clima" />
							<IconTile icon={Bolt} label="Energía" />
							<IconTile icon={Wind} label="Ventilación" />
						</div>
					</section>

					<aside
						id="operacion"
						className="relative min-h-[28rem] overflow-hidden border border-[rgba(13,79,46,0.16)] bg-[linear-gradient(145deg,rgba(13,79,46,0.98),rgba(18,70,43,0.96))] p-5 text-white shadow-[0_24px_70px_rgba(13,79,46,0.2)] motion-safe:animate-[home-reveal_750ms_180ms_var(--ease-out)_both] sm:min-h-[33rem] sm:p-7 lg:min-h-[39rem] lg:p-8"
					>
						<div className="pointer-events-none absolute -right-16 -top-14 h-56 w-56 rounded-full border border-white/15 motion-safe:animate-[home-drift_12s_ease-in-out_infinite]" />
						<div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full border border-[#d5b252]/25" />
						<div className="pointer-events-none absolute inset-x-8 top-1/2 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]" />

						<div className="relative flex h-full flex-col justify-between gap-10">
							<div className="flex items-start justify-between gap-4">
								<div>
									<p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d5b252]">
										Panel de operación
									</p>
									<h2 className="mt-4 max-w-[10ch] text-4xl font-semibold leading-[0.9] tracking-[-0.07em] text-white sm:text-5xl">
										Todo en su punto.
									</h2>
								</div>
								<span className="grid h-12 w-12 shrink-0 place-items-center border border-white/20 bg-white/10 text-[#f6d979] motion-safe:animate-[home-pulse_3.5s_ease-in-out_infinite]">
									<Sun aria-hidden="true" size={25} weight="Outline" />
								</span>
							</div>

							<div className="relative mx-auto grid h-48 w-48 place-items-center sm:h-56 sm:w-56">
								<div className="absolute inset-0 border border-white/20 motion-safe:animate-[home-drift_9s_ease-in-out_infinite]" />
								<div className="absolute inset-5 border border-dashed border-[#d5b252]/50 motion-safe:animate-[home-spin_24s_linear_infinite]" />
								<div className="grid h-24 w-24 place-items-center border border-[#f6d979]/55 bg-[#f6d979]/10 text-[#f6d979] shadow-[0_0_60px_rgba(246,217,121,0.12)]">
									<Bolt aria-hidden="true" size={46} weight="Outline" />
								</div>
								<span className="absolute left-0 top-8 text-white/60">
									<Sun aria-hidden="true" size={16} weight="Outline" />
								</span>
								<span className="absolute bottom-8 right-0 text-white/60">
									<Wind aria-hidden="true" size={18} weight="Outline" />
								</span>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<ConsoleSignal
									icon={BatteryCharging}
									label="Energía"
									detail="Generación y consumo bajo control."
									accent
								/>
								<ConsoleSignal
									icon={Thermometer}
									label="Clima"
									detail="Confort que se mantiene estable."
								/>
								<ConsoleSignal
									icon={Activity}
									label="Seguimiento"
									detail="Cada etapa visible para el equipo."
								/>
								<ConsoleSignal
									icon={ChartLine}
									label="Eficiencia"
									detail="Decisiones con mejor información."
								/>
							</div>
						</div>
					</aside>
				</div>

				<footer className="flex flex-col gap-4 border-t border-[rgba(13,79,46,0.12)] pt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
					<span>Soluciones para una operación más precisa</span>
					<div className="flex flex-wrap items-center gap-x-5 gap-y-2">
						<span className="inline-flex items-center gap-2">
							<CloudSun aria-hidden="true" size={15} weight="Outline" /> Paneles
							solares
						</span>
						<span className="inline-flex items-center gap-2">
							<Temperature aria-hidden="true" size={15} weight="Outline" />{" "}
							Climatización
						</span>
					</div>
				</footer>
			</section>
		</main>
	);
}
