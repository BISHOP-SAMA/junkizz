import { motion } from 'framer-motion';
import { useLocation, Redirect } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { ShellIcon } from '../components/ShellIcon';
import { ASSETS } from '../lib/assets';

const PAGES = [
  {
    id: 'shell-blitz',
    path: '/shell-blitz',
    label: 'Shell Blitz',
    sub: 'Season 1 · Live now',
    color: '#FF6B35',
    shadow: '#c04a1a',
    glow: 'rgba(255,107,53,0.25)',
    emoji: '🐚',
    image: ASSETS.shellblitz,
    live: true,
  },
  {
    id: 'slog-race',
    path: '/race',
    label: 'Slog Race',
    sub: 'Coming Season 2',
    color: '#06D6A0',
    shadow: '#048a67',
    glow: 'rgba(6,214,160,0.2)',
    emoji: '🏁',
    image: ASSETS.slograce,
    live: false,
  },
  {
    id: 'customize',
    path: '/customize',
    label: 'Customize',
    sub: 'Coming Season 2',
    color: '#EF476F',
    shadow: '#b0244e',
    glow: 'rgba(239,71,111,0.2)',
    emoji: '🎨',
    image: ASSETS.customise,
    live: false,
  },
  {
    id: 'gallery',
    path: '/gallery',
    label: 'Gallery',
    sub: 'Community art',
    color: '#118AB2',
    shadow: '#0a5a7a',
    glow: 'rgba(17,138,178,0.2)',
    emoji: '🖼️',
    image: ASSETS.shellblitz,
    live: false,
  },
];

export default function GameHub() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();

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
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FFFBF2 0%, #FFF0DC 55%, #FFFAF0 100%)' }}
    >
      {/* BG blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 14, repeat: Infinity }}
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
          style={{ background: '#FF6B35', opacity: 0.07 }}
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-40 -left-20 w-80 h-80 rounded-full"
          style={{ background: '#06D6A0', opacity: 0.07 }}
        />
      </div>

      {/* Top bar */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 border-b border-black/5"
        style={{ background: 'rgba(255,251,242,0.88)', backdropFilter: 'blur(14px)' }}
      >
        <div className="flex items-center gap-2.5">
          <img src={ASSETS.shellblitz} alt="logo" className="w-8 h-8 object-contain" />
          <span className="font-black text-base text-[#1a1a2e]" style={{ fontFamily: 'Georgia, serif' }}>
            Planetslog
          </span>
        </div>

        <motion.div
          key={user.shells_balance}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 0.28 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(6,214,160,0.1)', border: '1.5px solid rgba(6,214,160,0.25)' }}
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
            className="w-8 h-8 rounded-full border-2 border-[#FF6B35]/40"
          />
          <button
            onClick={logout}
            className="text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:text-gray-500"
            style={{ fontFamily: 'monospace' }}
          >
            out
          </button>
        </div>
      </div>

      {/* Welcome */}
      <div className="px-5 pt-5 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF6B35] mb-0.5">
            Welcome back
          </p>
          <h1 className="text-2xl font-black text-[#1a1a2e]" style={{ fontFamily: 'Georgia, serif' }}>
            @{user.twitter_handle}
          </h1>
        </motion.div>
      </div>

      {/* Page cards grid */}
      <div className="flex-1 px-4 pt-2 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {PAGES.map((page, i) => (
            <motion.button
              key={page.id}
              onClick={() => setLocation(page.path)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="relative flex flex-col overflow-hidden text-left"
              style={{
                borderRadius: 24,
                background: 'white',
                border: `2px solid ${page.color}20`,
                boxShadow: `0 6px 0 ${page.shadow}22, 0 12px 32px ${page.glow}`,
                minHeight: 160,
              }}
            >
              {/* Color top strip */}
              <div
                className="h-1.5 w-full flex-shrink-0"
                style={{ background: `linear-gradient(90deg, ${page.color}, ${page.color}88)` }}
              />

              {/* Live badge */}
              {page.live && (
                <motion.div
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute top-4 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white"
                  style={{ background: page.color }}
                >
                  Live
                </motion.div>
              )}

              {/* Image */}
              <div className="flex-1 flex items-center justify-center py-4 px-3">
                <motion.img
                  src={page.image}
                  alt={page.label}
                  className="w-16 h-16 object-contain"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                  style={{
                    filter: page.live ? `drop-shadow(0 4px 12px ${page.glow})` : 'grayscale(0.3) opacity(0.7)',
                  }}
                />
              </div>

              {/* Label */}
              <div
                className="px-3 pb-3"
                style={{ borderTop: `1px solid ${page.color}15` }}
              >
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="text-sm font-black text-[#1a1a2e]" style={{ fontFamily: 'Georgia, serif' }}>
                      {page.label}
                    </div>
                    <div className="text-[10px] font-bold mt-0.5" style={{ color: page.live ? page.color : '#bbb' }}>
                      {page.sub}
                    </div>
                  </div>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ background: page.live ? page.color : '#e0e0e0' }}
                  >
                    {page.live ? '→' : '🔒'}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Season info strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-5 p-4 rounded-2xl flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,53,0.08), rgba(255,209,102,0.08))',
            border: '1.5px solid rgba(255,107,53,0.15)',
          }}
        >
          <img src={ASSETS.goldenShell} alt="golden shell" className="w-10 h-10 object-contain flex-shrink-0"
            style={{ filter: 'drop-shadow(0 2px 6px rgba(245,158,11,0.4))' }} />
          <div className="flex-1">
            <div className="text-xs font-black text-[#1a1a2e]">Shell Blitz — Season 1</div>
            <div className="text-[10px] text-[#888] mt-0.5">Collect shells · Craft 3 fragments · Mint your WL</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs font-black" style={{ color: '#FF6B35' }}>
              {user.shells_balance}
            </div>
            <div className="text-[10px] text-[#bbb]">shells</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
