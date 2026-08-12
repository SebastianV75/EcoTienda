import { createClient } from "@supabase/supabase-js";

// Legacy bootstrap utility. Normal admins should create and manage users in the app.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userId = process.argv[2];

if (!supabaseUrl || !serviceRoleKey || !userId) {
	console.error(
		"Uso: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/make-admin.mjs <user-id>",
	);
	process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
	auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existingUserData, error: userLookupError } =
	await supabase.auth.admin.getUserById(userId);
const user = existingUserData.user;

if (userLookupError || !user) {
	console.error("No se encontró el usuario de Auth.");
	process.exit(1);
}

const { data: links, error: linksError } = await supabase
	.from("workers")
	.select("id, full_name, email, phone, role, auth_user_id, active, updated_at")
	.eq("auth_user_id", userId)
	.limit(2);

let workerLinks = links;
let workerLinksError = linksError;
let legacyWithoutEmail = false;

if (
	linksError?.code === "PGRST204" ||
	linksError?.code === "42703"
) {
	const legacyResult = await supabase
		.from("workers")
		.select("id, full_name, phone, role, auth_user_id, active, updated_at")
		.eq("auth_user_id", userId)
		.limit(2);
	workerLinks = legacyResult.data;
	workerLinksError = legacyResult.error;
	legacyWithoutEmail = true;
}

if (workerLinksError) {
	console.error("No se pudieron verificar los vínculos workers existentes.");
	process.exit(1);
}

if ((workerLinks?.length ?? 0) > 1) {
	console.error("El usuario está vinculado a más de un worker. Corrige los duplicados primero.");
	process.exit(1);
}

const existingWorker = workerLinks?.[0] ?? null;
const newWorkerValues = {
	full_name: user.user_metadata?.full_name ?? user.email ?? "Administrador",
	phone: null,
	role: "admin",
	auth_user_id: userId,
	active: true,
	...(legacyWithoutEmail ? {} : { email: user.email ?? null }),
};
const existingWorkerValues = {
	role: "admin",
	auth_user_id: userId,
	active: true,
};
let workerWritten = null;

if (existingWorker) {
	workerWritten = await supabase
		.from("workers")
		.update(existingWorkerValues)
		.eq("id", existingWorker.id)
		.eq("updated_at", existingWorker.updated_at)
		.select("id, updated_at")
		.maybeSingle();
} else {
	workerWritten = await supabase
		.from("workers")
		.insert(newWorkerValues)
		.select("id, updated_at")
		.single();
}

if (workerWritten.error || !workerWritten.data) {
	console.error("No se pudo crear o actualizar el vínculo worker administrador.");
	console.error("Aplica primero docs/sql/add-administrative-role-to-workers.sql si el esquema es legacy.");
	process.exit(1);
}

async function rollbackWorker() {
	if (!existingWorker) {
		const { data, error } = await supabase
			.from("workers")
			.delete()
			.eq("id", workerWritten.data.id)
			.eq("updated_at", workerWritten.data.updated_at)
			.select("id")
			.maybeSingle();
		return !error && data?.id === workerWritten.data.id;
	}

	const snapshot = {
		role: existingWorker.role,
		auth_user_id: existingWorker.auth_user_id,
		active: existingWorker.active,
	};
	const { data, error } = await supabase
		.from("workers")
		.update(snapshot)
		.eq("id", existingWorker.id)
		.eq("updated_at", workerWritten.data.updated_at)
		.select("id")
		.maybeSingle();
	return !error && data?.id === existingWorker.id;
}

async function rollbackRole() {
	const { data: freshUserData, error: freshLookupError } =
		await supabase.auth.admin.getUserById(userId);
	if (freshLookupError || !freshUserData.user) return false;
	if (freshUserData.user.app_metadata?.role === previousRole) return true;
	if (freshUserData.user.app_metadata?.role !== "admin") return false;
	const restoredMetadata = { ...(freshUserData.user.app_metadata ?? {}) };
	if (previousRole === undefined) {
		delete restoredMetadata.role;
	} else {
		restoredMetadata.role = previousRole;
	}
	const rollback = await supabase.auth.admin.updateUserById(userId, {
		app_metadata: restoredMetadata,
	});
	return !rollback.error;
}

const previousRole = user.app_metadata?.role;
const { data, error } = await supabase.auth.admin.updateUserById(userId, {
	app_metadata: { ...(user.app_metadata ?? {}), role: "admin" },
});

if (error || !data.user) {
	const workerRolledBack = await rollbackWorker();
	const roleRolledBack = workerRolledBack ? await rollbackRole() : false;

	console.error("No se pudo promover el usuario a admin.");
	if (!workerRolledBack || !roleRolledBack) {
		console.error(
			"Falló el rollback; revisa manualmente workers y app_metadata.role antes de continuar.",
		);
	}
	process.exit(1);
}

const [finalWorkerResult, finalUserResult] = await Promise.all([
	supabase
		.from("workers")
		.select("id, role, active")
		.eq("auth_user_id", userId)
		.limit(2),
	supabase.auth.admin.getUserById(userId),
]);

if (
	finalWorkerResult.error ||
	finalUserResult.error ||
	finalWorkerResult.data?.length !== 1 ||
	finalWorkerResult.data[0]?.role !== "admin" ||
	finalWorkerResult.data[0]?.active !== true ||
	finalUserResult.data.user?.app_metadata?.role !== "admin"
) {
	const workerRolledBack = await rollbackWorker();
	const roleRolledBack = workerRolledBack ? await rollbackRole() : false;
	console.error("No se pudo verificar la sincronización final de Auth y workers.");
	if (!workerRolledBack || !roleRolledBack) {
		console.error("Falló el rollback; se requiere revisión manual.");
	}
	process.exit(1);
}

console.log("Usuario promovido a admin y vinculado correctamente.");
console.log(JSON.stringify(data.user, null, 2));
