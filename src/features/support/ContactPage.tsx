import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface Query {
    id: string;
    subject: string;
    category: string;
    message: string;
    status: 'pending' | 'in_progress' | 'resolved';
    created_at: string;
    admin_reply?: string;
    replied_at?: string;
}

const CATEGORIES = [
    { value: 'account', label: 'Account & Profile', icon: 'person' },
    { value: 'billing', label: 'Billing & Subscription', icon: 'payment' },
    { value: 'stocks', label: 'Stocks & Trading', icon: 'trending_up' },
    { value: 'schemes', label: 'Government Schemes', icon: 'account_balance' },
    { value: 'ai', label: 'AI Features (DhanMitra)', icon: 'psychology' },
    { value: 'bug', label: 'Bug Report', icon: 'bug_report' },
    { value: 'feature', label: 'Feature Request', icon: 'lightbulb' },
    { value: 'other', label: 'Other', icon: 'help' },
];

const FAQ_ITEMS = [
    { q: 'How do I upgrade to Pro?', a: 'Go to Settings → Billing or visit the Pricing page to upgrade your plan via Razorpay.' },
    { q: 'Is DhanSathi a SEBI-registered advisor?', a: 'No. DhanSathi provides educational and informational content only. Always consult a SEBI-registered advisor for investment decisions.' },
    { q: 'How accurate is the stock data?', a: 'Stock data is fetched in real-time from Yahoo Finance API. There may be a 15-minute delay for some data points.' },
    { q: 'Can I get a refund?', a: 'Refunds are processed within 7 business days as per our refund policy. Contact us with your payment details.' },
    { q: 'How does DhanMitra AI work?', a: 'DhanMitra uses advanced AI to simulate stock scenarios based on market conditions, news sentiment, and technical indicators.' },
    { q: 'Are government scheme details accurate?', a: 'We aggregate data from official government portals. Always verify eligibility on the official scheme website.' },
];

export default function ContactPage() {
    const { user } = useAuthStore();
    const { lang } = useLanguageStore();
    const [activeTab, setActiveTab] = useState<'new' | 'queries' | 'faq'>('new');
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [queries, setQueries] = useState<Query[]>([]);
    const [loadingQueries, setLoadingQueries] = useState(false);

    useEffect(() => {
        if (activeTab === 'queries') {
            fetchMyQueries();
        }
    }, [activeTab]);

    async function fetchMyQueries() {
        if (!isSupabaseConfigured || !user) {
            setQueries([]);
            return;
        }
        setLoadingQueries(true);
        try {
            const { data, error } = await supabase
                .from('support_queries')
                .select('id, subject, category, message, status, created_at, admin_reply, replied_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setQueries(data as Query[]);
            }
        } catch (err) {
            console.error('Failed to fetch queries:', err);
        }
        setLoadingQueries(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !category || !message) return;
        setSubmitting(true);

        if (isSupabaseConfigured && user) {
            try {
                const { error } = await supabase.from('support_queries').insert({
                    user_id: user.id,
                    user_email: user.email,
                    user_name: user.full_name || null,
                    subject,
                    category,
                    message,
                    status: 'pending',
                });
                if (error) {
                    console.error('Failed to submit query:', error);
                }
            } catch (err) {
                console.error('Query submission error:', err);
            }
        } else {
            // Mock mode: simulate delay
            await new Promise((r) => setTimeout(r, 1500));
        }

        setSubmitting(false);
        setSubmitted(true);
        setSubject('');
        setCategory('');
        setMessage('');
        setTimeout(() => setSubmitted(false), 5000);
    };

    const statusColors = {
        pending: 'bg-amber-100 text-amber-800',
        in_progress: 'bg-blue-100 text-blue-800',
        resolved: 'bg-green-100 text-green-800',
    };

    const statusLabels = {
        pending: 'Pending',
        in_progress: 'In Progress',
        resolved: 'Resolved',
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-headline font-bold text-primary">Help & Support</h1>
                <p className="text-on-surface-variant mt-1">Get help, report issues, or send us your feedback</p>
            </div>

            {/* Quick Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-sky-500 to-sky-700 rounded-2xl p-5 text-white">
                    <span className="material-symbols-outlined text-3xl mb-2">mail</span>
                    <h3 className="font-bold">Email Us</h3>
                    <p className="text-white/80 text-sm mt-1">support@dhansathi.in</p>
                    <p className="text-white/60 text-xs mt-2">Response within 24 hours</p>
                </div>
                <div className="bg-gradient-to-br from-india-green to-emerald-700 rounded-2xl p-5 text-white">
                    <span className="material-symbols-outlined text-3xl mb-2">schedule</span>
                    <h3 className="font-bold">Working Hours</h3>
                    <p className="text-white/80 text-sm mt-1">Mon - Sat: 9 AM - 6 PM IST</p>
                    <p className="text-white/60 text-xs mt-2">Excluding public holidays</p>
                </div>
                <div className="bg-gradient-to-br from-saffron to-orange-600 rounded-2xl p-5 text-white">
                    <span className="material-symbols-outlined text-3xl mb-2">forum</span>
                    <h3 className="font-bold">Ask DhanSathi AI</h3>
                    <p className="text-white/80 text-sm mt-1">Instant AI-powered help</p>
                    <p className="text-white/60 text-xs mt-2">Available 24/7</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-surface-container-low rounded-2xl p-1">
                {[
                    { key: 'new' as const, label: 'New Query', icon: 'edit' },
                    { key: 'queries' as const, label: 'My Queries', icon: 'inbox' },
                    { key: 'faq' as const, label: 'FAQ', icon: 'quiz' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-medium text-sm transition-all ${activeTab === tab.key
                            ? 'bg-primary text-white shadow-lg'
                            : 'text-on-surface-variant hover:bg-white/50'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* New Query Form */}
            <AnimatePresence mode="wait">
                {activeTab === 'new' && (
                    <motion.div
                        key="new"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-3xl shadow-lg border border-outline-variant/20 p-6 md:p-8"
                    >
                        <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center space-x-2">
                            <span className="material-symbols-outlined text-primary">support_agent</span>
                            <span>Submit a Query</span>
                        </h2>

                        {submitted && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
                                <span className="material-symbols-outlined text-green-600">check_circle</span>
                                <div>
                                    <p className="font-bold text-green-800">Query Submitted Successfully!</p>
                                    <p className="text-green-700 text-sm">Our team will review and respond within 24 hours. Check "My Queries" for updates.</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-on-surface mb-2">Category *</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setCategory(cat.value)}
                                            className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${category === cat.value
                                                ? 'border-primary bg-primary/5 text-primary font-semibold'
                                                : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/30'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                                            <span className="truncate">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-semibold text-on-surface mb-2">Subject *</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Brief description of your issue"
                                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    required
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-semibold text-on-surface mb-2">Message *</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Describe your issue in detail. Include any relevant screenshots, error messages, or steps to reproduce the problem."
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                    required
                                />
                            </div>

                            {/* User info */}
                            <div className="bg-sky-50 rounded-xl p-4 flex items-center space-x-3">
                                <span className="material-symbols-outlined text-primary">info</span>
                                <p className="text-sm text-on-surface-variant">
                                    Logged in as <strong>{user?.email || 'user@example.com'}</strong>. Response will be sent to your query inbox.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !subject || !category || !message}
                                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/40 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">send</span>
                                        <span>Submit Query</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* My Queries */}
                {activeTab === 'queries' && (
                    <motion.div
                        key="queries"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        {loadingQueries ? (
                            <div className="bg-white rounded-3xl shadow-lg border border-outline-variant/20 p-12 text-center">
                                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                                <p className="text-on-surface-variant mt-4">Loading your queries...</p>
                            </div>
                        ) : queries.length === 0 ? (
                            <div className="bg-white rounded-3xl shadow-lg border border-outline-variant/20 p-12 text-center">
                                <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">inbox</span>
                                <p className="text-on-surface-variant mt-4 font-medium">No queries yet</p>
                                <p className="text-on-surface-variant/60 text-sm mt-1">Submit a query and track responses here</p>
                            </div>
                        ) : (
                            queries.map((q) => (
                                <div key={q.id} className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 overflow-hidden">
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-bold text-on-surface">{q.subject}</h3>
                                                <p className="text-xs text-on-surface-variant mt-1">
                                                    {CATEGORIES.find((c) => c.value === q.category)?.label} • {new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[q.status]}`}>
                                                {statusLabels[q.status]}
                                            </span>
                                        </div>
                                        <p className="text-sm text-on-surface-variant bg-surface-container-low rounded-xl p-3">{q.message}</p>
                                    </div>

                                    {q.admin_reply && (
                                        <div className="bg-green-50 border-t border-green-100 p-5">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="material-symbols-outlined text-green-600 text-[18px]">support_agent</span>
                                                <span className="text-sm font-bold text-green-800">Admin Response</span>
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
                            ))
                        )}
                    </motion.div>
                )}

                {/* FAQ */}
                {activeTab === 'faq' && (
                    <motion.div
                        key="faq"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                    >
                        {FAQ_ITEMS.map((item, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-5 text-left"
                                >
                                    <span className="font-semibold text-on-surface pr-4">{item.q}</span>
                                    <span className={`material-symbols-outlined text-primary transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </button>
                                <AnimatePresence>
                                    {expandedFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="px-5 pb-5 text-sm text-on-surface-variant leading-relaxed">{item.a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}