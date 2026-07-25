import { notFound, redirect } from "next/navigation";

import { requireRole } from "@/features/auth/session";
import { getWorkerByAuthUserId } from "@/features/workers/data";

import { getTrabajoVisitaById } from "./data";

export async function loadAuthorizedVisitWork(trabajoId: string) {
	const user = await requireRole(["admin", "technician"]);
	const work = await getTrabajoVisitaById(trabajoId);

	if (!work) {
		notFound();
	}

	if (user.role === "technician") {
		const worker = await getWorkerByAuthUserId(user.id);

		if (!worker || !worker.active || worker.role !== "technician") {
			redirect("/unauthorized");
		}

		if (work.agenda?.assignee_worker_id !== worker.id) {
			redirect("/unauthorized");
		}

		return {
			user,
			worker,
			work,
			shellRole: "technician" as const,
			hubHref: `/admin/visits/${trabajoId}`,
			homeHref: "/technician",
		};
	}

	return {
		user,
		worker: null,
		work,
		shellRole: "admin" as const,
		hubHref: `/admin/visits/${trabajoId}`,
		homeHref: "/admin/visits",
	};
}
