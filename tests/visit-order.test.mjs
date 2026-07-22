import assert from "node:assert/strict";
import test from "node:test";

import { orderVisitsByProgress } from "../src/features/trabajos/visit-order.ts";

const baseItem = {
	tipo: "visita_tecnica",
	descripcion: null,
	client_id: null,
	visit_id: null,
	trabajo_id: null,
	work_type: null,
	assignee_name: null,
	contact_name: null,
	contact_phone: null,
	address_text: null,
	latitude: null,
	longitude: null,
	client: null,
	updated_at: "2025-07-22T00:00:00.000Z",
};

test("orderVisitsByProgress prioritizes in-progress visits before pending and finalizado", () => {
	const ordered = orderVisitsByProgress([
		{
			...baseItem,
			id: "finalizado",
			fecha: "2025-07-24",
			appointment_at: "2025-07-24T09:00:00.000Z",
			titulo: "Finalizado",
			estado: "finalizado",
			created_at: "2025-07-24T09:00:00.000Z",
		},
		{
			...baseItem,
			id: "pendiente",
			fecha: "2025-07-23",
			appointment_at: "2025-07-23T09:00:00.000Z",
			titulo: "Pendiente",
			estado: "pendiente",
			created_at: "2025-07-23T09:00:00.000Z",
		},
		{
			...baseItem,
			id: "en-proceso",
			fecha: "2025-07-22",
			appointment_at: "2025-07-22T09:00:00.000Z",
			titulo: "En proceso",
			estado: "en_proceso",
			created_at: "2025-07-22T09:00:00.000Z",
		},
	]);

	assert.deepEqual(ordered.map((item) => item.id), [
		"en-proceso",
		"pendiente",
		"finalizado",
	]);
});
