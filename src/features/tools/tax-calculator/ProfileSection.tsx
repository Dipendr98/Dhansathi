import { useTaxStore } from '@/stores/taxStore';
import { CustomSelect } from '@/components/shared/CustomSelect';

export default function ProfileSection() {
  const profile = useTaxStore((s) => s.profile);
  const setProfile = useTaxStore((s) => s.setProfile);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">person</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-on-surface">Tax Profile</h3>
          <p className="text-xs text-on-surface-variant">Basic details for correct slab calculation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">
            Assessment Year
          </label>
          <CustomSelect
            value={profile.assessmentYear}
            onChange={(v) => setProfile({ assessmentYear: v as any })}
            options={[
              { value: 'AY 2026-27', label: 'AY 2026-27 (FY 2025-26)' },
              { value: 'AY 2025-26', label: 'AY 2025-26 (FY 2024-25)' },
            ]}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">
            User Type
          </label>
          <CustomSelect
            value={profile.userType}
            onChange={(v) => setProfile({ userType: v as any })}
            options={[
              { value: 'Salaried', label: 'Salaried / Private Job' },
              { value: 'Business', label: 'Business Owner' },
              { value: 'Freelancer', label: 'Freelancer / Professional' },
              { value: 'Trader', label: 'Stock Trader (F&O)' },
              { value: 'Pensioner', label: 'Pensioner' },
            ]}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">
            Age Category
          </label>
          <CustomSelect
            value={profile.ageCategory}
            onChange={(v) => setProfile({ ageCategory: v as any })}
            options={[
              { value: 'Below 60', label: 'Below 60 Years' },
              { value: '60-79', label: 'Senior (60-79)' },
              { value: '80+', label: 'Super Senior (80+)' },
            ]}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">
            Residential Status
          </label>
          <CustomSelect
            value={profile.residentialStatus}
            onChange={(v) => setProfile({ residentialStatus: v as any })}
            options={[
              { value: 'Resident', label: 'Resident Indian' },
              { value: 'NRI', label: 'Non-Resident (NRI)' },
            ]}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">
            Select Tax Regime
          </label>
          <div className="flex space-x-2 bg-surface-container-low rounded-xl p-1 border border-outline-variant/20">
            {(['new', 'old'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setProfile({ regime: r })}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  profile.regime === r
                    ? 'bg-primary text-white shadow-md'
                    : 'text-on-surface-variant hover:bg-white/50'
                }`}
              >
                {r === 'new' ? '🆕 New Regime (Default)' : '📋 Old Regime'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
