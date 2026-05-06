import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatINR, cn } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

interface PaymentRow {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  method: string | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
  plan?: string;
}

export default function AdminRevenue() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [planDistribution, setPlanDistribution] = useState<{ name: string; value: number; color: string }[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number }[]>([]);
  const [revenueByState, setRevenueByState] = useState<{ state: string; revenue: number }[]>([]);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  async function fetchRevenueData() {
    setLoading(true);
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    try {
      // Fetch profiles for plan distribution and state data
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, plan, state');

      if (profiles) {
        const counts: Record<string, number> = { free: 0, pro: 0 };
        profiles.forEach((p: any) => {
          const plan = (p.plan || 'free').toLowerCase();
          if (counts[plan] !== undefined) counts[plan]++;
          else counts.free++;
        });
        setPlanDistribution([
          { name: 'Free', value: counts.free, color: '#94a3b8' },
          { name: 'Pro', value: counts.pro, color: '#006194' },
        ]);
      }

      const profileMap: Record<string, { name: string; email: string; state: string }> = {};
      if (profiles) {
        profiles.forEach((p: any) => {
          profileMap[p.id] = { name: p.full_name || 'Unknown', email: p.email || '', state: p.state || '' };
        });
      }

      // Fetch all payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('id, user_id, amount, status, method, created_at')
        .order('created_at', { ascending: false });

      if (paymentsData) {
        const mapped: PaymentRow[] = paymentsData.map((p: any) => ({
          ...p,
          user_name: profileMap[p.user_id]?.name || 'Unknown',
          user_email: profileMap[p.user_id]?.email || '',
        }));
        setPayments(mapped);

        // Build monthly revenue from captured payments
        const monthMap: Record<string, number> = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        paymentsData
          .filter((p: any) => p.status === 'captured')
          .forEach((p: any) => {
            const d = new Date(p.created_at);
            const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
            monthMap[key] = (monthMap[key] || 0) + (p.amount || 0);
          });
        const monthlyArr = Object.entries(monthMap).map(([month, revenue]) => ({ month, revenue }));
        setMonthlyRevenue(monthlyArr);

        // Build revenue by state
        const stateMap: Record<string, number> = {};
        paymentsData
          .filter((p: any) => p.status === 'captured')
          .forEach((p: any) => {
            const state = profileMap[p.user_id]?.state || 'Unknown';
            if (state) {
              stateMap[state] = (stateMap[state] || 0) + (p.amount || 0);
            }
          });
        const stateArr = Object.entries(stateMap)
          .map(([state, revenue]) => ({ state, revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);
        setRevenueByState(stateArr);
      }
    } catch (err) {
      console.error('Revenue data fetch error:', err);
    }
    setLoading(false);
  }

  const totalRevenue = useMemo(() => {
    return payments.filter((p) => p.status === 'captured').reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const recentPayments = useMemo(() => payments.slice(0, 10), [payments]);

  const failedPayments = useMemo(() => {
    return payments.filter((p) => p.status === 'failed').slice(0, 10);
  }, [payments]);

  const totalPaidUsers = useMemo(() => {
    return (planDistribution[1]?.value || 0) + (planDistribution[2]?.value || 0);
  }, [planDistribution]);

  // Calculate MRR from last 30 days captured payments
  const mrr = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return payments
      .filter((p) => p.status === 'captured' && new Date(p.created_at) >= thirtyDaysAgo)
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const arpu = totalPaidUsers > 0 ? Math.round(mrr / totalPaidUsers) : 0;

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">Revenue Dashboard</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-amber-500">cloud_off</span>
          <h2 className="text-xl font-bold mt-4 text-amber-800">Supabase Not Configured</h2>
          <p className="text-amber-700 mt-2 max-w-md mx-auto">
            Configure Supabase in <code className="bg-amber-100 px-2 py-0.5 rounded">.env.local</code> to see revenue data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">Revenue Dashboard</h1>
          <p className="text-on-surface-variant mt-1">Financial overview from Supabase</p>
        </div>
        <button onClick={fetchRevenueData} className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gray-100 text-on-surface-variant font-medium text-sm hover:bg-gray-200 transition-colors">
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          <span>Refresh</span>
        </button>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="ml-3 text-on-surface-variant">Loading revenue data...</span>
        </div>
      ) : (
        <>
          {/* Top stat cards */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-ambient">
              <p className="text-sm text-on-surface-variant font-medium">Monthly Revenue (30d)</p>
              <p className="text-3xl font-mono font-bold text-on-surface mt-2">{formatINR(mrr)}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-ambient">
              <p className="text-sm text-on-surface-variant font-medium">Total Revenue</p>
              <p className="text-3xl font-mono font-bold text-on-surface mt-2">{formatINR(totalRevenue)}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-ambient">
              <p className="text-sm text-on-surface-variant font-medium">ARPU</p>
              <p className="text-3xl font-mono font-bold text-on-surface mt-2">{formatINR(arpu)}</p>
              <p className="text-xs text-on-surface-variant mt-2">Average Revenue Per Paid User</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-ambient">
              <p className="text-sm text-on-surface-variant font-medium">Failed Payments</p>
              <p className="text-3xl font-mono font-bold text-error mt-2">{failedPayments.length}</p>
            </div>
          </motion.div>

          {/* Charts row */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Revenue chart */}
            <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-ambient">
              <h2 className="font-headline font-bold text-on-surface mb-4">Monthly Revenue</h2>
              {monthlyRevenue.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#707881' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#707881' }} tickFormatter={(v: number) => v >= 100000 ? `${(v / 100000).toFixed(0)}L` : `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value: any) => [formatINR(value), 'Revenue']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="revenue" fill="#006194" radius={[6, 6, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-72 text-on-surface-variant">No payment data yet</div>
              )}
            </div>

            {/* Plan distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-ambient">
              <h2 className="font-headline font-bold text-on-surface mb-4">Plan Distribution</h2>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" strokeWidth={0}>
                      {planDistribution.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [value.toLocaleString('en-IN'), 'Users']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {planDistribution.map((p) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-sm text-on-surface-variant">{p.name}</span>
                    </div>
                    <span className="text-sm font-mono font-semibold text-on-surface">{p.value.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Revenue by State */}
          {revenueByState.length > 0 && (
            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-ambient">
              <h2 className="font-headline font-bold text-on-surface mb-4">Revenue by State (Top 10)</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByState} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#707881' }} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`} />
                    <YAxis type="category" dataKey="state" tick={{ fontSize: 11, fill: '#707881' }} width={110} />
                    <Tooltip formatter={(value: any) => [formatINR(value), 'Revenue']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="revenue" fill="#FF9933" radius={[0, 6, 6, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Bottom section: Recent Payments + Failed Payments */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Recent payments */}
            <div className="bg-white rounded-2xl shadow-ambient overflow-hidden">
              <div className="p-5 pb-3">
                <h2 className="font-headline font-bold text-on-surface">Recent Payments</h2>
              </div>
              {recentPayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-on-surface-variant text-left">
                        <th className="px-5 py-2.5 font-semibold">User</th>
                        <th className="px-5 py-2.5 font-semibold">Amount</th>
                        <th className="px-5 py-2.5 font-semibold">Date</th>
                        <th className="px-5 py-2.5 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3">
                            <p className="font-medium text-on-surface">{p.user_name}</p>
                            <p className="text-xs text-on-surface-variant">{p.user_email}</p>
                          </td>
                          <td className="px-5 py-3 font-mono font-semibold text-on-surface">{formatINR(p.amount)}</td>
                          <td className="px-5 py-3 font-mono text-on-surface-variant text-xs">
                            {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-5 py-3">
                            <span className={cn(
                              'px-2 py-0.5 rounded-lg text-xs font-semibold',
                              p.status === 'captured' ? 'bg-tertiary/10 text-tertiary' : p.status === 'failed' ? 'bg-error/10 text-error' : 'bg-gray-100 text-gray-600',
                            )}>
                              {p.status === 'captured' ? 'Success' : p.status === 'failed' ? 'Failed' : p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-on-surface-variant">No payments recorded yet</div>
              )}
            </div>

            {/* Failed payments */}
            <div className="bg-white rounded-2xl p-5 shadow-ambient">
              <div className="flex items-center space-x-2 mb-4">
                <span className="material-symbols-outlined text-error text-[22px]">error</span>
                <h2 className="font-headline font-bold text-on-surface">Failed Payments</h2>
                {failedPayments.length > 0 && (
                  <span className="text-xs font-bold bg-error/10 text-error px-2 py-0.5 rounded-lg">{failedPayments.length}</span>
                )}
              </div>
              {failedPayments.length > 0 ? (
                <div className="space-y-3">
                  {failedPayments.map((fp) => (
                    <div key={fp.id} className="p-4 rounded-2xl bg-error/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-on-surface">{fp.user_name}</p>
                          <p className="text-xs text-on-surface-variant">{fp.user_email}</p>
                        </div>
                        <p className="font-mono font-bold text-error">{formatINR(fp.amount)}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-on-surface-variant">Method: {fp.method || 'N/A'}</span>
                        <span className="font-mono text-on-surface-variant">
                          {new Date(fp.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-tertiary text-[40px] block mb-2">check_circle</span>
                  No failed payments
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}