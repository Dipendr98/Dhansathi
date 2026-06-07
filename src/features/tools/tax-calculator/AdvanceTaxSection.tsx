import { useTaxStore } from '@/stores/taxStore';

export default function AdvanceTaxSection() {
  const adv = useTaxStore((s) => s.advanceTax);
  const setAdv = useTaxStore((s) => s.setAdvanceTax);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-4">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-emerald-600">receipt_long</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-on-surface">TDS & Advance Tax</h3>
          <p className="text-xs text-on-surface-variant">Taxes already paid or deducted at source</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
            TDS Deducted (Form 26AS)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={adv.tdsAlreadyDeducted || ''}
              onChange={(e) => setAdv({ tdsAlreadyDeducted: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
            TCS Collected
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={adv.tcsCollected || ''}
              onChange={(e) => setAdv({ tcsCollected: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
            Advance / Self-Assessment Tax
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={adv.advanceTaxPaid || ''}
              onChange={(e) => setAdv({ advanceTaxPaid: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
