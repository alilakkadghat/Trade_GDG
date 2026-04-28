import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  // This will show up in the browser console during development.
  console.warn("Supabase credentials not fully set in environment variables.");
}

// Browser client that stores the session in cookies so middleware/server components can read it.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
