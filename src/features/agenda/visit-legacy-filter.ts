type LegacyVisitItem = {
	visit_id: string | null;
};

export function shouldIncludeLegacyVisit(
	item: LegacyVisitItem,
	linkedWorkStages: ReadonlyMap<string, string>,
) {
	if (!item.visit_id) {
		return true;
	}

	const linkedStage = linkedWorkStages.get(item.visit_id);
	return linkedStage === undefined || linkedStage === "visita";
}
