import { useState } from 'react';
import type { MonthData, ReportProfile } from '@/stores/proToolsStore';
import { CustomSelect } from '@/components/shared/CustomSelect';

interface Props {
  monthKey: string;
  data: MonthData;
  prevData: MonthData | null;
  profile: ReportProfile;
  setProfile: (p: ReportProfile) => void;
  updateData: (month: string, data: Partial<MonthData>) => void;
  onSave: () => void;
}

const PROFILES: { value: ReportProfile; label: string }[] = [
  { value: 'Salaried', label: 'Salaried Person' },
  { value: 'Student', label: 'Student' },
  { value: 'Freelancer', label: 'Freelancer' },
  { value: 'Business Owner', label: 'Business Owner' },
  { value: 'Family Budget', label: 'Family Budget' },
  { value: 'Investor', label: 'Investor' },
  { value: 'Loan/EMI Heavy User', label: 'Loan/EMI Heavy User' },
];

const FIELDS_BY_PROFILE: Record<ReportProfile, {
  income: string[];
  expenses: string[];
  savings: string[];
  assets: string[];
  liabilities: string[];
}> = {
  'Salaried': {
    income: ['Salary', 'Bonus', 'Major One-Time Income', 'Other Income'],
    expenses: ['Rent/EMI', 'Groceries', 'Utilities', 'Tax Deducted', 'Credit Card Bill', 'Insurance Paid This Month', 'EMI Paid This Month', 'Major One-Time Expense', 'Other Expenses'],
    savings: ['SIP / Mutual Funds', 'PF/NPS', 'Emergency Fund Balance', 'Amount Saved'],
    assets: ['Bank Balance / Cash Balance', 'Mutual Fund Value', 'PF/NPS Value', 'Portfolio Value'],
    liabilities: ['Debt / Loan Outstanding', 'Credit Card Outstanding'],
  },
  'Student': {
    income: ['Pocket Money', 'Part-Time Income', 'Major One-Time Income'],
    expenses: ['Fees', 'Hostel/Rent', 'Food', 'Travel', 'Course/Books', 'Entertainment', 'Major One-Time Expense'],
    savings: ['Amount Saved', 'Emergency Fund Balance'],
    assets: ['Bank Balance / Cash Balance', 'Portfolio Value'],
    liabilities: ['Debt / Loan Outstanding', 'Credit Card Outstanding'],
  },
  'Business Owner': {
    income: ['Business Revenue', 'Owner Withdrawal', 'Major One-Time Income', 'Other Income'],
    expenses: ['Business Expense', 'Inventory Purchase', 'GST Paid', 'Staff Salary', 'Insurance Paid This Month', 'EMI Paid This Month', 'Major One-Time Expense', 'Personal Expenses'],
    savings: ['Amount Saved', 'Emergency Fund Balance', 'Business Reserve'],
    assets: ['Bank Balance / Cash Balance', 'Inventory Value', 'Portfolio Value'],
    liabilities: ['Debt / Loan Outstanding', 'Credit Card Outstanding'],
  },
  'Freelancer': {
    income: ['Client Payments', 'Retainers', 'Major One-Time Income', 'Other Income'],
    expenses: ['Rent', 'Software Subscriptions', 'Equipment/Hardware', 'Taxes', 'Insurance Paid This Month', 'EMI Paid This Month', 'Major One-Time Expense', 'Living Expenses'],
    savings: ['Amount Saved', 'Emergency Fund Balance', 'Tax Reserve'],
    assets: ['Bank Balance / Cash Balance', 'Portfolio Value'],
    liabilities: ['Debt / Loan Outstanding', 'Credit Card Outstanding'],
  },
  'Family Budget': {
    income: ['Salary 1', 'Salary 2', 'Rental Income', 'Major One-Time Income', 'Other'],
    expenses: ['Rent/Home Loan EMI', 'Groceries', 'School Fees', 'Utilities', 'Medical', 'Insurance Paid This Month', 'EMI Paid This Month', 'Maid/Help', 'Major One-Time Expense'],
    savings: ['Amount Saved', 'Child Education Fund', 'Emergency Fund Balance'],
    assets: ['Bank Balance / Cash Balance', 'Portfolio Value', 'Gold Value', 'Property Value'],
    liabilities: ['Debt / Loan Outstanding', 'Car Loan', 'Credit Card Outstanding'],
  },
  'Investor': {
    income: ['Dividends', 'Interest', 'Capital Gains', 'Rental Income', 'Major One-Time Income'],
    expenses: ['Living Expenses', 'Taxes', 'Brokerage/Fees', 'Insurance Paid This Month', 'Major One-Time Expense'],
    savings: ['Amount Saved', 'Emergency Fund Balance'],
    assets: ['Bank Balance / Cash Balance', 'Portfolio Value', 'Stock Value', 'FD/RD Value', 'Crypto Value', 'Gold Value'],
    liabilities: ['Debt / Loan Outstanding', 'Credit Card Outstanding'],
  },
  'Loan/EMI Heavy User': {
    income: ['Salary', 'Major One-Time Income', 'Other Income'],
    expenses: ['Home Loan EMI', 'Car Loan EMI', 'Personal Loan EMI', 'EMI Paid This Month', 'Insurance Paid This Month', 'Major One-Time Expense', 'Living Expenses'],
    savings: ['Amount Saved', 'Emergency Fund Balance'],
    assets: ['Bank Balance / Cash Balance', 'Portfolio Value'],
    liabilities: ['Debt / Loan Outstanding', 'Credit Card Outstanding'],
  }
};

export default function ReportDataEntry({ monthKey, data, prevData, profile, setProfile, updateData, onSave }: Props) {
  const [warnings, setWarnings] = useState<string[]>([]);
  const fields = FIELDS_BY_PROFILE[profile];

  const handleObjChange = (category: keyof MonthData, fieldName: string, val: string) => {
    const num = Math.max(0, Number(val));
    const obj = { ...(data[category] as Record<string, number>) };
    obj[fieldName] = num;
    
    const newData = { ...data, [category]: obj };
    
    // Auto-calculate totals
    if (category === 'incomeDetails') newData.income = Object.values(obj).reduce((a, b) => a + b, 0);
    if (category === 'expenseDetails') newData.expenses = Object.values(obj).reduce((a, b) => a + b, 0);
    if (category === 'savingsDetails') newData.investments = Object.values(obj).reduce((a, b) => a + b, 0);
    if (category === 'assetDetails') newData.portfolioValue = Object.values(obj).reduce((a, b) => a + b, 0);
    
    updateData(monthKey, newData);
    checkWarnings(newData);
  };

  const handleNotes = (val: string) => {
    updateData(monthKey, { notes: val });
  };

  const checkWarnings = (d: MonthData) => {
    const w: string[] = [];
    if (d.expenses > d.income && d.income > 0) w.push('⚠️ Total expenses exceed total income for this month.');
    if (d.investments > d.income && d.income > 0) w.push('⚠️ Total investments exceed total income.');
    setWarnings(w);
  };

  const copyPrevious = () => {
    if (!prevData) return;
    const copied = {
      ...prevData,
      notes: '', // don't copy notes
      // We don't copy assets and liabilities as they change, but we copy income/expenses/savings
      assetDetails: data.assetDetails,
      liabilityDetails: data.liabilityDetails,
      portfolioValue: data.portfolioValue
    };
    updateData(monthKey, copied);
  };

  const Section = ({ title, objKey, fieldList, icon, color }: { title: string, objKey: keyof MonthData, fieldList: string[], icon: string, color: string }) => {
    const obj = data[objKey] as Record<string, number> || {};
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4">
        <h4 className={`text-sm font-bold flex items-center gap-2 mb-3 ${color}`}>
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
          {title}
        </h4>
        <div className="space-y-3">
          {fieldList.map(f => (
            <div key={f} className="flex items-center justify-between gap-3">
              <label className="text-xs text-on-surface-variant flex-1 truncate">{f}</label>
              <div className="relative w-32">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-outline-variant font-mono text-xs">₹</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={obj[f] === 0 || obj[f] === undefined ? '' : obj[f]}
                  onChange={e => handleObjChange(objKey, f, e.target.value)}
                  className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-outline-variant/30 font-mono text-sm text-right focus:ring-2 focus:ring-primary/30 outline-none"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const monthName = (() => { const d = new Date(monthKey + '-01'); return d.toLocaleString('default', { month: 'long', year: 'numeric' }); })();

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-primary/20 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-primary text-lg">Enter Data for {monthName}</h3>
          <p className="text-xs text-on-surface-variant mt-1">Fill in the details below to generate your monthly report.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-48">
            <CustomSelect
              value={profile}
              onChange={val => setProfile(val as ReportProfile)}
              options={PROFILES}
            />
          </div>
          {prevData && (
            <button onClick={copyPrevious} className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-xl transition-colors whitespace-nowrap">
              Copy Previous Month
            </button>
          )}
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-800 font-medium">{w}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Section title="Income Sources" objKey="incomeDetails" fieldList={fields.income} icon="payments" color="text-india-green" />
        <Section title="Monthly Expenses" objKey="expenseDetails" fieldList={fields.expenses} icon="receipt_long" color="text-red-500" />
        <Section title="Savings & Investments" objKey="savingsDetails" fieldList={fields.savings} icon="savings" color="text-primary" />
        <Section title="Assets & Portfolio" objKey="assetDetails" fieldList={fields.assets} icon="account_balance" color="text-amber-600" />
        <Section title="Debt & Liabilities" objKey="liabilityDetails" fieldList={fields.liabilities} icon="credit_card" color="text-purple-600" />
        
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex flex-col">
          <h4 className="text-sm font-bold flex items-center gap-2 mb-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            Monthly Notes
          </h4>
          <textarea
            value={data.notes || ''}
            onChange={e => handleNotes(e.target.value)}
            placeholder="E.g., Salary delayed, medical emergency, bonus received..."
            className="flex-1 w-full p-3 rounded-lg border border-outline-variant/30 text-sm focus:ring-2 focus:ring-primary/30 outline-none resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-outline-variant/20">
        <button onClick={onSave} className="bg-primary text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">save</span>
          Save Month & Generate Report
        </button>
      </div>
    </div>
  );
}
