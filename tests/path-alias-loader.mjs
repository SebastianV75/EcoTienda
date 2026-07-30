import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const extensionCandidates = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
const stubbedSpecifiers = new Map([
	["next/link", new URL("./stubs/next-link.mjs", import.meta.url).href],
	["next/image", new URL("./stubs/next-image.mjs", import.meta.url).href],
	["next/navigation", new URL("./stubs/next-navigation.mjs", import.meta.url).href],
	[
		"@/components/app-shell",
		new URL("./stubs/app-shell.mjs", import.meta.url).href,
	],
	[
		"@/features/auth/session",
		new URL("./stubs/auth-session.mjs", import.meta.url).href,
	],
	[
		"@/features/trabajos/data",
		new URL("./stubs/trabajos-data.mjs", import.meta.url).href,
	],
]);

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
	if (stubbedSpecifiers.has(specifier)) {
		return {
			url: stubbedSpecifiers.get(specifier),
			shortCircuit: true,
		};
	}

	if (specifier.startsWith("@/")) {
		return {
			url: resolveAliasTarget(specifier),
			shortCircuit: true,
		};
	}

	return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
	if (url.startsWith("file:") && (url.endsWith(".ts") || url.endsWith(".tsx"))) {
		const source = await readFile(fileURLToPath(url), "utf8");
		const transpiled = ts.transpileModule(source, {
			compilerOptions: {
				module: ts.ModuleKind.ESNext,
				target: ts.ScriptTarget.ES2020,
				jsx: ts.JsxEmit.ReactJSX,
				esModuleInterop: true,
				moduleResolution: ts.ModuleResolutionKind.Bundler,
				allowJs: true,
			},
			fileName: fileURLToPath(url),
		});

		return {
			format: "module",
			source: transpiled.outputText,
			shortCircuit: true,
		};
	}

	return nextLoad(url, context);
}
