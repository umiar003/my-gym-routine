import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./supabaseConfig";

export function createSupabaseBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

