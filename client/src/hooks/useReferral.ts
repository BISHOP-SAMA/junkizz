import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useReferral() {
  const { user, refreshProfile } = useAuth();

  useEffect(() => {
    if (!user) return;

    const params = new URLSearchParams(window.location.search);
    const refHandle = params.get('ref');
    if (!refHandle) return;

    // Prevent self-referral check on client too
    if (refHandle === user.twitter_handle || refHandle === user.twitter_handle.replace('@', '')) {
      console.log('[Referral] Self referral blocked');
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    const process = async () => {
      const { data, error } = await supabase.rpc('process_referral', {
        referrer_handle: refHandle,
      });

      if (error) {
        console.error('[Referral] RPC error:', error.message);
        return;
      }

      console.log('[Referral] Result:', data);

      if (data?.success) {
        console.log('[Referral] Success! 120 shells awarded to', data.referrer);
        refreshProfile(); // refresh current user's profile if needed
      }

      // Clean URL regardless of outcome
      window.history.replaceState({}, '', window.location.pathname);
    };

    process();
  }, [user, refreshProfile]);
}
