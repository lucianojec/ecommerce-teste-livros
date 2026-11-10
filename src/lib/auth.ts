import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getPublicEnv } from "@/lib/env";
import { jsonError } from "@/lib/api";

export async function getApiClient(request: Request) {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY } =
    getPublicEnv();
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return createSupabaseClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { Authorization: authorization } },
      },
    );
  }

  const cookieStore = await cookies();
  return createServerClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (values) => {
          values.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
}

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  return authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
}

export type AuthenticatedRequest = {
  supabase: Awaited<ReturnType<typeof getApiClient>>;
  user: User;
};

export async function authenticate(request: Request) {
  const supabase = await getApiClient(request);
  const token = getBearerToken(request);
  const {
    data: { user },
    error,
  } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();

  if (error || !user) {
    return { response: jsonError(401, "UNAUTHORIZED", "Faça login para continuar.") };
  }
  return { supabase, user } satisfies AuthenticatedRequest;
}

export async function authenticateAdmin(request: Request) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated;

  const { data: profile, error } = await authenticated.supabase
    .from("profiles")
    .select("role")
    .eq("id", authenticated.user.id)
    .single();

  if (error) {
    return {
      response: jsonError(503, "DATABASE_UNAVAILABLE", "Não foi possível verificar as permissões."),
    };
  }
  if (profile.role !== "ADMIN") {
    return { response: jsonError(403, "FORBIDDEN", "Acesso restrito à administração.") };
  }
  return authenticated;
}
