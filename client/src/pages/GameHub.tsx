import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Redirect } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { ShellIcon } from '../components/ShellIcon';
import ProfileMenu from '../components/ProfileMenu';
import { ASSETS } from '../lib/assets';

const PAGES = [
  {
    id: 'shell-blitz',
    path: '/shell-blitz',
    label: 'Shell Blitz',
    sub: 'Season 1 · Live now',
    color: '#FF6B35',
    shadow: '#c04a1a',
    glow: 'rgba(255,107,53,0.35)',
    emoji: '🐚',
    image: ASSETS.shellblitz,
    live: true,
  },
  {
    id: 'airdrop',
    path: '/airdrop',
    label: 'Airdrop',
    sub: 'Claim rewards',
    color: '#8B5CF6',
    shadow: '#6d28d9',
    glow: 'rgba(139,92,246,0.35)',
    emoji: '🎁',
    image: ASSETS.airdrop,
    live: true,
  },
  {
    id: 'slog-race',
    path: '/race',
    label: 'Slog Race',
    sub: 'Coming Season 2',
    color: '#06D6A0',
    shadow: '#048a67',
    glow: 'rgba(6,214,160,0.25)',
    emoji: '🏁',
    image: ASSETS.slograce,
    live: false,
  },
  {
    id: 'community-frens',
    path: '/frens',
    label: 'Community Frens',
    sub: 'Coming Season 2',
    color: '#EF476F',
    shadow: '#b0244e',
    glow: 'rgba(239,71,111,0.25)',
    emoji: '👥',
    image: ASSETS.slogfrens,        // ← NEW IMAGE
    live: false,
  },
  {
    id: 'gallery',
    path: '/gallery',
    label: 'Gallery',
    sub: 'Community art',
    color: '#118AB2',
    shadow: '#0a5a7a',
    glow: 'rgba(17,138,178,0.25)',
    emoji: '🖼️',
    image: ASSETS.shellblitz,
    live: false,
  },
];

export default function GameHub() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [index, setIndex] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFBF2' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}>
          <ShellIcon size={34} />
        </motion.div>
      </div>
    );
  }

  if (!user) return <Redirect to="/" />;

  const current = PAGES[index];
  const prev = PAGES[(index - 1 + PAGES.length) % PAGES.length];
  const next = PAGES[(index + 1) % PAGES.length];

  const go = (dir: number) => setIndex((i) => (i + dir + PAGES.length) % PAGES.length);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #FFFBF2 0%, #FFF0DC 55%, #FFFAF0 100%)' }}>
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.06, 0.1, 0.06] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: current.color }}
        />
      </div>

      <div className="relative z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <img src={ASSETS.logo} alt="logo" className="w-9 h-9 object-contain rounded-xl" />
          <span className="font-black text-lg text-[#1a1a2e]" style={{ fontFamily: 'Georgia, serif' }}>Planetslog</span>
        </div>
        <ProfileMenu />
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10 px-4">
        <motion.button
          whileHover={{ scale: 1.15, x: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => go(-1)}
          className="absolute left-4 sm:left-8 z-20 w-12 h-12 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm border border-black/5 shadow-lg"
        >
          <span className="text-2xl font-black text-[#1a1a2e]">‹</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.15, x: 2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => go(1)}
          className="absolute right-4 sm:right-8 z-20 w-12 h-12 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm border border-black/5 shadow-lg"
        >
          <span className="text-2xl font-black text-[#1a1a2e]">›</span>
        </motion.button>

        <div className="relative w-full max-w-sm aspect-[3/4] flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {/* Prev card */}
            <motion.div
              key={`prev-${prev.id}`}
              initial={{ x: -200, scale: 0.7, opacity: 0 }}
              animate={{ x: -140, scale: 0.75, opacity: 0.4, zIndex: 1 }}
              exit={{ x: -300, scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute w-full h-full rounded-3xl overflow-hidden cursor-pointer"
              style={{ background: 'white', boxShadow: `0 8px 32px ${prev.glow}` }}
              onClick={() => go(-1)}
            >
              <img src={prev.image} alt={prev.label} className="w-full h-full object-cover opacity-60" />
            </motion.div>

            {/* Current card */}
            <motion.div
              key={`curr-${current.id}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ x: 0, scale: 1, opacity: 1, zIndex: 10 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute w-full h-full rounded-3xl overflow-hidden cursor-pointer"
              style={{ boxShadow: `0 24px 80px ${current.glow}, 0 0 0 3px ${current.color}30` }}
              onClick={() => current.live && setLocation(current.path)}
            >
              {/* Background image */}
              <div className="absolute inset-0">
                <img src={current.image} alt={current.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.05) 60%, transparent 100%)` }} />
              </div>

              {/* Premium border overlay */}
              <div className="absolute inset-2 rounded-2xl pointer-events-none" style={{ border: `2px solid ${current.color}50` }} />

              {/* Live badge */}
              {current.live && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-5 right-5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white z-10"
                  style={{ background: current.color }}
                >
                  Live
                </motion.div>
              )}

              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Georgia, serif', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                  {current.label}
                </h2>
                <p className="text-sm font-bold mb-6 text-white/80">
                  {current.sub}
                </p>

                {current.live ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex px-8 py-3.5 rounded-2xl text-sm font-black text-white items-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${current.color}, ${current.shadow})`, boxShadow: `0 6px 0 ${current.shadow}88` }}
                  >
                    <span>Enter</span>
                    <span>→</span>
                  </motion.div>
                ) : (
                  <div className="inline-flex px-6 py-3 rounded-2xl text-xs font-black text-white/60 bg-white/10 backdrop-blur-sm border border-white/10">
                    🔒 Coming Soon
                  </div>
                )}
              </div>
            </motion.div>

            {/* Next card */}
            <motion.div
              key={`next-${next.id}`}
              initial={{ x: 200, scale: 0.7, opacity: 0 }}
              animate={{ x: 140, scale: 0.75, opacity: 0.4, zIndex: 1 }}
              exit={{ x: 300, scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute w-full h-full rounded-3xl overflow-hidden cursor-pointer"
              style={{ background: 'white', boxShadow: `0 8px 32px ${next.glow}` }}
              onClick={() => go(1)}
            >
              <img src={next.image} alt={next.label} className="w-full h-full object-cover opacity-60" />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center gap-2 pb-6">
        {PAGES.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setIndex(i)}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i === index ? current.color : 'rgba(0,0,0,0.15)',
              transform: i === index ? 'scale(1.4)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 px-6 pb-6">
        <div className="p-4 rounded-2xl flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,107,53,0.1)' }}>
          <img src={ASSETS.goldenShell} alt="golden shell" className="w-10 h-10 object-contain" style={{ filter: 'drop-shadow(0 2px 6px rgba(245,158,11,0.4))' }} />
          <div className="flex-1">
            <div className="text-xs font-black text-[#1a1a2e]">Shell Blitz — Season 1</div>
            <div className="text-[10px] text-[#888] mt-0.5">Collect shells · Craft fragments · Mint your WL</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-black text-[#FF6B35]">{user.shells_balance.toLocaleString()}</div>
            <div className="text-[10px] text-[#bbb]">shells</div>
          </div>
        </div>
      </div>
    </div>
  );
}
