import { useTaxStore } from '@/stores/taxStore';

export default function StockTraderSection() {
  const profile = useTaxStore((s) => s.profile);
  const fando = useTaxStore((s) => s.fando);
  const setFAndO = useTaxStore((s) => s.setFAndO);

  if (profile.userType !== 'Trader' && profile.userType !== 'Business') return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">candlestick_chart</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-on-surface">F&O and Intraday Trading</h3>
          <p className="text-xs text-on-surface-variant">Treated as Business Income</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
            Trading Turnover
          </label>
          <span className="text-[10px] text-on-surface-variant mb-2 block">Absolute sum of positive and negative differences.</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={fando.turnover || ''}
              onChange={(e) => setFAndO({ turnover: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
            Net Trading Profit
          </label>
          <span className="text-[10px] text-on-surface-variant mb-2 block">Gross profit from F&O and Intraday.</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={fando.netProfit || ''}
              onChange={(e) => setFAndO({ netProfit: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
            Brokerage & Expenses
          </label>
          <span className="text-[10px] text-on-surface-variant mb-2 block">Brokerage, STT, Exchange charges, Internet.</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={fando.expenses || ''}
              onChange={(e) => setFAndO({ expenses: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>
      </div>

      {fando.turnover > 10000000 && (
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3 mt-4">
          <span className="material-symbols-outlined text-amber-700">error</span>
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong>Tax Audit Alert:</strong> Your trading turnover exceeds ₹1 Crore. If less than 5% of transactions are in cash (digital trading), the limit is ₹10 Crore. Ensure you consult a CA.
          </p>
        </div>
      )}
    </div>
  );
}
