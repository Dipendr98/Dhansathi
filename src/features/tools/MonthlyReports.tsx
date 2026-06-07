import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useProToolsStore, type MonthData } from '@/stores/proToolsStore';
import ReportDataEntry from './monthly-reports/ReportDataEntry';
import ReportDashboard from './monthly-reports/ReportDashboard';
import ReportCharts from './monthly-reports/ReportCharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
    return { 
        income: 0, expenses: 0, investments: 0, portfolioValue: 0,
        incomeDetails: {}, expenseDetails: {}, savingsDetails: {}, assetDetails: {}, liabilityDetails: {},
        goals: [], notes: ''
    };
}

export default function MonthlyReports() {
    const months = useMemo(() => getLastNMonthKeys(12), []);
    const { monthlyData, setMonthlyData, reportProfile, setReportProfile } = useProToolsStore();

    const data = useMemo(() => {
        const res: Record<string, MonthData> = {};
        months.forEach(k => { res[k] = monthlyData[k] || blankMonth(); });
        return res;
    }, [monthlyData, months]);

    const [selected, setSelected] = useState(months[months.length - 1]);
    const [view, setView] = useState<'dashboard' | 'dataEntry'>('dashboard');

    const current = data[selected];
    const prevKey = months[months.indexOf(selected) - 1];
    const prev = prevKey ? data[prevKey] : null;

    const hasData = Object.keys(current.incomeDetails || {}).length > 0 || Object.keys(current.expenseDetails || {}).length > 0;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6 tax-calculator-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print-hidden">
                <div className="flex items-center space-x-3">
                    <span className="material-symbols-outlined text-primary text-4xl p-3 bg-primary/10 rounded-xl">assessment</span>
                    <div>
                        <h1 className="text-3xl font-headline font-bold m-0 tracking-tight">Monthly Reports</h1>
                        <p className="text-sm text-on-surface-variant m-0 mt-1">Track your income, expenses, and net worth comprehensively.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setView('dataEntry')}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${view === 'dataEntry' ? 'bg-primary text-white shadow-md' : 'bg-surface-container hover:bg-surface-container-high'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">edit_document</span>
                        Enter Data
                    </button>
                    <button
                        onClick={() => setView('dashboard')}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${view === 'dashboard' ? 'bg-primary text-white shadow-md' : 'bg-surface-container hover:bg-surface-container-high'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">analytics</span>
                        Dashboard
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold bg-surface-container hover:bg-surface-container-high transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Month Selector Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar print-hidden">
                {months.map(m => {
                    const d = new Date(m + '-01');
                    const label = `${MONTHS[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
                    const md = data[m];
                    const isFilled = Object.keys(md.incomeDetails || {}).length > 0 || Object.keys(md.expenseDetails || {}).length > 0;
                    
                    return (
                        <button 
                            key={m} 
                            onClick={() => setSelected(m)} 
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5
                                ${selected === m 
                                    ? 'bg-primary text-white shadow-lg scale-105' 
                                    : isFilled 
                                        ? 'bg-india-green/10 text-india-green border border-india-green/30 hover:bg-india-green/20' 
                                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}
                        >
                            {label}
                            {isFilled && selected !== m && <span className="material-symbols-outlined text-[14px]">check_circle</span>}
                        </button>
                    );
                })}
            </div>

            {view === 'dataEntry' ? (
                <ReportDataEntry 
                    monthKey={selected} 
                    data={current} 
                    prevData={prev} 
                    profile={reportProfile}
                    setProfile={setReportProfile}
                    updateData={setMonthlyData}
                    onSave={() => setView('dashboard')}
                />
            ) : (
                <div className="space-y-6">
                    {hasData ? (
                        <>
                            <div className="mb-4">
                                <h2 className="text-xl font-bold">Performance for {MONTHS[new Date(selected + '-01').getMonth()]} {new Date(selected + '-01').getFullYear()}</h2>
                            </div>
                            <ReportDashboard current={current} prev={prev} />
                            
                            <div className="pt-6 mt-6 border-t border-outline-variant/20">
                                <h2 className="text-xl font-bold mb-6">Advanced Analytics</h2>
                                <ReportCharts months={months} data={data} currentMonthKey={selected} />
                            </div>
                        </>
                    ) : (
                        <div className="bg-amber-50 rounded-2xl p-10 border border-amber-200 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-4xl text-amber-500">receipt_long</span>
                            </div>
                            <h3 className="font-bold text-xl text-amber-900">No Data for {MONTHS[new Date(selected + '-01').getMonth()]}</h3>
                            <p className="text-sm text-amber-800 mt-2 max-w-md">
                                Enter this month's income, expenses, investments, and assets to generate your report and track your financial trends.
                            </p>
                            <button 
                                onClick={() => setView('dataEntry')}
                                className="mt-6 bg-primary text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-primary/90 active:scale-95 transition-all"
                            >
                                Enter Data Now
                            </button>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}
