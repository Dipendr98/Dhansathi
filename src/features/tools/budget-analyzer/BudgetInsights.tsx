import type { BudgetRule } from '@/stores/proToolsStore';

interface Props {
  income: number;
  needs: number;
  wants: number;
  savings: number;
  debt: number;
  rule: BudgetRule;
  emergencyFund: number;
}

const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function BudgetInsights({ income, needs, wants, savings, debt, rule, emergencyFund }: Props) {
  const totalExpenses = needs + wants + debt;
  const surplus = income - totalExpenses - savings;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  
  // Parse targets from rule
  let targetNeeds = 50, targetWants = 30, targetSave = 20;
  if (rule === '60/20/20 High Cost City') { targetNeeds = 60; targetWants = 20; targetSave = 20; }
  if (rule === '70/20/10 Low Income / Starting Career') { targetNeeds = 70; targetWants = 20; targetSave = 10; }
  if (rule === '40/20/40 Aggressive Saver') { targetNeeds = 40; targetWants = 20; targetSave = 40; }
  // Custom uses standard for now unless implemented differently

  const actualNeedsRate = income > 0 ? (needs / income) * 100 : 0;
  const actualWantsRate = income > 0 ? (wants / income) * 100 : 0;

  return (
    <div className="bg-sky-50 rounded-2xl p-5 border border-sky-200">
      <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined">psychology</span>
        Smart Insights
      </h3>
      
      {income === 0 ? (
        <p className="text-sm text-on-surface-variant italic">Enter your monthly income to unlock personalized insights and recommendations.</p>
      ) : (
        <ul className="space-y-3 text-sm text-on-surface-variant">
          {/* Surplus / Deficit Warning */}
          {surplus < 0 ? (
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-[18px] mt-0.5">error</span>
              <span><strong className="text-error">Critical Deficit!</strong> Your total allocation exceeds your income by {fmt(Math.abs(surplus))}. Please reduce expenses or increase income immediately to prevent debt spiral.</span>
            </li>
          ) : (
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-india-green text-[18px] mt-0.5">check_circle</span>
              <span>You have a positive budget surplus of {fmt(surplus)}. Consider allocating this to your emergency fund or debt payoff.</span>
            </li>
          )}

          {/* Needs Analysis */}
          {actualNeedsRate > targetNeeds ? (
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5">warning</span>
              <span>Your needs consume <strong>{actualNeedsRate.toFixed(0)}%</strong> of income, which is higher than the {targetNeeds}% target. Try reducing fixed bills or rent if possible.</span>
            </li>
          ) : (
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-india-green text-[18px] mt-0.5">verified</span>
              <span>Your needs ({actualNeedsRate.toFixed(0)}%) are perfectly within the {targetNeeds}% safe limit.</span>
            </li>
          )}

          {/* Wants Analysis */}
          {actualWantsRate > targetWants && (
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5">trending_down</span>
              <span>Your lifestyle expenses (Wants) are <strong>{actualWantsRate.toFixed(0)}%</strong> (target: {targetWants}%). Try cutting back on shopping, eating out, or subscriptions by {fmt((actualWantsRate - targetWants) / 100 * income)}.</span>
            </li>
          )}

          {/* Savings Analysis */}
          {savingsRate < targetSave && surplus >= 0 ? (
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">savings</span>
              <span>You are saving <strong>{savingsRate.toFixed(0)}%</strong> (target: {targetSave}%). Start by allocating your {fmt(surplus)} surplus to SIPs or an Emergency Fund.</span>
            </li>
          ) : savingsRate >= targetSave ? (
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-india-green text-[18px] mt-0.5">workspace_premium</span>
              <span>Excellent! You are saving <strong>{savingsRate.toFixed(0)}%</strong>, beating your target of {targetSave}%.</span>
            </li>
          ) : null}

          {/* Emergency Fund Check */}
          {(() => {
            const monthlyBurn = needs + debt; // Minimal survival burn
            if (monthlyBurn === 0) return null;
            
            const targetFund = monthlyBurn * 6; // 6 months survival
            
            if (emergencyFund === 0) {
              return (
                <li className="flex items-start gap-2 mt-4 pt-3 border-t border-sky-200">
                  <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5">medical_services</span>
                  <span><strong>No Emergency Fund!</strong> Experts recommend 6 months of living expenses ({fmt(targetFund)}). Start building this immediately.</span>
                </li>
              );
            }
            
            const coverageMonths = emergencyFund / monthlyBurn;
            
            if (coverageMonths < 3) {
              return (
                <li className="flex items-start gap-2 mt-4 pt-3 border-t border-sky-200">
                  <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5">medical_services</span>
                  <span>Current emergency fund covers <strong>{coverageMonths.toFixed(1)} months</strong> of minimal expenses. Target: 3–6 months. Shortfall: {fmt(targetFund - emergencyFund)}.</span>
                </li>
              );
            } else {
              return (
                <li className="flex items-start gap-2 mt-4 pt-3 border-t border-sky-200">
                  <span className="material-symbols-outlined text-india-green text-[18px] mt-0.5">shield</span>
                  <span><strong>Fully Protected:</strong> Your emergency fund safely covers {coverageMonths.toFixed(1)} months of living expenses!</span>
                </li>
              );
            }
          })()}
        </ul>
      )}
    </div>
  );
}
