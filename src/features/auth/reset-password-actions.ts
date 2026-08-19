"use server";

import { redirect } from "next/navigation";

import {
	getPasswordUpdateError,
	validateNewPassword,
} from "@/features/auth/invitation-rules";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ResetPasswordActionState = { error: string | null };

export async function resetPasswordAction(
	_previousState: ResetPasswordActionState,
	formData: FormData,
): Promise<ResetPasswordActionState> {
	const password = formData.get("password")?.toString() ?? "";
	const confirmation = formData.get("password_confirmation")?.toString() ?? "";
	const validation = validateNewPassword({ password, confirmation });

	if (validation.error || !validation.password) {
		return { error: validation.error };
	}

	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
		error: sessionError,
	} = await supabase.auth.getUser();

	if (sessionError || !user) {
		return {
			error: "La sesión para restablecer la contraseña venció. Solicita un nuevo enlace.",
		};
	}

	const { data, error } = await supabase.auth.updateUser({
		password: validation.password,
	});

	if (error || !data.user) {
		return { error: getPasswordUpdateError(error) };
	}

	await supabase.auth.signOut({ scope: "local" });
	redirect("/auth/sign-in?reset=1");
}
