import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameLayout from '../components/GameLayout';
import { ConfettiBurst } from '../components/ConfettiBurst';
import { ShellIcon } from '../components/ShellIcon';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { ASSETS } from '../lib/assets';

type Quest = { id: string; icon: string; label: string; points: number; shells: number; done: boolean; url?: string; day: number };

const PLANETSLOG_URL = 'https://x.com/planetslog?s=21';
const TWEET_URL = 'https://x.com/planetslog/status/2052019506881458402?s=46';
const SHELLS_PER_FRAG = 1500;
const MAX_FRAGMENTS = 3;
const BOX_COOLDOWN_MS = 3 * 60 * 60 * 1000;
const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

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

function QuestItem({ quest, locked, onComplete }: { quest: Quest; locked: boolean; onComplete: (id: string) => void }) {
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
          <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }} onClick={handle} disabled={loading} className="h-8 px-3 rounded-full text-xs font-black flex-shrink-0"
            style={{ background: loading ? '#eee' : 'linear-gradient(135deg, #FF6B35, #FF9500)', color: loading ? '#bbb' : 'white', boxShadow: loading ? 'none' : '0 3px 0 #c04a1a', minWidth: 52 }}>
            {loading ? '···' : 'Go →'}
          </motion.button>
        )
      )}
    </motion.div>
  );
}

function DailyClaimCard({ day, shells, onClaim, canClaim }: { day: number; shells: number; onClaim: () => void; canClaim: boolean }) {
  return (
    <motion.div className="flex items-center gap-3 p-3 rounded-2xl"
      style={{ background: !canClaim ? 'rgba(6,214,160,0.07)' : 'white', border: !canClaim ? '1.5px solid rgba(6,214,160,0.3)' : '1.5px solid rgba(255,107,53,0.18)', boxShadow: !canClaim ? 'none' : '0 2px 10px rgba(255,107,53,0.07)' }}>
      <img src={ASSETS.dailyShells} alt="shells" className="w-10 h-10 object-contain flex-shrink-0" />
      <div className="flex-1">
        <div className="text-sm font-black" style={{ color: '#1a1a2e' }}>Day {day} Free Claim</div>
        <div className="text-xs font-bold" style={{ color: '#FF6B35' }}>+{shells} 🐚</div>
      </div>
      {!canClaim ? (
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#06D6A0', color: 'white' }}>✓</div>
      ) : (
        <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }} onClick={onClaim} className="h-8 px-3 rounded-full text-xs font-black"
          style={{ background: 'linear-gradient(135deg, #FF6B35, #FF9500)', color: 'white', boxShadow: '0 3px 0 #c04a1a' }}>
          Claim
        </motion.button>
      )}
    </motion.div>
  );
}

function FragmentCraftCard({ shells, fragments, onCraft }: { shells: number; fragments: number; onCraft: () => void }) {
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
        <div className="p-3 rounded-xl text-center text-sm font-black" style={{ background: 'rgba(245,158,11,0.1)', border: '1.5px solid rgba(245,158,11,0.3)', color: '#92400e' }}>
          🎉 All 3 fragments crafted — submit your EVM wallet!
        </div>
      ) : (
        <motion.button whileHover={canCraft ? { scale: 1.02 } : {}} whileTap={canCraft ? { scale: 0.97 } : {}} onClick={onCraft} disabled={!canCraft} className="w-full py-2.5 rounded-xl text-sm font-black"
          style={{ background: canCraft ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(253,230,138,0.2))' : 'rgba(0,0,0,0.04)', border: canCraft ? '1.5px solid rgba(245,158,11,0.4)' : '1.5px solid rgba(0,0,0,0.06)', color: canCraft ? '#92400e' : '#ccc', cursor: canCraft ? 'pointer' : 'not-allowed' }}>
          {canCraft ? `Craft Fragment ${fragments + 1} ✦` : `Need ${Math.max(0, SHELLS_PER_FRAG - (shells % SHELLS_PER_FRAG || SHELLS_PER_FRAG))} more 🐚`}
        </motion.button>
      )}
    </div>
  );
}

export default function ShellBlitz() {
  const { user, refreshProfile } = useAuth();
  const [shells, setShells] = useState(0);
  const [fragments, setFragments] = useState(0);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [dailyTimeLeft, setDailyTimeLeft] = useState(0);
  const [artSubmitted, setArtSubmitted] = useState(false);

  // Sync shells from user profile on load
  useEffect(() => {
    if (user) {
      setShells(user.shells_balance);
      setFragments(user.fragments ?? 0);
    }
  }, [user]);

  // Daily claim cooldown
  useEffect(() => {
    if (!user) return;
    const key = `daily_claim_${user.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const end = parseInt(saved, 10);
      if (end > Date.now()) {
        setDailyClaimed(true);
        setDailyTimeLeft(end - Date.now());
      }
    }
  }, [user]);

  useEffect(() => {
    if (!dailyClaimed || dailyTimeLeft <= 0) return;
    const t = setInterval(() => {
      const left = dailyTimeLeft - 1000;
      if (left <= 0) {
        setDailyClaimed(false);
        setDailyTimeLeft(0);
        clearInterval(t);
      } else {
        setDailyTimeLeft(left);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [dailyClaimed, dailyTimeLeft]);

  const addShells = useCallback(async (amount: number) => {
    if (!user) return;
    const next = shells + amount;
    setShells(next);
    await supabase.from('users').update({ shells_balance: next }).eq('id', user.id);
    refreshProfile();
  }, [shells, user, refreshProfile]);

  const claimDaily = async () => {
    if (!user || dailyClaimed) return;
    const amount = 400;
    await addShells(amount);
    const end = Date.now() + DAILY_COOLDOWN_MS;
    localStorage.setItem(`daily_claim_${user.id}`, end.toString());
    setDailyClaimed(true);
    setDailyTimeLeft(DAILY_COOLDOWN_MS);
  };

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

  const completeQuest = async (id: string) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || !user) return;
    setQuests(q => q.map(q => q.id === id ? { ...q, done: true } : q));
    await addShells(quest.shells);
    await supabase.from('user_quests').insert({ user_id: user.id, quest_type: id });
  };

  const [quests, setQuests] = useState<Quest[]>([
    { id: 'follow', icon: '🐦', label: 'Follow @planetslog', points: 200, shells: 200, done: false, url: PLANETSLOG_URL, day: 1 },
    { id: 'retweet', icon: '🔁', label: 'Like & Retweet', points: 150, shells: 150, done: false, url: TWEET_URL, day: 1 },
    { id: 'comment', icon: '💬', label: 'Comment & Tag 3 Frens', points: 250, shells: 250, done: false, url: TWEET_URL, day: 1 },
    { id: 'd2_tbd', icon: '⭐', label: 'Day 2 Quest', points: 300, shells: 300, done: false, day: 2 },
    { id: 'd2_q2', icon: '🌊', label: 'Day 2 Quest 2', points: 200, shells: 200, done: false, day: 2 },
  ]);

  const fmtTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  if (!user) return null;

  return (
    <GameLayout pageId="shell-blitz" label="Shell Blitz" color="#FF6B35">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4 pb-24">
        {/* Stats */}
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
          <BoxGrid onEarn={n => addShells(n)} userId={user.id} />
        </div>

        {/* Daily Claim */}
        <div className="p-4 rounded-2xl" style={{ background: 'white', border: '1.5px solid rgba(255,107,53,0.12)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-black text-sm" style={{ color: '#1a1a2e' }}>Daily Claim</span>
            {dailyClaimed && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#06D6A0/10', color: '#06D6A0' }}>
                {fmtTime(dailyTimeLeft)}
              </span>
            )}
          </div>
          <DailyClaimCard day={1} shells={400} onClaim={claimDaily} canClaim={!dailyClaimed} />
        </div>

        {/* Quests */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: '#FF6B35' }}>Day 1</span>
            <span className="text-xs font-bold" style={{ color: '#aaa' }}>Social Tasks</span>
          </div>
          <div className="space-y-2">
            {quests.filter(q => q.day === 1).map(q => <QuestItem key={q.id} quest={q} locked={false} onComplete={completeQuest} />)}
          </div>
        </div>

        {/* Locked quests */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black" style={{ background: '#f0f0f0', color: '#bbb' }}>Day 2+</span>
            <span className="text-xs font-bold" style={{ color: '#ccc' }}>Unlocks soon</span>
          </div>
          <div className="space-y-2">
            {quests.filter(q => q.day > 1).map(q => <QuestItem key={q.id} quest={q} locked={true} onComplete={completeQuest} />)}
          </div>
        </div>

        {/* Art submission */}
        {user && !artSubmitted && (
          <div className="p-4 rounded-2xl" style={{ background: 'white', border: '1.5px solid rgba(255,107,53,0.15)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎨</span>
              <span className="text-sm font-black" style={{ color: '#1a1a2e' }}>Submit Your Art</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">Post your art on X tagging @planetslog</p>
            <button onClick={() => setArtSubmitted(true)} className="w-full py-2.5 rounded-xl text-sm font-black text-white" style={{ background: '#FF6B35', boxShadow: '0 3px 0 #c04a1a' }}>
              Submit
            </button>
          </div>
        )}
        {artSubmitted && (
          <div className="p-3 rounded-2xl text-center text-xs font-bold" style={{ background: 'rgba(6,214,160,0.08)', color: '#048a67', border: '1.5px solid rgba(6,214,160,0.2)' }}>
            🎨 Art submission received
          </div>
        )}
      </div>
    </GameLayout>
  );
}
