import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ShoppingBag, X, Receipt } from 'lucide-react';
import { PurchaseStatusBadge, PurchaseStatus } from './admin/PurchaseStatusBadge';

const TABS: { label: string; value: 'all' | PurchaseStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export function StudentPurchaseDropdown({
  purchases,
  loading,
  onClose,
  isMobile,
}: {
  purchases: any[];
  loading: boolean;
  onClose: () => void;
  isMobile?: boolean;
}) {
  const [tab, setTab] = useState<'all' | PurchaseStatus>('all');
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or escape
  useEffect(() => {
    function handle(e: MouseEvent | KeyboardEvent) {
      if (e instanceof MouseEvent && ref.current && !ref.current.contains(e.target as Node)) onClose();
      if (e instanceof KeyboardEvent && e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', handle);
    };
  }, [onClose]);

  const filtered = tab === 'all' ? purchases : purchases.filter(p => p.status === tab);

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-[6px] transition-opacity duration-300" onClick={onClose}>
        <div
          className="w-full max-w-md bg-gradient-to-br from-cyan-900/90 via-blue-900/90 to-teal-900/90 rounded-t-3xl md:rounded-2xl border-2 border-cyan-500/40 p-0 animate-in fade-in relative max-h-[90vh] flex flex-col neon-glow modal-depth"
          style={{ boxShadow: '0 0 32px 4px rgba(0,255,255,0.18), 0 0 0 2px #22d3ee, 0 4px 32px 0 rgba(0,0,0,0.45) inset' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-2 rounded-t-3xl">
            <div className="flex items-center gap-2">
              <Receipt className="w-6 h-6 text-cyan-300 drop-shadow-glow" />
              <span className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-cyan-300 via-blue-400 to-teal-300 bg-clip-text text-transparent font-['Orbitron',_Montserrat,_Poppins,_sans-serif] select-none">Your Purchases</span>
            </div>
            <button
              onClick={onClose}
              className="text-cyan-200 hover:text-cyan-100 transition text-xl rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              style={{ boxShadow: 'none' }}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 animate-gradient-x rounded-b-xl shadow-cyan-glow" />
          <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-cyan-800">
            {TABS.map(t => (
              <button
                key={t.value}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 ${tab === t.value ? 'bg-cyan-700/80 text-white' : 'bg-cyan-950/80 text-cyan-100 hover:bg-cyan-800/30'}`}
                onClick={() => setTab(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-cyan-800 bg-cyan-900/80">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-cyan-200 animate-pulse">
                <Loader2 className="animate-spin mb-2 text-cyan-300" />
                Loading your purchases...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-cyan-400">
                <ShoppingBag className="h-10 w-10 mb-2 text-cyan-400/60" />
                <div className="text-lg font-semibold mb-1">No purchases</div>
                <div className="text-sm">You haven't redeemed any rewards yet.</div>
              </div>
            ) : (
              filtered.map((purchase) => (
                <div key={purchase.id} className="flex items-center gap-3 px-4 py-4 hover:bg-cyan-900/40 transition group">
                  {purchase.products?.image_url ? (
                    <img src={purchase.products.image_url} alt={purchase.products.name} className="w-14 h-14 rounded-xl object-cover bg-cyan-950/80 border-2 border-cyan-800/40 shadow group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-cyan-950/80 flex items-center justify-center border-2 border-cyan-800/40">
                      <ShoppingBag className="w-7 h-7 text-cyan-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-cyan-100 truncate text-base">{purchase.products?.name}</div>
                    <div className="text-xs text-cyan-300 font-mono">{new Date(purchase.created_at).toLocaleString()}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-cyan-300 font-bold text-sm">-{purchase.points_spent} pts</span>
                      <PurchaseStatusBadge status={purchase.status} />
                      {purchase.status === 'pending' && <span className="ml-1 animate-pulse text-yellow-300 text-xs">• processing</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <style>{`
            @keyframes gradient-x { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
            .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 6s ease-in-out infinite; }
          `}</style>
        </div>
      </div>
    );
  }
  // Desktop dropdown (default)
  return (
    <div
      ref={ref}
      className="absolute right-0 mt-2 w-96 max-w-[95vw] rounded-3xl z-50 p-0 overflow-hidden animate-in fade-in bg-gradient-to-br from-cyan-900/90 via-blue-900/90 to-teal-900/90 border-2 border-cyan-500/40 backdrop-blur-xl"
      style={{ minWidth: 320 }}
    >
      <div className="p-4 border-b border-cyan-800 bg-gradient-to-r from-cyan-900/80 to-blue-900 flex items-center justify-between rounded-t-3xl">
        <span className="text-2xl font-extrabold bg-gradient-to-r from-cyan-300 via-blue-400 to-teal-300 bg-clip-text text-transparent font-['Orbitron',_Montserrat,_Poppins,_sans-serif] tracking-wide">Your Purchases</span>
        <button onClick={onClose} className="text-cyan-300 hover:text-cyan-100 transition"><X className="w-5 h-5" /></button>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 animate-gradient-x rounded-b-xl" />
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-cyan-800">
        {TABS.map(t => (
          <button
            key={t.value}
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 ${tab === t.value ? 'bg-cyan-700/80 text-white' : 'bg-cyan-950/80 text-cyan-100 hover:bg-cyan-800/30'}`}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-cyan-800 bg-cyan-900/80">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-cyan-200 animate-pulse">
            <Loader2 className="animate-spin mb-2 text-cyan-300" />
            Loading your purchases...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-cyan-400">
            <ShoppingBag className="h-10 w-10 mb-2 text-cyan-400/60" />
            <div className="text-lg font-semibold mb-1">No purchases</div>
            <div className="text-sm">You haven't redeemed any rewards yet.</div>
          </div>
        ) : (
          filtered.map((purchase) => (
            <div key={purchase.id} className="flex items-center gap-3 px-4 py-4 hover:bg-cyan-900/40 transition group">
              {purchase.products?.image_url ? (
                <img src={purchase.products.image_url} alt={purchase.products.name} className="w-14 h-14 rounded-xl object-cover bg-cyan-950/80 border-2 border-cyan-800/40 shadow group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-cyan-950/80 flex items-center justify-center border-2 border-cyan-800/40">
                  <ShoppingBag className="w-7 h-7 text-cyan-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-cyan-100 truncate text-base">{purchase.products?.name}</div>
                <div className="text-xs text-cyan-300 font-mono">{new Date(purchase.created_at).toLocaleString()}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-cyan-300 font-bold text-sm">-{purchase.points_spent} pts</span>
                  <PurchaseStatusBadge status={purchase.status} />
                  {purchase.status === 'pending' && <span className="ml-1 animate-pulse text-yellow-300 text-xs">• processing</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <style>{`
        @keyframes gradient-x { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
} 