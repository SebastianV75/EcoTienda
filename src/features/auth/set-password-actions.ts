"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import {
	getPasswordUpdateError,
	validateNewPassword,
} from "@/features/auth/invitation-rules";
import {
	invitationSessionCookie,
	verifyInvitationSessionProof,
} from "@/features/auth/invitation-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminEnv } from "@/lib/env";

export type SetPasswordActionState = { error: string | null };

export async function setPasswordAction(
	_previousState: SetPasswordActionState,
	formData: FormData,
): Promise<SetPasswordActionState> {
	const password = formData.get("password")?.toString() ?? "";
	const confirmation =
		formData.get("password_confirmation")?.toString() ?? "";
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
			error: "La sesión de invitación venció o no es válida. Solicita una nueva invitación.",
		};
	}

	const cookieStore = await cookies();
	const proof = cookieStore.get(invitationSessionCookie.name)?.value;
	const { serviceRoleKey } = getSupabaseAdminEnv();

	if (!verifyInvitationSessionProof(proof, user.id, serviceRoleKey)) {
		return {
			error: "La activación de la invitación venció o no es válida. Abre nuevamente el enlace de invitación.",
		};
	}

	const { data, error } = await supabase.auth.updateUser({
		password: validation.password,
	});

	if (error || !data.user) {
		return { error: getPasswordUpdateError(error) };
	}

	cookieStore.delete(invitationSessionCookie.name);
	await supabase.auth.signOut({ scope: "local" });
	redirect("/auth/sign-in?activated=1");
}
