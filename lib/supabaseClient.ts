import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabaseConfig } from "./supabaseConfig";

type CookiePayload = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function createSupabaseServerComponentClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore
          .getAll()
          .map((cookie) => ({ name: cookie.name, value: cookie.value }));
      },
    },
  });
}

export async function createSupabaseRouteHandlerClient(
  response: NextResponse
) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore
          .getAll()
          .map((cookie) => ({ name: cookie.name, value: cookie.value }));
      },
      setAll(cookiesToSet: CookiePayload[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        });
      },
    },
  });
}

export function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request
          .cookies.getAll()
          .map((cookie) => ({ name: cookie.name, value: cookie.value }));
      },
      setAll(cookiesToSet: CookiePayload[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        });
      },
    },
  });
}

