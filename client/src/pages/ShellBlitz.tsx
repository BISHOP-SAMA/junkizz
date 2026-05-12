import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameLayout from '../components/GameLayout';
import { ConfettiBurst } from '../components/ConfettiBurst';
import { ShellIcon } from '../components/ShellIcon';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { ASSETS } from '../lib/assets';
import ArtUploadModal from '../components/ArtUploadModal';

type Quest = { id: string; icon: string; label: string; points: number; shells: number; done: boolean; url?: string; day: number; oneTime?: boolean; requiresSubmission?: boolean };

const PLANETSLOG_URL = 'https://x.com/planetslog?s=21';
const TWEET_URL = 'https://x.com/planetslog/status/2052019506881458402?s=46';
const DAY2_TWEET_URL = 'https://x.com/planetslog/status/2051376348380463131?s=46';
const GARY_URL = 'https://x.com/garythecleaner1?s=21';
const SHELLS_PER_FRAG = 1500;
const MAX_FRAGMENTS = 3;
const BOX_COOLDOWN_MS = 3 * 60 * 60 * 1000;
const DAY2_UNLOCK_MS = 24 * 60 * 60 * 1000;
const QUEST_TIMER_SECONDS = 30;

const DAILY_REWARDS = [
  { day: 1, shells: 200 },
  { day: 2, shells: 300 },
  { day: 3, shells: 500 },
  { day: 4, shells: 600 },
  { day: 5, shells: 700 },
  { day: 6, shells: 800 },
  { day: 7, shells: 1000 },
];

// ─── Submission Modal for "Write About PlanetSlog" ───
function ArticleSubmissionModal({ isOpen, onClose, userId, onSubmitted }: {
  isOpen: boolean; onClose: () => void; userId: string; onSubmitted: () => void;
}) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) { setUrl(''); setError(''); setSubmitted(false); setLoading(false); }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!url.trim()) { setError('Please enter your article link'); return; }
    if (!url.startsWith('http')) { setError('Please enter a valid URL'); return; }
    setLoading(true);
    setError('');

    const { error: err } = await supabase
      .from('article_submissions')
      .insert({ user_id: userId, article_url: url.trim(), status: 'pending' });

    setLoading(false);
    if (err) {
      if (err.code === '23505') { setError('You already submitted an article.'); }
      else { setError(err.message); }
      return;
    }
    setSubmitted(true);
    onSubmitted();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl p-5 space-y-4"
            style={{ background: 'white', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black" style={{ color: '#1a1a2e' }}>Submit Article</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: '#f4f4f4', color: '#888' }}>×</button>
            </div>

            {submitted ? (
              <div className="py-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-4xl mb-2">⏳</motion.div>
                <div className="text-sm font-black" style={{ color: '#8B5CF6' }}>Pending Approval</div>
                <div className="text-xs text-gray-400 mt-1">We'll review your article and assign shells soon.</div>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-400">
                  Write an article about PlanetSlog and paste the link below. Our team will review and approve it.
                </p>
                <input
                  type="text"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://medium.com/... or https://x.com/..."
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: '#fafafa', border: '1.5px solid #ececec', color: '#1a1a2e' }}
                />
                {error && (
                  <div className="text-[10px] font-bold px-3 py-2 rounded-lg" style={{ background: 'rgba(239,71,111,0.08)', color: '#EF476F', border: '1px solid rgba(239,71,111,0.2)' }}>
                    {error}
                  </div>
                )}
                <motion.button
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.97 } : {}}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-black text-white"
                  style={{
                    background: loading ? '#eee' : 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                    boxShadow: loading ? 'none' : '0 4px 0 #6d28d9',
                    color: loading ? '#bbb' : 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Article →'}
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── 30s Timer Modal for Social Tasks ───
function QuestTimerModal({ isOpen, onComplete, questLabel }: {
  isOpen: boolean; onComplete: () => void; questLabel: string;
}) {
  const [secondsLeft, setSecondsLeft] = useState(QUEST_TIMER_SECONDS);

  useEffect(() => {
    if (!isOpen) return;
    setSecondsLeft(QUEST_TIMER_SECONDS);
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xs rounded-2xl p-6 text-center"
        style={{ background: 'white', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
      >
        <div className="text-3xl mb-3">⏱️</div>
        <h3 className="text-sm font-black mb-1" style={{ color: '#1a1a2e' }}>{questLabel}</h3>
        <p className="text-xs text-gray-400 mb-4">Complete the task to earn shells</p>
        
        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#f0f0f0" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="42" fill="none" stroke="#FF6B35" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={264}
              animate={{ strokeDashoffset: 264 * (secondsLeft / QUEST_TIMER_SECONDS) }}
              transition={{ duration: 0.5, ease: 'linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-black" style={{ color: '#FF6B35', fontFamily: 'monospace' }}>
              {secondsLeft}s
            </span>
          </div>
        </div>

        <div className="text-[10px] text-gray-400">
          {secondsLeft > 0 ? 'Stay on the task page...' : '✓ Verifying completion...'}
        </div>
      </motion.div>
    </motion.div>
  );
}

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
            background: i < count ? 'radial-gradient(circle at 35% 35%, #fef3c7, #f59e0b)' : 'rgba(0,0,0,0.05)',
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

function WalletSubmission({ userId, currentWallet, onSubmitted }: { userId: string; currentWallet: string | null; onSubmitted: () => void }) {
  const [wallet, setWallet] = useState(currentWallet || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(!!currentWallet);

  useEffect(() => {
    if (currentWallet) {
      setWallet(currentWallet);
      setSubmitted(true);
    }
  }, [currentWallet]);

  const handleSubmit = async () => {
    if (submitted) return;
    const trimmed = wallet.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      setError('Please enter a valid EVM wallet address (0x...)');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await supabase
      .from('users')
      .update({ evm_wallet: trimmed })
      .eq('id', userId);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSubmitted(true);
    onSubmitted();
  };

  if (submitted) {
    return (
      <div className="p-3 rounded-xl text-center text-sm font-black" style={{ background: 'rgba(6,214,160,0.1)', border: '1.5px solid rgba(6,214,160,0.3)', color: '#048a67' }}>
        🎉 Wallet submitted: {wallet.slice(0, 6)}...{wallet.slice(-4)}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-bold" style={{ color: '#92400e' }}>Submit your EVM wallet to receive rewards:</div>
      <input
        type="text"
        value={wallet}
        onChange={(e) => setWallet(e.target.value)}
        placeholder="0x..."
        className="w-full px-3 py-2 rounded-xl text-sm font-mono"
        style={{ background: '#fafafa', border: '1.5px solid rgba(245,158,11,0.3)', color: '#1a1a2e' }}
      />
      {error && <div className="text-[10px] font-bold" style={{ color: '#EF476F' }}>{error}</div>}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-2.5 rounded-xl text-sm font-black"
        style={{ background: loading ? '#eee' : 'linear-gradient(135deg, #f59e0b, #fde68a)', color: loading ? '#bbb' : '#92400e', border: '1.5px solid rgba(245,158,11,0.4)', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Saving...' : 'Submit Wallet ✓'}
      </motion.button>
    </div>
  );
}

function FragmentCraftCard({ shells, fragments, userId, evmWallet, onCraft, onWalletSubmitted }: { shells: number; fragments: number; userId: string; evmWallet: string | null; onCraft: () => void; onWalletSubmitted: () => void }) {
  const canCraft = shells >= SHELLS_PER_FRAG && fragments < MAX_FRAGMENTS;
  const progress = Math.min((shells / (SHELLS_PER_FRAG * MAX_FRAGMENTS)) * 100, 100);

  return (
    <div className="p-4 rounded-2xl" style={{ background: 'white', border: '1.5px solid rgba(245,158,11,0.2)', boxShadow: '0 2px 12px rgba(245,158,11,0.08)' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-black" style={{ color: '#1a1a2e' }}>Golden Shell</div>
          <div className="text-[10px] mt-0.5" style={{ color: '#888' }}>1,500 🐚 per fragment · 3 to mint</div>
        </div>
        <motion.img src={ASSETS.goldenShell} alt="golden shell" className="w-12 h-12 object-contain"
          animate={fragments > 0 ? { rotate: [0, 5, -5, 0] } : {}} transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          style={{ filter: fragments === 0 ? 'grayscale(0.8) opacity(0.5)' : 'drop-shadow(0 0 8px rgba(245,158,11,0.7))' }} />
      </div>
      <FragmentOrbs count={fragments} />
      <div className="mt-3 mb-3">
        <div className="flex justify-between text-[10px] mb-1" style={{ color: '#aaa', fontFamily: 'monospace' }}>
          <span>{shells.toLocaleString()} shells</span>
          <span>{(SHELLS_PER_FRAG * MAX_FRAGMENTS).toLocaleString()} goal</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
          <motion.div className="h-full rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{ background: 'linear-gradient(90deg, #f59e0b, #fde68a)' }} />
        </div>
      </div>
      {fragments === MAX_FRAGMENTS ? (
        <WalletSubmission userId={userId} currentWallet={evmWallet} onSubmitted={onWalletSubmitted} />
      ) : (
        <motion.button whileHover={canCraft ? { scale: 1.02 } : {}} whileTap={canCraft ? { scale: 0.97 } : {}} onClick={onCraft} disabled={!canCraft} className="w-full py-2.5 rounded-xl text-sm font-black"
          style={{ background: canCraft ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(253,230,138,0.2))' : 'rgba(0,0,0,0.04)', border: canCraft ? '1.5px solid rgba(245,158,11,0.4)' : '1.5px solid rgba(0,0,0,0.06)', color: canCraft ? '#92400e' : '#ccc', cursor: canCraft ? 'pointer' : 'not-allowed' }}>
          {canCraft ? `Craft Fragment ${fragments + 1} ✦` : `Need ${Math.max(0, SHELLS_PER_FRAG - (shells % SHELLS_PER_FRAG || SHELLS_PER_FRAG))} more 🐚`}
        </motion.button>
      )}
    </div>
  );
}

function BoxGrid({ onEarn, userId }: { onEarn: (n: number) => void; userId: string }) {
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [reward, setReward] = useState<number | null>(null);
  const [burst, setBurst] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`box_cooldown_${userId}`);
    if (saved) {
      const end = parseInt(saved, 10);
      if (end > Date.now()) setCooldownEnd(end);
    }
  }, [userId]);

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
    const earned = Math.floor(Math.random() * 201) + 100;
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
    localStorage.setItem(`box_cooldown_${userId}`, end.toString());
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
          <p className="text-center text-[10px] font-black tracking-[0.2em] uppercase mb-3" style={{ color: '#bbb' }}>Pick one box</p>
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
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center text-white font-black" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}>
                    <span className="text-sm">+{reward}</span>
                    <span className="text-xs">🐚</span>
                  </motion.div>
                ) : (
                  <img src={selected === i ? ASSETS.chestOpen : ASSETS.chestClosed} alt="box" className="w-10 h-10 object-contain" />
                )}
              </motion.button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function QuestItem({ quest, locked, onComplete, onOpenSubmission }: {
  quest: Quest; locked: boolean; onComplete: (id: string) => void; onOpenSubmission?: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);

  const handle = async () => {
    if (quest.done || locked || loading || timerOpen) return;

    // Article submission quest — open modal instead of X
    if (quest.requiresSubmission && onOpenSubmission) {
      onOpenSubmission(quest.id);
      return;
    }

    // Social tasks with 30s timer
    if (quest.url) {
      window.open(quest.url, '_blank');
      setTimerOpen(true);
      return;
    }

    // Fallback for tasks without URL (shouldn't happen)
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    onComplete(quest.id);
  };

  const handleTimerComplete = () => {
    setTimerOpen(false);
    onComplete(quest.id);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 p-3 rounded-2xl"
        style={{ background: locked ? 'rgba(0,0,0,0.02)' : quest.done ? 'rgba(6,214,160,0.07)' : 'white', border: quest.done ? '1.5px solid rgba(6,214,160,0.3)' : locked ? '1.5px solid rgba(0,0,0,0.05)' : '1.5px solid rgba(255,107,53,0.18)', boxShadow: locked || quest.done ? 'none' : '0 2px 10px rgba(255,107,53,0.07)', opacity: locked ? 0.42 : 1 }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: locked ? '#f4f4f4' : quest.done ? 'rgba(6,214,160,0.12)' : '#FFF5EE' }}>
          {locked ? '🔒' : quest.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black leading-tight truncate" style={{ color: locked ? '#ccc' : '#1a1a2e' }}>{quest.label}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-bold" style={{ color: locked ? '#ddd' : '#FF6B35' }}>+{quest.shells}🐚</span>
            <span className="text-[10px]" style={{ color: '#ccc' }}>·</span>
            <span className="text-[10px] font-bold" style={{ color: locked ? '#ddd' : '#888' }}>+{quest.points}pts</span>
          </div>
        </div>
        {!locked && (
          quest.done ? (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: '#06D6A0', color: 'white' }}>✓</div>
          ) : (
            <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }} onClick={handle} disabled={loading || timerOpen} className="h-8 px-3 rounded-full text-xs font-black flex-shrink-0"
              style={{ background: loading || timerOpen ? '#eee' : 'linear-gradient(135deg, #FF6B35, #FF9500)', color: loading || timerOpen ? '#bbb' : 'white', boxShadow: loading || timerOpen ? 'none' : '0 3px 0 #c04a1a', minWidth: 52 }}>
              {loading || timerOpen ? '···' : quest.requiresSubmission ? 'Submit →' : 'Go →'}
            </motion.button>
          )
        )}
      </motion.div>

      <QuestTimerModal
        isOpen={timerOpen}
        onComplete={handleTimerComplete}
        questLabel={quest.label}
      />
    </>
  );
}

function DailyClaimGrid({ userId, onClaim }: { userId: string; onClaim: (amount: number) => void }) {
  const [claimedDays, setClaimedDays] = useState<number[]>([]);
  const [lastClaimTime, setLastClaimTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const savedDays = localStorage.getItem(`daily_claimed_days_${userId}`);
    const savedTime = localStorage.getItem(`daily_claim_time_${userId}`);
    if (savedDays) setClaimedDays(JSON.parse(savedDays));
    if (savedTime) {
      const t = parseInt(savedTime, 10);
      if (Date.now() - t < 24 * 60 * 60 * 1000) {
        setLastClaimTime(t);
        setTimeLeft(24 * 60 * 60 * 1000 - (Date.now() - t));
      }
    }
  }, [userId]);

  useEffect(() => {
    if (!lastClaimTime || timeLeft <= 0) return;
    const interval = setInterval(() => {
      const left = 24 * 60 * 60 * 1000 - (Date.now() - lastClaimTime);
      if (left <= 0) {
        setTimeLeft(0);
        setLastClaimTime(null);
        clearInterval(interval);
      } else {
        setTimeLeft(left);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastClaimTime, timeLeft]);

  const canClaim = (day: number) => {
    if (timeLeft > 0) return false;
    if (claimedDays.includes(day)) return false;
    if (day === 1) return true;
    return claimedDays.includes(day - 1);
  };

  const claim = (day: number, amount: number) => {
    if (!canClaim(day)) return;
    const next = [...claimedDays, day];
    setClaimedDays(next);
    localStorage.setItem(`daily_claimed_days_${userId}`, JSON.stringify(next));
    const now = Date.now();
    setLastClaimTime(now);
    localStorage.setItem(`daily_claim_time_${userId}`, now.toString());
    setTimeLeft(24 * 60 * 60 * 1000);
    onClaim(amount);
  };

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div>
      {timeLeft > 0 && (
        <div className="text-center mb-3">
          <span className="text-xs font-bold text-[#FF6B35]" style={{ fontFamily: 'monospace' }}>Next claim in {fmt(timeLeft)}</span>
        </div>
      )}
      <div className="grid grid-cols-7 gap-1.5">
        {DAILY_REWARDS.map(({ day, shells: reward }) => {
          const claimed = claimedDays.includes(day);
          const available = canClaim(day);
          return (
            <motion.button
              key={day}
              whileHover={available ? { scale: 1.05 } : {}}
              whileTap={available ? { scale: 0.95 } : {}}
              onClick={() => claim(day, reward)}
              disabled={!available}
              className="flex flex-col items-center p-2 rounded-xl transition-all"
              style={{
                background: claimed ? 'rgba(6,214,160,0.12)' : available ? 'white' : 'rgba(0,0,0,0.03)',
                border: claimed ? '1.5px solid rgba(6,214,160,0.4)' : available ? '1.5px solid rgba(255,107,53,0.25)' : '1.5px solid rgba(0,0,0,0.06)',
                boxShadow: available ? '0 2px 8px rgba(255,107,53,0.1)' : 'none',
                opacity: available || claimed ? 1 : 0.5,
              }}
            >
              <span className="text-[9px] font-black uppercase tracking-wider mb-1" style={{ color: claimed ? '#06D6A0' : available ? '#FF6B35' : '#bbb' }}>
                Day {day}
              </span>
              <img src={ASSETS.dailyShells} alt="shell" className="w-8 h-8 object-contain mb-1" style={{ filter: claimed ? 'grayscale(0.3)' : available ? 'none' : 'grayscale(1)' }} />
              <span className="text-[10px] font-black" style={{ color: claimed ? '#06D6A0' : available ? '#1a1a2e' : '#ccc' }}>
                +{reward}
              </span>
              {claimed && <span className="text-[8px] text-[#06D6A0] font-bold">✓</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

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
          {count}/6 · +120🐚 each
        </span>
      </div>
      <div className="flex gap-1.5 mb-3">
        {Array.from({ length: 6 }, (_, i) => (
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

export default function ShellBlitz() {
  const { user, refreshProfile } = useAuth();
  const [shells, setShells] = useState(0);
  const [fragments, setFragments] = useState(0);
  const [showArtModal, setShowArtModal] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [day2Unlocked, setDay2Unlocked] = useState(false);
  const [day2TimeLeft, setDay2TimeLeft] = useState(0);

  const [quests, setQuests] = useState<Quest[]>([
    // Day 1 - Social Tasks
    { id: 'follow', icon: '🐦', label: 'Follow @planetslog', points: 200, shells: 200, done: false, url: PLANETSLOG_URL, day: 1 },
    { id: 'retweet', icon: '🔁', label: 'Like & Retweet', points: 150, shells: 150, done: false, url: TWEET_URL, day: 1 },
    { id: 'comment', icon: '💬', label: 'Comment & Tag 3 Frens', points: 250, shells: 250, done: false, url: TWEET_URL, day: 1 },
    // Day 2 - Social Tasks
    { id: 'd2_retweet', icon: '🔁', label: 'Like & Retweet Day 2', points: 150, shells: 150, done: false, url: DAY2_TWEET_URL, day: 2 },
    { id: 'd2_comment', icon: '💬', label: 'Comment & Tag 3 Frens Day 2', points: 250, shells: 250, done: false, url: DAY2_TWEET_URL, day: 2 },
    // One-time tasks
    { id: 'write_about', icon: '✍️', label: 'Write About PlanetSlog', points: 500, shells: 1500, done: false, day: 1, oneTime: true, requiresSubmission: true },
    { id: 'follow_gary', icon: '🧹', label: 'Follow @garythecleaner1', points: 300, shells: 600, done: false, url: GARY_URL, day: 1, oneTime: true },
  ]);

  // Load shells/fragments from user profile
  useEffect(() => {
    if (user) {
      setShells(user.shells_balance);
      setFragments(user.fragments ?? 0);
    }
  }, [user]);

  // Day 2 unlock timer
  useEffect(() => {
    if (!user) return;
    const key = `day2_unlock_${user.id}`;
    const saved = localStorage.getItem(key);
    let unlockTime: number;

    if (saved) {
      unlockTime = parseInt(saved, 10);
    } else {
      unlockTime = Date.now() + DAY2_UNLOCK_MS;
      localStorage.setItem(key, unlockTime.toString());
    }

    const updateTimer = () => {
      const left = unlockTime - Date.now();
      if (left <= 0) {
        setDay2Unlocked(true);
        setDay2TimeLeft(0);
      } else {
        setDay2Unlocked(false);
        setDay2TimeLeft(left);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Load completed quests from Supabase
  useEffect(() => {
    if (!user) return;

    const loadCompletedQuests = async () => {
      const { data, error } = await supabase
        .from('quest_completions')
        .select('quest_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to load quests:', error);
        return;
      }

      const completed = new Set(data?.map(q => q.quest_id) || []);
      setQuests(prev => prev.map(q => ({
        ...q,
        done: completed.has(q.id)
      })));
    };

    loadCompletedQuests();
  }, [user]);

  const addShells = useCallback(async (amount: number) => {
    if (!user) return;
    const next = shells + amount;
    setShells(next);
    await supabase.from('users').update({ shells_balance: next }).eq('id', user.id);
    refreshProfile();
  }, [shells, user, refreshProfile]);

  const craftFragment = async () => {
    if (!user || shells < SHELLS_PER_FRAG || fragments >= MAX_FRAGMENTS) return;
    const nextShells = shells - SHELLS_PER_FRAG;
    const nextFrags = fragments + 1;
    setShells(nextShells);
    setFragments(nextFrags);
    await supabase.from('users').update({ shells_balance: nextShells, fragments: nextFrags }).eq('id', user.id);
    await supabase.from('fragments').insert({ user_id: user.id });
    refreshProfile();
  };

  // Exploit-proof quest completion
  const completeQuest = async (id: string) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || !user || quest.done) return;

    const { data: existing } = await supabase
      .from('quest_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('quest_id', id)
      .maybeSingle();

    if (existing) {
      setQuests(prev => prev.map(q => q.id === id ? { ...q, done: true } : q));
      return;
    }

    const { error: insertError } = await supabase
      .from('quest_completions')
      .insert({ user_id: user.id, quest_id: id });

    if (insertError) {
      console.error('Quest insert failed:', insertError);
      return;
    }

    setQuests(prev => prev.map(q => q.id === id ? { ...q, done: true } : q));
    await addShells(quest.shells);
  };

  const fmtTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m ${sec.toString().padStart(2, '0')}s`;
  };

  const day1Quests = quests.filter(q => q.day === 1 && !q.oneTime);
  const day2Quests = quests.filter(q => q.day === 2);
  const oneTimeQuests = quests.filter(q => q.oneTime);

  if (!user) return null;

  return (
    <GameLayout pageId="shell-blitz" label="Shell Blitz" color="#FF6B35">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4 pb-24">
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

        <FragmentCraftCard
          shells={shells}
          fragments={fragments}
          userId={user.id}
          evmWallet={user.evm_wallet || null}
          onCraft={craftFragment}
          onWalletSubmitted={refreshProfile}
        />

        <div className="p-4 rounded-2xl" style={{ background: 'white', border: '1.5px solid rgba(255,107,53,0.12)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-black text-sm" style={{ color: '#1a1a2e' }}>Mystery Boxes</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#FFF5EE', color: '#FF6B35' }}>Every 3h</span>
          </div>
          <BoxGrid onEarn={n => addShells(n)} userId={user.id} />
        </div>

        <div className="p-4 rounded-2xl" style={{ background: 'white', border: '1.5px solid rgba(255,107,53,0.12)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-black text-sm" style={{ color: '#1a1a2e' }}>Daily Claim</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#FFF5EE', color: '#FF6B35' }}>7-Day Streak</span>
          </div>
          <DailyClaimGrid userId={user.id} onClaim={addShells} />
        </div>

        {/* One-Time Tasks */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: '#8B5CF6' }}>One-Time</span>
            <span className="text-xs font-bold" style={{ color: '#aaa' }}>Bonus Tasks</span>
          </div>
          <div className="space-y-2">
            {oneTimeQuests.map(q => (
              <QuestItem
                key={q.id}
                quest={q}
                locked={false}
                onComplete={completeQuest}
                onOpenSubmission={q.requiresSubmission ? () => setShowArticleModal(true) : undefined}
              />
            ))}
          </div>
        </div>

        {/* Day 1 Tasks */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: '#FF6B35' }}>Day 1</span>
            <span className="text-xs font-bold" style={{ color: '#aaa' }}>Social Tasks</span>
          </div>
          <div className="space-y-2">
            {day1Quests.map(q => <QuestItem key={q.id} quest={q} locked={false} onComplete={completeQuest} />)}
          </div>
        </div>

        {/* Day 2 Tasks */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black" style={{ background: day2Unlocked ? '#FF6B35' : '#f0f0f0', color: day2Unlocked ? 'white' : '#bbb' }}>Day 2</span>
            <span className="text-xs font-bold" style={{ color: day2Unlocked ? '#aaa' : '#ccc' }}>
              {day2Unlocked ? 'Social Tasks' : `Unlocks in ${fmtTime(day2TimeLeft)}`}
            </span>
          </div>
          <div className="space-y-2">
            {day2Quests.map(q => <QuestItem key={q.id} quest={q} locked={!day2Unlocked} onComplete={completeQuest} />)}
          </div>
        </div>

        <ReferralSection handle={user.twitter_handle} count={user.referral_count} />

        <div className="p-4 rounded-2xl" style={{ background: 'white', border: '1.5px solid rgba(255,107,53,0.15)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🎨</span>
            <span className="text-sm font-black" style={{ color: '#1a1a2e' }}>Submit Your Art</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">Upload your art and link your X post tagging @planetslog</p>
          <button onClick={() => setShowArtModal(true)} className="w-full py-2.5 rounded-xl text-sm font-black text-white" style={{ background: '#FF6B35', boxShadow: '0 3px 0 #c04a1a' }}>
            Submit Art
          </button>
        </div>
      </div>

      <ArtUploadModal
        isOpen={showArtModal}
        onClose={() => setShowArtModal(false)}
        userId={user.id}
      />

      <ArticleSubmissionModal
        isOpen={showArticleModal}
        onClose={() => setShowArticleModal(false)}
        userId={user.id}
        onSubmitted={() => {
          // Mark as pending in UI — no shells awarded yet
          setQuests(prev => prev.map(q => q.id === 'write_about' ? { ...q, done: true } : q));
        }}
      />
    </GameLayout>
  );
}
