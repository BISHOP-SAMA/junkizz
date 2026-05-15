import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GameLayout from '../components/GameLayout';
import { ConfettiBurst } from '../components/ConfettiBurst';
import { ShellIcon } from '../components/ShellIcon';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { ASSETS } from '../lib/assets';

const BOX_COOLDOWN_MS = 24 * 60 * 60 * 1000;

function BoxGrid({ onEarn, userId }: { onEarn: (n: number) => void; userId: string }) {
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [reward, setReward] = useState<number | null>(null);
  const [burst, setBurst] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`box_cooldown_${userId}`);
    if (saved) { const end = parseInt(saved, 10); if (end > Date.now()) setCooldownEnd(end); }
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
    setBusy(true); setSelected(i);
    await new Promise(r => setTimeout(r, 700));
    const earned = Math.floor(Math.random() * 201) + 100;
    setReward(earned); setBurst(true); onEarn(earned);
    setTimeout(() => setBurst(false), 900);
    await new Promise(r => setTimeout(r, 2200));
    setSelected(null); setReward(null); setBusy(false);
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
              <motion.button key={i} onClick={() => pick(i)} disabled={busy}
                whileHover={{ y: -4, scale: 1.05 }} whileTap={{ scale: 0.9 }}
                animate={selected === i ? { rotate: [0, -12, 12, -6, 6, 0], scale: [1, 1.18, 1] } : {}}
                transition={{ duration: 0.45 }}
                className="relative aspect-square rounded-xl flex items-center justify-center overflow-hidden"
                style={{ background: box.bg, boxShadow: `0 5px 0 ${box.shadow}`, border: '2px solid rgba(255,255,255,0.3)', opacity: busy && selected !== i ? 0.35 : 1, cursor: busy ? 'not-allowed' : 'pointer' }}>
                {selected === i && reward !== null ? (
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center text-white font-black" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}>
                    <span className="text-sm">+{reward}</span><span className="text-xs">🐚</span>
                  </motion.div>
                ) : <img src={selected === i ? ASSETS.chestOpen : ASSETS.chestClosed} alt="box" className="w-10 h-10 object-contain" />}
              </motion.button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ShellBlitz() {
  const { user, refreshProfile } = useAuth();
  const [shells, setShells] = useState(0);

  useEffect(() => {
    if (user) { setShells(user.shells_balance); }
  }, [user]);

  const addShells = useCallback(async (amount: number) => {
    if (!user) return;
    const next = shells + amount;
    setShells(next);
    await supabase.from('users').update({ shells_balance: next }).eq('id', user.id);
    refreshProfile();
  }, [shells, user, refreshProfile]);

  if (!user) return null;

  return (
    <GameLayout pageId="shell-blitz" label="Shell Blitz" color="#FF6B35">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4 pb-24">
        <div className="p-3.5 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg,#FF6B35,#FF9500)', boxShadow: '0 4px 0 #c04a1a' }}>
          <div className="text-xl font-black text-white">{shells.toLocaleString()}</div>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <ShellIcon size={12} />
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Shells</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl" style={{ background: 'white', border: '1.5px solid rgba(255,107,53,0.12)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-black text-sm" style={{ color: '#1a1a2e' }}>Mystery Boxes</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#FFF5EE', color: '#FF6B35' }}>Every 24h</span>
          </div>
          <BoxGrid onEarn={n => addShells(n)} userId={user.id} />
        </div>
      </div>
    </GameLayout>
  );
}
