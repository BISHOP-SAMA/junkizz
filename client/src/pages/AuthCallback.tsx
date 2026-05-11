import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Supabase automatically handles the OAuth hash params
    // We just wait for the session to be established
    const check = setInterval(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          clearInterval(check);
          setLocation('/game'); // or '/' if you want landing page
        }
      });
    }, 100);

    // Fallback after 3 seconds
    const timeout = setTimeout(() => {
      clearInterval(check);
      setLocation('/game');
    }, 3000);

    return () => {
      clearInterval(check);
      clearTimeout(timeout);
    };
  }, [setLocation]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(160deg, #FFFBF2 0%, #FFF3DC 55%, #FFFAF0 100%)' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        className="mb-4"
      >
        <div className="w-8 h-8 rounded-full border-2 border-[#FF6B35] border-t-transparent" />
      </motion.div>
      <p className="text-sm font-bold text-gray-400">Signing you in...</p>
    </div>
  );
}
