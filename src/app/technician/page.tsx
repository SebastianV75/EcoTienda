import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getCurrentUser, requireRole } from "@/features/auth/session";
import { getTrabajosForList } from "@/features/trabajos/data";
import { getWorkerByAuthUserId } from "@/features/workers/data";
import { hasSupabaseEnv } from "@/lib/env";
import { trabajoStageLabels } from "@/types/trabajo";

function formatAppointment(dateString: string | null) {
	if (!dateString) {
		return null;
	}

	return new Intl.DateTimeFormat("es-MX", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: "UTC",
	}).format(new Date(dateString));
}

function getUtcDayStamp(date: Date) {
	return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function getTechnicianBucket(dateString: string | null) {
	if (!dateString) {
		return "later" as const;
	}

	const appointment = new Date(dateString);
	const today = new Date();
	const appointmentStamp = getUtcDayStamp(appointment);
	const todayStamp = getUtcDayStamp(today);
	const diffDays = Math.round(
		(appointmentStamp - todayStamp) / (24 * 60 * 60 * 1000),
	);

	if (diffDays <= 0) {
		return "today" as const;
	}

	if (diffDays <= 3) {
		return "next" as const;
	}

	return "later" as const;
}

export default async function TechnicianPage() {
	const user = hasSupabaseEnv()
		? await requireRole(["admin", "technician"])
		: await getCurrentUser();

	if (!user) {
		redirect("/auth/sign-in");
	}

	const worker = await getWorkerByAuthUserId(user.id);

	if (!worker) {
		return (
			<AppShell
				role="technician"
				title="No encontramos tu cuenta de técnico"
				description="Parece que tu cuenta no está vinculada a un técnico."
				email={user.email}
			>
				<section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
						<svg
							className="h-8 w-8 text-amber-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<h3 className="text-lg font-semibold text-amber-900">
						Cuenta no vinculada
					</h3>
					<p className="mt-2 text-sm text-amber-800">
						Habla con el administrador para vincular tu cuenta.
					</p>
				</section>
			</AppShell>
		);
	}

	if (!worker.active || worker.role !== "technician") {
		return (
			<AppShell
				role="technician"
				title="Tu cuenta aún no está activa"
				description="Estamos preparando tu acceso."
				email={user.email}
			>
				<section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
						<svg
							className="h-8 w-8 text-amber-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<h3 className="text-lg font-semibold text-amber-900">
						Cuenta en preparación
					</h3>
					<p className="mt-2 text-sm text-amber-800">
						El administrador debe activar tu cuenta.
					</p>
				</section>
			</AppShell>
		);
	}

	const trabajos = await getTrabajosForList({
		assignee_worker_id: worker.id,
	});

	const groupedTrabajos = {
		today: trabajos.filter(
			(trabajo) => getTechnicianBucket(trabajo.appointment_at) === "today",
		),
		next: trabajos.filter(
			(trabajo) => getTechnicianBucket(trabajo.appointment_at) === "next",
		),
		later: trabajos.filter(
			(trabajo) => getTechnicianBucket(trabajo.appointment_at) === "later",
		),
	};

	const readyCount = trabajos.filter(
		(trabajo) =>
			trabajo.current_stage === "agenda" || trabajo.current_stage === "visita",
	).length;

	return (
		<AppShell
			role="technician"
			title={`Hola, ${worker.full_name.split(" ")[0]}`}
			description="Tus visitas asignadas"
			email={user.email}
		>
			<div className="space-y-6">
				{/* Resumen rápido */}
				{trabajos.length > 0 && (
					<div className="grid grid-cols-3 gap-3">
						<div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 text-center">
							<div className="text-3xl font-bold text-emerald-700">
								{groupedTrabajos.today.length}
							</div>
							<div className="mt-1 text-xs font-medium text-emerald-600">
								Hoy
							</div>
						</div>
						<div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 text-center">
							<div className="text-3xl font-bold text-blue-700">
								{groupedTrabajos.next.length}
							</div>
							<div className="mt-1 text-xs font-medium text-blue-600">
								Próximos
							</div>
						</div>
						<div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 text-center">
							<div className="text-3xl font-bold text-gray-700">
								{trabajos.length - readyCount}
							</div>
							<div className="mt-1 text-xs font-medium text-gray-600">
								En proceso
							</div>
						</div>
					</div>
				)}

				{/* Lista de trabajos */}
				{trabajos.length > 0 ? (
					<div className="space-y-4">
						{groupedTrabajos.today.length > 0 && (
							<section>
								<div className="mb-3 flex items-center gap-2">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
										<svg
											className="h-5 w-5 text-emerald-600"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									</div>
									<h2 className="text-lg font-semibold text-gray-900">
										Visitas de hoy
									</h2>
								</div>
								<div className="space-y-3">
									{groupedTrabajos.today.map((trabajo) => (
										<TrabajoCard key={trabajo.id} trabajo={trabajo} />
									))}
								</div>
							</section>
						)}

						{groupedTrabajos.next.length > 0 && (
							<section>
								<div className="mb-3 flex items-center gap-2">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
										<svg
											className="h-5 w-5 text-blue-600"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
									</div>
									<h2 className="text-lg font-semibold text-gray-900">
										Próximos días
									</h2>
								</div>
								<div className="space-y-3">
									{groupedTrabajos.next.map((trabajo) => (
										<TrabajoCard key={trabajo.id} trabajo={trabajo} />
									))}
								</div>
							</section>
						)}

						{groupedTrabajos.later.length > 0 && (
							<section>
								<div className="mb-3 flex items-center gap-2">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
										<svg
											className="h-5 w-5 text-gray-600"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
											/>
										</svg>
									</div>
									<h2 className="text-lg font-semibold text-gray-900">
										Más adelante
									</h2>
								</div>
								<div className="space-y-3">
									{groupedTrabajos.later.map((trabajo) => (
										<TrabajoCard key={trabajo.id} trabajo={trabajo} />
									))}
								</div>
							</section>
						)}
					</div>
				) : (
					<section className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
						<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
							<svg
								className="h-10 w-10 text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900">
							No tienes visitas asignadas
						</h3>
						<p className="mt-2 text-sm text-gray-600">
							Cuando te asignen una visita, aparecerá aquí.
						</p>
					</section>
				)}
			</div>
		</AppShell>
	);
}

// Componente auxiliar para las tarjetas de trabajo
function TrabajoCard({
	trabajo,
}: {
	trabajo: Awaited<ReturnType<typeof getTrabajosForList>>[number];
}) {
	const appointmentLabel = formatAppointment(trabajo.appointment_at);
	const isVisitReady =
		trabajo.current_stage === "agenda" || trabajo.current_stage === "visita";

	return (
		<article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
			<div className="flex flex-col gap-4">
				{/* Encabezado */}
				<div>
					<div className="flex items-start justify-between gap-3">
						<div className="flex-1">
							<h3 className="text-lg font-semibold text-gray-900">
								{trabajo.client_name ?? trabajo.intake_name}
							</h3>
							{appointmentLabel && (
								<div className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
									<svg
										className="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									<span>{appointmentLabel}</span>
								</div>
							)}
						</div>
						{isVisitReady && (
							<span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
								Listo
							</span>
						)}
					</div>
				</div>

				{/* Dirección */}
				<div className="flex items-start gap-2 text-sm text-gray-600">
					<svg
						className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
					<p className="flex-1">{trabajo.intake_address_text}</p>
				</div>

				{/* Acción */}
				{isVisitReady ? (
					<Link
						href={`/admin/visits/${trabajo.id}`}
						className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-emerald-700 active:scale-[0.98]"
					>
						<svg
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							/>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
							/>
						</svg>
						Iniciar visita
					</Link>
				) : (
					<div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
						<svg
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						En proceso administrativo
					</div>
				)}
			</div>
		</article>
	);
}
