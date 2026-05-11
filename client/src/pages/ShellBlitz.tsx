import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameLayout from '../components/GameLayout';
import { ConfettiBurst } from '../components/ConfettiBurst';
import { ShellIcon } from '../components/ShellIcon';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { ASSETS } from '../lib/assets';

// ─── TYPES ───────────────────────────────────────────────────────────────────
type Quest = {
  id: string;
  icon: string;
  label: string;
  description: string;
  points: number;
  shells: number;
  done: boolean;
  url?: string;
  day: number;
};

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const PLANETSLOG_URL   = 'https://x.com/planetslog?s=21';
const TWEET_URL        = 'https://x.com/planetslog/status/2052019506881458402?s=46';
const SHELLS_PER_FRAG  = 1500;
const MAX_FRAGMENTS    = 3;
const MAX_REFERRALS    = 6;
const BOX_COOLDOWN_MS  = 3 * 60 * 60 * 1000; // 3 hours

// ─── FRAGMENT ORBS ───────────────────────────────────────────────────────────
function FragmentOrbs({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: MAX_FRAGMENTS }, (_, i) => (
        <motion.div
          key={i}
          animate={i < count ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: i < count ? Infinity : 0, delay: i * 0.3 }}
          className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-black"
          style={{
            background: i < count
              ? 'radial-gradient(circle at 35% 35%, #fef3c7, #f59e0b)'
              : 'rgba(0,0,0,0.05)',
            borderColor: i < count ? 'rgba(245,158,11,0.6)' : 'rgba(0,0,0,0.1)',
            boxShadow: i < count ? '0 0 14px rgba(245,158,11,0.45)' : 'none',
            color: i < count ? '#78350f' : '#ccc',
          }}
        >
          {i < count ? '◆' : '◇'}
        </motion.div>
      ))}
    </div>
  );
}

// ─── BOX GRID ────────────────────────────────────────────────────────────────
function BoxGrid({ onEarn }: { onEarn: (n: number) => void }) {
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [reward, setReward] = useState<number | null>(null);
  const [burst, setBurst] = useState(false);
  const [busy, setBusy] = useState(false);

  // Persist cooldown across refreshes
  useEffect(() => {
    const saved = localStorage.getItem('box_cooldown_end');
    if (saved) {
      const end = parseInt(saved, 10);
      if (end > Date.now()) setCooldownEnd(end);
    }
  }, []);

  useEffect(() => {
    if (!cooldownEnd) return;
    const t = setInterval(() => {
      const left = cooldownEnd - Date.now();
      if (left <= 0) { setCooldownEnd(null); setTimeLeft(0); clearInterval(t); }
      else setTimeLeft(left);
    }, 1000);
    return () => clearInterval(t);
  }, [cooldownEnd]);

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m ${sec.toString().padStart(2, '0')}s`;
  };

  const pick = async (i: number) => {
    if (cooldownEnd || busy) return;
    setBusy(true);
    setSelected(i);
    await new Promise(r => setTimeout(r, 700));
    const earned = Math.floor(Math.random() * 201) + 100; // 100–300
    setReward(earned);
    setBurst(true);
    onEarn(earned);
    setTimeout(() => setBurst(false), 900);
    await new Promise(r => setTimeout(r, 2200));
    setSelected(null);
    setReward(null);
    setBusy(false);
    const end = Date.now() + BOX_COOLDOWN_MS;
    setCooldownEnd(end);
    localStorage.setItem('box_cooldown_end', end.toString());
  };

  const BOXES = [
    { bg: '#FF6B35', shadow: '#c04a1a' },
    { bg: '#06D6A0', shadow: '#048a67' },
    { bg: '#FFD166', shadow: '#c9a030' },
    { bg: '#EF476F', shadow: '#b0244e' },
  ];

  return (
    <div className="relative">
      <ConfettiBurst active={burst} />
      {cooldownEnd && timeLeft > 0 ? (
        <div className="text-center py-5">
          <img src={ASSETS.chestClosed} alt="chest" className="w-16 h-16 object-contain mx-auto mb-2 opacity-50" />
          <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#bbb' }}>Next boxes</div>
          <div className="text-xl font-black" style={{ color: '#FF6B35', fontFamily: 'monospace' }}>{fmt(timeLeft)}</div>
        </div>
      ) : (
        <>
          <p className="text-center text-[10px] font-black tracking-[0.2em] uppercase mb-3" style={{ color: '#bbb' }}>
            Pick one box
          </p>
          <div className="grid grid-cols-4 gap-2">
            {BOXES.map((box, i) => (
              <motion.button
                key={i}
                onClick={() => pick(i)}
                disabled={busy}
                whileHover={{ y: -4, scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                animate={selected === i ? { rotate: [0,-12,12,-6,6,0], scale:[1,1.18,1] } : {}}
                transition={{ duration: 0.45 }}
                className="relative aspect-square rounded-xl flex items-center justify-center overflow-hidden"
                style={{
                  background: box.bg,
                  boxShadow: `0 5px 0 ${box.shadow}`,
                  border: '2px solid rgba(255,255,255,0.3)',
                  opacity: busy && selected !== i ? 0.35 : 1,
                  cursor: busy ? 'not-allowed' : 'pointer',
                }}
              >
                {selected === i && reward !== null ? (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-white font-black"
                    style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
                  >
                    <span className="text-sm">+{reward}</span>
                    <span className="text-xs">🐚</span>
                  </motion.div>
                ) : (
                  <img
                    src={selected === i ? ASSETS.chestOpen : ASSETS.chestClosed}
                    alt="box"
                    className="w-10 h-10 object-contain"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── QUEST ITEM ───────────────────────────────────────────────────────────────
function QuestItem({ quest, locked, onComplete }: {
  quest: Quest; locked: boolean; onComplete: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (quest.done || locked || loading) return;
    if (quest.url) window.open(quest.url, '_blank');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    onComplete(quest.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 rounded-2xl"
      style={{
        background: locked ? 'rgba(0,0,0,0.02)' : quest.done ? 'rgba(6,214,160,0.07)' : 'white',
        border: quest.done ? '1.5px solid rgba(6,214,160,0.3)' : locked ? '1.5px solid rgba(0,0,0,0.05)' : '1.5px solid rgba(255,107,53,0.18)',
        boxShadow: locked || quest.done ? 'none' : '0 2px 10px rgba(255,107,53,0.07)',
        opacity: locked ? 0.42 : 1,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: locked ? '#f4f4f4' : quest.done ? 'rgba(6,214,160,0.12)' : '#FFF5EE' }}
      >
        {locked ? '🔒' : quest.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-black leading-tight truncate" style={{ color: locked ? '#ccc' : '#1a1a2e' }}>
          {quest.label}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-bold" style={{ color: locked ? '#ddd' : '#FF6B35' }}>
            +{quest.shells}🐚
          </span>
          <span className="text-[10px]" style={{ color: '#ccc' }}>·</span>
          <span className="text-[10px] font-bold" style={{ color: locked ? '#ddd' : '#888' }}>
            +{quest.points}pts
          </span>
        </div>
      </div>
      {!locked && (
        quest.done ? (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: '#06D6A0', color: 'white' }}>✓</div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.93 }}
            onClick={handle}
            disabled={loading}
            className="h-8 px-3 rounded-full text-xs font-black flex-shrink-0"
            style={{
              background: loading ? '#eee' : 'linear-gradient(135deg, #FF6B35, #FF9500)',
              color: loading ? '#bbb' : 'white',
              boxShadow: loading ? 'none' : '0 3px 0 #c04a1a',
              minWidth: 52,
            }}
          >
            {loading ? '···' : 'Go →'}
          </motion.button>
        )
      )}
    </motion.div>
  );
}

// ─── REFERRAL SECTION ────────────────────────────────────────────────────────
function ReferralSection({ handle, count = 0 }: { handle: string; count?: number }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/?ref=${handle}`;

  const copy = () => {
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="p-4 rounded-2xl" style={{ background: 'white', border: '1.5px solid rgba(255,107,53,0.15)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">👥</span>
          <span className="text-sm font-black" style={{ color: '#1a1a2e' }}>Referrals</span>
        </div>
        <span className="text-[10px] font-black px-2 py-1 rounded-full" style={{ background: '#FFF5EE', color: '#FF6B35' }}>
          {count}/{MAX_REFERRALS} · +120🐚 each
        </span>
      </div>
      <div className="flex gap-1.5 mb-3">
        {Array.from({ length: MAX_REFERRALS }, (_, i) => (
          <motion.div
            key={i}
            className="flex-1 h-2.5 rounded-full"
            style={{ background: i < count ? '#FF6B35' : '#f0f0f0' }}
            animate={i < count ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 px-3 py-2 rounded-xl text-xs font-mono truncate" style={{ background: '#f9f9f9', border: '1px solid #ececec', color: '#888' }}>
          {link}
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }} onClick={copy}
          className="px-4 py-2 rounded-xl text-xs font-black flex-shrink-0"
          style={{ background: copied ? '#06D6A0' : '#FF6B35', color: 'white', boxShadow: copied ? '0 3px 0 #048a67' : '0 3px 0 #c04a1a', transition: 'background 0.2s' }}>
          {copied ? '✓ Done' : 'Copy'}
        </motion.button>
      </div>
    </div>
  );
}

// ─── ART SUBMISSION ───────────────────────────────────────────────────────────
function ArtSubmission({ userId, onSubmitted }: { userId: string; onSubmitted: () => void }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!url.trim() || loading || done) return;
    if (!url.startsWith('http')) { setError('Please enter a valid X post URL'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.from('art_submissions').insert({
      user_id: userId,
      x_post_url: url.trim(),
      status: 'pending',
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    onSubmitted();
  };

  if (done) {
    return (
      <div className="p-4 rounded-2xl text-center" style={{ background: 'rgba(6,214,160,0.07)', border: '1.5px solid rgba(6,214,160,0.3)' }}>
        <div className="text-2xl mb-1">🎨</div>
        <div className="text-sm font-black" style={{ color: '#1a1a2e' }}>Art submitted!</div>
        <div className="text-xs mt-1" style={{ color: '#888' }}>We'll review it and award your shells</div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl" style={{ background: 'white', border: '1.5px solid rgba(255,107,53,0.15)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🎨</span>
        <span className="text-sm font-black" style={{ color: '#1a1a2e' }}>Submit Your Art</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: '#FFF5EE', color: '#FF6B35' }}>
          1-time task
        </span>
      </div>
      <div className="space-y-2 mb-3 text-xs" style={{ color: '#888' }}>
        <div className="flex justify-between">
          <span>✅ Art approved</span>
          <span className="font-bold" style={{ color: '#FF6B35' }}>+1,500–2,000 🐚</span>
        </div>
        <div className="flex justify-between">
          <span>❌ Not approved</span>
          <span className="font-bold" style={{ color: '#06D6A0' }}>+500 🐚 for effort</span>
        </div>
        <p className="text-[10px] leading-relaxed" style={{ color: '#bbb' }}>
          Post your art on X tagging @planetslog, then paste the link below. Approved art appears in the Gallery.
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://x.com/you/status/..."
          className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
          style={{ background: '#f9f9f9', border: `1px solid ${error ? '#EF476F' : '#ececec'}`, color: '#1a1a2e' }}
        />
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={submit}
          disabled={loading}
          className="px-3 py-2 rounded-xl text-xs font-black flex-shrink-0"
          style={{ background: loading ? '#eee' : '#FF6B35', color: loading ? '#bbb' : 'white', boxShadow: loading ? 'none' : '0 3px 0 #c04a1a' }}
        >
          {loading ? '···' : 'Submit'}
        </motion.button>
      </div>
      {error && <p className="text-[10px] mt-1.5" style={{ color: '#EF476F' }}>{error}</p>}
    </div>
  );
}

// ─── DAILY CLAIM ─────────────────────────────────────────────────────────────
function DailyClaimCard({ day, shells, claimed, onClaim }: {
  day: number; shells: number; claimed: boolean; onClaim: () => void;
}) {
  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-2xl"
      style={{
        background: claimed ? 'rgba(6,214,160,0.07)' : 'white',
        border: claimed ? '1.5px solid rgba(6,214,160,0.3)' : '1.5px solid rgba(255,107,53,0.18)',
        boxShadow: claimed ? 'none' : '0 2px 10px rgba(255,107,53,0.07)',
      }}
    >
      <img src={ASSETS.dailyShells} alt="shells" className="w-10 h-10 object-contain flex-shrink-0" />
      <div className="flex-1">
        <div className="text-sm font-black" style={{ color: '#1a1a2e' }}>Day {day} Free Claim</div>
        <div className="text-xs font-bold" style={{ color: '#FF6B35' }}>+{shells} 🐚</div>
      </div>
      {claimed ? (
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#06D6A0', color: 'white' }}>✓</div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
          onClick={onClaim}
          className="h-8 px-3 rounded-full text-xs font-black"
          style={{ background: 'linear-gradient(135deg, #FF6B35, #FF9500)', color: 'white', boxShadow: '0 3px 0 #c04a1a' }}
        >
          Claim
        </motion.button>
      )}
    </motion.div>
  );
}

// ─── FRAGMENT CRAFT CARD ─────────────────────────────────────────────────────
function FragmentCraftCard({ shells, fragments, onCraft }: {
  shells: number; fragments: number; onCraft: () => void;
}) {
  const canCraft = shells >= SHELLS_PER_FRAG && fragments < MAX_FRAGMENTS;
  const progress = Math.min((shells / (SHELLS_PER_FRAG * MAX_FRAGMENTS)) * 100, 100);

  return (
    <div className="p-4 rounded-2xl" style={{ background: 'white', border: '1.5px solid rgba(245,158,11,0.2)', boxShadow: '0 2px 12px rgba(245,158,11,0.08)' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-black" style={{ color: '#1a1a2e' }}>Golden Shell</div>
          <div className="text-[10px] mt-0.5" style={{ color: '#888' }}>1,500 🐚 per fragment · 3 to mint</div>
        </div>
        <motion.img
          src={ASSETS.goldenShell}
          alt="golden shell"
          className="w-12 h-12 object-contain"
          animate={fragments > 0 ? { rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          style={{ filter: fragments === 0 ? 'grayscale(0.8) opacity(0.5)' : 'drop-shadow(0 0 8px rgba(245,158,11,0.7))' }}
        />
      </div>

      <FragmentOrbs count={fragments} />

      <div className="mt-3 mb-3">
        <div className="flex justify-between text-[10px] mb-1" style={{ color: '#aaa', fontFamily: 'monospace' }}>
          <span>{shells.toLocaleString()} shells</span>
          <span>{(SHELLS_PER_FRAG * MAX_FRAGMENTS).toLocaleString()} goal</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ background: 'linear-gradient(90deg, #f59e0b, #fde68a)' }}
          />
        </div>
      </div>

      {fragments === MAX_FRAGMENTS ? (
        <div className="p-3 rounded-xl text-center text-sm font-black"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1.5px solid rgba(245,158,11,0.3)', color: '#92400e' }}>
          🎉 All 3 fragments crafted — submit your EVM wallet!
        </div>
      ) : (
        <motion.button
          whileHover={canCraft ? { scale: 1.02 } : {}}
          whileTap={canCraft ? { scale: 0.97 } : {}}
          onClick={onCraft}
          disabled={!canCraft}
          className="w-full py-2.5 rounded-xl text-sm font-black"
          style={{
            background: canCraft ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(253,230,138,0.2))' : 'rgba(0,0,0,0.04)',
            border: canCraft ? '1.5px solid rgba(245,158,11,0.4)' : '1.5px solid rgba(0,0,0,0.06)',
            color: canCraft ? '#92400e' : '#ccc',
            cursor: canCraft ? 'pointer' : 'not-allowed',
          }}
        >
          {canCraft ? `Craft Fragment ${fragments + 1} ✦` : `Need ${Math.max(0, SHELLS_PER_FRAG - (shells % SHELLS_PER_FRAG || SHELLS_PER_FRAG))} more 🐚`}
        </motion.button>
      )}
    </div>
  );
}

// ─── SHELL TRANSFER ───────────────────────────────────────────────────────────
function ShellTransfer({ userId, balance, onTransfer }: {
  userId: string; balance: number; onTransfer: (amount: number) => void;
}) {
  const [handle, setHandle] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const send = async () => {
    const n = parseInt(amount, 10);
    if (!handle.trim() || !n || n <= 0 || n > balance) {
      setMsg({ text: 'Invalid handle or amount', ok: false });
      return;
    }
    setLoading(true);
    setMsg(null);

    // Look up recipient
    const { data: recipient } = await supabase
      .from('users')
      .select('id, shells_balance')
      .eq('twitter_handle', handle.replace('@', ''))
      .single();

    if (!recipient) {
      setMsg({ text: 'User not found', ok: false });
      setLoading(false);
      return;
    }

    // Deduct from sender
    await supabase.from('users').update({ shells_balance: balance - n }).eq('id', userId);
    // Add to recipient
    await supabase.from('users').update({ shells_balance: recipient.shells_balance + n }).eq('id', recipient.id);
    // Log transfer
    await supabase.from('shell_transfers').insert({ from_user_id: userId, to_user_id: recipient.id, amount: n });

    onTransfer(n);
    setHandle('');
    setAmount('');
    setMsg({ text: `Sent ${n} shells to @${handle.replace('@', '')} ✓`, ok: true });
    setLoading(false);
  };

  return (
    <div className="p-4 rounded-2xl" style={{ background: 'white', border: '1.5px solid rgba(255,107,53,0.15)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">📤</span>
        <span className="text-sm font-black" style={{ color: '#1a1a2e' }}>Send Shells</span>
        <span className="text-[10px] ml-auto" style={{ color: '#aaa' }}>Balance: {balance.toLocaleString()} 🐚</span>
      </div>
      <div className="flex gap-2">
        <input
          value={handle}
          onChange={e => setHandle(e.target.value)}
          placeholder="@username"
          className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
          style={{ background: '#f9f9f9', border: '1px solid #ececec', color: '#1a1a2e' }}
        />
        <input
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount"
          type="number"
          className="w-20 px-3 py-2 rounded-xl text-xs outline-none"
          style={{ background: '#f9f9f9', border: '1px solid #ececec', color: '#1a1a2e' }}
        />
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
          onClick={send}
          disabled={loading}
          className="px-3 py-2 rounded-xl text-xs font-black flex-shrink-0"
          style={{ background: loading ? '#eee' : '#FF6B35', color: loading ? '#bbb' : 'white', boxShadow: loading ? 'none' : '0 3px 0 #c04a1a' }}
        >
          {loading ? '···' : 'Send'}
        </motion.button>
      </div>
      {msg && (
        <p className="text-[10px] mt-1.5 font-bold" style={{ color: msg.ok ? '#06D6A0' : '#EF476F' }}>
          {msg.text}
        </p>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ShellBlitz() {
  const { user, refreshProfile } = useAuth();
  const [shells, setShells] = useState(user?.shells_balance ?? 0);
  const [fragments, setFragments] = useState(user?.fragments ?? 0);
  const [day2Claimed, setDay2Claimed] = useState(user?.day_2_claimed ?? false);
  const [day4Claimed, setDay4Claimed] = useState(user?.day_4_claimed ?? false);
  const [artSubmitted, setArtSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'quests' | 'shells'>('quests');

  const [quests, setQuests] = useState<Quest[]>([
    { id: 'follow',  icon: '🐦', label: 'Follow @planetslog',       description: 'Follow on X',                     points: 200, shells: 200, done: false, url: PLANETSLOG_URL, day: 1 },
    { id: 'retweet', icon: '🔁', label: 'Like & Retweet',           description: 'Like and RT the season post',     points: 150, shells: 150, done: false, url: TWEET_URL,      day: 1 },
    { id: 'comment', icon: '💬', label: 'Comment & Tag 3 Frens',    description: 'Comment on post, tag 3 friends',  points: 250, shells: 250, done: false, url: TWEET_URL,      day: 1 },
    { id: 'd2_tbd',  icon: '⭐', label: 'Day 2 Quest',              description: 'Coming Day 2',                    points: 300, shells: 300, done: false,                       day: 2 },
    { id: 'd2_q2',   icon: '🌊', label: 'Day 2 Quest 2',            description: 'Coming Day 2',                    points: 200, shells: 200, done: false,                       day: 2 },
  ]);

  // Sync shells to Supabase when they change
  const addShells = async (amount: number) => {
    const next = shells + amount;
    setShells(next);
    if (user) await supabase.from('users').update({ shells_balance: next }).eq('id', user.id);
  };

  const completeQuest = async (id: string) => {
    const quest = quests.find(q => q.id === id);
    if (!quest) return;
    setQuests(q => q.map(quest => quest.id === id ? { ...quest, done: true } : quest));
    await addShells(quest.shells);
    if (user) {
      await supabase.from('user_quests').insert({ user_id: user.id, quest_type: id });
    }
  };

  const craftFragment = async () => {
    if (shells < SHELLS_PER_FRAG || fragments >= MAX_FRAGMENTS) return;
    const nextShells = shells - SHELLS_PER_FRAG;
    const nextFrags = fragments + 1;
    setShells(nextShells);
    setFragments(nextFrags);
    if (user) {
      await supabase.from('users').update({ shells_balance: nextShells, fragments: nextFrags }).eq('id', user.id);
      await supabase.from('fragments').insert({ user_id: user.id });
    }
  };

  const claimDaily = async (day: number) => {
    const amount = 400;
    await addShells(amount);
    if (day === 2) {
      setDay2Claimed(true);
      if (user) await supabase.from('users').update({ day_2_claimed: true }).eq('id', user.id);
    } else {
      setDay4Claimed(true);
      if (user) await supabase.from('users').update({ day_4_claimed: true }).eq('id', user.id);
    }
  };

  const day1Quests = quests.filter(q => q.day === 1);
  const laterQuests = quests.filter(q => q.day > 1);
  const currentDay = 1; // TODO: derive from season start date

  return (
    <GameLayout pageId="shell-blitz">
      <div className="space-y-4 pb-2">

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg,#FF6B35,#FF9500)', boxShadow: '0 4px 0 #c04a1a' }}>
            <div className="text-xl font-black text-white">{shells.toLocaleString()}</div>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <ShellIcon size={12} />
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Shells</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg,#06D6A0,#118AB2)', boxShadow: '0 4px 0 #048a67' }}>
            <div className="text-xl font-black text-white">{fragments}/{MAX_FRAGMENTS}</div>
            <div className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-0.5">Fragments</div>
          </div>
        </div>

        {/* Fragment craft */}
        <FragmentCraftCard shells={shells} fragments={fragments} onCraft={craftFragment} />

        {/* Mystery boxes */}
        <div className="p-4 rounded-2xl" style={{ background: 'white', border: '1.5px solid rgba(255,107,53,0.12)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-black text-sm" style={{ color: '#1a1a2e' }}>Mystery Boxes</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#FFF5EE', color: '#FF6B35' }}>Every 3h</span>
          </div>
          <BoxGrid onEarn={n => addShells(n)} />
        </div>

        {/* Tabs: Quests / Shells Economy */}
        <div className="flex gap-1.5">
          {(['quests', 'shells'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              style={{
                background: activeTab === tab ? '#FF6B35' : 'rgba(0,0,0,0.05)',
                color: activeTab === tab ? 'white' : '#bbb',
                boxShadow: activeTab === tab ? '0 3px 0 #c04a1a' : 'none',
                transform: activeTab === tab ? 'translateY(-1px)' : 'none',
              }}
            >
              {tab === 'quests' ? '⚡ Quests' : '🐚 Economy'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'quests' ? (
            <motion.div key="quests" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">

              {/* Day 1 quests */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: '#FF6B35' }}>Day 1</span>
                  <span className="text-xs font-bold" style={{ color: '#aaa' }}>Social Tasks</span>
                </div>
                <div className="space-y-2">
                  {day1Quests.map(q => <QuestItem key={q.id} quest={q} locked={false} onComplete={completeQuest} />)}
                </div>
              </div>

              {/* Daily claims */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: '#118AB2' }}>Daily Claims</span>
                </div>
                <div className="space-y-2">
                  <DailyClaimCard day={2} shells={400} claimed={day2Claimed} onClaim={() => currentDay >= 2 && claimDaily(2)} />
                  <DailyClaimCard day={4} shells={400} claimed={day4Claimed} onClaim={() => currentDay >= 4 && claimDaily(4)} />
                </div>
              </div>

              {/* Locked future quests */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="px-3 py-1 rounded-full text-xs font-black" style={{ background: '#f0f0f0', color: '#bbb' }}>Day 2+</span>
                  <span className="text-xs font-bold" style={{ color: '#ccc' }}>Unlocks soon</span>
                </div>
                <div className="space-y-2">
                  {laterQuests.map(q => <QuestItem key={q.id} quest={q} locked={true} onComplete={completeQuest} />)}
                </div>
              </div>

              {/* Art submission */}
              {user && !artSubmitted && (
                <ArtSubmission userId={user.id} onSubmitted={() => setArtSubmitted(true)} />
              )}
              {artSubmitted && (
                <div className="p-3 rounded-2xl text-center text-xs font-bold" style={{ background: 'rgba(6,214,160,0.08)', color: '#048a67', border: '1.5px solid rgba(6,214,160,0.2)' }}>
                  🎨 Art submission received — we'll review it soon
                </div>
              )}

            </motion.div>
          ) : (
            <motion.div key="shells" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
              {user && (
                <>
                  <ReferralSection handle={user.twitter_handle} count={user.referral_count} />
                  <ShellTransfer
                    userId={user.id}
                    balance={shells}
                    onTransfer={n => setShells(s => s - n)}
                  />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </GameLayout>
  );
}
