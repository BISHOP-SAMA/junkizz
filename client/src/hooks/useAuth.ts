import { useState, useEffect } from 'react';
import { supabase, type User } from '../lib/supabase';

export function useAuth() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await ensureProfile(session.user);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const ensureProfile = async (authUser: any) => {
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

    if (data && !error) setProfile(data as User);
    setLoading(false);
  };

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await ensureProfile(session.user);
    else setLoading(false);
  };

  const refreshProfile = async () => {
    if (!profile) return;
    const { data } = await supabase.from('users').select('*').eq('id', profile.id).single();
    if (data) setProfile(data as User);
  };

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: { redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/shell-blitz` : undefined },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return { user: profile, loading, login, logout, refreshProfile };
}
