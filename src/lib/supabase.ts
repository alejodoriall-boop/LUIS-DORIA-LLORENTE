import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://qshdvbzqqeorhhmwtttj.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_JkHEciw1QYgI8kl1RHfslA_3hlPfa8L';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
