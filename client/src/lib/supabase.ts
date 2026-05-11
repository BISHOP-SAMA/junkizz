import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) 
  || process.env.SUPABASE_URL 
  || process.env.VITE_SUPABASE_URL;

const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) 
  || process.env.SUPABASE_ANON_KEY 
  || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase credentials. ` +
    `URL: ${supabaseUrl ? 'OK' : 'MISSING'}, ` +
    `Key: ${supabaseAnonKey ? 'OK' : 'MISSING'}`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  twitter_id: string;
  twitter_handle: string;
  twitter_avatar: string;
  shells_balance: number;
  fragments: number;
  evm_wallet: string | null;
  day_2_claimed: boolean;
  day_4_claimed: boolean;
  referral_count: number;
  created_at: string;
};

export type ArtSubmission = {
  id: string;
  user_id: string;
  x_post_url: string;
  image_url: string;
  status: 'pending' | 'approved' | 'rejected';
  shells_awarded: number;
  submitted_at: string;
};
