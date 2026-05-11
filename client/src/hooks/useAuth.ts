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
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const ensureProfile = async (authUser: any) => {
      if (!mounted) return;
      const meta = authUser.user_metadata;
      const handle = meta.user_name || meta.preferred_username || 'you';
      const avatar = meta.avatar_url || '';
      const providerId = meta.provider_id || authUser.id;

      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: authUser.id,
          twitter_id: providerId,
          twitter_handle: handle,
          twitter_avatar: avatar,
        }, { onConflict: 'id' })
        .select()
        .single();

      if (!mounted) return;
      if (data && !error) setProfile(data as User);
      setLoading(false);
    };

    // Check initial session (handles OAuth redirect)
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        await ensureProfile(session.user);
      } else if (mounted) {
        setLoading(false);
      }
    };

    init();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        ensureProfile(session.user);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (!profile) return;
    const { data } = await supabase.from('users').select('*').eq('id', profile.id).single();
    if (data) setProfile(data as User);
  };

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'x',
      options: { redirectTo: 'https://planetslog.xyz/' },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return { user: profile, loading, login, logout, refreshProfile };
}
