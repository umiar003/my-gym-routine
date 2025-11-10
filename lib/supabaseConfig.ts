export function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Sample database schema (describe only, no migrations run yet):
 *
 * TABLE cycles:
 *   - id (uuid, primary key)
 *   - user_id (uuid, references auth.users.id)
 *   - sequence_number (integer, increments per user)
 *   - started_at (timestamp with time zone)
 *   - completed_at (timestamp with time zone, nullable)
 *
 * TABLE days:
 *   - id (uuid, primary key)
 *   - cycle_id (uuid, references cycles.id)
 *   - day_index (integer, 1-7)
 *   - completed (boolean, default false)
 *
 * TABLE tasks:
 *   - id (uuid, primary key)
 *   - day_id (uuid, references days.id)
 *   - title (text)
 *   - description (text, nullable)
 *   - completed (boolean, default false)
 *   - created_at (timestamp with time zone, default now())
 */

