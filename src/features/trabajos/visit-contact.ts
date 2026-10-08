import type { AppRole } from "@/types/auth";
import type { WorkerSummary } from "@/types/worker";

type VisitContactSource = {
	intake_name?: string | null;
	intake_phone?: string | null;
	intake_address_text?: string | null;
	intake_latitude?: number | null;
	intake_longitude?: number | null;
	agenda?: {
		contact_name?: string | null;
		contact_phone?: string | null;
		address_text?: string | null;
		latitude?: number | null;
		longitude?: number | null;
	} | null;
};

export type VisitContact = {
	name: string | null;
	phone: string | null;
	address: string | null;
	phoneHref: string | null;
	mapHref: string | null;
};

function validCoordinates(latitude?: number | null, longitude?: number | null) {
	return (
		typeof latitude === "number" &&
		Number.isFinite(latitude) &&
		typeof longitude === "number" &&
		Number.isFinite(longitude) &&
		Math.abs(latitude) <= 90 &&
		Math.abs(longitude) <= 180
	);
}

export function getVisitContact(source: VisitContactSource): VisitContact {
	const agenda = source.agenda;
	const name = agenda?.contact_name?.trim() || source.intake_name?.trim() || null;
	const phone = agenda?.contact_phone?.trim() || source.intake_phone?.trim() || null;
	const agendaAddress = agenda?.address_text?.trim();
	const address = agendaAddress || source.intake_address_text?.trim() || null;
	// A changed Agenda address must never point to old intake coordinates.
	const location =
		agendaAddress || validCoordinates(agenda?.latitude, agenda?.longitude)
			? agenda
			: { latitude: source.intake_latitude, longitude: source.intake_longitude };
	const query = validCoordinates(location?.latitude, location?.longitude)
		? `${location?.latitude},${location?.longitude}`
		: address;
	const phoneNumber = phone?.replace(/[\s().-]/g, "");

	return {
		name,
		phone,
		address,
		phoneHref:
			phoneNumber && /^\+?\d{7,15}$/.test(phoneNumber)
				? `tel:${phoneNumber}`
				: null,
		mapHref: query
			? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
			: null,
	};
}

export function canAccessAssignedVisit(
	role: AppRole,
	worker: Pick<WorkerSummary, "id" | "active" | "role"> | null,
	assigneeWorkerId: string | null | undefined,
) {
	if (role === "admin" || role === "administrative") {
		return true;
	}
	return (
		role === "technician" &&
		Boolean(
			worker?.active &&
				worker.role === "technician" &&
				worker.id === assigneeWorkerId,
		)
	);
}
