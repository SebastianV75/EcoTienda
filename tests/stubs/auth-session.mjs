const defaultUser = { email: "admin@ecotienda.test", role: "admin" };

export async function getCurrentUser() {
	return globalThis.__ecotiendaAuthUser ?? defaultUser;
}

export async function requireUser() {
	return getCurrentUser();
}

export async function requireRole() {
	return getCurrentUser();
}
