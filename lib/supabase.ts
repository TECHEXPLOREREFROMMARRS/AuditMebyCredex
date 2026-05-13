import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey && !supabaseUrl.includes('dummy') && !supabaseKey.includes('dummy')) {
  supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}

export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error('Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.');
  }
  return supabaseAdmin;
}

export function isSupabaseConfigured() {
  return !!supabaseAdmin;
}
