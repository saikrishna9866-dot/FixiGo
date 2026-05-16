import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key';

if (!isSupabaseConfigured) {
  console.warn('Supabase URL or Anon Key is missing. Please set them in your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
