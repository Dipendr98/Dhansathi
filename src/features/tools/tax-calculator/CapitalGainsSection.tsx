import { useTaxStore } from '@/stores/taxStore';

export default function CapitalGainsSection() {
  const cg = useTaxStore((s) => s.capitalGains);
  const setCG = useTaxStore((s) => s.setCapitalGains);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">monitoring</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-on-surface">Capital Gains</h3>
          <p className="text-xs text-on-surface-variant">Stocks, Mutual Funds, and Real Estate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
            STCG on Equity (111A)
          </label>
          <span className="text-[10px] text-on-surface-variant mb-2 block">Listed stocks/equity MFs held {'<'} 1 year. Taxed at 20%.</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={cg.stcgEquity111A || ''}
              onChange={(e) => setCG({ stcgEquity111A: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
            LTCG on Equity (112A)
          </label>
          <span className="text-[10px] text-on-surface-variant mb-2 block">Listed stocks held {'>'} 1 year. 12.5% above ₹1.25L.</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={cg.ltcgEquity112A || ''}
              onChange={(e) => setCG({ ltcgEquity112A: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
            Other STCG
          </label>
          <span className="text-[10px] text-on-surface-variant mb-2 block">Debt funds, unlisted shares, gold. Added to slab income.</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={cg.stcgOther || ''}
              onChange={(e) => setCG({ stcgOther: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
            Other LTCG
          </label>
          <span className="text-[10px] text-on-surface-variant mb-2 block">Real estate, unlisted shares. Taxed at 12.5%.</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={cg.ltcgOther || ''}
              onChange={(e) => setCG({ ltcgOther: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 flex items-start gap-3 mt-4">
        <span className="material-symbols-outlined text-primary">info</span>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          <strong>Important:</strong> Under both regimes, LTCG under section 112A (Equity) is <strong>NOT eligible</strong> for the ₹25k / ₹12.5k tax rebate (Section 87A). 
          Also, LTCG on equity is tax-free up to ₹1,25,000 per year.
        </p>
      </div>
    </div>
  );
}
