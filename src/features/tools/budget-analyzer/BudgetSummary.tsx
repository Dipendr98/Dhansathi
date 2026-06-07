import { CustomSelect } from '@/components/shared/CustomSelect';
import type { BudgetRule } from '@/stores/proToolsStore';

interface Props {
  income: number;
  needs: number;
  wants: number;
  savings: number;
  debt: number;
  rule: BudgetRule;
  setRule: (rule: BudgetRule) => void;
}

const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function BudgetSummary({ income, needs, wants, savings, debt, rule, setRule }: Props) {
  const totalExpenses = needs + wants + debt;
  const surplus = income - totalExpenses - savings;
  const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : '0';
  const expenseRate = income > 0 ? ((totalExpenses / income) * 100).toFixed(1) : '0';
  const dtiRate = income > 0 ? ((debt / income) * 100).toFixed(1) : '0';

  const getHealthStatus = () => {
    if (income === 0) return { label: 'No Data', color: 'text-on-surface-variant', icon: 'hourglass_empty' };
    if (surplus < 0) return { label: 'Critical Deficit', color: 'text-error', icon: 'warning' };
    if (Number(savingsRate) < 10) return { label: 'Risky', color: 'text-error', icon: 'trending_down' };
    if (Number(savingsRate) < 20) return { label: 'Average', color: 'text-amber-600', icon: 'trending_flat' };
    if (Number(savingsRate) < 30) return { label: 'Good', color: 'text-india-green', icon: 'trending_up' };
    return { label: 'Excellent', color: 'text-primary', icon: 'workspace_premium' };
  };

  const health = getHealthStatus();

  return (
    <div className="bg-gradient-to-br from-primary-container to-primary-fixed rounded-2xl shadow-xl border border-primary/20 p-6 space-y-6 relative overflow-hidden h-full flex flex-col">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-3xl rounded-full" />
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-bold text-on-primary-container/80 uppercase tracking-widest mb-1">Financial Health</p>
          <div className={`flex items-center gap-2 ${health.color}`}>
            <span className="material-symbols-outlined text-3xl">{health.icon}</span>
            <span className="text-3xl font-black font-headline tracking-tight">{health.label}</span>
          </div>
        </div>
        
        <div className="w-64">
          <p className="text-xs font-bold text-on-primary-container/80 mb-1 text-right">Budget Rule</p>
          <CustomSelect
            value={rule}
            onChange={(val) => setRule(val as BudgetRule)}
            options={[
              { value: '50/30/20 Standard', label: '50/30/20 Standard' },
              { value: '60/20/20 High Cost City', label: '60/20/20 High Cost City' },
              { value: '70/20/10 Low Income / Starting Career', label: '70/20/10 Low Income' },
              { value: '40/20/40 Aggressive Saver', label: '40/20/40 Aggressive Saver' },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10 flex-1 content-start">
        <div className="bg-white/50 p-4 rounded-xl border border-primary/10">
          <p className="text-xs font-semibold text-on-primary-container/80">Monthly Income</p>
          <p className="font-mono font-bold text-xl text-india-green">{fmt(income)}</p>
        </div>
        <div className="bg-white/50 p-4 rounded-xl border border-primary/10">
          <p className="text-xs font-semibold text-on-primary-container/80">Total Spending</p>
          <p className="font-mono font-bold text-xl text-error">{fmt(totalExpenses)}</p>
        </div>
        <div className="bg-white/50 p-4 rounded-xl border border-primary/10">
          <p className="text-xs font-semibold text-on-primary-container/80">Total Saved</p>
          <p className="font-mono font-bold text-xl text-primary">{fmt(savings)}</p>
        </div>
        <div className={`p-4 rounded-xl border ${surplus >= 0 ? 'bg-india-green/10 border-india-green/30' : 'bg-error/10 border-error/30'}`}>
          <p className="text-xs font-semibold text-on-primary-container/80">Net Surplus</p>
          <p className={`font-mono font-bold text-xl ${surplus >= 0 ? 'text-india-green' : 'text-error'}`}>
            {fmt(surplus)}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-primary/20 relative z-10">
        <div className="text-center">
          <p className="text-[10px] uppercase font-bold text-on-primary-container/70">Savings Rate</p>
          <p className="font-mono font-bold">{savingsRate}%</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase font-bold text-on-primary-container/70">Expense Ratio</p>
          <p className="font-mono font-bold">{expenseRate}%</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase font-bold text-on-primary-container/70">Debt-to-Income</p>
          <p className="font-mono font-bold">{dtiRate}%</p>
        </div>
      </div>
      
      <button
        onClick={() => window.print()}
        className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-primary/90 active:scale-[0.98] print-hidden"
      >
        <span className="material-symbols-outlined">download</span>
        Download Budget Report
      </button>
    </div>
  );
}
