type DocumentPreviewParams = {
	trabajoId?: string;
};

export async function resolveTrabajoPreviewId(
	params: DocumentPreviewParams | undefined,
) {
	const trabajoId = params?.trabajoId?.trim();
	if (trabajoId) {
		return trabajoId;
	}

	return null;
}
