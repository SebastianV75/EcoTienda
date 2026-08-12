"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
	getDefaultRouteForRole,
	resolveUserRole,
} from "@/features/auth/session";

export type AuthActionState = {
	error: string | null;
};

export async function signInAction(
	_previousState: AuthActionState,
	formData: FormData,
): Promise<AuthActionState> {
	const email = formData.get("email")?.toString().trim();
	const password = formData.get("password")?.toString();

	if (!email || !password) {
		return {
			error: "Correo y contraseña son obligatorios.",
		};
	}

	const supabase = await createSupabaseServerClient();
	const { error, data } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		return {
			error: "No se pudo iniciar sesión. Verifica tu correo y contraseña.",
		};
	}

	const role = await resolveUserRole(data.user);
	if (!role) {
		redirect("/unauthorized");
	}
	redirect(getDefaultRouteForRole(role));
}

export async function signOutAction() {
	const supabase = await createSupabaseServerClient();
	await supabase.auth.signOut();
	redirect("/auth/sign-in");
}
