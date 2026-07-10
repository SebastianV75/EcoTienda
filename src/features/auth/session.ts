import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import type { AppRole } from "@/types/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthUser = {
	id: string;
	email: string | null;
	role: AppRole;
};

const DEFAULT_ROLE: AppRole = "technician";

export function getUserRole(
	user: Pick<User, "app_metadata" | "user_metadata"> | null,
): AppRole {
	const appRole = user?.app_metadata?.role;
	const userRole = user?.user_metadata?.role;

	if (appRole === "admin" || appRole === "technician") {
		return appRole;
	}

	if (userRole === "admin" || userRole === "technician") {
		return userRole;
	}

	return DEFAULT_ROLE;
}

export function getDefaultRouteForRole(role: AppRole) {
	return role === "admin" ? "/admin" : "/technician";
}

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
	if (!hasSupabaseEnv()) {
		return null;
	}

	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return null;
	}

	return {
		id: user.id,
		email: user.email ?? null,
		role: getUserRole(user),
	};
});

export async function requireUser() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/auth/sign-in");
	}

	return user;
}

export async function requireRole(allowedRoles: AppRole[]) {
	const user = await requireUser();

	if (!allowedRoles.includes(user.role)) {
		redirect("/unauthorized");
	}

	return user;
}
