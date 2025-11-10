import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabaseClient";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectPath = requestUrl.searchParams.get("redirectTo") ?? "/dashboard";

  const response = NextResponse.redirect(
    new URL(redirectPath, requestUrl.origin)
  );

  if (code) {
    const supabase = await createSupabaseRouteHandlerClient(response);
    await supabase.auth.exchangeCodeForSession(code);
  }

  return response;
}

