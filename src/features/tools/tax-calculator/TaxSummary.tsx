import { useTaxStore } from '@/stores/taxStore';
import { calculateTax } from '@/lib/taxEngine';

const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function TaxSummary() {
  const profile = useTaxStore((s) => s.profile);
  const salary = useTaxStore((s) => s.salary);
  const deductions = useTaxStore((s) => s.deductions);

  const cg = useTaxStore((s) => s.capitalGains);
  const biz = useTaxStore((s) => s.business);
  const crypto = useTaxStore((s) => s.crypto);
  const fando = useTaxStore((s) => s.fando);
  const other = useTaxStore((s) => s.otherIncome);
  const hp = useTaxStore((s) => s.houseProperty);
  const adv = useTaxStore((s) => s.advanceTax);

  // Current Regime Result
  const result = calculateTax(profile, salary, deductions, cg, biz, crypto, fando, other, hp, adv);

  // Opposite Regime Result for Comparison
  const altProfile = { ...profile, regime: profile.regime === 'new' ? 'old' : 'new' } as const;
  const altResult = calculateTax(altProfile, salary, deductions, cg, biz, crypto, fando, other, hp, adv);

  const diff = altResult.totalTax - result.totalTax;
  const better = diff > 0 ? 'current' : diff < 0 ? 'alternative' : 'same';

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary-container to-primary-fixed rounded-2xl shadow-xl border border-primary/20 p-6 space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-3xl rounded-full" />
        
        <h3 className="font-bold text-xl text-on-primary-container flex items-center gap-2">
          <span className="material-symbols-outlined">receipt_long</span>
          Tax Computation ({profile.regime === 'new' ? 'New' : 'Old'} Regime)
        </h3>

        <div className="space-y-3 relative z-10">
          <div className="flex justify-between text-sm">
            <span className="text-on-primary-container/80">Gross Income</span>
            <span className="font-mono font-medium">{fmt(result.grossIncome)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-primary-container/80">Total Deductions & Exemptions</span>
            <span className="font-mono font-medium text-error">-{fmt(result.totalDeductions)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-primary/20 pt-3">
            <span className="text-on-primary-container">Taxable Income</span>
            <span className="font-mono text-primary">{fmt(result.taxableIncome)}</span>
          </div>
        </div>

        <div className="space-y-3 relative z-10 pt-4 border-t border-primary/20">
          <div className="flex justify-between text-sm">
            <span className="text-on-primary-container/80">Tax on Normal Income</span>
            <span className="font-mono font-medium">{fmt(result.baseTax)}</span>
          </div>
          {result.specialTax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-on-primary-container/80">Tax on Capital Gains</span>
              <span className="font-mono font-medium">{fmt(result.specialTax - (result.cryptoTax || 0))}</span>
            </div>
          )}
          {result.cryptoTax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-on-primary-container/80">Tax on Crypto / VDA (30%)</span>
              <span className="font-mono font-medium">{fmt(result.cryptoTax)}</span>
            </div>
          )}
          {result.rebate87a > 0 && (
            <div className="flex justify-between text-sm text-india-green">
              <span>Rebate u/s 87A</span>
              <span className="font-mono font-medium">-{fmt(result.rebate87a)}</span>
            </div>
          )}
          {result.marginalRelief > 0 && (
            <div className="flex justify-between text-sm text-india-green">
              <span>Marginal Relief</span>
              <span className="font-mono font-medium">-{fmt(result.marginalRelief)}</span>
            </div>
          )}
          {result.surcharge > 0 && (
            <div className="flex justify-between text-sm text-error">
              <span>Surcharge</span>
              <span className="font-mono font-medium">+{fmt(result.surcharge)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-on-primary-container/80">Health & Education Cess (4%)</span>
            <span className="font-mono font-medium">{fmt(result.cess)}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-t-2 border-primary/30 pt-4 mt-2">
            <div>
              <span className="block text-sm font-bold text-on-primary-container/80 uppercase tracking-widest">Total Tax Payable</span>
              <span className="text-xs text-on-primary-container/60">Effective Rate: {result.grossIncome > 0 ? ((result.totalTax / result.grossIncome) * 100).toFixed(1) : 0}%</span>
            </div>
            <span className="text-4xl font-headline font-black text-primary mt-2 sm:mt-0 tracking-tight">
              {fmt(result.totalTax)}
            </span>
          </div>
          
          {result.netTaxPayable !== result.totalTax && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center text-sm font-bold text-on-surface">
                <span>NET TAX DUE</span>
                <span className={`font-mono text-lg ${result.netTaxPayable < 0 ? 'text-india-green' : 'text-error'}`}>
                  {result.netTaxPayable < 0 ? `REFUND: ${fmt(Math.abs(result.netTaxPayable))}` : fmt(result.netTaxPayable)}
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-1">
                After adjusting TDS, TCS, and Advance Tax paid.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Winner Card */}
      <div className={`p-5 rounded-2xl border ${better === 'current' ? 'bg-india-green/10 border-india-green/30' : better === 'alternative' ? 'bg-amber-50 border-amber-200' : 'bg-surface-container border-outline-variant/20'}`}>
        <h4 className="font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">compare_arrows</span>
          Old vs New Regime
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl ${profile.regime === 'new' ? 'bg-white shadow-sm ring-2 ring-primary' : 'bg-white/50'}`}>
            <p className="text-xs font-semibold text-on-surface-variant uppercase">New Regime</p>
            <p className="font-mono font-bold text-xl mt-1">{fmt(profile.regime === 'new' ? result.totalTax : altResult.totalTax)}</p>
            {(better === 'current' && profile.regime === 'new') || (better === 'alternative' && profile.regime === 'old') ? <p className="text-[10px] font-bold text-india-green mt-1">✓ RECOMMENDED</p> : null}
          </div>
          <div className={`p-4 rounded-xl ${profile.regime === 'old' ? 'bg-white shadow-sm ring-2 ring-primary' : 'bg-white/50'}`}>
            <p className="text-xs font-semibold text-on-surface-variant uppercase">Old Regime</p>
            <p className="font-mono font-bold text-xl mt-1">{fmt(profile.regime === 'old' ? result.totalTax : altResult.totalTax)}</p>
            {(better === 'current' && profile.regime === 'old') || (better === 'alternative' && profile.regime === 'new') ? <p className="text-[10px] font-bold text-india-green mt-1">✓ RECOMMENDED</p> : null}
          </div>
        </div>
        <p className="text-sm mt-4 font-medium">
          {better === 'current' && `You are on the right regime! You save ${fmt(diff)} compared to ${altProfile.regime}.`}
          {better === 'alternative' && `⚠️ Switch to ${altProfile.regime === 'new' ? 'New' : 'Old'} Regime! You will save ${fmt(Math.abs(diff))}.`}
          {better === 'same' && 'Both regimes yield the exact same tax for your profile.'}
        </p>
      </div>

      {/* Download PDF Button */}
      <button
        type="button"
        onClick={() => window.print()}
        className="w-full py-4 bg-surface-container border border-outline-variant/30 hover:bg-surface-container-high hover:border-primary/50 text-on-surface font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] print-hidden shadow-sm"
      >
        <span className="material-symbols-outlined text-primary">download</span>
        Download Detailed Tax Report (PDF)
      </button>
    </div>
  );
}
