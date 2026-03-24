import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseServiceRoleKey === 'placeholder-key') {
  console.warn('Supabase URL or Service Role Key is missing. Please set them in your environment variables.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
