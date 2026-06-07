import { useTaxStore } from '@/stores/taxStore';
import { CustomSelect } from '@/components/shared/CustomSelect';

export default function BusinessSection() {
  const profile = useTaxStore((s) => s.profile);
  const biz = useTaxStore((s) => s.business);
  const setBiz = useTaxStore((s) => s.setBusiness);

  if (profile.userType !== 'Business' && profile.userType !== 'Freelancer') return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-4">
        <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-saffron">storefront</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-on-surface">Business & Profession</h3>
          <p className="text-xs text-on-surface-variant">Turnover, Presumptive Taxation, and Expenses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
            Gross Receipts / Turnover
          </label>
          <span className="text-[10px] text-on-surface-variant mb-2 block">Total yearly sales or professional income.</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={biz.grossReceipts || ''}
              onChange={(e) => setBiz({ grossReceipts: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center mt-6">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={biz.presumptive}
              onChange={(e) => setBiz({ presumptive: e.target.checked })}
              className="w-5 h-5 text-primary rounded border-outline-variant focus:ring-primary"
            />
            <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
              Opt for Presumptive Taxation (44AD / 44ADA)
            </span>
          </label>
          <p className="text-xs text-on-surface-variant mt-1 ml-8">Declare income as a fixed % of turnover. No audit required.</p>
        </div>
      </div>

      {biz.presumptive ? (
        <div className="bg-saffron/5 p-5 rounded-xl border border-saffron/20 mt-4">
          <label className="text-xs font-semibold text-saffron-dark uppercase tracking-wider block mb-2">
            Presumptive Profit Margin (%)
          </label>
          <div className="max-w-xs">
            <CustomSelect
              value={String(biz.presumptiveRate)}
              onChange={(v) => setBiz({ presumptiveRate: Number(v) })}
              options={[
                { value: '50', label: '50% (Professionals 44ADA)' },
                { value: '8', label: '8% (Cash Business 44AD)' },
                { value: '6', label: '6% (Digital Business 44AD)' },
              ]}
            />
          </div>
          <p className="text-sm font-medium mt-4">
            Declared Profit: <span className="font-mono text-primary font-bold">₹{Math.round(biz.grossReceipts * (biz.presumptiveRate / 100)).toLocaleString('en-IN')}</span>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
              Business Expenses
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
              <input
                type="number"
                min="0"
                value={biz.expenses || ''}
                onChange={(e) => setBiz({ expenses: Number(e.target.value) })}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
              Depreciation
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
              <input
                type="number"
                min="0"
                value={biz.depreciation || ''}
                onChange={(e) => setBiz({ depreciation: Number(e.target.value) })}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm font-medium mt-1">
              Net Profit: <span className="font-mono text-primary font-bold">₹{Math.max(0, biz.grossReceipts - biz.expenses - biz.depreciation).toLocaleString('en-IN')}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
