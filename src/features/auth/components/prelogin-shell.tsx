import type { ReactNode } from "react";
import { Ac, Bolt, Sun, Thermometer, Wind } from "reicon-react";

type PreloginShellProps = {
	eyebrow: string;
	title: string;
	description: string;
	primaryCta: ReactNode;
	secondaryContent?: ReactNode;
	children?: ReactNode;
};

export function PreloginShell({
	eyebrow,
	title,
	description,
	primaryCta,
	secondaryContent,
	children,
}: PreloginShellProps) {
	return (
		<main className="relative min-h-screen overflow-hidden bg-[#f4f0e7] px-3 py-3 text-[var(--foreground)] sm:px-5 sm:py-5 lg:px-8 lg:py-7">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_4%_8%,rgba(47,179,20,0.16),transparent_25%),radial-gradient(circle_at_96%_12%,rgba(224,178,71,0.15),transparent_21%),linear-gradient(135deg,rgba(255,255,255,0.28),transparent_50%)]" />
			<div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(13,79,46,0.14)_0.65px,transparent_0.65px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
			<section className="relative mx-auto grid min-h-[calc(100vh-24px)] w-full max-w-[1360px] overflow-hidden border border-[rgba(13,79,46,0.14)] bg-[rgba(255,253,247,0.82)] shadow-[0_28px_90px_rgba(10,44,21,0.12)] backdrop-blur-sm motion-safe:animate-[prelogin-reveal_650ms_var(--ease-out)_both] sm:min-h-[calc(100vh-40px)] lg:min-h-[calc(100vh-56px)] lg:grid-cols-[minmax(0,1.05fr)_minmax(390px,0.95fr)]">
				<section className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(145deg,#0d4f2e,#123f2b)] px-6 py-7 text-white sm:px-10 sm:py-10 lg:px-14 lg:py-12" aria-labelledby="prelogin-title">
					<div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10 motion-safe:animate-[prelogin-float_12s_ease-in-out_infinite]" />
					<div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full border border-[#d5b252]/20" />
					<div className="relative flex items-center justify-between gap-4">
						<div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center border border-[#f6d979]/45 bg-[#f6d979]/10 text-[10px] font-bold uppercase tracking-[0.22em] text-[#f6d979]">ET</span><div><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white">EcoTienda</p><p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/55">Centro operativo</p></div></div>
						<span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/60"><span className="h-1.5 w-1.5 bg-[#f6d979] motion-safe:animate-[prelogin-pulse_2.8s_ease-in-out_infinite]" />Seguro</span>
					</div>
					<div className="relative mt-14 max-w-xl sm:mt-20 lg:mt-0"><p className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f6d979] motion-safe:animate-[prelogin-reveal_600ms_100ms_var(--ease-out)_both]"><span className="h-px w-8 bg-[#f6d979]" />{eyebrow}</p><h1 id="prelogin-title" className="max-w-[10ch] text-[clamp(3.3rem,7vw,6.7rem)] font-semibold leading-[0.88] tracking-[-0.09em] text-balance motion-safe:animate-[prelogin-reveal_700ms_160ms_var(--ease-out)_both]">{title}</h1><p className="mt-7 max-w-lg text-sm leading-7 text-white/70 sm:text-base sm:leading-8 motion-safe:animate-[prelogin-reveal_700ms_240ms_var(--ease-out)_both]">{description}</p></div>
					<div className="relative mt-12 space-y-5 lg:mt-0 motion-safe:animate-[prelogin-reveal_700ms_320ms_var(--ease-out)_both]"><div className="relative mx-auto grid h-36 w-36 place-items-center border border-[#f6d979]/45 bg-[#f6d979]/[0.08] shadow-[0_0_80px_rgba(246,217,121,0.1)] sm:mx-0 sm:h-44 sm:w-44"><div className="absolute h-24 w-24 border border-dashed border-[#f6d979]/50 motion-safe:animate-[prelogin-spin_18s_linear_infinite] sm:h-32 sm:w-32" /><Sun aria-hidden="true" size={52} weight="Outline" className="text-[#f6d979]" /></div><div className="flex flex-wrap gap-2">{[ [Sun,"Solar"], [Ac,"Clima"], [Bolt,"Energía"], [Wind,"Ventilación"] ].map(([Icon,label]) => <div key={label as string} className="flex items-center gap-2 border border-white/15 bg-white/[0.07] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm"><Icon aria-hidden="true" size={15} weight="Outline" /><span>{label as string}</span></div>)}</div></div>
				</section>
				<section className="relative flex flex-col justify-center px-5 py-7 sm:px-10 sm:py-12 lg:px-14 lg:py-14"><div className="mx-auto w-full max-w-[31rem] motion-safe:animate-[prelogin-reveal_700ms_180ms_var(--ease-out)_both]"><div className="mb-8 flex items-center justify-between gap-4 border-b border-[rgba(13,79,46,0.12)] pb-5"><p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--brand-strong)]">Acceso interno</p><Thermometer aria-hidden="true" size={20} weight="Outline" className="text-[var(--brand-strong)]" /></div><div className="mb-8">{primaryCta}</div>{children}{secondaryContent ? <div className="mt-7 border-t border-[rgba(13,79,46,0.12)] pt-5 text-sm leading-6 text-[var(--muted)]">{secondaryContent}</div> : null}</div></section>
			</section>
		</main>
	);
}
