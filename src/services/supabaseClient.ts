import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase credentials. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

// Clean url if it ends with /rest/v1/
const cleanUrl = supabaseUrl ? supabaseUrl.replace(/\/rest\/v1\/?$/, '') : '';

export const supabase = createClient(cleanUrl, supabaseAnonKey || '');
