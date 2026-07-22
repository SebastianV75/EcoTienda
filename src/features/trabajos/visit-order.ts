import type { AgendaItem } from "@/types/agenda";

const visitProgressOrder: Record<AgendaItem["estado"], number> = {
	en_proceso: 0,
	pendiente: 1,
	finalizado: 2,
};

export function orderVisitsByProgress(items: AgendaItem[]) {
	return [...items].sort((left, right) => {
		const progressDelta =
			visitProgressOrder[left.estado] - visitProgressOrder[right.estado];

		if (progressDelta !== 0) {
			return progressDelta;
		}

		return (left.appointment_at ?? left.created_at).localeCompare(
			right.appointment_at ?? right.created_at,
		);
	});
}
