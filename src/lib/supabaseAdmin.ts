import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Supabase URL is missing! Check your environment variables.');
}
if (!supabaseServiceKey) {
  console.error('Supabase Service Role Key is missing! Check your environment variables.');
}

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder'
);

export const isSupabaseAdminConfigured = !!(supabaseUrl && supabaseServiceKey && supabaseServiceKey !== 'placeholder');
