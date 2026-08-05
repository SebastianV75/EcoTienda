function getStore() {
	if (!globalThis.__ecotiendaTrabajosData) {
		globalThis.__ecotiendaTrabajosData = {
			latestLookups: [],
			trabajoLookups: [],
			latestByClientId: new Map(),
			trabajosById: new Map(),
		};
	}

	return globalThis.__ecotiendaTrabajosData;
}

export function __resetTrabajoFixtures() {
	globalThis.__ecotiendaTrabajosData = {
		latestLookups: [],
		trabajoLookups: [],
		latestByClientId: new Map(),
		trabajosById: new Map(),
	};
}

export async function getLatestTrabajoDocumentByClientId(clientId) {
	const store = getStore();
	store.latestLookups.push(clientId);
	return store.latestByClientId.get(clientId) ?? null;
}

export async function getTrabajoDocumentById(id) {
	const store = getStore();
	store.trabajoLookups.push(id);
	return store.trabajosById.get(id) ?? null;
}
