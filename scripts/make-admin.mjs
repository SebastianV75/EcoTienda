import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userId = process.argv[2];

if (!supabaseUrl) {
	console.error("Falta NEXT_PUBLIC_SUPABASE_URL en el entorno.");
	process.exit(1);
}

if (!serviceRoleKey) {
	console.error("Falta SUPABASE_SERVICE_ROLE_KEY en el entorno.");
	process.exit(1);
}

if (!userId) {
	console.error("Uso: node scripts/make-admin.mjs <user-id>");
	process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const { data, error } = await supabase.auth.admin.updateUserById(userId, {
	app_metadata: { role: "admin" },
});

if (error) {
	console.error("No se pudo promover el usuario a admin.");
	console.error(error.message);
	process.exit(1);
}

console.log("Usuario promovido a admin correctamente.");
console.log(JSON.stringify(data.user, null, 2));
