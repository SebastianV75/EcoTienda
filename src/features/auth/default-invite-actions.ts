"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  createInvitationSessionProof,
  invitationSessionCookie,
} from "@/features/auth/invitation-session";
import { getSupabaseAdminEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function prepareInvitationSessionAction() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/link-error");
  }

  const { serviceRoleKey } = getSupabaseAdminEnv();
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
