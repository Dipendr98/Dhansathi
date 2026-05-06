import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface SupportQuery {
    id: string;
    user_id: string;
    user_email: string;
    user_name: string | null;
    subject: string;
    category: string;
    message: string;
    status: 'pending' | 'in_progress' | 'resolved';
    admin_reply: string | null;
    replied_at: string | null;
    created_at: string;
}

const CATEGORIES: Record<string, { label: string; icon: string }> = {
    account: { label: 'Account & Profile', icon: 'person' },
    billing: { label: 'Billing & Subscription', icon: 'payment' },
    stocks: { label: 'Stocks & Trading', icon: 'trending_up' },
    schemes: { label: 'Government Schemes', icon: 'account_balance' },
    ai: { label: 'AI Features', icon: 'psychology' },
    bug: { label: 'Bug Report', icon: 'bug_report' },
    feature: { label: 'Feature Request', icon: 'lightbulb' },
    other: { label: 'Other', icon: 'help' },
};

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800', icon: 'schedule' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: 'autorenew' },
    resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: 'check_circle' },
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function AdminQueries() {
    const [queries, setQueries] = useState<SupportQuery[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [selectedQuery, setSelectedQuery] = useState<SupportQuery | null>(null);
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);
    const [newStatus, setNewStatus] = useState<string>('');

    useEffect(() => { fetchQueries(); }, []);

    async function fetchQueries() {
        setLoading(true);
        if (!isSupabaseConfigured) { setLoading(false); return; }
        try {
            const { data, error } = await supabase
                .from('support_queries')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && data) setQueries(data as SupportQuery[]);
        } catch (err) { console.error('Failed to fetch queries:', err); }
        setLoading(false);
    }

    const filtered = useMemo(() => {
        let list = [...queries];
        if (filterStatus !== 'all') list = list.filter((q) => q.status === filterStatus);
        if (filterCategory !== 'all') list = list.filter((q) => q.category === filterCategory);
        if (search) {
            const s = search.toLowerCase();
            list = list.filter((q) =>
                q.subject.toLowerCase().includes(s) ||
                q.user_email.toLowerCase().includes(s) ||
                (q.user_name || '').toLowerCase().includes(s) ||
                q.message.toLowerCase().includes(s),
            );
        }
        return list;
    }, [queries, filterStatus, filterCategory, search]);

    const stats = useMemo(() => ({
        total: queries.length,
        pending: queries.filter((q) => q.status === 'pending').length,
        in_progress: queries.filter((q) => q.status === 'in_progress').length,
        resolved: queries.filter((q) => q.status === 'resolved').length,
    }), [queries]);

    async function handleReply() {
        if (!selectedQuery || !replyText.trim()) return;
        setReplying(true);
        try {
            const status = newStatus || 'resolved';
            const { error } = await supabase
                .from('support_queries')
                .update({
                    admin_reply: replyText.trim(),
                    replied_at: new Date().toISOString(),
                    status,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', selectedQuery.id);

            if (!error) {
                setQueries((prev) =>
                    prev.map((q) =>
                        q.id === selectedQuery.id
                            ? { ...q, admin_reply: replyText.trim(), replied_at: new Date().toISOString(), status: status as any }
                            : q,
                    ),
                );
                setSelectedQuery(null);
                setReplyText('');
                setNewStatus('');
            }
        } catch (err) { console.error('Reply failed:', err); }
        setReplying(false);
    }

    async function handleStatusChange(queryId: string, status: string) {
        try {
            const { error } = await supabase
                .from('support_queries')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', queryId);
            if (!error) {
                setQueries((prev) => prev.map((q) => q.id === queryId ? { ...q, status: status as any } : q));
            }
        } catch (err) { console.error('Status update failed:', err); }
    }

    if (!isSupabaseConfigured) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">Query Center</h1>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
                    <span className="material-symbols-outlined text-5xl text-amber-500">cloud_off</span>
                    <h2 className="text-xl font-bold mt-4 text-amber-800">Supabase Not Configured</h2>
                    <p className="text-amber-700 mt-2 max-w-md mx-auto">
                        Configure Supabase in <code className="bg-amber-100 px-2 py-0.5 rounded">.env.local</code> to manage user queries.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">Query Center</h1>
                    <p className="text-on-surface-variant mt-1">Manage and respond to user support queries</p>
                </div>
                <button onClick={fetchQueries} className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gray-100 text-on-surface-variant font-medium text-sm hover:bg-gray-200 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                    <span>Refresh</span>
                </button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stats.total, icon: 'inbox', color: 'text-primary bg-primary/10' },
                    { label: 'Pending', value: stats.pending, icon: 'schedule', color: 'text-amber-700 bg-amber-100' },
                    { label: 'In Progress', value: stats.in_progress, icon: 'autorenew', color: 'text-blue-700 bg-blue-100' },
                    { label: 'Resolved', value: stats.resolved, icon: 'check_circle', color: 'text-green-700 bg-green-100' },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl p-5 shadow-ambient">
                        <div className="flex items-center space-x-2 mb-2">
                            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', s.color)}>
                                <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                            </div>
                            <span className="text-sm text-on-surface-variant">{s.label}</span>
                        </div>
                        <p className="text-2xl font-mono font-bold text-on-surface">{s.value}</p>
                    </div>
                ))}
            </motion.div>

            {/* Filters */}
            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-4 shadow-ambient">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                        <input type="text" placeholder="Search queries..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="all">All Categories</option>
                        {Object.entries(CATEGORIES).map(([key, cat]) => (
                            <option key={key} value={key}>{cat.label}</option>
                        ))}
                    </select>
                </div>
            </motion.div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="ml-3 text-on-surface-variant">Loading queries...</span>
                </div>
            ) : filtered.length === 0 ? (
                <motion.div variants={fadeUp} className="bg-white rounded-2xl p-12 shadow-ambient text-center">
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">inbox</span>
                    <p className="text-on-surface-variant mt-4 font-medium">
                        {queries.length === 0 ? 'No queries yet' : 'No queries match your filters'}
                    </p>
                </motion.div>
            ) : (
                <motion.div variants={fadeUp} className="space-y-4">
                    {filtered.map((q) => (
                        <div key={q.id} className="bg-white rounded-2xl shadow-ambient overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', statusConfig[q.status].color)}>
                                                {statusConfig[q.status].label}
                                            </span>
                                            <span className="text-xs text-on-surface-variant flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">{CATEGORIES[q.category]?.icon || 'help'}</span>
                                                {CATEGORIES[q.category]?.label || q.category}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-on-surface">{q.subject}</h3>
                                        <p className="text-sm text-on-surface-variant mt-1">
                                            From: <strong>{q.user_name || 'Unknown'}</strong> ({q.user_email})
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <select
                                            value={q.status}
                                            onChange={(e) => handleStatusChange(q.id, e.target.value)}
                                            className="text-xs px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                        <button
                                            onClick={() => { setSelectedQuery(q); setReplyText(q.admin_reply || ''); setNewStatus(q.status); }}
                                            className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                            title="Reply"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">reply</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 bg-gray-50 rounded-xl p-3 text-sm text-on-surface-variant">{q.message}</div>
                            </div>
                            {q.admin_reply && (
                                <div className="bg-green-50 border-t border-green-100 p-4">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="material-symbols-outlined text-green-600 text-[16px]">support_agent</span>
                                        <span className="text-xs font-bold text-green-800">Admin Reply</span>
                                        {q.replied_at && (
                                            <span className="text-xs text-green-600">
                                                • {new Date(q.replied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-green-800">{q.admin_reply}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Reply Modal */}
            <AnimatePresence>
                {selectedQuery && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedQuery(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-on-surface">Reply to Query</h2>
                                    <button onClick={() => setSelectedQuery(null)} className="p-1 rounded-lg hover:bg-gray-100">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                    <p className="text-sm font-semibold text-on-surface">{selectedQuery.subject}</p>
                                    <p className="text-xs text-on-surface-variant mt-1">From: {selectedQuery.user_name || 'Unknown'} ({selectedQuery.user_email})</p>
                                    <p className="text-sm text-on-surface-variant mt-2">{selectedQuery.message}</p>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-on-surface mb-2">Set Status</label>
                                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-on-surface mb-2">Your Reply</label>
                                    <textarea
                                        value={replyText} onChange={(e) => setReplyText(e.target.value)}
                                        rows={5} placeholder="Type your response to the user..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                                    />
                                </div>
                                <button
                                    onClick={handleReply}
                                    disabled={replying || !replyText.trim()}
                                    className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/40 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
                                >
                                    {replying ? (
                                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Sending...</span></>
                                    ) : (
                                        <><span className="material-symbols-outlined">send</span><span>Send Reply</span></>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}