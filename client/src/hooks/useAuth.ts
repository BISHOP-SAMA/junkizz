import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchUser();
  };

  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = () => {
    window.location.href = '/api/auth/logout';
  };

  return { user, loading, login, logout, refreshProfile };
}
