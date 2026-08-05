import assert from "node:assert/strict";
import test from "node:test";

import { getPostalCodeLocation } from "../src/features/trabajos/postal-code-location.ts";

test("autocompleta Chihuahua para el código postal confirmado 31100", () => {
	assert.deepEqual(getPostalCodeLocation("31100"), {
		municipality: "Chihuahua",
		state: "Chihuahua",
	});
});

test("no infiere municipio o estado para códigos postales no catalogados", () => {
	assert.equal(getPostalCodeLocation("01000"), null);
	assert.equal(getPostalCodeLocation(""), null);
});
