import type { MonthData } from '@/stores/proToolsStore';

interface Props {
  current: MonthData;
  prev: MonthData | null;
}

const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const pct = (n: number) => Math.round(n) + '%';

export default function ReportDashboard({ current, prev }: Props) {
  // Extract totals from details since user requested specific calculations
  const totalAssets = Object.values(current.assetDetails || {}).reduce((a, b) => a + b, 0);
  const totalLiabilities = Object.values(current.liabilityDetails || {}).reduce((a, b) => a + b, 0);
  const netWorth = totalAssets - totalLiabilities;
  
  const prevAssets = prev ? Object.values(prev.assetDetails || {}).reduce((a, b) => a + b, 0) : 0;
  const prevLiabilities = prev ? Object.values(prev.liabilityDetails || {}).reduce((a, b) => a + b, 0) : 0;
  const prevNetWorth = prevAssets - prevLiabilities;

  const surplus = current.income - current.expenses - current.investments;
  const savingsRate = current.income > 0 ? ((current.income - current.expenses) / current.income) * 100 : 0;
  const investRate = current.income > 0 ? (current.investments / current.income) * 100 : 0;
  const expenseRatio = current.income > 0 ? (current.expenses / current.income) * 100 : 0;
  const dti = current.income > 0 ? (totalLiabilities / current.income) * 100 : 0;

  // Emergency Fund logic
  // Case-insensitive search for 'emergency' in savings details or asset details
  let emergencyFund = 0;
  Object.entries(current.savingsDetails || {}).forEach(([k, v]) => { if (k.toLowerCase().includes('emergency')) emergencyFund += v; });
  Object.entries(current.assetDetails || {}).forEach(([k, v]) => { if (k.toLowerCase().includes('emergency')) emergencyFund += v; });
  
  // Minimal monthly essential burn = just expenses (excluding investments)
  const monthlyBurn = current.expenses; 
  const emergencyTarget = monthlyBurn * 6;
  const emergencyCoverage = monthlyBurn > 0 ? emergencyFund / monthlyBurn : 0;

  const change = (curr: number, old: number) => {
    if (old === 0) return null;
    const diff = curr - old;
    return diff;
  };

  const MetricCard = ({ label, value, diff, invertColors = false }: { label: string, value: string, diff: number | null, invertColors?: boolean }) => {
    const isPositive = diff !== null && diff >= 0;
    const isGood = invertColors ? !isPositive : isPositive;
    
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col justify-between">
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{label}</p>
        <p className="font-mono font-bold text-xl mt-1">{value}</p>
        {diff !== null && (
          <div className={`mt-2 flex items-center gap-1 text-[10px] font-bold ${isGood ? 'text-india-green' : 'text-error'}`}>
            <span className="material-symbols-outlined text-[14px]">
              {isPositive ? 'trending_up' : 'trending_down'}
            </span>
            <span>{isPositive ? '+' : ''}{fmt(diff)} vs last month</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Level Comparison Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Income" value={fmt(current.income)} diff={prev ? change(current.income, prev.income) : null} />
        <MetricCard label="Expenses" value={fmt(current.expenses)} diff={prev ? change(current.expenses, prev.expenses) : null} invertColors={true} />
        <MetricCard label="Investments" value={fmt(current.investments)} diff={prev ? change(current.investments, prev.investments) : null} />
        <MetricCard label="Net Worth" value={fmt(netWorth)} diff={prev ? change(netWorth, prevNetWorth) : null} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Ratios & Formulas */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 md:col-span-1 space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">calculate</span>
            Financial Ratios
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-primary/10 pb-2">
              <span className="text-sm text-on-surface-variant">Savings Rate</span>
              <span className="font-mono font-bold">{pct(savingsRate)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-primary/10 pb-2">
              <span className="text-sm text-on-surface-variant">Investment Rate</span>
              <span className="font-mono font-bold">{pct(investRate)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-primary/10 pb-2">
              <span className="text-sm text-on-surface-variant">Expense Ratio</span>
              <span className="font-mono font-bold">{pct(expenseRatio)}</span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="text-sm text-on-surface-variant">Debt-to-Income</span>
              <span className="font-mono font-bold">{pct(dti)}</span>
            </div>
          </div>
        </div>

        {/* Emergency Fund */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 md:col-span-1 space-y-4">
          <h3 className="font-bold text-sky-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">medical_services</span>
            Emergency Fund
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-sky-700">Current Balance</p>
              <p className="font-mono font-bold text-lg text-sky-900">{fmt(emergencyFund)}</p>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-sky-700">Target (6 Months)</p>
                <p className="font-mono font-bold text-sm text-sky-900">{fmt(emergencyTarget)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-sky-700">Coverage</p>
                <p className={`font-mono font-bold text-lg ${emergencyCoverage >= 6 ? 'text-india-green' : 'text-amber-600'}`}>
                  {emergencyCoverage.toFixed(1)} mo
                </p>
              </div>
            </div>
            {emergencyFund < emergencyTarget && (
              <p className="text-xs text-error font-medium mt-2 border-t border-sky-200 pt-2">
                Shortfall: {fmt(emergencyTarget - emergencyFund)}
              </p>
            )}
          </div>
        </div>

        {/* Monthly Notes / Memo */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 md:col-span-1 flex flex-col">
          <h3 className="font-bold text-amber-900 flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[20px]">edit_note</span>
            Monthly Notes
          </h3>
          <p className="text-sm text-amber-800 italic flex-1 whitespace-pre-wrap">
            {current.notes || "No notes saved for this month."}
          </p>
        </div>
      </div>
    </div>
  );
}
