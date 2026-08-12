import type {
	WorkerAccessMode,
	WorkerRole,
} from "@/types/worker";
import { normalizeWorkerRole } from "@/features/auth/role-rules";

type WorkerFieldsValidation = {
	error: string | null;
	values: {
		full_name: string;
		email: string | null;
		phone: string | null;
		role: WorkerRole;
	} | null;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9().\-\s]{7,30}$/;

export function normalizeName(value: string) {
	return value.normalize("NFKC").trim().replace(/\s+/g, " ");
}

export function normalizeEmail(value: string) {
	const email = value.normalize("NFKC").trim().toLowerCase();
	return email.length > 0 && emailPattern.test(email) && email.length <= 254
		? email
		: null;
}

export function normalizePhone(value: string) {
	const phone = value.normalize("NFKC").trim().replace(/\s+/g, " ");
	return phone.length > 0 && phonePattern.test(phone) ? phone : null;
}

export function normalizeRole(value: string): WorkerRole | null {
	return normalizeWorkerRole(value);
}

export function isWorkerAccessMode(value: string): value is WorkerAccessMode {
	return value === "profile" || value === "invite";
}

export function validateWorkerFields(input: {
	fullName: string;
	email: string;
	phone: string;
	role: string;
	accessMode?: string;
}): WorkerFieldsValidation {
	const fullName = normalizeName(input.fullName);
	const email = input.email ? normalizeEmail(input.email) : null;
	const phone = input.phone ? normalizePhone(input.phone) : null;
	const role = normalizeRole(input.role);

	if (fullName.length < 2 || fullName.length > 120) {
		return { error: "El nombre debe tener entre 2 y 120 caracteres.", values: null };
	}

	if (input.email && !email) {
		return { error: "Captura un correo válido.", values: null };
	}

	if (input.phone && !phone) {
		return { error: "Captura un teléfono válido.", values: null };
	}

	if (!role) {
		return { error: "Selecciona un rol válido.", values: null };
	}

	if (input.accessMode && !isWorkerAccessMode(input.accessMode)) {
		return {
			error: "Selecciona una modalidad de acceso válida.",
			values: null,
		};
	}

	if (input.accessMode === "invite" && !email) {
		return {
			error: "El correo es obligatorio para invitar el acceso.",
			values: null,
		};
	}

	return {
		error: null,
		values: {
			full_name: fullName,
			email,
			phone,
			role,
		},
	};
}
