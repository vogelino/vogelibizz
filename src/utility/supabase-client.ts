import { createClient } from "@refinedev/supabase";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
	throw new Error("Missing Supabase credentials");
}

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
	db: { schema: "public" },
	auth: { persistSession: true },
});
