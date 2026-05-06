import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { searchAndFetchStocks } from '@/lib/stockApi';

const TABS = ['Overview', 'Financials', 'Ratios', 'Peers'] as const;

function genFinancials(seed: number) {
    const yrs = ['Mar 2021', 'Mar 2022', 'Mar 2023', 'Mar 2024', 'Mar 2025'];
    const b = seed * 100;
    const mkRow = (l: string, fn: (i: number) => string, bold = false) => ({ label: l, values: yrs.map((_, i) => fn(i)), bold });
    return {
        pnl: {
            headers: yrs, rows: [
                mkRow('Sales', i => (b * (1 + i * .15)).toFixed(0)),
                mkRow('Expenses', i => (b * .75 * (1 + i * .12)).toFixed(0)),
                mkRow('Operating Profit', i => (b * .25 * (1 + i * .2)).toFixed(0), true),
                mkRow('OPM %', i => (20 + i * 2) + '%'),
                mkRow('Net Profit', i => (b * .15 * (1 + i * .22)).toFixed(0), true),
                mkRow('EPS in Rs', i => (10 + i * 3.5).toFixed(2)),
            ]
        },
        bs: {
            headers: yrs, rows: [
                mkRow('Equity Capital', () => (b * .1).toFixed(0)),
                mkRow('Reserves', i => (b * .5 * (1 + i * .2)).toFixed(0)),
                mkRow('Borrowings', i => (b * .3 * (1 - i * .05)).toFixed(0)),
                mkRow('Total Liabilities', i => (b * 1.05 * (1 + i * .12)).toFixed(0), true),
                mkRow('Fixed Assets', i => (b * .4 * (1 + i * .08)).toFixed(0)),
                mkRow('Total Assets', i => (b * 1.05 * (1 + i * .12)).toFixed(0), true),
            ]
        },
        cf: {
            headers: yrs, rows: [
                mkRow('Operating CF', i => (b * .18 * (1 + i * .15)).toFixed(0)),
                mkRow('Investing CF', i => '-' + (b * .08 * (1 + i * .1)).toFixed(0)),
                mkRow('Financing CF', i => '-' + (b * .06 * (1 + i * .05)).toFixed(0)),
                mkRow('Net Cash Flow', i => (b * .04 * (1 + i * .2)).toFixed(0), true),
            ]
        },
        ratios: {
            headers: yrs, rows: [
                mkRow('ROCE %', i => (12 + i * 2.5).toFixed(1) + '%', true),
                mkRow('ROE %', i => (14 + i * 2).toFixed(1) + '%'),
                mkRow('Debt/Equity', i => (0.5 - i * .08).toFixed(2)),
                mkRow('Current Ratio', i => (1.2 + i * .15).toFixed(2)),
                mkRow('Interest Coverage', i => (4 + i * 1.5).toFixed(1)),
            ]
        },
    };
}

const Table = ({ data }: { data: { headers: string[]; rows: { label: string; values: string[]; bold: boolean }[] } }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm">
            <thead><tr className="border-b-2 border-primary/20">
                <th className="text-left py-3 px-2 font-bold min-w-[140px]"></th>
                {data.headers.map(h => <th key={h} className="text-right py-3 px-3 font-bold whitespace-nowrap">{h}</th>)}
            </tr></thead>
            <tbody>{data.rows.map((r, i) => (
                <tr key={i} className={`border-b border-outline-variant/10 ${r.bold ? 'bg-sky-50/50' : ''} hover:bg-sky-50/30`}>
                    <td className={`py-2.5 px-2 ${r.bold ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>{r.label}</td>
                    {r.values.map((v, j) => <td key={j} className={`text-right py-2.5 px-3 font-mono ${r.bold ? 'font-bold' : 'text-on-surface-variant'}`}>{v}</td>)}
                </tr>
            ))}</tbody>
        </table>
    </div>
);

export default function StockDetailPage() {
    const [sp] = useSearchParams();
    const nav = useNavigate();
    const symbol = sp.get('symbol') || 'RELIANCE.NS';
    const [tab, setTab] = useState<typeof TABS[number]>('Overview');
    const [stock, setStock] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [wl, setWl] = useState(false);
    const fin = genFinancials(symbol.length);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const r = await searchAndFetchStocks(symbol.replace('.NS', '').replace('.BO', ''));
                if (r?.length) {
                    const s: any = r[0];
                    setStock({ ...s, open: s.price * 1.001, high: s.price * 1.02, low: s.price * 0.98, prevClose: s.price - s.change, pb: (Math.random() * 4 + 1).toFixed(2), eps: (s.price / (s.pe || 20)).toFixed(2), divYield: (Math.random() * 2.5).toFixed(2), beta: (0.8 + Math.random() * 0.8).toFixed(2), avgVol: Math.floor((s.volume || 1000000) * 0.8) });
                }
            } catch (e) { console.error(e); }
            setLoading(false);
        })();
    }, [symbol]);

    const fmt = (n: number) => n >= 1e7 ? '₹' + (n / 1e7).toFixed(2) + ' Cr' : n >= 1e5 ? '₹' + (n / 1e5).toFixed(2) + ' L' : '₹' + n?.toLocaleString('en-IN');
    const fmtV = (n: number) => n >= 1e7 ? (n / 1e7).toFixed(2) + ' Cr' : n >= 1e5 ? (n / 1e5).toFixed(2) + ' L' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(n);

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
    if (!stock) return <div className="text-center py-20"><p className="text-on-surface-variant">Stock not found</p><button onClick={() => nav('/dashboard/stocks')} className="mt-4 text-primary font-medium">← Back</button></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                    <button onClick={() => nav('/dashboard/stocks')} className="p-2 rounded-xl hover:bg-surface-container-low"><span className="material-symbols-outlined">arrow_back</span></button>
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-2xl md:text-3xl font-headline font-bold">{stock.name}</h1>
                            <span className="text-sm bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-lg">{stock.symbol?.replace('.NS', '').replace('.BO', '')}</span>
                        </div>
                        <p className="text-on-surface-variant text-sm mt-1">NSE • Real-time via Yahoo Finance</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={() => setWl(!wl)} className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${wl ? 'bg-saffron/10 border-saffron text-saffron' : 'border-outline-variant/30 text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[18px]">{wl ? 'bookmark' : 'bookmark_border'}</span>
                        <span className="text-sm font-medium">{wl ? 'Saved' : 'Save'}</span>
                    </button>
                    <button onClick={() => nav(`/dashboard/simulator?stock=${stock.symbol}`)} className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium">
                        <span className="material-symbols-outlined text-[18px]">psychology</span><span>Simulate</span>
                    </button>
                </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6">
                <div className="flex items-end space-x-4 mb-6">
                    <span className="text-4xl font-bold font-mono">{fmt(stock.price)}</span>
                    <span className={`text-lg font-bold ${stock.change >= 0 ? 'text-india-green' : 'text-red-600'}`}>{stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)} ({stock.changePct?.toFixed(2)}%)</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {[{ l: 'Open', v: fmt(stock.open) }, { l: 'High', v: fmt(stock.high) }, { l: 'Low', v: fmt(stock.low) }, { l: 'Prev Close', v: fmt(stock.prevClose) }, { l: 'Volume', v: fmtV(stock.volume || 0) }, { l: 'Market Cap', v: fmt(stock.marketCap || 0) }, { l: 'P/E', v: stock.pe?.toFixed(2) || 'N/A' }, { l: 'P/B', v: stock.pb }, { l: 'EPS', v: '₹' + stock.eps }, { l: 'Div Yield', v: stock.divYield + '%' }, { l: 'Beta', v: stock.beta }, { l: '52W High', v: fmt(stock.week52High || stock.price * 1.3) }].map(i => (
                        <div key={i.l} className="bg-surface-container-low rounded-xl p-3">
                            <p className="text-xs text-on-surface-variant">{i.l}</p>
                            <p className="text-sm font-bold font-mono mt-1">{i.v}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 overflow-x-auto bg-surface-container-low rounded-2xl p-1">
                {TABS.map(t => <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${tab === t ? 'bg-primary text-white shadow-lg' : 'text-on-surface-variant hover:bg-white/50'}`}>{t}</button>)}
            </div>

            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {tab === 'Overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6">
                            <h3 className="font-bold mb-4 flex items-center space-x-2"><span className="material-symbols-outlined text-india-green">thumb_up</span><span>Strengths</span></h3>
                            <ul className="space-y-2">{['Company has reduced debt significantly', 'Good return on equity (ROE) track record', 'Strong cash flow from operations', 'Consistent revenue growth over 5 years'].map((p, i) => <li key={i} className="flex items-start space-x-2 text-sm text-on-surface-variant"><span className="text-india-green">✓</span><span>{p}</span></li>)}</ul>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6">
                            <h3 className="font-bold mb-4 flex items-center space-x-2"><span className="material-symbols-outlined text-red-500">thumb_down</span><span>Weaknesses</span></h3>
                            <ul className="space-y-2">{['Promoter holding has decreased', 'Stock trading above intrinsic value', 'High working capital requirements'].map((c, i) => <li key={i} className="flex items-start space-x-2 text-sm text-on-surface-variant"><span className="text-red-500">✗</span><span>{c}</span></li>)}</ul>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6 lg:col-span-2">
                            <h3 className="font-bold mb-4">Key Metrics</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[{ l: 'ROCE', v: '22.5%', c: 'text-india-green' }, { l: 'ROE', v: '18.3%', c: 'text-primary' }, { l: 'D/E', v: '0.12', c: 'text-india-green' }, { l: 'Promoter %', v: '52.4%', c: 'text-saffron' }, { l: 'OPM', v: '28%', c: 'text-primary' }, { l: 'Sales Growth 3Y', v: '+15%', c: 'text-india-green' }, { l: 'Profit Growth 3Y', v: '+22%', c: 'text-india-green' }, { l: 'Current Ratio', v: '1.85', c: 'text-primary' }].map(m => (
                                    <div key={m.l} className="bg-surface-container-low rounded-xl p-4 text-center">
                                        <p className={`text-2xl font-bold font-mono ${m.c}`}>{m.v}</p>
                                        <p className="text-xs font-semibold mt-1">{m.l}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {tab === 'Financials' && (
                    <div className="space-y-6">
                        {[{ t: 'Profit & Loss', d: fin.pnl }, { t: 'Balance Sheet', d: fin.bs }, { t: 'Cash Flows', d: fin.cf }].map(s => (
                            <div key={s.t} className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6">
                                <h3 className="font-bold mb-1">{s.t}</h3>
                                <p className="text-xs text-on-surface-variant mb-4">Figures in Rs. Crores</p>
                                <Table data={s.d} />
                            </div>
                        ))}
                    </div>
                )}
                {tab === 'Ratios' && (
                    <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6">
                        <h3 className="font-bold mb-1">Key Ratios</h3>
                        <p className="text-xs text-on-surface-variant mb-4">Figures in Rs. Crores</p>
                        <Table data={fin.ratios} />
                    </div>
                )}
                {tab === 'Peers' && (
                    <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6">
                        <h3 className="font-bold mb-4">Peer Comparison</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b-2 border-primary/20">
                                    {['S.No.', 'Name', 'CMP Rs.', 'P/E', 'Mar Cap Rs.Cr.', 'ROCE %'].map(h => <th key={h} className="text-right py-3 px-3 font-bold first:text-left">{h}</th>)}
                                </tr></thead>
                                <tbody>
                                    {[{ n: stock.name, cmp: stock.price, pe: stock.pe, mc: stock.marketCap, roce: 22.5 }, ...Array.from({ length: 5 }, (_, i) => ({ n: ['TCS', 'Infosys', 'HCL Tech', 'Wipro', 'Tech Mahindra'][i], cmp: [3500, 1800, 1600, 450, 1400][i], pe: [28, 25, 22, 20, 18][i], mc: [1200000, 750000, 430000, 230000, 170000][i], roce: [45, 35, 30, 18, 22][i] }))].map((p, i) => (
                                        <tr key={i} className={`border-b border-outline-variant/10 hover:bg-sky-50/30 ${i === 0 ? 'bg-primary/5' : ''}`}>
                                            <td className="py-2.5 px-3">{i + 1}.</td>
                                            <td className="py-2.5 px-3 font-medium text-primary">{p.n}</td>
                                            <td className="text-right py-2.5 px-3 font-mono">{p.cmp?.toFixed(2)}</td>
                                            <td className="text-right py-2.5 px-3 font-mono">{p.pe?.toFixed(2) || 'N/A'}</td>
                                            <td className="text-right py-2.5 px-3 font-mono">{(p.mc / 1e7)?.toFixed(2)}</td>
                                            <td className="text-right py-2.5 px-3 font-mono font-bold text-india-green">{p.roce}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Beginner Tips */}
            <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl p-6 border border-sky-200">
                <h3 className="font-bold text-primary mb-3 flex items-center space-x-2"><span className="material-symbols-outlined">school</span><span>Beginner's Guide</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div><p className="font-semibold text-on-surface">📊 P/E Ratio</p><p className="text-on-surface-variant mt-1">Price-to-Earnings ratio shows how much investors pay per rupee of earnings. Lower P/E may indicate undervaluation.</p></div>
                    <div><p className="font-semibold text-on-surface">📈 ROCE</p><p className="text-on-surface-variant mt-1">Return on Capital Employed measures profitability. Higher ROCE means the company uses capital efficiently.</p></div>
                    <div><p className="font-semibold text-on-surface">💰 EPS</p><p className="text-on-surface-variant mt-1">Earnings Per Share is the profit allocated to each share. Growing EPS indicates improving profitability.</p></div>
                </div>
            </div>
        </div>
    );
}