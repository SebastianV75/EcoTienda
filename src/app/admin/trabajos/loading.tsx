import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/feedback";


function FilterFieldSkeleton() {
	return (
		<div className="flex-1 sm:min-w-[160px]">
			<Skeleton className="mb-2 h-3 w-20 rounded-[999px]" />
			<Skeleton className="h-12 rounded-full border border-[rgba(13,79,46,0.08)] bg-[rgba(255,255,255,0.72)]" />
		</div>
	);
}

function TrabajoCardSkeleton() {
	return (
		<article className="rounded-[26px] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1">
					<Skeleton className="h-3 w-16 rounded-[999px]" />
					<Skeleton className="mt-2 h-5 w-40 max-w-full rounded-[999px]" />
				</div>
				<div className="flex shrink-0 gap-2">
					<Skeleton className="h-7 w-20 rounded-full border border-[rgba(13,79,46,0.06)] bg-[rgba(244,247,244,0.9)]" />
					<Skeleton className="h-7 w-16 rounded-full border border-[rgba(13,79,46,0.06)] bg-[rgba(244,247,244,0.9)]" />
				</div>
			</div>

			<div className="mt-4 space-y-2">
				<Skeleton className="h-4 w-[88%] rounded-[999px]" />
				<Skeleton className="h-4 w-[68%] rounded-[999px]" />
			</div>

			<div className="mt-5 space-y-2.5">
				<div className="flex items-center gap-2">
					<Skeleton className="h-3 w-16 rounded-[999px]" />
					<Skeleton className="h-3 flex-1 rounded-[999px]" />
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-3 w-10 rounded-[999px]" />
					<Skeleton className="h-3 flex-1 rounded-[999px]" />
				</div>
			</div>

			<div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--border-soft)] pt-3">
				<Skeleton className="h-3 w-32 rounded-[999px]" />
				<Skeleton className="h-3 w-14 rounded-[999px]" />
			</div>
		</article>
	);
}

export default function TrabajosLoading() {
	return (
		<AppShell
			role="admin"
			navigationLoading
			title="Trabajos"
			description="Seguimiento centralizado de todos los trabajos, desde la agenda hasta la venta."
		>
			<div className="space-y-4">
				<section className="rounded-[26px] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
					<div className="flex flex-wrap items-end gap-3">
						<FilterFieldSkeleton />
						<FilterFieldSkeleton />
						<FilterFieldSkeleton />
						<FilterFieldSkeleton />
						<FilterFieldSkeleton />
						<FilterFieldSkeleton />
						<div className="flex-1 sm:flex-none sm:min-w-[120px]">
							<Skeleton className="h-3 w-16 rounded-[999px]" />
							<Skeleton className="mt-2 h-12 w-full rounded-full border border-[rgba(13,79,46,0.08)] bg-[rgba(244,247,244,0.9)] sm:w-[120px]" />
						</div>
					</div>
				</section>

				<section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, index) => (
						<TrabajoCardSkeleton key={index} />
					))}
				</section>
			</div>
		</AppShell>
	);
}
