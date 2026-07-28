import { AppShell } from "@/components/app-shell";

function Skeleton({ className = "" }: { className?: string }) {
	return (
		<div
			aria-hidden="true"
			className={`animate-pulse motion-reduce:animate-none rounded-none bg-[rgba(13,79,46,0.08)] ${className}`}
		/>
	);
}

function VisitCardSkeleton() {
	return (
		<article className="rounded-[18px] border border-[var(--border-soft)] bg-white/95 px-3 py-2.5 shadow-[0_10px_24px_rgba(10,44,21,0.05)]">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1">
					<Skeleton className="h-3 w-20 rounded-[999px]" />
					<Skeleton className="mt-2 h-4 w-40 max-w-full rounded-[999px]" />
					<Skeleton className="mt-2 h-3 w-32 rounded-[999px]" />
					<Skeleton className="mt-2 h-3 w-28 rounded-[999px]" />
				</div>
				<Skeleton className="h-7 w-24 rounded-full border border-[rgba(13,79,46,0.08)] bg-[rgba(244,247,244,0.92)]" />
			</div>
		</article>
	);
}

export default function VisitsLoading() {
	return (
		<AppShell
			role="admin"
			title="Visitas"
			description="Seguimiento de visitas desde Agenda. Abrí cada trabajo y dejá listo el siguiente paso."
		>
			<div className="space-y-4">
				<section className="rounded-panel border border-[var(--border-soft)] bg-white p-4 shadow-panel sm:p-5">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div className="min-w-0 flex-1">
							<Skeleton className="h-3 w-24 rounded-[999px]" />
							<Skeleton className="mt-3 h-7 w-[min(24rem,90%)] rounded-[999px]" />
							<Skeleton className="mt-3 h-4 w-[min(36rem,96%)] rounded-[999px]" />
							<Skeleton className="mt-2 h-4 w-[min(28rem,84%)] rounded-[999px]" />
						</div>

						<Skeleton className="h-4 w-20 rounded-[999px]" />
					</div>

					<div className="mt-4 flex flex-wrap gap-3">
						<Skeleton className="h-4 w-24 rounded-[999px]" />
						<Skeleton className="h-4 w-24 rounded-[999px]" />
						<Skeleton className="h-4 w-40 rounded-[999px]" />
					</div>

					<div className="mt-5">
						<Skeleton className="h-10 w-32 rounded-full border border-[rgba(13,79,46,0.08)] bg-[rgba(244,247,244,0.92)]" />
					</div>
				</section>

				<section className="grid gap-3 lg:grid-cols-2">
					{Array.from({ length: 6 }).map((_, index) => (
						<VisitCardSkeleton key={index} />
					))}
				</section>
			</div>
		</AppShell>
	);
}
