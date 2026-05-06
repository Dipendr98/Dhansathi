import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MonthData {
    income: number;
    expenses: number;
    investments: number;
    portfolioValue: number;
}

function getLastNMonthKeys(n: number): string[] {
    const keys: string[] = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return keys;
}

function blankMonth(): MonthData {
    return { income: 0, expenses: 0, investments: 0, portfolioValue: 0 };
}

const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function MonthlyReports() {
    const user = useAuthStore((s) => s.user);
    const nav = useNavigate();
    const isPro = user?.plan === 'pro';

    if (!isPro) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <span className="material-symbols-outlined text-6xl text-primary/30">lock</span>
                <h2 className="text-xl font-bold">Pro Feature</h2>
                <p className="text-on-surface-variant max-w-md">Monthly Reports is available on the Pro plan.</p>
                <button onClick={() => nav('/dashboard/pricing')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold">Upgrade to Pro</button>
            </div>
        );
    }

    const months = useMemo(() => getLastNMonthKeys(12), []);
    const [data, setData] = useState<Record<string, MonthData>>(() => {
        const init: Record<string, MonthData> = {};
        months.forEach(k => { init[k] = blankMonth(); });
        return init;
    });
    const [selected, setSelected] = useState(months[months.length - 1]);
    const [editing, setEditing] = useState(false);

    const current = data[selected];
    const prevKey = months[months.indexOf(selected) - 1];
    const prev = prevKey ? data[prevKey] : null;

    const savings = current.income - current.expenses;
    const savingsRate = current.income > 0 ? ((savings / current.income) * 100) : 0;
    const returns = current.portfolioValue > 0 && prev?.portfolioValue
        ? (((current.portfolioValue - prev.portfolioValue) / prev.portfolioValue) * 100)
        : 0;

    const updateField = (month: string, field: keyof MonthData, value: number) => {
        setData(prev => ({ ...prev, [month]: { ...prev[month], [field]: value } }));
    };

    const change = (curr: number, old: number | undefined) => {
        if (!old || old === 0) return null;
        return +((curr - old) / old * 100).toFixed(1);
    };

    const filledMonths = months.filter(k => data[k].income > 0 || data[k].expenses > 0);
    const totalIncome = filledMonths.reduce((s, k) => s + data[k].income, 0);
    const totalExpenses = filledMonths.reduce((s, k) => s + data[k].expenses, 0);
    const totalSavings = totalIncome - totalExpenses;
    const totalInvested = filledMonths.reduce((s, k) => s + data[k].investments, 0);
    const avgSavingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : '0';
    const hasData = filledMonths.length > 0;

    // Analysis insights
    const insights: string[] = [];
    if (hasData) {
        const avgMonthlyIncome = totalIncome / filledMonths.length;
        const avgMonthlyExpense = totalExpenses / filledMonths.length;
        const highestExpMonth = filledMonths.reduce((a, b) => data[a].expenses > data[b].expenses ? a : b);
        const lowestExpMonth = filledMonths.reduce((a, b) => data[a].expenses < data[b].expenses ? a : b);

        if (+avgSavingsRate >= 30) insights.push('🌟 Your average savings rate is excellent (above 30%). Keep it up!');
        else if (+avgSavingsRate >= 20) insights.push('👍 Your savings rate is good (20-30%). Try to push it above 30%.');
        else if (+avgSavingsRate >= 10) insights.push('⚡ Your savings rate is below 20%. Consider cutting discretionary spending.');
        else if (+avgSavingsRate > 0) insights.push('🚨 Your savings rate is critically low. Review your expenses urgently.');
        else insights.push('⚠️ You are spending more than you earn on average. This is unsustainable.');

        if (filledMonths.length >= 2) {
            const hd = new Date(highestExpMonth + '-01');
            const ld = new Date(lowestExpMonth + '-01');
            insights.push(`📊 Highest spending month: ${MONTHS[hd.getMonth()]} (${fmt(data[highestExpMonth].expenses)})`);
            insights.push(`💰 Lowest spending month: ${MONTHS[ld.getMonth()]} (${fmt(data[lowestExpMonth].expenses)})`);
        }

        if (totalInvested > 0) {
            const investRate = ((totalInvested / totalIncome) * 100).toFixed(1);
            insights.push(`📈 You invested ${investRate}% of your income. Target at least 15-20%.`);
        } else {
            insights.push('💡 You haven\'t recorded any investments. Start SIPs to build wealth.');
        }

        if (avgMonthlyExpense > avgMonthlyIncome * 0.7) {
            insights.push('⚠️ Expenses exceed 70% of income. Reduce non-essential spending.');
        }

        // Trend analysis
        if (filledMonths.length >= 3) {
            const last3 = filledMonths.slice(-3);
            const expTrend = last3.map(k => data[k].expenses);
            const increasing = expTrend[2] > expTrend[1] && expTrend[1] > expTrend[0];
            const decreasing = expTrend[2] < expTrend[1] && expTrend[1] < expTrend[0];
            if (increasing) insights.push('📈 Your expenses have been increasing for 3 months. Watch out!');
            if (decreasing) insights.push('📉 Great! Your expenses have been decreasing for 3 months.');
        }
    }

    function ChangeIndicator({ value }: { value: number | null }) {
        if (value === null) return null;
        const positive = value >= 0;
        return (
            <span className={`text-[10px] font-bold ${positive ? 'text-india-green' : 'text-red-500'}`}>
                {positive ? '▲' : '▼'} {Math.abs(value)}%
            </span>
        );
    }

    const maxBar = Math.max(1, ...months.map(k => Math.max(data[k].income, data[k].expenses)));

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <span className="material-symbols-outlined text-primary text-3xl">assessment</span>
                    <div>
                        <h1 className="text-2xl font-headline font-bold">Monthly Reports</h1>
                        <p className="text-sm text-on-surface-variant">Enter your monthly data to track financial progress</p>
                    </div>
                </div>
                <button
                    onClick={() => setEditing(!editing)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${editing ? 'bg-india-green text-white' : 'bg-primary text-white'}`}
                >
                    <span className="material-symbols-outlined text-sm align-middle mr-1">{editing ? 'check' : 'edit'}</span>
                    {editing ? 'Done' : 'Enter Data'}
                </button>
            </div>

            {/* Month Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {months.map(m => {
                    const d = new Date(m + '-01');
                    const label = `${MONTHS[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
                    const hasMData = data[m].income > 0 || data[m].expenses > 0;
                    return (
                        <button key={m} onClick={() => setSelected(m)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selected === m ? 'bg-primary text-white shadow-lg' : hasMData ? 'bg-india-green/10 text-india-green border border-india-green/30' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}>
                            {label}
                            {hasMData && selected !== m && <span className="ml-1">✓</span>}
                        </button>
                    );
                })}
            </div>

            {/* Data Entry Form */}
            {editing && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white rounded-2xl shadow-lg border-2 border-primary/20 p-6">
                    <h3 className="font-bold mb-4 text-primary">
                        Enter Data for {(() => { const d = new Date(selected + '-01'); return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`; })()}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Monthly Income', field: 'income' as keyof MonthData, icon: 'payments', color: 'text-india-green' },
                            { label: 'Monthly Expenses', field: 'expenses' as keyof MonthData, icon: 'receipt_long', color: 'text-red-500' },
                            { label: 'Amount Invested', field: 'investments' as keyof MonthData, icon: 'account_balance', color: 'text-purple-600' },
                            { label: 'Portfolio Value', field: 'portfolioValue' as keyof MonthData, icon: 'pie_chart', color: 'text-amber-600' },
                        ].map(f => (
                            <div key={f.field}>
                                <label className="text-xs font-medium text-on-surface-variant flex items-center gap-1">
                                    <span className={`material-symbols-outlined text-sm ${f.color}`}>{f.icon}</span>
                                    {f.label}
                                </label>
                                <input
                                    type="number"
                                    value={current[f.field] || ''}
                                    onChange={e => updateField(selected, f.field, +e.target.value || 0)}
                                    placeholder="0"
                                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                />
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-3">💡 Tip: Select different months from the tabs above to enter data for each month.</p>
                </motion.div>
            )}

            {!hasData && !editing && (
                <div className="bg-amber-50 rounded-2xl p-8 border border-amber-200 text-center">
                    <span className="material-symbols-outlined text-5xl text-amber-400">edit_note</span>
                    <h3 className="font-bold text-lg mt-3">No Data Yet</h3>
                    <p className="text-sm text-on-surface-variant mt-1 max-w-md mx-auto">Click "Enter Data" above to start entering your monthly income, expenses, and investment details. DhanSathi will analyze your financial trends.</p>
                </div>
            )}

            {hasData && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                            { label: 'Income', value: fmt(current.income), change: change(current.income, prev?.income), icon: 'trending_up', color: 'text-india-green', bg: 'bg-green-50' },
                            { label: 'Expenses', value: fmt(current.expenses), change: change(current.expenses, prev?.expenses), icon: 'shopping_cart', color: 'text-red-500', bg: 'bg-red-50' },
                            { label: 'Savings', value: fmt(savings), change: change(savings, prev ? prev.income - prev.expenses : undefined), icon: 'savings', color: 'text-primary', bg: 'bg-blue-50' },
                            { label: 'Invested', value: fmt(current.investments), change: change(current.investments, prev?.investments), icon: 'account_balance', color: 'text-purple-600', bg: 'bg-purple-50' },
                            { label: 'Portfolio', value: fmt(current.portfolioValue), change: change(current.portfolioValue, prev?.portfolioValue), icon: 'pie_chart', color: 'text-amber-600', bg: 'bg-amber-50' },
                            { label: 'Returns', value: `${returns.toFixed(1)}%`, change: null, icon: returns >= 0 ? 'arrow_upward' : 'arrow_downward', color: returns >= 0 ? 'text-india-green' : 'text-red-500', bg: returns >= 0 ? 'bg-green-50' : 'bg-red-50' },
                        ].map(c => (
                            <div key={c.label} className={`${c.bg} rounded-2xl p-4 border border-outline-variant/10`}>
                                <div className="flex items-center justify-between">
                                    <span className={`material-symbols-outlined ${c.color} text-xl`}>{c.icon}</span>
                                    <ChangeIndicator value={c.change} />
                                </div>
                                <p className="text-[10px] text-on-surface-variant mt-2">{c.label}</p>
                                <p className={`font-mono font-bold ${c.color}`}>{c.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Savings Rate Gauge */}
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-5 border border-primary/20">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold">Monthly Savings Rate</h3>
                            <span className={`text-2xl font-bold font-mono ${savingsRate >= 30 ? 'text-india-green' : savingsRate >= 20 ? 'text-amber-600' : 'text-red-500'}`}>
                                {savingsRate.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${savingsRate >= 30 ? 'bg-india-green' : savingsRate >= 20 ? 'bg-amber-500' : savingsRate >= 0 ? 'bg-red-400' : 'bg-red-600'}`}
                                style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-on-surface-variant mt-1">
                            <span>0%</span>
                            <span className="text-red-400">10%</span>
                            <span className="text-amber-500">20%</span>
                            <span className="text-india-green font-bold">30%+ ✓</span>
                        </div>
                    </div>

                    {/* Income vs Expenses Chart */}
                    <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6">
                        <h3 className="font-bold mb-4">Income vs Expenses (12 Months)</h3>
                        <div className="space-y-2">
                            {months.map(m => {
                                const d = new Date(m + '-01');
                                const label = MONTHS[d.getMonth()];
                                const md = data[m];
                                if (md.income === 0 && md.expenses === 0) {
                                    return (
                                        <div key={m} className="flex items-center gap-3 opacity-30">
                                            <span className="text-xs font-mono w-8 text-on-surface-variant">{label}</span>
                                            <div className="flex-1 text-xs text-on-surface-variant italic">No data</div>
                                        </div>
                                    );
                                }
                                const mSavings = md.income - md.expenses;
                                return (
                                    <div key={m} className={`flex items-center gap-3 ${m === selected ? 'bg-primary/5 -mx-2 px-2 py-1 rounded-lg' : ''}`}>
                                        <span className="text-xs font-mono w-8 text-on-surface-variant">{label}</span>
                                        <div className="flex-1 flex flex-col gap-0.5">
                                            <div className="h-3 rounded-full bg-india-green/20 relative overflow-hidden">
                                                <div className="h-full bg-india-green rounded-full transition-all" style={{ width: `${(md.income / maxBar) * 100}%` }} />
                                            </div>
                                            <div className="h-3 rounded-full bg-red-100 relative overflow-hidden">
                                                <div className="h-full bg-red-400 rounded-full transition-all" style={{ width: `${(md.expenses / maxBar) * 100}%` }} />
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-mono w-16 text-right ${mSavings >= 0 ? 'text-india-green' : 'text-red-500'}`}>{fmt(mSavings)}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex gap-6 mt-3 text-xs text-on-surface-variant">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-india-green" /> Income</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400" /> Expenses</span>
                        </div>
                    </div>

                    {/* AI Analysis */}
                    {insights.length > 0 && (
                        <div className="bg-sky-50 rounded-2xl p-5 border border-sky-200">
                            <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined">psychology</span>
                                DhanSathi Analysis
                            </h3>
                            <ul className="space-y-2">
                                {insights.map((insight, i) => (
                                    <li key={i} className="text-sm text-on-surface-variant">{insight}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Annual Summary */}
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
                        <h3 className="font-bold mb-3">Annual Summary ({filledMonths.length} months of data)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                            <div>
                                <p className="text-xs text-on-surface-variant">Total Income</p>
                                <p className="font-mono font-bold text-lg text-india-green">{fmt(totalIncome)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-on-surface-variant">Total Expenses</p>
                                <p className="font-mono font-bold text-lg text-red-500">{fmt(totalExpenses)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-on-surface-variant">Total Saved</p>
                                <p className="font-mono font-bold text-lg text-primary">{fmt(totalSavings)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-on-surface-variant">Total Invested</p>
                                <p className="font-mono font-bold text-lg text-purple-600">{fmt(totalInvested)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-on-surface-variant">Avg Savings Rate</p>
                                <p className="font-mono font-bold text-lg text-primary">{avgSavingsRate}%</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
}