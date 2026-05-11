import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion'; // ← ADD THIS
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const errorDesc = params.get('error_description');

    if (error) {
      setStatus('error');
      setErrorMsg(errorDesc || error);
      return;
    }

    const check = setInterval(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          clearInterval(check);
          setStatus('success');
          setTimeout(() => setLocation('/game'), 500);
        }
      });
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(check);
      setStatus('error');
      setErrorMsg('Session timeout — please try again');
    }, 5000);

    return () => {
      clearInterval(check);
      clearTimeout(timeout);
    };
  }, [setLocation]);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#FFFBF2' }}>
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-lg font-black text-[#1a1a2e] mb-2">Sign-in failed</h1>
        <p className="text-sm text-gray-400 text-center max-w-[280px] mb-6">{errorMsg}</p>
        <button
          onClick={() => setLocation('/')}
          className="px-6 py-3 rounded-2xl font-black text-sm text-white"
          style={{ background: '#FF6B35', boxShadow: '0 4px 0 #c04a1a' }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#FFFBF2' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        className="mb-4"
      >
        <div className="w-8 h-8 rounded-full border-2 border-[#FF6B35] border-t-transparent" />
      </motion.div>
      <p className="text-sm font-bold text-gray-400">
        {status === 'success' ? 'Redirecting...' : 'Signing you in...'}
      </p>
    </div>
  );
}
