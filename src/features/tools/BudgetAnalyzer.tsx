import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

interface BudgetItem { label: string; amount: number; }

const DEFAULT_INCOME: BudgetItem[] = [
    { label: 'Salary', amount: 80000 },
    { label: 'Freelance / Side Income', amount: 0 },
    { label: 'Rental Income', amount: 0 },
    { label: 'Dividends / Interest', amount: 0 },
];

const DEFAULT_EXPENSES: BudgetItem[] = [
    { label: 'Rent / EMI', amount: 20000 },
    { label: 'Groceries & Food', amount: 8000 },
    { label: 'Utilities & Bills', amount: 3000 },
    { label: 'Transport / Fuel', amount: 4000 },
    { label: 'Insurance Premiums', amount: 2000 },
    { label: 'Education / Courses', amount: 0 },
    { label: 'Entertainment', amount: 3000 },
    { label: 'Shopping / Personal', amount: 5000 },
    { label: 'Medical / Health', amount: 1000 },
    { label: 'Other Expenses', amount: 2000 },
];

const SAVINGS_TARGETS: BudgetItem[] = [
    { label: 'Emergency Fund', amount: 5000 },
    { label: 'SIP / Mutual Funds', amount: 10000 },
    { label: 'PPF / NPS', amount: 5000 },
    { label: 'Stocks / Trading', amount: 5000 },
    { label: 'Fixed Deposits', amount: 0 },
    { label: 'Gold / Other', amount: 0 },
];

function sum(items: BudgetItem[]) { return items.reduce((a, b) => a + b.amount, 0); }
const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function BudgetAnalyzer() {
    const user = useAuthStore((s) => s.user);
    const nav = useNavigate();
    const isPro = user?.plan === 'pro';

    if (!isPro) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <span className="material-symbols-outlined text-6xl text-primary/30">lock</span>
                <h2 className="text-xl font-bold">Pro Feature</h2>
                <p className="text-on-surface-variant max-w-md">Budget Analyzer is available on the Pro plan.</p>
                <button onClick={() => nav('/dashboard/pricing')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold">Upgrade to Pro</button>
            </div>
        );
    }

    const [incomes, setIncomes] = useState<BudgetItem[]>(DEFAULT_INCOME);
    const [expenses, setExpenses] = useState<BudgetItem[]>(DEFAULT_EXPENSES);
    const [savings, setSavings] = useState<BudgetItem[]>(SAVINGS_TARGETS);

    const totalIncome = sum(incomes);
    const totalExpenses = sum(expenses);
    const totalSavings = sum(savings);
    const surplus = totalIncome - totalExpenses - totalSavings;
    const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : '0';
    const expenseRate = totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : '0';

    const updateItem = (list: BudgetItem[], setList: (v: BudgetItem[]) => void, idx: number, amount: number) => {
        const copy = [...list];
        copy[idx] = { ...copy[idx], amount };
        setList(copy);
    };

    const getHealthColor = () => {
        if (surplus < 0) return 'text-red-600';
        if (+savingsRate >= 30) return 'text-india-green';
        if (+savingsRate >= 20) return 'text-amber-600';
        return 'text-red-500';
    };

    const getHealthLabel = () => {
        if (surplus < 0) return '⚠️ Over Budget!';
        if (+savingsRate >= 30) return '🌟 Excellent';
        if (+savingsRate >= 20) return '👍 Good';
        if (+savingsRate >= 10) return '⚡ Needs Improvement';
        return '🚨 Critical - Save More!';
    };

    function Section({ title, icon, items, setItems, color }: { title: string; icon: string; items: BudgetItem[]; setItems: (v: BudgetItem[]) => void; color: string }) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-5 space-y-3">
                <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined ${color}`}>{icon}</span>
                    <h3 className="font-bold">{title}</h3>
                    <span className="ml-auto font-mono font-bold text-sm">{fmt(sum(items))}</span>
                </div>
                {items.map((item, i) => (
                    <div key={item.label} className="flex items-center gap-3">
                        <span className="text-xs text-on-surface-variant flex-1 min-w-0 truncate">{item.label}</span>
                        <input type="number" value={item.amount} onChange={e => updateItem(items, setItems, i, +e.target.value)} className="w-28 px-2 py-1.5 rounded-lg border border-outline-variant/20 font-mono text-sm text-right" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center space-x-3">
                <span className="material-symbols-outlined text-primary text-3xl">account_balance_wallet</span>
                <div>
                    <h1 className="text-2xl font-headline font-bold">Budget Analyzer</h1>
                    <p className="text-sm text-on-surface-variant">Plan your monthly budget with the 50/30/20 rule</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Income', value: fmt(totalIncome), icon: 'trending_up', color: 'text-india-green', bg: 'bg-green-50' },
                    { label: 'Expenses', value: fmt(totalExpenses), icon: 'shopping_cart', color: 'text-red-500', bg: 'bg-red-50' },
                    { label: 'Savings', value: fmt(totalSavings), icon: 'savings', color: 'text-primary', bg: 'bg-blue-50' },
                    { label: 'Surplus', value: fmt(surplus), icon: surplus >= 0 ? 'check_circle' : 'warning', color: surplus >= 0 ? 'text-india-green' : 'text-red-600', bg: surplus >= 0 ? 'bg-green-50' : 'bg-red-50' },
                ].map(c => (
                    <div key={c.label} className={`${c.bg} rounded-2xl p-4 border border-outline-variant/10`}>
                        <span className={`material-symbols-outlined ${c.color} text-2xl`}>{c.icon}</span>
                        <p className="text-xs text-on-surface-variant mt-1">{c.label}</p>
                        <p className={`font-mono font-bold text-lg ${c.color}`}>{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Health Score */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-5 border border-primary/20 flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold">Financial Health</p>
                    <p className={`text-2xl font-bold ${getHealthColor()}`}>{getHealthLabel()}</p>
                    <p className="text-xs text-on-surface-variant mt-1">Savings Rate: <span className="font-bold">{savingsRate}%</span> • Expense Ratio: <span className="font-bold">{expenseRate}%</span></p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-on-surface-variant">50/30/20 Rule Target</p>
                    <p className="text-xs">Needs: {fmt(totalIncome * 0.5)} | Wants: {fmt(totalIncome * 0.3)} | Save: {fmt(totalIncome * 0.2)}</p>
                </div>
            </div>

            {/* Input Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Section title="Monthly Income" icon="payments" items={incomes} setItems={setIncomes} color="text-india-green" />
                <Section title="Monthly Expenses" icon="receipt_long" items={expenses} setItems={setExpenses} color="text-red-500" />
                <Section title="Savings & Investments" icon="savings" items={savings} setItems={setSavings} color="text-primary" />
            </div>

            {/* DhanSathi Analysis */}
            <div className="bg-sky-50 rounded-2xl p-5 border border-sky-200">
                <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined">psychology</span>
                    DhanSathi Analysis
                </h3>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                    {surplus < 0 && <li>🚨 <strong>Over Budget!</strong> You're spending {fmt(Math.abs(surplus))} more than you earn. Cut expenses or increase income immediately.</li>}
                    {surplus >= 0 && surplus < totalIncome * 0.05 && <li>⚠️ Your surplus is very thin ({fmt(surplus)}). Any unexpected expense could push you into debt.</li>}
                    {+savingsRate >= 30 && <li>🌟 Excellent savings rate of {savingsRate}%! You're well on track for financial freedom.</li>}
                    {+savingsRate >= 20 && +savingsRate < 30 && <li>👍 Good savings rate ({savingsRate}%). Push to 30%+ by reducing discretionary spending.</li>}
                    {+savingsRate >= 10 && +savingsRate < 20 && <li>⚡ Savings rate of {savingsRate}% needs improvement. Target at least 20% for long-term wealth building.</li>}
                    {+savingsRate > 0 && +savingsRate < 10 && <li>🚨 Critical: Only {savingsRate}% savings rate. Review all non-essential expenses.</li>}

                    {/* 50/30/20 Analysis */}
                    {totalIncome > 0 && (
                        <>
                            {totalExpenses > totalIncome * 0.5 && <li>📊 Your expenses are {((totalExpenses / totalIncome) * 100).toFixed(0)}% of income (target: 50% for needs). Consider reducing {fmt(totalExpenses - totalIncome * 0.5)} in expenses.</li>}
                            {totalSavings < totalIncome * 0.2 && totalSavings >= 0 && <li>💰 You're saving {fmt(totalSavings)} but the 50/30/20 rule suggests saving at least {fmt(totalIncome * 0.2)}. Gap: {fmt(totalIncome * 0.2 - totalSavings)}</li>}
                            {totalSavings >= totalIncome * 0.2 && <li>✅ Your savings meet the 20% target of the 50/30/20 rule. Well done!</li>}
                        </>
                    )}

                    {/* Emergency Fund */}
                    {(() => {
                        const emergencyTarget = totalExpenses * 6;
                        const emergencyFund = savings.find(s => s.label === 'Emergency Fund')?.amount || 0;
                        if (emergencyFund > 0) {
                            const monthsToGoal = emergencyFund > 0 ? Math.ceil((emergencyTarget) / emergencyFund) : Infinity;
                            return <li>🏦 At {fmt(emergencyFund)}/month, you'll build a 6-month emergency fund ({fmt(emergencyTarget)}) in ~{monthsToGoal} months.</li>;
                        }
                        return <li>🏦 No emergency fund allocation detected. Aim to save {fmt(emergencyTarget)} (6 months of expenses).</li>;
                    })()}

                    {/* Investment Analysis */}
                    {(() => {
                        const totalInvest = sum(savings);
                        const investRate = totalIncome > 0 ? ((totalInvest / totalIncome) * 100).toFixed(1) : '0';
                        if (+investRate >= 20) return <li>📈 Investing {investRate}% of income — excellent wealth-building strategy!</li>;
                        if (+investRate >= 10) return <li>📈 Investing {investRate}% of income. Try to increase to 20% for faster wealth growth.</li>;
                        if (+investRate > 0) return <li>📈 Only investing {investRate}% of income. Increase SIPs to at least 15-20%.</li>;
                        return <li>💡 No investments recorded. Start with even {fmt(totalIncome * 0.1)}/month in SIPs.</li>;
                    })()}

                    {/* Specific Category Insights */}
                    {(() => {
                        const rent = expenses.find(e => e.label === 'Rent / EMI')?.amount || 0;
                        if (rent > 0 && totalIncome > 0 && rent > totalIncome * 0.3) {
                            return <li>🏠 Rent/EMI is {((rent / totalIncome) * 100).toFixed(0)}% of income (recommended: under 30%). Consider downsizing or increasing income.</li>;
                        }
                        return null;
                    })()}
                    {(() => {
                        const entertainment = expenses.find(e => e.label === 'Entertainment')?.amount || 0;
                        const shopping = expenses.find(e => e.label === 'Shopping / Personal')?.amount || 0;
                        const discretionary = entertainment + shopping;
                        if (discretionary > totalIncome * 0.15) {
                            return <li>🛍️ Entertainment + Shopping is {fmt(discretionary)}/month ({((discretionary / totalIncome) * 100).toFixed(0)}% of income). Reducing by 20% saves {fmt(discretionary * 0.2 * 12)}/year.</li>;
                        }
                        return null;
                    })()}
                </ul>
            </div>

            {/* Tips */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                <p className="text-sm font-semibold text-amber-800 mb-2">💡 Budget Tips</p>
                <ul className="text-xs text-amber-700 space-y-1">
                    <li>• Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
                    <li>• Build an emergency fund covering 6 months of expenses first</li>
                    <li>• Automate SIPs on salary day to enforce discipline</li>
                    <li>• Review and adjust your budget every quarter</li>
                </ul>
            </div>
        </motion.div>
    );
}