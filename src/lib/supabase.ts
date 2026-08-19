import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string, fallback = ''): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return fallback;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL', 'https://rvpdwkqpgloyfahdjmvr.supabase.co');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY', '');

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseAnonKey.trim() !== '');
};

export const supabase = createClient(
  supabaseUrl || 'https://rvpdwkqpgloyfahdjmvr.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
