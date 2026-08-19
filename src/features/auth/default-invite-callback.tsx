"use client";

import { useEffect, useState } from "react";

import { prepareInvitationSessionAction } from "@/features/auth/default-invite-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type CallbackState = "idle" | "processing" | "error";

function getInviteTokens() {

  const hash = new URLSearchParams(window.location.hash.slice(1));
  const query = new URLSearchParams(window.location.search);

  return {
    accessToken: hash.get("access_token"),
    refreshToken: hash.get("refresh_token"),
    code: query.get("code"),
    type: hash.get("type") ?? query.get("type"),
  };
}

export function DefaultInviteCallback() {
  const [state, setState] = useState<CallbackState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { accessToken, refreshToken, code, type } = getInviteTokens();

    if (type !== "invite" || (!code && (!accessToken || !refreshToken))) {
      return;
    }

    let cancelled = false;

    async function completeInvite() {
      setState("processing");
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);

      const supabase = createSupabaseBrowserClient();
      const result = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : accessToken && refreshToken
          ? await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
          : { error: new Error("Missing invitation session tokens") };

      if (result.error) {
        if (!cancelled) {
          setState("error");
          setError("El enlace de invitación venció o ya fue utilizado. Solicita una nueva invitación.");
        }
        return;
      }

      await prepareInvitationSessionAction();
    }

    void completeInvite().catch(() => {
      if (!cancelled) {
        setState("error");
        setError("No se pudo activar la invitación. Solicita una nueva invitación.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "processing") {
    return (
      <p className="mb-4 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
        Verificando tu invitación…
      </p>
    );
  }

  if (state === "error") {
    return (
      <p className="mb-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-900">
        {error}
      </p>
    );
  }

  return null;
}
