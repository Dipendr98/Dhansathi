import { useTaxStore } from '@/stores/taxStore';
import { CustomSelect } from '@/components/shared/CustomSelect';

export default function HousePropertySection() {
  const hp = useTaxStore((s) => s.houseProperty);
  const setHp = useTaxStore((s) => s.setHouseProperty);
  const profile = useTaxStore((s) => s.profile);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">real_estate_agent</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-on-surface">Income from House Property</h3>
          <p className="text-xs text-on-surface-variant">Rental Income & Home Loan Interest</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
          Property Type
        </label>
        <div className="max-w-xs">
          <CustomSelect
            value={hp.propertyType}
            onChange={(val) => setHp({ propertyType: val as 'Self-Occupied' | 'Let-Out' })}
            options={[
              { value: 'Self-Occupied', label: 'Self-Occupied' },
              { value: 'Let-Out', label: 'Let-Out (Rented)' },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {hp.propertyType === 'Let-Out' && (
          <>
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
                Gross Annual Rent Received
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
                <input
                  type="number"
                  min="0"
                  value={hp.grossRent || ''}
                  onChange={(e) => setHp({ grossRent: Number(e.target.value) })}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
                Municipal Taxes Paid
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
                <input
                  type="number"
                  min="0"
                  value={hp.propertyTaxes || ''}
                  onChange={(e) => setHp({ propertyTaxes: Number(e.target.value) })}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
            Interest on Home Loan (Sec 24b)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={hp.homeLoanInterest || ''}
              onChange={(e) => setHp({ homeLoanInterest: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>
      </div>

      {hp.propertyType === 'Let-Out' && (
        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex items-start gap-3 mt-4">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            <strong>Smart AI Check:</strong> A flat <strong>30% Standard Deduction</strong> (₹{Math.max(0, (hp.grossRent - hp.propertyTaxes) * 0.30).toLocaleString('en-IN')}) has been automatically applied to your Net Annual Value under Section 24(a) to cover repairs and maintenance. No receipts needed!
          </p>
        </div>
      )}

      {hp.propertyType === 'Self-Occupied' && profile.regime === 'new' && hp.homeLoanInterest > 0 && (
        <div className="bg-error/5 p-4 rounded-xl border border-error/20 flex items-start gap-3 mt-4">
          <span className="material-symbols-outlined text-error">warning</span>
          <p className="text-xs text-error leading-relaxed">
            <strong>Warning:</strong> Under the New Tax Regime, you cannot claim the deduction for Home Loan Interest on a Self-Occupied property. The engine will safely ignore this input unless you switch to the Old Regime.
          </p>
        </div>
      )}
    </div>
  );
}
