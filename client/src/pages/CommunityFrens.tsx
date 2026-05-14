import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameLayout from '../components/GameLayout';
import { ASSETS } from '../lib/assets';
import { supabase } from '../lib/supabase';

/* ------------------------------------------------------------------ */
/*  Community data                                                    */
/* ------------------------------------------------------------------ */

type Community = {
  id: string;
  name: string;
  image: string;
  color: string;
};

const COMMUNITIES: Community[] = [
  { id: 'delmundos', name: 'DelMundos', image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Delmundos.jpg', color: '#EF476F' },
  { id: 'froge-69mg', name: 'FROGE 69mg', image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/FROGE69mg.jpg', color: '#06D6A0' },
  { id: 'funkari', name: 'Funkari', image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Funkari.jpg', color: '#FFD166' },
  { id: 'fwogs', name: 'Fwogs', image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Fwogs.jpg', color: '#118AB2' },
  { id: 'giraffes', name: 'Giraffes', image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Giraffies.jpg', color: '#073B4C' },
  { id: 'goblynz', name: 'Goblynz', image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Goblynz.jpg', color: '#9D4EDD' },
  { id: 'normies', name: 'Normies', image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Normies.jpg', color: '#FF9F1C' },
  { id: 'penguish', name: 'Penguish', image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Penguish.jpg', color: '#2EC4B6' },
  { id: 'slonks', name: 'Slonks', image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Slonks.jpg', color: '#E71D36' },
  { id: 'the-florentines', name: 'The Florentines', image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/The-Florentines.jpg', color: '#662E9B' },
  { id: 'theorem', name: 'Theorem', image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Theorem.jpg', color: '#F86624' },
  { id: 'zorgz', name: 'Zorgz', image: 'https://lbcnvlvdrjsnpvxxqzzp.supabase.co/storage/v1/object/public/Planetslog/Communities/Zorgz.jpg', color: '#43AA8B' },
];

const TOTAL_SPOTS = 300;
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTgKmB-kwiKyh7Xeo-JOmwcmdfNi99LMXCl5_RoypTknt419Io5w84rr41HffgdNOz2pxkTVHXBnqzP/pub?output=csv';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr.trim());

const parseCSV = (text: string): Set<string> => {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const addresses = new Set<string>();
  for (const line of lines) {
    const cols = line.split(',');
    for (const col of cols) {
      const clean = col.trim().toLowerCase();
      if (isValidAddress(clean)) addresses.add(clean);
    }
  }
  return addresses;
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function CommunityFrens() {
  const [claims, setClaims] = useState<<Record<string, number>>({});
  const [csvAddresses, setCsvAddresses] = useState<<Set<string> | null>(null);
  const [loadingCSV, setLoadingCSV] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeCommunity, setActiveCommunity] = useState<<Community | null>(null);
  const [walletInput, setWalletInput] = useState('');
  const [claimStatus, setClaimStatus] = useState<'idle' | 'checking' | 'eligible' | 'ineligible' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  /* ---- Load CSV whitelist ---- */
  useEffect(() => {
    fetch(CSV_URL)
      .then((r) => r.text())
      .then((text) => {
        setCsvAddresses(parseCSV(text));
        setLoadingCSV(false);
      })
      .catch(() => {
        setLoadingCSV(false);
        setErrorMsg('Could not load eligibility list. Try again later.');
      });
  }, []);

  /* ---- Load claim counts from Supabase ---- */
  const fetchClaimCounts = useCallback(async () => {
    const { data, error } = await supabase
      .from('community_claims')
      .select('community_id');
    if (error || !data) return;

    const counts: Record<string, number> = {};
    for (const c of COMMUNITIES) counts[c.id] = 0;
    for (const row of data) {
      if (counts[row.community_id] !== undefined) counts[row.community_id]++;
    }
    setClaims(counts);
  }, []);

  useEffect(() => {
    fetchClaimCounts();
  }, [fetchClaimCounts]);

  /* ---- Claim handler ---- */
  const handleClaim = async () => {
    if (!activeCommunity || !csvAddresses) return;
    const addr = walletInput.trim().toLowerCase();

    if (!isValidAddress(addr)) {
      setClaimStatus('error');
      setErrorMsg('Invalid wallet address format.');
      return;
    }

    setClaimStatus('checking');
    await new Promise((r) => setTimeout(r, 400)); // tiny UX delay

    if (!csvAddresses.has(addr)) {
      setClaimStatus('ineligible');
      setErrorMsg('This address is not on the eligibility list.');
      return;
    }

    // Check if already claimed in this community
    const { data: existing } = await supabase
      .from('community_claims')
      .select('id')
      .eq('community_id', activeCommunity.id)
      .eq('wallet_address', addr)
      .maybeSingle();

    if (existing) {
      setClaimStatus('error');
      setErrorMsg('You already claimed a spot in this community.');
      return;
    }

    setClaimStatus('submitting');
    const { error } = await supabase
      .from('community_claims')
      .insert({ community_id: activeCommunity.id, wallet_address: addr });

    if (error) {
      setClaimStatus('error');
      setErrorMsg(error.message);
      return;
    }

    setClaimStatus('success');
    setClaims((prev) => ({
      ...prev,
      [activeCommunity.id]: (prev[activeCommunity.id] || 0) + 1,
    }));
  };

  const openModal = (community: Community) => {
    setActiveCommunity(community);
    setWalletInput('');
    setClaimStatus('idle');
    setErrorMsg('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setActiveCommunity(null), 300);
  };

  const progressPct = (id: string) =>
    Math.min(100, ((claims[id] || 0) / TOTAL_SPOTS) * 100);

  return (
    <GameLayout pageId="community-frens" label="Community Frens" color="#EF476F">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h1
            className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-3"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Community Frens
          </h1>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            300 spots per community. Paste your wallet to claim if you’re on the list.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {COMMUNITIES.map((c, i) => {
            const claimed = claims[c.id] || 0;
            const isFull = claimed >= TOTAL_SPOTS;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="relative group rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{ background: `linear-gradient(to top, ${c.color}, transparent)` }}
                  />
                  <div className="absolute bottom-2 left-3">
                    <span
                      className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black text-white uppercase tracking-wider"
                      style={{ background: c.color }}
                    >
                      {c.name}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  {/* Progress */}
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1.5">
                    <span>{claimed} / {TOTAL_SPOTS} claimed</span>
                    <span className={isFull ? 'text-red-500' : 'text-green-600'}>
                      {isFull ? 'Full' : `${TOTAL_SPOTS - claimed} left`}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden mb-4">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: c.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct(c.id)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => openModal(c)}
                    disabled={isFull || loadingCSV}
                    className={`w-full py-2.5 rounded-xl text-sm font-black text-white transition-transform active:scale-95 ${
                      isFull || loadingCSV ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'
                    }`}
                    style={{ background: c.color }}
                  >
                    {loadingCSV ? 'Loading…' : isFull ? 'Sold Out' : 'Claim Spot'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Claim Modal */}
      <AnimatePresence>
        {modalOpen && activeCommunity && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeModal}
            />

            {/* Card */}
            <motion.div
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              {/* Header bar */}
              <div
                className="h-24 flex items-end p-5"
                style={{ background: activeCommunity.color }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={activeCommunity.image}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <h3 className="text-white font-black text-lg leading-tight">
                      {activeCommunity.name}
                    </h3>
                    <p className="text-white/80 text-xs font-bold">
                      {claims[activeCommunity.id] || 0} / {TOTAL_SPOTS} claimed
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold transition"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {claimStatus === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl mx-auto mb-3">
                      🎉
                    </div>
                    <h4 className="text-lg font-black text-[#1a1a2e] mb-1">Spot Claimed!</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Your address has been recorded for <strong>{activeCommunity.name}</strong>.
                    </p>
                    <button
                      onClick={closeModal}
                      className="px-6 py-2.5 rounded-xl text-sm font-black text-white"
                      style={{ background: activeCommunity.color }}
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
                      value={walletInput}
                      onChange={(e) => {
                        setWalletInput(e.target.value);
                        if (claimStatus === 'error' || claimStatus === 'ineligible') {
                          setClaimStatus('idle');
                          setErrorMsg('');
                        }
                      }}
                      placeholder="0x..."
                      disabled={claimStatus === 'submitting'}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-mono text-[#1a1a2e] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 transition"
                      style={{ '--tw-ring-color': activeCommunity.color } as React.CSSProperties}
                    />

                    {/* Status messages */}
                    <AnimatePresence mode="wait">
                      {claimStatus === 'ineligible' && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-red-500 font-bold mt-2"
                        >
                          {errorMsg}
                        </motion.p>
                      )}
                      {claimStatus === 'error' && (
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
                      disabled={
                        !walletInput ||
                        claimStatus === 'checking' ||
                        claimStatus === 'submitting'
                      }
                      className="w-full mt-4 py-3 rounded-xl text-sm font-black text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                      style={{ background: activeCommunity.color }}
                    >
                      {claimStatus === 'checking'
                        ? 'Checking eligibility…'
                        : claimStatus === 'submitting'
                        ? 'Claiming…'
                        : 'Claim My Spot'}
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
