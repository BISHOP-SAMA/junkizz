import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameLayout from '../components/GameLayout';
import { supabase } from '../lib/supabase';

type Community = {
  id: string;
  name: string;
  image: string;
};

const COMMUNITIES: Community[] = [
  { id: 'delmundos',       name: 'DelMundos',       image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Delmundos.jpg' },
  { id: 'froge-69mg',      name: 'FROGE 69mg',      image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/FROGE69mg.jpg' },
  { id: 'funkari',         name: 'Funkari',         image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Funkari.jpg' },
  { id: 'fwogs',           name: 'Fwogs',           image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Fwogs.jpg' },
  { id: 'giraffes',        name: 'Giraffes',        image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Giraffies.jpg' },
  { id: 'goblynz',         name: 'Goblynz',         image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Goblynz.jpg' },
  { id: 'normies',         name: 'Normies',         image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Normies.jpg' },
  { id: 'penguish',        name: 'Penguish',        image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Penguish.jpg' },
  { id: 'slonks',          name: 'Slonks',          image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Slonks.jpg' },
  { id: 'the-florentines', name: 'The Florentines', image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/The-Florentines.jpg' },
  { id: 'theorem',         name: 'Theorem',         image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Theorem.jpg' },
  { id: 'zorgz',           name: 'Zorgz',           image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Zorgz.jpg' },
];

const TOTAL_SPOTS = 300;
const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTgKmB-kwiKyh7Xeo-JOmwcmdfNi99LMXCl5_RoypTknt419Io5w84rr41HffgdNOz2pxkTVHXBnqzP/pub?output=csv';

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

export default function CommunityFrens() {
  const [totalClaimed, setTotalClaimed] = useState(0);
  const [csvSet, setCsvSet] = useState<Set<string> | null>(null);
  const [csvLoading, setCsvLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [input, setInput] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'checking' | 'ineligible' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch(CSV_URL)
      .then((r) => r.text())
      .then((t) => setCsvSet(parseCSV(t)))
      .catch(() => setErrorMsg('Could not load eligibility list.'))
      .finally(() => setCsvLoading(false));
  }, []);

  const fetchCounts = useCallback(async () => {
    const { count } = await supabase
      .from('community_claims')
      .select('*', { count: 'exact', head: true });
    setTotalClaimed(count ?? 0);
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleClaim = async () => {
    if (!csvSet || !selectedCommunity) return;
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
      .eq('wallet_address', addr)
      .maybeSingle();

    if (existing) {
      setStatus('error');
      setErrorMsg('This wallet has already claimed a spot.');
      return;
    }

    if (totalClaimed >= TOTAL_SPOTS) {
      setStatus('error');
      setErrorMsg('All 300 spots have been claimed.');
      return;
    }

    setStatus('submitting');
    const { error } = await supabase
      .from('community_claims')
      .insert({ community_id: selectedCommunity, wallet_address: addr });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }

    setStatus('success');
    setTotalClaimed((p) => p + 1);
  };

  const openModal = () => {
    setInput('');
    setStatus('idle');
    setErrorMsg('');
    setSelectedCommunity(null);
    setModalOpen(true);
  };

  const close = () => {
    setModalOpen(false);
  };

  const globalFull = totalClaimed >= TOTAL_SPOTS;
  const pct = Math.min(100, (totalClaimed / TOTAL_SPOTS) * 100);

  return (
    <GameLayout pageId="community-frens" label="Community Frens" color="#EF476F">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Community Frens
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Are you a holder of one of our partner communities?
          </p>

          {/* Global progress */}
          <div className="max-w-xs mx-auto mb-2">
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
              <span>{totalClaimed} / {TOTAL_SPOTS} claimed</span>
              <span className={globalFull ? 'text-red-500' : 'text-green-600'}>
                {globalFull ? 'Full' : `${TOTAL_SPOTS - totalClaimed} left`}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#EF476F]"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Community grid — display only */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-3 mb-8"
        >
          {COMMUNITIES.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm">
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] font-bold text-gray-500 text-center leading-tight">
                {c.name}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Single claim button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={openModal}
            disabled={globalFull || csvLoading}
            className={`w-full py-4 rounded-2xl text-base font-black text-white transition-transform active:scale-95 shadow-lg ${
              globalFull || csvLoading ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'
            }`}
            style={{ background: '#EF476F' }}
          >
            {csvLoading ? 'Loading…' : globalFull ? '🔒 All Spots Claimed' : 'Claim My Spot'}
          </button>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
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
              {/* Modal header */}
              <div className="h-24 flex items-center justify-center px-6" style={{ background: '#EF476F' }}>
                <h3 className="text-white font-black text-2xl" style={{ fontFamily: 'Georgia, serif' }}>
                  Claim Your Spot
                </h3>
                <button
                  onClick={close}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold transition"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {status === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl mx-auto mb-3">
                      🐌
                    </div>
                    <h4 className="text-lg font-black text-[#1a1a2e] mb-1">Spot Claimed!</h4>
                    <p className="text-sm text-gray-500 mb-5">
                      Your wallet is locked in. Welcome, fren!
                    </p>
                    <button
                      onClick={close}
                      className="px-6 py-2.5 rounded-xl text-sm font-black text-white"
                      style={{ background: '#EF476F' }}
                    >
                      Close
                    </button>
                  </motion.div>
                ) : (
                  <>
                    {/* Pick community */}
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                      Select Your Community
                    </p>
                    <div className="grid grid-cols-4 gap-2 mb-5">
                      {COMMUNITIES.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCommunity(c.id)}
                          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border-2 transition-all ${
                            selectedCommunity === c.id
                              ? 'border-[#EF476F] scale-105 shadow-md'
                              : 'border-transparent hover:border-gray-200'
                          }`}
                        >
                          <img
                            src={c.image}
                            alt={c.name}
                            className="w-full aspect-square rounded-lg object-cover"
                          />
                          <span className="text-[9px] font-bold text-gray-500 text-center leading-tight">
                            {c.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Wallet input */}
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
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-mono text-[#1a1a2e] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#EF476F] focus:ring-offset-2 transition"
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
                      disabled={!input || !selectedCommunity || status === 'checking' || status === 'submitting'}
                      className="w-full mt-4 py-3 rounded-xl text-sm font-black text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                      style={{ background: '#EF476F' }}
                    >
                      {status === 'checking' ? 'Checking…' : status === 'submitting' ? 'Claiming…' : 'Claim My Spot'}
                    </button>

                    <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
                      One claim per wallet. Must be on the eligibility list.
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