type LegacyDocumentPreviewParams = {
	trabajoId?: string;
	clientId?: string;
};

type TrabajoIdLookup = (clientId: string) => Promise<{ id: string } | null>;

async function lookupLatestTrabajoDocumentByClientId(clientId: string) {
	const { getLatestTrabajoDocumentByClientId } = await import(
		"@/features/trabajos/data"
	);

	return getLatestTrabajoDocumentByClientId(clientId);
}

export async function resolveTrabajoPreviewId(
	params: LegacyDocumentPreviewParams | undefined,
	lookupByClientId: TrabajoIdLookup = lookupLatestTrabajoDocumentByClientId,
) {
	const trabajoId = params?.trabajoId?.trim();
	if (trabajoId) {
		return trabajoId;
	}

	const clientId = params?.clientId?.trim();
	if (!clientId) {
		return null;
	}

	const trabajo = await lookupByClientId(clientId);
	return trabajo?.id ?? null;
}
