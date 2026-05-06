import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

type Regime = 'old' | 'new';

const OLD_SLABS = [
    { min: 0, max: 250000, rate: 0 },
    { min: 250000, max: 500000, rate: 5 },
    { min: 500000, max: 1000000, rate: 20 },
    { min: 1000000, max: Infinity, rate: 30 },
];

const NEW_SLABS = [
    { min: 0, max: 300000, rate: 0 },
    { min: 300000, max: 700000, rate: 5 },
    { min: 700000, max: 1000000, rate: 10 },
    { min: 1000000, max: 1200000, rate: 15 },
    { min: 1200000, max: 1500000, rate: 20 },
    { min: 1500000, max: Infinity, rate: 30 },
];

function calcTax(income: number, slabs: typeof OLD_SLABS, deductions: number) {
    const taxable = Math.max(0, income - deductions);
    let tax = 0;
    for (const slab of slabs) {
        if (taxable <= slab.min) break;
        const amt = Math.min(taxable, slab.max) - slab.min;
        tax += amt * (slab.rate / 100);
    }
    const cess = tax * 0.04;
    return { taxable, tax, cess, total: tax + cess };
}

export default function TaxCalculator() {
    const user = useAuthStore((s) => s.user);
    const nav = useNavigate();
    const isPro = user?.plan === 'pro';

    if (!isPro) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <span className="material-symbols-outlined text-6xl text-primary/30">lock</span>
                <h2 className="text-xl font-bold">Pro Feature</h2>
                <p className="text-on-surface-variant max-w-md">Tax Calculator is available on the Pro plan. Upgrade to access this and other premium features.</p>
                <button onClick={() => nav('/dashboard/pricing')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold">Upgrade to Pro</button>
            </div>
        );
    }

    const [regime, setRegime] = useState<Regime>('new');
    const [income, setIncome] = useState(1200000);
    const [hra, setHra] = useState(0);
    const [sec80c, setSec80c] = useState(150000);
    const [sec80d, setSec80d] = useState(25000);
    const [nps, setNps] = useState(50000);
    const [homeLoan, setHomeLoan] = useState(0);
    const [otherDed, setOtherDed] = useState(0);
    const [stcg, setStcg] = useState(0);
    const [ltcg, setLtcg] = useState(0);

    const oldDed = regime === 'old' ? sec80c + sec80d + nps + homeLoan + hra + otherDed : 75000; // new regime standard deduction
    const slabs = regime === 'old' ? OLD_SLABS : NEW_SLABS;
    const result = calcTax(income, slabs, oldDed);

    const stcgTax = stcg * 0.20;
    const ltcgTax = Math.max(0, ltcg - 125000) * 0.125;
    const grandTotal = result.total + stcgTax + ltcgTax;

    const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-3">
                <span className="material-symbols-outlined text-primary text-3xl">calculate</span>
                <div>
                    <h1 className="text-2xl font-headline font-bold">Income Tax Calculator</h1>
                    <p className="text-sm text-on-surface-variant">FY 2025-26 (AY 2026-27) • Old & New Regime</p>
                </div>
            </div>

            {/* Regime Toggle */}
            <div className="flex space-x-2 bg-surface-container-low rounded-2xl p-1">
                {(['new', 'old'] as Regime[]).map(r => (
                    <button key={r} onClick={() => setRegime(r)} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${regime === r ? 'bg-primary text-white shadow-lg' : 'text-on-surface-variant hover:bg-white/50'}`}>
                        {r === 'new' ? '🆕 New Regime' : '📋 Old Regime'}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input */}
                <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6 space-y-4">
                    <h3 className="font-bold text-lg">Income Details</h3>
                    <div>
                        <label className="text-sm font-medium text-on-surface-variant">Gross Annual Income</label>
                        <input type="number" value={income} onChange={e => setIncome(+e.target.value)} className="w-full mt-1 px-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-lg focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    </div>

                    {regime === 'old' && (
                        <>
                            <h4 className="font-semibold text-sm text-primary mt-4">Deductions</h4>
                            {[
                                { label: 'HRA Exemption', val: hra, set: setHra },
                                { label: 'Section 80C (PPF, ELSS, LIC etc.)', val: sec80c, set: setSec80c },
                                { label: 'Section 80D (Health Insurance)', val: sec80d, set: setSec80d },
                                { label: 'NPS (80CCD 1B)', val: nps, set: setNps },
                                { label: 'Home Loan Interest (Sec 24)', val: homeLoan, set: setHomeLoan },
                                { label: 'Other Deductions', val: otherDed, set: setOtherDed },
                            ].map(d => (
                                <div key={d.label}>
                                    <label className="text-xs text-on-surface-variant">{d.label}</label>
                                    <input type="number" value={d.val} onChange={e => d.set(+e.target.value)} className="w-full mt-0.5 px-3 py-2 rounded-lg border border-outline-variant/20 font-mono text-sm" />
                                </div>
                            ))}
                        </>
                    )}

                    <h4 className="font-semibold text-sm text-primary mt-4">Capital Gains (Stock Market)</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-on-surface-variant">STCG (Short Term)</label>
                            <input type="number" value={stcg} onChange={e => setStcg(+e.target.value)} className="w-full mt-0.5 px-3 py-2 rounded-lg border border-outline-variant/20 font-mono text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-on-surface-variant">LTCG (Long Term)</label>
                            <input type="number" value={ltcg} onChange={e => setLtcg(+e.target.value)} className="w-full mt-0.5 px-3 py-2 rounded-lg border border-outline-variant/20 font-mono text-sm" />
                        </div>
                    </div>
                </div>

                {/* Result */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20 p-6 space-y-4">
                        <h3 className="font-bold text-lg">Tax Summary ({regime === 'new' ? 'New' : 'Old'} Regime)</h3>
                        {[
                            { l: 'Gross Income', v: fmt(income) },
                            { l: 'Total Deductions', v: fmt(oldDed) },
                            { l: 'Taxable Income', v: fmt(result.taxable), bold: true },
                            { l: 'Income Tax', v: fmt(result.tax) },
                            { l: 'Health & Education Cess (4%)', v: fmt(result.cess) },
                            ...(stcg > 0 ? [{ l: 'STCG Tax (20%)', v: fmt(stcgTax) }] : []),
                            ...(ltcg > 0 ? [{ l: 'LTCG Tax (12.5% above ₹1.25L)', v: fmt(ltcgTax) }] : []),
                        ].map(r => (
                            <div key={r.l} className={`flex justify-between ${(r as any).bold ? 'font-bold text-primary border-t border-primary/20 pt-2' : 'text-sm'}`}>
                                <span className="text-on-surface-variant">{r.l}</span>
                                <span className="font-mono">{r.v}</span>
                            </div>
                        ))}
                        <div className="flex justify-between text-xl font-bold border-t-2 border-primary/30 pt-3">
                            <span>Total Tax Payable</span>
                            <span className="text-primary font-mono">{fmt(grandTotal)}</span>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-on-surface-variant">Effective Tax Rate: <span className="font-bold">{income > 0 ? ((grandTotal / income) * 100).toFixed(1) : 0}%</span></p>
                            <p className="text-xs text-on-surface-variant">Monthly Tax: <span className="font-bold">{fmt(grandTotal / 12)}</span></p>
                        </div>
                    </div>

                    {/* Tax Slabs */}
                    <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6">
                        <h3 className="font-bold mb-3">{regime === 'new' ? 'New' : 'Old'} Regime Tax Slabs</h3>
                        <table className="w-full text-sm">
                            <thead><tr className="border-b-2 border-primary/20">
                                <th className="text-left py-2">Income Slab</th>
                                <th className="text-right py-2">Rate</th>
                                <th className="text-right py-2">Tax</th>
                            </tr></thead>
                            <tbody>
                                {slabs.map((s, i) => {
                                    const taxable = result.taxable;
                                    if (taxable <= s.min) return null;
                                    const amt = Math.min(taxable, s.max === Infinity ? taxable : s.max) - s.min;
                                    return (
                                        <tr key={i} className="border-b border-outline-variant/10">
                                            <td className="py-2">{fmt(s.min)} – {s.max === Infinity ? 'Above' : fmt(s.max)}</td>
                                            <td className="text-right font-mono">{s.rate}%</td>
                                            <td className="text-right font-mono font-bold">{fmt(amt * s.rate / 100)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Regime Comparison */}
                    {(() => {
                        const oldDedCalc = sec80c + sec80d + nps + homeLoan + hra + otherDed;
                        const oldResult = calcTax(income, OLD_SLABS, oldDedCalc);
                        const newResult = calcTax(income, NEW_SLABS, 75000);
                        const oldTotal = oldResult.total + stcg * 0.20 + Math.max(0, ltcg - 125000) * 0.125;
                        const newTotal = newResult.total + stcg * 0.20 + Math.max(0, ltcg - 125000) * 0.125;
                        const diff = oldTotal - newTotal;
                        const better = diff > 0 ? 'new' : diff < 0 ? 'old' : 'same';
                        return (
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
                                <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined">compare_arrows</span>
                                    Regime Comparison
                                </h3>
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div className={`p-3 rounded-xl ${better === 'old' ? 'bg-india-green/10 border-2 border-india-green/30' : 'bg-white border border-outline-variant/20'}`}>
                                        <p className="text-xs font-semibold">Old Regime</p>
                                        <p className="font-mono font-bold text-lg">{fmt(oldTotal)}</p>
                                        {better === 'old' && <span className="text-[10px] text-india-green font-bold">✓ BETTER</span>}
                                    </div>
                                    <div className={`p-3 rounded-xl ${better === 'new' ? 'bg-india-green/10 border-2 border-india-green/30' : 'bg-white border border-outline-variant/20'}`}>
                                        <p className="text-xs font-semibold">New Regime</p>
                                        <p className="font-mono font-bold text-lg">{fmt(newTotal)}</p>
                                        {better === 'new' && <span className="text-[10px] text-india-green font-bold">✓ BETTER</span>}
                                    </div>
                                </div>
                                <p className="text-sm text-amber-800">
                                    {better === 'new' && `💡 New regime saves you ${fmt(Math.abs(diff))}/year. Stick with new regime.`}
                                    {better === 'old' && `💡 Old regime saves you ${fmt(Math.abs(diff))}/year with your deductions. Use old regime.`}
                                    {better === 'same' && '💡 Both regimes result in the same tax. Choose based on convenience.'}
                                </p>
                            </div>
                        );
                    })()}

                    {/* DhanSathi Analysis */}
                    <div className="bg-sky-50 rounded-2xl p-5 border border-sky-200">
                        <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined">psychology</span>
                            DhanSathi Analysis
                        </h3>
                        <ul className="space-y-2 text-sm text-on-surface-variant">
                            {income > 0 && <li>📊 Effective tax rate: <strong>{((grandTotal / income) * 100).toFixed(1)}%</strong> — you take home {fmt(income - grandTotal)}/year ({fmt((income - grandTotal) / 12)}/month).</li>}
                            {regime === 'old' && sec80c < 150000 && <li>💰 You can invest {fmt(150000 - sec80c)} more in 80C (ELSS/PPF) to save up to {fmt((150000 - sec80c) * 0.312)} in tax.</li>}
                            {regime === 'old' && sec80d === 0 && <li>🏥 Get health insurance! ₹25,000 in 80D saves up to {fmt(25000 * 0.312)} in tax.</li>}
                            {regime === 'old' && nps === 0 && <li>📈 NPS contribution of ₹50,000 (80CCD 1B) can save up to {fmt(50000 * 0.312)} extra.</li>}
                            {stcg > 0 && <li>⚡ STCG of {fmt(stcg)} taxed at 20% = {fmt(stcgTax)}. Hold stocks for 1+ year to convert to LTCG (12.5% with ₹1.25L exemption).</li>}
                            {ltcg > 125000 && <li>📈 LTCG above ₹1.25L: {fmt(ltcg - 125000)} taxed at 12.5%. Consider harvesting gains annually to stay under the exemption limit.</li>}
                            {ltcg > 0 && ltcg <= 125000 && <li>✅ Your LTCG of {fmt(ltcg)} is within the ₹1.25L tax-free limit. No LTCG tax!</li>}
                            {income > 5000000 && <li>⚠️ High income alert: Consider tax-loss harvesting and maximizing all deductions.</li>}
                            {grandTotal === 0 && income > 0 && <li>🎉 Zero tax liability! Your deductions fully offset your income tax.</li>}
                        </ul>
                    </div>

                    {/* Tips */}
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                        <p className="text-sm font-semibold text-amber-800 mb-2">💡 Tax Saving Tips</p>
                        <ul className="text-xs text-amber-700 space-y-1">
                            <li>• Invest ₹1.5L in 80C (ELSS, PPF, NPS) to save up to ₹46,800</li>
                            <li>• Health insurance (80D) saves up to ₹7,500–₹15,600</li>
                            <li>• NPS extra ₹50K (80CCD 1B) saves up to ₹15,600</li>
                            <li>• LTCG up to ₹1.25 lakh/year is tax-free on equity</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}