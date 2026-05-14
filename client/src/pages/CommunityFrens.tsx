import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameLayout from '../components/GameLayout';
import { supabase } from '../lib/supabase';

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

type Community = {
  id: string;
  name: string;
  image: string;
  color: string;
};

const COMMUNITIES: Community[] = [
  { id: 'delmundos',      name: 'DelMundos',        image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Delmundos.jpg',      color: '#EF476F' },
  { id: 'froge-69mg',     name: 'FROGE 69mg',       image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/FROGE69mg.jpg',     color: '#06D6A0' },
  { id: 'funkari',        name: 'Funkari',          image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Funkari.jpg',        color: '#FFD166' },
  { id: 'fwogs',          name: 'Fwogs',            image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Fwogs.jpg',           color: '#118AB2' },
  { id: 'giraffes',       name: 'Giraffes',         image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Giraffies.jpg',       color: '#073B4C' },
  { id: 'goblynz',        name: 'Goblynz',          image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Goblynz.jpg',         color: '#9D4EDD' },
  { id: 'normies',        name: 'Normies',          image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Normies.jpg',         color: '#FF9F1C' },
  { id: 'penguish',       name: 'Penguish',         image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Penguish.jpg',        color: '#2EC4B6' },
  { id: 'slonks',         name: 'Slonks',           image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Slonks.jpg',          color: '#E71D36' },
  { id: 'the-florentines',name: 'The Florentines',  image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/The-Florentines.jpg', color: '#662E9B' },
  { id: 'theorem',        name: 'Theorem',          image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Theorem.jpg',         color: '#F86624' },
  { id: 'zorgz',          name: 'Zorgz',            image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Zorgz.jpg',           color: '#43AA8B' },
];

const TOTAL_SPOTS = 300;
const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTgKmB-kwiKyh7Xeo-JOmwcmdfNi99LMXCl5_RoypTknt419Io5w84rr41HffgdNOz2pxkTVHXBnqzP/pub?output=csv';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const isValidAddress = (a: string) => /^0x[a-fA-F0-9]{40}$/.test(a.trim());

const parseCSV = (text: string): Set<string> => {
  const set = new Set<string>();
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    for (const col of line.split(',')) {
      const c = col.trim().toLowerCase();
      if (isValidAddress(c)) set.add(c);
    }
  }
  return set;
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function CommunityFrens() {
  const [claims, setClaims] = useState<<Record<string, number>>({});
  const [csvSet, setCsvSet] = useState<<Set<string> | null>(null);
  const [csvLoading, setCsvLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [active, setActive] = useState<<Community | null>(null);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'ineligible' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  /* ---- Load whitelist ---- */
  useEffect(() => {
    fetch(CSV_URL)
      .then((r) => r.text())
      .then((t) => setCsvSet(parseCSV(t)))
      .catch(() => setErrorMsg('Could not load eligibility list.'))
      .finally(() => setCsvLoading(false));
  }, []);

  /* ---- Load claim counts ---- */
  const fetchCounts = useCallback(async () => {
    const { data } = await supabase.from('community_claims').select('community_id');
    if (!data) return;
    const counts: Record<string, number> = {};
    for (const c of COMMUNITIES) counts[c.id] = 0;
    for (const row of data) {
      if (counts[row.community_id] !== undefined) counts[row.community_id]++;
    }
    setClaims(counts);
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  /* ---- Claim ---- */
  const handleClaim = async () => {
    if (!active || !csvSet) return;
    const addr = input.trim().toLowerCase();

    if (!isValidAddress(addr)) {
      setStatus('error');
      setErrorMsg('Invalid address format.');
      return;
    }

    setStatus('checking');
    await new Promise((r) => setTimeout(r, 300));

    if (!csvSet.has(addr)) {
      setStatus('ineligible');
      setErrorMsg('Address not on the eligibility list.');
      return;
    }

    const { data: existing } = await supabase
      .from('community_claims')
      .select('id')
      .eq('community_id', active.id)
      .eq('wallet_address', addr)
      .maybeSingle();

    if (existing) {
      setStatus('error');
      setErrorMsg('You already claimed this community.');
      return;
    }

    setStatus('submitting');
    const { error } = await supabase
      .from('community_claims')
      .insert({ community_id: active.id, wallet_address: addr });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }

    setStatus('success');
    setClaims((p) => ({ ...p, [active.id]: (p[active.id] || 0) + 1 }));
  };

  const open = (c: Community) => {
    setActive(c);
    setInput('');
    setStatus('idle');
    setErrorMsg('');
    setModalOpen(true);
  };

  const close = () => {
    setModalOpen(false);
    setTimeout(() => setActive(null), 250);
  };

  const pct = (id: string) => Math.min(100, ((claims[id] || 0) / TOTAL_SPOTS) * 100);

  return (
    <GameLayout pageId="community-frens" label="Community Frens" color="#EF476F">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Community Frens
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            300 spots per community. Paste your wallet to claim if you’re on the list.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {COMMUNITIES.map((c, i) => {
            const claimed = claims[c.id] || 0;
            const full = claimed >= TOTAL_SPOTS;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
                className="relative group rounded-3xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 opacity-25"
                    style={{ background: `linear-gradient(to top, ${c.color}, transparent)` }}
                  />
                  <div className="absolute bottom-3 left-3">
                    <span
                      className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-wider"
                      style={{ background: c.color }}
                    >
                      {c.name}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1.5">
                    <span>{claimed} / {TOTAL_SPOTS} claimed</span>
                    <span className={full ? 'text-red-500' : 'text-green-600'}>
                      {full ? 'Full' : `${TOTAL_SPOTS - claimed} left`}
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden mb-4">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: c.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct(c.id)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>

                  <button
                    onClick={() => open(c)}
                    disabled={full || csvLoading}
                    className={`w-full py-2.5 rounded-xl text-sm font-black text-white transition-transform active:scale-95 ${
                      full || csvLoading ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'
                    }`}
                    style={{ background: c.color }}
                  >
                    {csvLoading ? 'Loading…' : full ? 'Sold Out' : 'Claim Spot'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && active && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />

            <motion.div
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              {/* Header */}
              <div className="h-28 flex items-end p-5" style={{ background: active.color }}>
                <div className="flex items-center gap-3">
                  <img
                    src={active.image}
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <h3 className="text-white font-black text-xl leading-tight">{active.name}</h3>
                    <p className="text-white/80 text-xs font-bold">
                      {claims[active.id] || 0} / {TOTAL_SPOTS} claimed
                    </p>
                  </div>
                </div>
                <button
                  onClick={close}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold transition"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {status === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl mx-auto mb-3">
                      🎉
                    </div>
                    <h4 className="text-lg font-black text-[#1a1a2e] mb-1">Spot Claimed!</h4>
                    <p className="text-sm text-gray-500 mb-5">
                      Your address is locked in for <strong>{active.name}</strong>.
                    </p>
                    <button
                      onClick={close}
                      className="px-6 py-2.5 rounded-xl text-sm font-black text-white"
                      style={{ background: active.color }}
                    >
                      Close
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                      Paste Wallet Address
                    </label>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        if (status === 'error' || status === 'ineligible') {
                          setStatus('idle');
                          setErrorMsg('');
                        }
                      }}
                      placeholder="0x..."
                      disabled={status === 'submitting'}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-mono text-[#1a1a2e] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 transition"
                      style={{ '--tw-ring-color': active.color } as React.CSSProperties}
                    />

                    <AnimatePresence>
                      {(status === 'ineligible' || status === 'error') && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-red-500 font-bold mt-2"
                        >
                          {errorMsg}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={handleClaim}
                      disabled={!input || status === 'checking' || status === 'submitting'}
                      className="w-full mt-4 py-3 rounded-xl text-sm font-black text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                      style={{ background: active.color }}
                    >
                      {status === 'checking' ? 'Checking…' : status === 'submitting' ? 'Claiming…' : 'Claim My Spot'}
                    </button>

                    <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
                      Address must exist in the published CSV whitelist to qualify.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameLayout>
  );
}
