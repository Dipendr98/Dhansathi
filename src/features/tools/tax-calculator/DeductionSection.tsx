import { useTaxStore } from '@/stores/taxStore';

export default function DeductionSection() {
  const profile = useTaxStore((s) => s.profile);
  const deductions = useTaxStore((s) => s.deductions);
  const setDeductions = useTaxStore((s) => s.setDeductions);

  if (profile.regime === 'new') {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">savings</span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-on-surface">Deductions (New Regime)</h3>
            <p className="text-xs text-on-surface-variant">Only specific deductions allowed</p>
          </div>
        </div>
        
        <div className="bg-error/10 p-4 rounded-xl border border-error/20 flex gap-3">
          <span className="material-symbols-outlined text-error">warning</span>
          <p className="text-sm text-error font-medium">
            Under the New Tax Regime, major deductions like 80C (PPF/ELSS), 80D (Health Insurance), and Home Loan Interest are <strong>NOT allowed</strong>. Only standard deduction and Employer NPS are considered.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">
            Employer NPS Contribution - 80CCD(2)
          </label>
          <div className="relative max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={deductions.sec80ccd2 || ''}
              onChange={(e) => setDeductions({ sec80ccd2: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  const inputs = [
    { key: 'sec80c', label: 'Section 80C', desc: 'PPF, ELSS, EPF, LIC, Tuition Fees (Max ₹1.5L)' },
    { key: 'sec80d', label: 'Section 80D', desc: 'Health Insurance Premium' },
    { key: 'sec80ccd1b', label: 'NPS 80CCD(1B)', desc: 'Extra NPS Contribution (Max ₹50K)' },
    { key: 'sec24b', label: 'Home Loan Interest', desc: 'Section 24(b) - Self Occupied (Max ₹2L)' },
    { key: 'sec80tta', label: 'Section 80TTA', desc: 'Savings A/C Interest (Max ₹10K)' },
    { key: 'sec80g', label: 'Section 80G', desc: 'Charitable Donations' },
  ] as const;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">savings</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-on-surface">Tax Deductions (Old Regime)</h3>
          <p className="text-xs text-on-surface-variant">Chapter VI-A and Home Loan Deductions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {inputs.map(({ key, label, desc }) => (
          <div key={key}>
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
              {label}
            </label>
            <span className="text-[10px] text-on-surface-variant mb-2 block">{desc}</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
              <input
                type="number"
                min="0"
                value={deductions[key] || ''}
                onChange={(e) => setDeductions({ [key]: Number(e.target.value) })}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
