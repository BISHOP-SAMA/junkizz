import { motion } from 'framer-motion';
import { Redirect } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { ASSETS } from '../lib/assets';

export default function Home() {
  const { user, loading, login } = useAuth();
  if (loading) return null;
  if (user) return <Redirect to="/shell-blitz" />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6" style={{ background: 'linear-gradient(160deg, #FFFBF2 0%, #FFF3DC 55%, #FFFAF0 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1,1.12,1], rotate: [0,10,0] }} transition={{ duration: 14, repeat: Infinity }} className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#FF6B35] opacity-10" />
        <motion.div animate={{ scale: [1,1.08,1], rotate: [0,-7,0] }} transition={{ duration: 11, repeat: Infinity, delay: 2 }} className="absolute -bottom-28 -left-20 w-72 h-72 rounded-full bg-[#06D6A0] opacity-10" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-[320px]">
        <motion.div animate={{ y: [0,-8,0] }} transition={{ duration: 3.5, repeat: Infinity }} className="mb-6">
          <img src={ASSETS.shellblitz} alt="Shellies" className="w-28 h-28 object-contain drop-shadow-xl" />
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-black leading-none mb-2 text-[3.5rem] text-[#1a1a2e]" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.03em' }}>
          Shellies
        </motion.h1>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="flex items-center gap-3 mb-8">
          <div className="h-px w-10 bg-[#FF6B35] opacity-40" />
          <span className="text-xs font-black tracking-[0.3em] uppercase text-[#FF6B35]">Season 1</span>
          <div className="h-px w-10 bg-[#FF6B35] opacity-40" />
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={login}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[0.95rem] tracking-wide text-white mb-4"
          style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d2d4e)', fontFamily: 'Georgia, serif', boxShadow: '0 6px 0 #0a0a1a, 0 12px 28px rgba(26,26,46,0.22)' }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="white">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Sign in with X
        </motion.button>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-xs text-gray-400 italic">
          Slow & steady wins the shell 🐚
        </motion.p>
      </div>
    </div>
  );
}
