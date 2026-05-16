import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GameLayout from '../components/GameLayout';
import { ConfettiBurst } from '../components/ConfettiBurst';
import { ShellIcon } from '../components/ShellIcon';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { ASSETS } from '../lib/assets';

const SHELLS_PER_ITEM = 1500;
const MAX_ITEMS = 3;
const BOX_COOLDOWN_MS = 24 * 60 * 60 * 1000;

function ItemOrbs({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: MAX_ITEMS }, (_, i) => (
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

  useEffect(() => { if (currentWallet) { setWallet(currentWallet); setSubmitted(true); } }, [currentWallet]);

  const handleSubmit = async () => {
    if (submitted) return;
    const trimmed = wallet.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) { setError('Please enter a valid EVM wallet address (0x...)'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.from('users').update({ evm_wallet: trimmed }).eq('id', userId);
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSubmitted(true); onSubmitted();
  };

  if (submitted) return (
    <div className="p-3 rounded-xl text-center text-sm font-black" style={{ background: 'rgba(6,214,160,0.1)', border: '1.5px solid rgba(6,214,160,0.3)', color: '#048a67' }}>
      🎉 Wallet submitted: {wallet.slice(0, 6)}...{wallet.slice(-4)}
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="text-xs font-bold" style={{ color: '#92400e' }}>Submit your EVM wallet:</div>
      <input type="text" value={wallet} onChange={e => setWallet(e.target.value)} placeholder="0x..."
        className="w-full px-3 py-2 rounded-xl text-sm font-mono" style={{ background: '#fafafa', border: '1.5px solid rgba(245,158,11,0.3)', color: '#1a1a2e' }} />
      {error && <div className="text-[10px] font-bold" style={{ color: '#EF476F' }}>{error}</div>}
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={loading}
        className="w-full py-2.5 rounded-xl text-sm font-black"
        style={{ background: loading ? '#eee' : 'linear-gradient(135deg, #f59e0b, #fde68a)', color: loading ? '#bbb' : '#92400e', border: '1.5px solid rgba(245,158,11,0.4)', cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Saving...' : 'Submit Wallet ✓'}
      </motion.button>
    </div>
  );
}

function ItemCraftCard({ shells, items, userId, evmWallet, onCraft, onWalletSubmitted }: {
  shells: number; items: number; userId: string; evmWallet: string | null; onCraft: () => void; onWalletSubmitted: () => void;
}) {
  const canCraft = shells >= SHELLS_PER_ITEM && items < MAX_ITEMS;
  const progress = Math.min((shells / (SHELLS_PER_ITEM * MAX_ITEMS)) * 100, 100);

  return (
    <div className="p-4 rounded-2xl" style={{ background: 'white', border: '1.5px solid rgba(245,158,11,0.2)', boxShadow: '0 2px 12px rgba(245,158,11,0.08)' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-black" style={{ color: '#1a1a2e' }}>Golden Shell</div>
          <div className="text-[10px] mt-0.5" style={{ color: '#888' }}>1,500 🐚 per item · 3 to mint</div>
        </div>
        <motion.img src={ASSETS.goldenShell} alt="golden shell" className="w-12 h-12 object-contain"
          animate={items > 0 ? { rotate: [0, 5, -5, 0] } : {}} transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          style={{ filter: items === 0 ? 'grayscale(0.8) opacity(0.5)' : 'drop-shadow(0 0 8px rgba(245,158,11,0.7))' }} />
      </div>
      <ItemOrbs count={items} />
      <div className="mt-3 mb-3">
        <div className="flex justify-between text-[10px] mb-1" style={{ color: '#aaa', fontFamily: 'monospace' }}>
          <span>{shells.toLocaleString()} shells</span>
          <span>{(SHELLS_PER_ITEM * MAX_ITEMS).toLocaleString()} goal</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
          <motion.div className="h-full rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{ background: 'linear-gradient(90deg, #f59e0b, #fde68a)' }} />
        </div>
      </div>
      {items === MAX_ITEMS ? (
        <WalletSubmission userId={userId} currentWallet={evmWallet} onSubmitted={onWalletSubmitted} />
      ) : (
        <motion.button whileHover={canCraft ? { scale: 1.02 } : {}} whileTap={canCraft ? { scale: 0.97 } : {}} onClick={onCraft} disabled={!canCraft}
          className="w-full py-2.5 rounded-xl text-sm font-black"
          style={{ background: canCraft ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(253,230,138,0.2))' : 'rgba(0,0,0,0.04)', border: canCraft ? '1.5px solid rgba(245,158,11,0.4)' : '1.5px solid rgba(0,0,0,0.06)', color: canCraft ? '#92400e' : '#ccc', cursor: canCraft ? 'pointer' : 'not-allowed' }}>
          {canCraft ? `Craft Item ${items + 1} ✦` : `Need ${Math.max(0, SHELLS_PER_ITEM - (shells % SHELLS_PER_ITEM || SHELLS_PER_ITEM))} more 🐚`}
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
  const [items, setItems] = useState(0);

  useEffect(() => {
    if (user) { setShells(user.shells_balance); setItems(user.items ?? 0); }
  }, [user]);

  const addShells = useCallback(async (amount: number) => {
    if (!user) return;
    const next = shells + amount;
    setShells(next);
    await supabase.from('users').update({ shells_balance: next }).eq('id', user.id);
    refreshProfile();
  }, [shells, user, refreshProfile]);

  const craftItem = async () => {
    if (!user || shells < SHELLS_PER_ITEM || items >= MAX_ITEMS) return;
    const nextShells = shells - SHELLS_PER_ITEM;
    const nextItems = items + 1;
    setShells(nextShells);
    setItems(nextItems);
    await supabase.from('users').update({ shells_balance: nextShells, items: nextItems }).eq('id', user.id);
    await supabase.from('fragments').insert({ user_id: user.id });
    refreshProfile();
  };

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
            <div className="text-xl font-black text-white">{items}/{MAX_ITEMS}</div>
            <div className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-0.5">Items</div>
          </div>
        </div>

        <ItemCraftCard shells={shells} items={items} userId={user.id} evmWallet={user.evm_wallet || null} onCraft={craftItem} onWalletSubmitted={refreshProfile} />

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
