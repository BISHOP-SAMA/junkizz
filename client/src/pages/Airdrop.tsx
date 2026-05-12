import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameLayout from '../components/GameLayout';
import { ShellIcon } from '../components/ShellIcon';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { ASSETS } from '../lib/assets';

const BURN_COST = 4500;
const MAX_CLAIMS = 50;

interface AirdropClaim {
  id: string;
  user_id: string;
  twitter_handle: string;
  evm_wallet: string | null;
  burned_at: string;
}

function WalletModal({ isOpen, onClose, onSubmit, loading }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (wallet: string) => void;
  loading: boolean;
}) {
  const [wallet, setWallet] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setWallet('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const trimmed = wallet.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      setError('Enter a valid EVM address (0x + 40 chars)');
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
              <h3 className="text-sm font-black" style={{ color: '#1a1a2e' }}>Submit Wallet</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: '#f4f4f4', color: '#888' }}>×</button>
            </div>

            <p className="text-xs text-gray-400">
              Enter your EVM wallet address to receive the Season 1 airdrop.
            </p>

            <input
              type="text"
              value={wallet}
              onChange={e => setWallet(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2.5 rounded-xl text-sm font-mono"
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
              {loading ? 'Claiming...' : 'Confirm & Claim Spot'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Airdrop() {
  const { user, refreshProfile } = useAuth();
  const [claims, setClaims] = useState<AirdropClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [burning, setBurning] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [error, setError] = useState('');
  const [justClaimed, setJustClaimed] = useState(false);

  useEffect(() => {
    loadClaims();
    const channel = supabase
      .channel('airdrop_claims')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'airdrop_claims' }, () => loadClaims())
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  const loadClaims = async () => {
    const { data, error } = await supabase
      .from('airdrop_claims')
      .select('*')
      .order('burned_at', { ascending: true });
    if (!error && data) setClaims(data);
    setLoading(false);
  };

  const hasClaimed = user ? claims.some(c => c.user_id === user.id) : false;
  const claimCount = claims.length;
  const remaining = MAX_CLAIMS - claimCount;
  const userShells = user?.shells_balance ?? 0;
  const canBurn = user && userShells >= BURN_COST && !hasClaimed && claimCount < MAX_CLAIMS;

  const handleBurnClick = () => {
    if (!canBurn || burning) return;
    setShowWalletModal(true);
  };

  const handleWalletSubmit = async (wallet: string) => {
    if (!user) return;
    setBurning(true);
    setError('');

    try {
      // Verify shells
      const { data: freshUser } = await supabase
        .from('users')
        .select('shells_balance')
        .eq('id', user.id)
        .single();

      if (!freshUser || freshUser.shells_balance < BURN_COST) {
        setError('Not enough shells!');
        setBurning(false);
        return;
      }

      // Deduct shells
      const newBalance = freshUser.shells_balance - BURN_COST;
      const { error: updateErr } = await supabase
        .from('users')
        .update({ shells_balance: newBalance })
        .eq('id', user.id);

      if (updateErr) throw updateErr;

      // Record claim with wallet
      const { error: claimErr } = await supabase
        .from('airdrop_claims')
        .insert({
          user_id: user.id,
          twitter_handle: user.twitter_handle || 'unknown',
          evm_wallet: wallet,
        });

      if (claimErr) {
        if (claimErr.code === '23505') {
          setError('You already claimed!');
        } else {
          throw claimErr;
        }
        setBurning(false);
        return;
      }

      setShowWalletModal(false);
      setJustClaimed(true);
      refreshProfile();
      setTimeout(() => setJustClaimed(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Claim failed. Try again.');
    } finally {
      setBurning(false);
    }
  };

  return (
    <GameLayout pageId="airdrop" label="Airdrop" color="#8B5CF6">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-24">

        {/* Hero Chest */}
        <div className="relative p-6 rounded-3xl text-center" style={{ background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)', boxShadow: '0 8px 0 #6d28d9' }}>
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-32 h-32 mx-auto mb-4 rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 20px 60px rgba(139,92,246,0.4)' }}
          >
            <img src={ASSETS.airdropChest} alt="airdrop chest" className="w-full h-full object-cover" />
          </motion.div>
          <h2 className="text-2xl font-black text-white mb-1">Season 1 Airdrop</h2>
          <p className="text-xs text-white/60 font-bold uppercase tracking-widest">First come, first served</p>
        </div>

        {/* Live Counter */}
        <div className="p-4 rounded-2xl text-center" style={{ background: 'white', border: '1.5px solid rgba(139,92,246,0.2)', boxShadow: '0 2px 12px rgba(139,92,246,0.08)' }}>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: '#aaa' }}>Claims Live</div>
          <div className="flex items-center justify-center gap-1 mb-2">
            <span className="text-4xl font-black" style={{ color: '#8B5CF6', fontFamily: 'monospace' }}>{claimCount}</span>
            <span className="text-xl font-bold" style={{ color: '#ccc' }}>/</span>
            <span className="text-2xl font-black" style={{ color: '#aaa' }}>{MAX_CLAIMS}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(claimCount / MAX_CLAIMS) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)' }}
            />
          </div>
          <div className="text-xs font-bold" style={{ color: remaining > 0 ? '#8B5CF6' : '#EF476F' }}>
            {remaining > 0 ? `${remaining} spots remaining` : 'All claimed! 🎉'}
          </div>
        </div>

        {/* Recent Claimers */}
        {claims.length > 0 && (
          <div className="p-4 rounded-2xl" style={{ background: 'white', border: '1.5px solid rgba(139,92,246,0.12)' }}>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: '#aaa' }}>Recent Claimers</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              <AnimatePresence>
                {claims.slice(-10).reverse().map((claim, i) => (
                  <motion.div
                    key={claim.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl"
                    style={{ background: i === 0 && justClaimed ? 'rgba(139,92,246,0.08)' : '#f9f9f9' }}
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black" style={{ background: '#8B5CF6', color: 'white' }}>
                      #{claims.findIndex(c => c.id === claim.id) + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black truncate" style={{ color: '#1a1a2e' }}>@{claim.twitter_handle}</div>
                      <div className="text-[9px] font-mono truncate" style={{ color: '#aaa' }}>
                        {claim.evm_wallet ? `${claim.evm_wallet.slice(0, 6)}...${claim.evm_wallet.slice(-4)}` : 'No wallet'}
                      </div>
                    </div>
                    <div className="text-[10px] font-bold" style={{ color: '#8B5CF6' }}>-{BURN_COST.toLocaleString()}🐚</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Burn Section */}
        {user && (
          <div className="p-4 rounded-2xl" style={{ background: 'white', border: '1.5px solid rgba(139,92,246,0.15)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-black" style={{ color: '#1a1a2e' }}>Burn to Claim</div>
              <div className="flex items-center gap-1 text-xs font-bold" style={{ color: '#8B5CF6' }}>
                <ShellIcon size={14} />
                {BURN_COST.toLocaleString()} 🐚
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3 p-3 rounded-xl" style={{ background: '#fafafa', border: '1px solid #ececec' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)' }}>
                <ShellIcon size={20} color="#8B5CF6" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold" style={{ color: '#1a1a2e' }}>Your Balance</div>
                <div className="text-[10px]" style={{ color: '#888' }}>{userShells.toLocaleString()} shells available</div>
              </div>
              <div className="text-xs font-black" style={{ color: userShells >= BURN_COST ? '#06D6A0' : '#EF476F' }}>
                {userShells >= BURN_COST ? '✓ Enough' : '✗ Need more'}
              </div>
            </div>

            {hasClaimed ? (
              <div className="p-3 rounded-xl text-center text-sm font-black" style={{ background: 'rgba(6,214,160,0.08)', color: '#048a67', border: '1.5px solid rgba(6,214,160,0.2)' }}>
                🎉 You've claimed! #{claims.findIndex(c => c.user_id === user.id) + 1}/50
                {claims.find(c => c.user_id === user.id)?.evm_wallet && (
                  <div className="text-[10px] font-mono mt-1 opacity-60">
                    {claims.find(c => c.user_id === user.id)?.evm_wallet?.slice(0, 6)}...{claims.find(c => c.user_id === user.id)?.evm_wallet?.slice(-4)}
                  </div>
                )}
              </div>
            ) : claimCount >= MAX_CLAIMS ? (
              <div className="p-3 rounded-xl text-center text-sm font-black" style={{ background: 'rgba(239,71,111,0.08)', color: '#EF476F', border: '1.5px solid rgba(239,71,111,0.2)' }}>
                All 50 spots claimed. Better luck next season!
              </div>
            ) : (
              <motion.button
                whileHover={canBurn ? { scale: 1.02 } : {}}
                whileTap={canBurn ? { scale: 0.97 } : {}}
                onClick={handleBurnClick}
                disabled={!canBurn || burning}
                className="w-full py-3 rounded-xl text-sm font-black text-white"
                style={{
                  background: canBurn ? 'linear-gradient(135deg, #8B5CF6, #A78BFA)' : '#eee',
                  boxShadow: canBurn ? '0 4px 0 #6d28d9' : 'none',
                  color: canBurn ? 'white' : '#bbb',
                  cursor: canBurn ? 'pointer' : 'not-allowed',
                }}
              >
                {burning ? 'Processing...' : `Burn ${BURN_COST.toLocaleString()} Shells & Claim Spot`}
              </motion.button>
            )}

            {error && (
              <div className="mt-2 text-[10px] font-bold text-center" style={{ color: '#EF476F' }}>
                {error}
              </div>
            )}
          </div>
        )}

        <div className="text-center">
          <p className="text-[10px] text-gray-400 max-w-xs mx-auto">
            First 50 players to burn {BURN_COST.toLocaleString()} shells secure a guaranteed Season 1 airdrop allocation.
          </p>
        </div>
      </div>

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => { if (!burning) setShowWalletModal(false); }}
        onSubmit={handleWalletSubmit}
        loading={burning}
      />
    </GameLayout>
  );
}
