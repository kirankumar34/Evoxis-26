import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rvpdwkqpgloyfahdjmvr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseAnonKey.trim() !== '');
};

export const supabase = createClient(
  supabaseUrl || 'https://rvpdwkqpgloyfahdjmvr.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
