import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, Redirect } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { ShellIcon } from './ShellIcon';
import { ASSETS } from '../lib/assets';

export const PAGES = [
  { id: 'shell-blitz', path: '/shell-blitz', label: 'Shell Blitz', color: '#FF6B35', shadow: '#c04a1a', emoji: '🐚' },
  { id: 'slog-race',   path: '/race',       label: 'Slog Race',   color: '#06D6A0', shadow: '#048a67', emoji: '🏁' },
  { id: 'customize',   path: '/customize',  label: 'Customize',   color: '#EF476F', shadow: '#b0244e', emoji: '🎨' },
  { id: 'gallery',     path: '/gallery',    label: 'Gallery',     color: '#118AB2', shadow: '#0a5a7a', emoji: '🖼️' },
];

export default function GameLayout({ children, pageId }: { children: React.ReactNode; pageId: string }) {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();

  const currentIndex = PAGES.findIndex((p) => p.id === pageId);
  const meta = PAGES[currentIndex];
  const prevPage = PAGES[currentIndex - 1];
  const nextPage = PAGES[currentIndex + 1];

  const go = (path: string) => setLocation(path);

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

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'linear-gradient(170deg, #FFFBF2 0%, #FFF3DC 60%, #FFFAF0 100%)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full"
          style={{ background: meta?.color || '#FF6B35', opacity: 0.05 }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Top Bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-black/5" style={{ background: 'rgba(255,251,242,0.9)', backdropFilter: 'blur(14px)' }}>
        <div className="flex items-center gap-2">
          <img src={ASSETS.shellblitz} alt="logo" className="w-7 h-7 object-contain" />
          <span className="font-black text-sm text-[#1a1a2e]" style={{ fontFamily: 'Georgia, serif' }}>Planetslog</span>
        </div>

        <motion.div
          key={user.shells_balance}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 0.28 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#06D6A0]/10 border border-[#06D6A0]/25"
        >
          <ShellIcon size={15} />
          <span className="text-sm font-black tabular-nums text-[#048a67]" style={{ fontFamily: 'monospace' }}>
            {user.shells_balance.toLocaleString()}
          </span>
        </motion.div>

        <div className="flex items-center gap-2">
          <img
            src={user.twitter_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.twitter_handle}`}
            alt={user.twitter_handle}
            className="w-8 h-8 rounded-full border-2"
            style={{ borderColor: meta?.color || '#FF6B35', transition: 'border-color 0.4s' }}
          />
          <button onClick={logout} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600" style={{ fontFamily: 'monospace' }}>
            out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1 overflow-x-auto">
        {PAGES.map((p) => {
          const active = p.id === pageId;
          return (
            <button
              key={p.id}
              onClick={() => go(p.path)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all duration-300 whitespace-nowrap"
              style={{
                background: active ? p.color : 'rgba(0,0,0,0.05)',
                color: active ? 'white' : '#bbb',
                boxShadow: active ? `0 3px 0 ${p.shadow}` : 'none',
                transform: active ? 'translateY(-1px)' : 'none',
              }}
            >
              {p.emoji}
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Framed Content */}
      <div className="flex-1 flex items-start relative px-2 pb-6 pt-2">
        {prevPage && (
          <motion.button
            onClick={() => go(prevPage.path)}
            whileHover={{ scale: 1.12, x: -2 }}
            whileTap={{ scale: 0.88 }}
            className="absolute left-2 top-32 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white border border-black/8 shadow-md"
          >
            <span className="font-black text-lg text-[#118AB2]">‹</span>
          </motion.button>
        )}

        <div className="flex-1 mx-10">
          <div
            className="rounded-3xl p-1 overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, #e0e0e0, #f5f5f5, #e0e0e0)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}
          >
            {/* Metallic corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-gray-400 rounded-tl-2xl z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-gray-400 rounded-tr-2xl z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-gray-400 rounded-bl-2xl z-10 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-gray-400 rounded-br-2xl z-10 pointer-events-none" />

            <div
              className="rounded-[20px] p-4 overflow-y-auto bg-white/90 backdrop-blur-sm"
              style={{ border: '1px solid rgba(0,0,0,0.06)', maxHeight: 'calc(100vh - 200px)' }}
            >
              {children}
            </div>
          </div>

          <div className="text-center mt-3">
            <span className="text-sm font-black text-[#1a1a2e]" style={{ fontFamily: 'Georgia, serif' }}>
              {meta?.emoji} {meta?.label}
            </span>
            {pageId === 'shell-blitz' && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#FF6B35]/10 text-[#FF6B35]">
                Live
              </span>
            )}
          </div>
        </div>

        {nextPage && (
          <motion.button
            onClick={() => go(nextPage.path)}
            whileHover={{ scale: 1.12, x: 2 }}
            whileTap={{ scale: 0.88 }}
            className="absolute right-2 top-32 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white border border-black/8 shadow-md"
          >
            <span className="font-black text-lg text-[#118AB2]">›</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}
