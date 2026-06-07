import { useTaxStore } from '@/stores/taxStore';
import { CustomSelect } from '@/components/shared/CustomSelect';

export default function SalarySection() {
  const profile = useTaxStore((s) => s.profile);
  const salary = useTaxStore((s) => s.salary);
  const setSalary = useTaxStore((s) => s.setSalary);

  if (profile.userType !== 'Salaried') return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-4">
        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-secondary">work</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-on-surface">Salary Details</h3>
          <p className="text-xs text-on-surface-variant">Enter your basic, HRA, and allowances</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">
            Basic Salary (Yearly)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={salary.basicSalary || ''}
              onChange={(e) => setSalary({ basicSalary: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              placeholder="e.g. 500000"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">
            HRA Received
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={salary.hraReceived || ''}
              onChange={(e) => setSalary({ hraReceived: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              placeholder="e.g. 150000"
            />
          </div>
        </div>

        {salary.hraReceived > 0 && profile.regime === 'old' && (
          <>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-amber-900 uppercase tracking-wider mb-2 block">
                  Actual Rent Paid (Yearly)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700 font-mono">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={salary.rentPaid || ''}
                    onChange={(e) => setSalary({ rentPaid: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-amber-300 bg-white font-mono text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-amber-900 uppercase tracking-wider mb-2 block">
                  City Type
                </label>
                <CustomSelect
                  value={salary.cityType}
                  onChange={(v) => setSalary({ cityType: v as any })}
                  options={[
                    { value: 'Metro', label: 'Metro (50% Basic)' },
                    { value: 'Non-metro', label: 'Non-Metro (40% Basic)' },
                  ]}
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">
            Bonus / Allowances / Other
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={salary.bonus || ''}
              onChange={(e) => setSalary({ bonus: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">
            Employer PF (If part of CTC)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={salary.employerPf || ''}
              onChange={(e) => setSalary({ employerPf: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>

        {profile.regime === 'old' && (
          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">
              Professional Tax Paid
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
              <input
                type="number"
                min="0"
                value={salary.professionalTax || ''}
                onChange={(e) => setSalary({ professionalTax: Number(e.target.value) })}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary">info</span>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Standard Deduction of <strong>₹{profile.regime === 'new' ? '75,000' : '50,000'}</strong> is automatically applied. 
          {profile.regime === 'new' && salary.hraReceived > 0 && (
            <span className="text-error font-semibold block mt-1">Warning: HRA exemption is NOT allowed under the New Tax Regime.</span>
          )}
        </p>
      </div>
    </div>
  );
}
