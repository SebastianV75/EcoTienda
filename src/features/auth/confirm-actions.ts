"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { parseInviteConfirmation } from "@/features/auth/invitation-rules";
import {
	createInvitationSessionProof,
	invitationSessionCookie,
} from "@/features/auth/invitation-session";
import { getSupabaseAdminEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function confirmInvitationAction(formData: FormData) {
	const confirmation = parseInviteConfirmation({
		tokenHash: formData.get("token_hash")?.toString() ?? null,
		type: formData.get("type")?.toString() ?? null,
	});

	if (!confirmation) {
		redirect("/auth/link-error");
	}

	const { serviceRoleKey } = getSupabaseAdminEnv();
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase.auth.verifyOtp(confirmation);
	const user = data.user;

	if (error || !user) {
		redirect("/auth/link-error");
	}

	const cookieStore = await cookies();
	cookieStore.set(
		invitationSessionCookie.name,
		createInvitationSessionProof(user.id, serviceRoleKey),
		{
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/auth",
			maxAge: invitationSessionCookie.maxAge,
		},
	);

	redirect("/auth/set-password");
}
