import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const hasValidSupabaseUrl =
  supabaseUrl?.startsWith("https://") || supabaseUrl?.startsWith("http://");
const hasValidSupabaseKey =
  supabaseKey && supabaseKey !== "your_supabase_publishable_key";

// Only create the client when real Supabase environment values exist.
export const isSupabaseConfigured = Boolean(
  hasValidSupabaseUrl && hasValidSupabaseKey
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;
