import assert from "node:assert/strict";
import test from "node:test";

import {
	getUnifilarRule,
	parseUnifilarPanelCount,
} from "../src/features/documents/unifilar-diagram-rules.ts";

test("resuelve las reglas automáticas de diagramas por paneles", () => {
	const expected = new Map([
		[0, "panels_0_5"],
		[3, "panels_0_5"],
		[4, "panels_0_5"],
		[5, "panels_0_5"],
		[6, "panels_6"],
		[7, "panels_7"],
		[8, "panels_8_9"],
		[9, "panels_8_9"],
		[10, "panels_10_12"],
		[12, "panels_10_12"],
		[13, "panels_13_14"],
		[14, "panels_13_14"],
	]);

	for (const [count, ruleKey] of expected) {
		assert.equal(getUnifilarRule(String(count))?.key, ruleKey);
	}

	assert.equal(getUnifilarRule("15"), null);
	assert.equal(getUnifilarRule("30 paneles"), null);
});

test("parsea cantidades con texto y rechaza valores inválidos", () => {
	assert.equal(parseUnifilarPanelCount("9 paneles"), 9);
	assert.equal(parseUnifilarPanelCount(""), null);
	assert.equal(parseUnifilarPanelCount("sin definir"), null);
});
