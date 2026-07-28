import { existsSync } from "node:fs";

const extensionCandidates = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

function resolveAliasTarget(specifier) {
	const baseUrl = new URL(`../src/${specifier.slice(2)}`, import.meta.url);
	const basePath = baseUrl.pathname;

	if (existsSync(basePath)) {
		return baseUrl.href;
	}

	for (const extension of extensionCandidates) {
		if (existsSync(`${basePath}${extension}`)) {
			return new URL(`${baseUrl.pathname}${extension}`, baseUrl).href;
		}
	}

	for (const extension of extensionCandidates) {
		if (existsSync(`${basePath}/index${extension}`)) {
			return new URL(`${baseUrl.pathname}/index${extension}`, baseUrl).href;
		}
	}

	return baseUrl.href;
}

export async function resolve(specifier, context, nextResolve) {
	if (specifier.startsWith("@/")) {
		return {
			url: resolveAliasTarget(specifier),
			shortCircuit: true,
		};
	}

	return nextResolve(specifier, context);
}
