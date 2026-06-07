import { useTaxStore } from '@/stores/taxStore';

export default function OtherIncomeSection() {
  const other = useTaxStore((s) => s.otherIncome);
  const setOther = useTaxStore((s) => s.setOtherIncome);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-4">
        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-secondary">account_balance</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-on-surface">Income from Other Sources</h3>
          <p className="text-xs text-on-surface-variant">Savings, FDs, and Dividends</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
            Savings Bank Interest
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={other.savingsInterest || ''}
              onChange={(e) => setOther({ savingsInterest: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
            FD & Post Office Interest
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={other.fdInterest || ''}
              onChange={(e) => setOther({ fdInterest: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
            Dividends Received
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={other.dividend || ''}
              onChange={(e) => setOther({ dividend: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
            Other Income (Gifts, Lottery)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={other.other || ''}
              onChange={(e) => setOther({ other: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
