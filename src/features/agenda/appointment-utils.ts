export function buildAppointmentAt(fecha: string, hora: string) {
	const [year, month, day] = fecha.split("-").map(Number);
	const [hours, minutes] = hora.split(":").map(Number);

	if (
		!Number.isInteger(year) ||
		!Number.isInteger(month) ||
		!Number.isInteger(day) ||
		!Number.isInteger(hours) ||
		!Number.isInteger(minutes)
	) {
		return null;
	}

	if (
		month < 1 ||
		month > 12 ||
		day < 1 ||
		day > 31 ||
		hours < 0 ||
		hours > 23 ||
		minutes < 0 ||
		minutes > 59
	) {
		return null;
	}

	const appointmentDate = new Date(
		Date.UTC(year, month - 1, day, hours, minutes),
	);

	if (
		appointmentDate.getUTCFullYear() !== year ||
		appointmentDate.getUTCMonth() !== month - 1 ||
		appointmentDate.getUTCDate() !== day ||
		appointmentDate.getUTCHours() !== hours ||
		appointmentDate.getUTCMinutes() !== minutes
	) {
		return null;
	}

	return appointmentDate.toISOString();
}
