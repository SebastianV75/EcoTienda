import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

test("la migración incremental cubre todas las tablas administrativas", async () => {
	const sql = await readFile(
		new URL("../docs/sql/update-administrative-role-policies.sql", import.meta.url),
		"utf8",
	);
	for (const table of [
		"agenda_items",
		"clients",
		"projects",
		"quotations",
		"quotation_items",
		"trabajos",
		"trabajo_agenda_stage",
		"trabajo_media_assets",
		"trabajo_visita_stage",
		"trabajo_quotation_stage",
		"trabajo_sale_stage",
		"trabajo_document_overrides",
	]) {
		assert.match(sql, new RegExp(table));
	}
	assert.match(sql, /app_private\.current_worker_role\(\)/);
	assert.doesNotMatch(sql, /auth\.jwt\(/);
	assert.match(sql, /drop policy if exists/);
});

test("el helper RLS privado valida worker activo y rol JWT sincronizado", async () => {
	const sql = await readFile(
		new URL("../docs/sql/add-administrative-role-to-workers.sql", import.meta.url),
		"utf8",
	);
	assert.match(sql, /create schema if not exists app_private/i);
	assert.match(sql, /function app_private\.current_worker_role\(\)/i);
	assert.match(sql, /security definer/i);
	assert.match(sql, /set search_path = ''/i);
	assert.match(sql, /\(select auth\.uid\(\)\) is not null/i);
	assert.match(sql, /worker\.auth_user_id = \(select auth\.uid\(\)\)/i);
	assert.match(sql, /worker\.active = true/i);
	assert.match(sql, /when 'staff' then 'administrative'/i);
	assert.match(sql, /normalized\.role = \(select auth\.jwt\(\)/i);
	assert.match(
		sql,
		/revoke all on function app_private\.current_worker_role\(\) from public, anon, authenticated/i,
	);
	assert.match(
		sql,
		/grant execute on function app_private\.current_worker_role\(\) to authenticated/i,
	);
	assert.match(sql, /for select\s+to authenticated\s+using \(\(select app_private\.current_worker_role\(\)\)/i);
});

test("los scripts base autorizan mediante el helper privado", async () => {
	for (const file of [
		"create-workers-table.sql",
		"create-agenda-items-table.sql",
		"create-clients-table.sql",
		"create-projects-table.sql",
		"create-quotations-table.sql",
		"create-trabajos-tables.sql",
	]) {
		const sql = await readFile(new URL(`../docs/sql/${file}`, import.meta.url), "utf8");
		const policySql =
			file === "create-workers-table.sql"
				? sql.slice(sql.indexOf('drop policy if exists "admins can read workers"'))
				: sql;
		assert.match(policySql, /app_private\.current_worker_role\(\)/, file);
		assert.doesNotMatch(policySql, /auth\.jwt\(/, file);
	}
});

test("auth.jwt solo aparece dentro del helper privado", async () => {
	const sqlDirectory = new URL("../docs/sql/", import.meta.url);
	const files = (await readdir(sqlDirectory)).filter((file) => file.endsWith(".sql"));
	for (const file of files) {
		const sql = await readFile(new URL(file, sqlDirectory), "utf8");
		if (!sql.includes("auth.jwt()")) continue;

		assert.ok(
			[
				"add-administrative-role-to-workers.sql",
				"create-workers-table.sql",
			].includes(file),
			`${file} contiene autorización directa por auth.jwt()`,
		);
		assert.equal(sql.match(/auth\.jwt\(\)/g)?.length, 1, file);
		assert.match(
			sql,
			/function app_private\.current_worker_role\(\)[\s\S]*auth\.jwt\(\)[\s\S]*?\$\$;/i,
			file,
		);
	}
});

test("las policies opcionales de técnico también exigen el helper", async () => {
	for (const file of [
		"allow-technician-assigned-work-access.sql",
		"allow-technician-legacy-assignment-access.sql",
	]) {
		const sql = await readFile(new URL(`../docs/sql/${file}`, import.meta.url), "utf8");
		const policyCount = sql.match(/create policy/gi)?.length ?? 0;
		const helperCount =
			sql.match(/\(select app_private\.current_worker_role\(\)\) = 'technician'/g)
				?.length ?? 0;
		assert.ok(policyCount > 0, file);
		assert.ok(helperCount >= policyCount, file);
	}
});

test("la página GET de confirmación no consume el token", async () => {
	const page = await readFile(
		new URL("../src/app/auth/confirm/page.tsx", import.meta.url),
		"utf8",
	);
	const action = await readFile(
		new URL("../src/features/auth/confirm-actions.ts", import.meta.url),
		"utf8",
	);
	assert.doesNotMatch(page, /verifyOtp/);
	assert.match(page, /<form action=\{confirmInvitationAction\}/);
	assert.match(action, /verifyOtp/);
});

test("el bootstrap protege escrituras y rollbacks con updated_at", async () => {
	const script = await readFile(
		new URL("../scripts/make-admin.mjs", import.meta.url),
		"utf8",
	);
	assert.match(script, /\.eq\("updated_at", existingWorker\.updated_at\)/);
	assert.equal(
		(script.match(/\.eq\("updated_at", workerWritten\.data\.updated_at\)/g) ?? [])
			.length,
		2,
	);
	assert.match(script, /return !error && data\?\.id === workerWritten\.data\.id/);
	assert.match(script, /return !error && data\?\.id === existingWorker\.id/);
	assert.match(script, /\.\.\.\(user\.app_metadata \?\? \{\}\), role: "admin"/);
	assert.match(script, /app_metadata: restoredMetadata/);
	assert.match(script, /\.update\(existingWorkerValues\)/);
	assert.match(script, /\.insert\(newWorkerValues\)/);
	const existingValues = script.match(
		/const existingWorkerValues = \{(?<body>[\s\S]*?)\n\};/,
	)?.groups?.body;
	assert.ok(existingValues);
	assert.doesNotMatch(existingValues, /full_name|email|phone/);
});

test("el alta invitada preserva app_metadata ajena al rol", async () => {
	const action = await readFile(
		new URL("../src/features/workers/actions.ts", import.meta.url),
		"utf8",
	);
	assert.match(action, /mergeWorkerRoleIntoAppMetadata,/);
	assert.match(
		action,
		/mergeWorkerRoleIntoAppMetadata\(\s*inviteData\.user\.app_metadata,\s*workerValues\.role,\s*\)/,
	);
	assert.match(action, /\{ app_metadata: appMetadata \}/);
	assert.doesNotMatch(action, /app_metadata: \{ role: workerValues\.role \}/);
});

test("la RPC de borradores usa el resolver privado y no metadata manipulable", async () => {
	const sql = await readFile(
		new URL(
			"../supabase/migrations/20260818090000_harden_quotation_draft_authorization.sql",
			import.meta.url,
		),
		"utf8",
	);
	assert.match(sql, /app_private\.current_worker_role\(\)/);
	assert.match(sql, /not in \('admin', 'administrative'\)/);
	assert.doesNotMatch(sql, /user_metadata/);
	assert.doesNotMatch(sql, /auth\.jwt\(\)/);
	assert.match(sql, /revoke all on function public\.save_quotation_draft/);
	assert.match(sql, /grant execute on function public\.save_quotation_draft/);
});

test("las descargas y acciones de venta tienen autorización explícita", async () => {
	const pdfRoute = await readFile(
		new URL("../src/app/api/quotations/[id]/pdf/route.ts", import.meta.url),
		"utf8",
	);
	const salesActions = await readFile(
		new URL("../src/features/sales/actions.ts", import.meta.url),
		"utf8",
	);
	assert.match(pdfRoute, /getCurrentUser/);
	assert.match(pdfRoute, /status: 401/);
	assert.match(pdfRoute, /status: 403/);
	assert.doesNotMatch(pdfRoute, /console\.(log|error)/);
	assert.match(
		salesActions,
		/markSaleAsLostAction[\s\S]*?requireRole\(\["admin", "administrative"\]\)/,
	);
	assert.doesNotMatch(salesActions, /console\.(log|error)/);
});
