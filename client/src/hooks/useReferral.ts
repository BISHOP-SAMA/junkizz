import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useReferral() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const params = new URLSearchParams(window.location.search);
    const refHandle = params.get('ref');

    if (!refHandle) return;
    if (refHandle === user.twitter_handle) return; // Can't refer yourself

    const processReferral = async () => {
      // Find the referrer
      const { data: referrer } = await supabase
        .from('users')
        .select('id, referral_count, shells_balance')
        .eq('twitter_handle', refHandle)
        .single();

      if (!referrer) return;

      // Check if this user was already referred
      const { data: existingRef } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_id', user.id)
        .maybeSingle();

      if (existingRef) return;

      // Cap at 6 referrals
      if (referrer.referral_count >= 6) return;

      // Record the referral
      const { error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrer.id,
          referred_id: user.id,
          referred_handle: user.twitter_handle,
        });

      if (insertError) {
        console.error('Referral insert failed:', insertError);
        return;
      }

      // Award +120 shells
      await supabase
        .from('users')
        .update({
          shells_balance: referrer.shells_balance + 120,
          referral_count: referrer.referral_count + 1,
        })
        .eq('id', referrer.id);

      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    };

    processReferral();
  }, [user]);
}
