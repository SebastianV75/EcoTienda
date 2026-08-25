export const UNIFILAR_RULES = [
	{ key: "panels_0_5", label: "0 a 5 paneles", min: 0, max: 5, fallback: "4-paneles.png" },
	{ key: "panels_6", label: "6 paneles", min: 6, max: 6, fallback: "6-paneles.png" },
	{ key: "panels_7", label: "7 paneles", min: 7, max: 7, fallback: "7-paneles.png" },
	{ key: "panels_8_9", label: "8 a 9 paneles", min: 8, max: 9, fallback: "8-paneles.png" },
	{ key: "panels_10_12", label: "10 a 12 paneles", min: 10, max: 12, fallback: "10-paneles.png" },
	{ key: "panels_13_14", label: "13 a 14 paneles", min: 13, max: 14, fallback: "14-paneles.png" },
] as const;

export type UnifilarRuleKey = (typeof UNIFILAR_RULES)[number]["key"];

export function parseUnifilarPanelCount(value: string | null | undefined): number | null {
	const normalized = (value ?? "").trim();
	if (!normalized) return null;

	const match = normalized.match(/\d+/);
	if (!match) return null;

	const parsed = Number(match[0]);
	return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

export function getUnifilarRule(panelCount: string | null | undefined) {
	const count = parseUnifilarPanelCount(panelCount);
	if (count === null || count >= 15) return null;
	return UNIFILAR_RULES.find((rule) => count >= rule.min && count <= rule.max) ?? null;
}

export function getUnifilarRuleByKey(ruleKey: string) {
	return UNIFILAR_RULES.find((rule) => rule.key === ruleKey) ?? null;
}
