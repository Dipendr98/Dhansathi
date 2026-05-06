import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface SimRow {
  id: string;
  user_id: string;
  stock_symbol: string;
  scenario_type: string;
  status: string;
  progress: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  user_name?: string;
}

interface CreditRow {
  plan: string;
  credits_total: number;
  credits_used: number;
}

const scenarioColors: Record<string, string> = {
  bull: 'bg-tertiary/10 text-tertiary',
  bear: 'bg-error/10 text-error',
  black_swan: 'bg-india-navy/10 text-india-navy',
  custom: 'bg-secondary/10 text-secondary',
};

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  graph_building: 'bg-blue-50 text-blue-600',
  env_setup: 'bg-blue-50 text-blue-600',
  simulating: 'bg-primary/10 text-primary',
  reporting: 'bg-saffron/10 text-saffron',
  completed: 'bg-tertiary/10 text-tertiary',
  failed: 'bg-error/10 text-error',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function AdminSimulations() {
  const [loading, setLoading] = useState(true);
  const [simulations, setSimulations] = useState<SimRow[]>([]);
  const [credits, setCredits] = useState<CreditRow[]>([]);
  const [logView, setLogView] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    if (!isSupabaseConfigured) { setLoading(false); return; }
    try {
      // Fetch profiles for user names
      const { data: profiles } = await supabase.from('profiles').select('id, full_name');
      const profileMap: Record<string, string> = {};
      if (profiles) profiles.forEach((p: any) => { profileMap[p.id] = p.full_name || 'Unknown'; });

      // Fetch simulations
      const { data: simData } = await supabase
        .from('simulations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (simData) {
        setSimulations(simData.map((s: any) => ({
          ...s,
          user_name: profileMap[s.user_id] || 'Unknown',
        })));
      }

      // Fetch credit usage
      const { data: creditData } = await supabase
        .from('simulation_credits')
        .select('plan, credits_total, credits_used');

      if (creditData) setCredits(creditData);
    } catch (err) {
      console.error('Failed to fetch simulation data:', err);
    }
    setLoading(false);
  }

  const active = useMemo(() => simulations.filter((s) => !['completed', 'failed'].includes(s.status)), [simulations]);
  const completed = useMemo(() => simulations.filter((s) => s.status === 'completed').slice(0, 10), [simulations]);
  const failed = useMemo(() => simulations.filter((s) => s.status === 'failed').slice(0, 10), [simulations]);

  // Aggregate credits by plan
  const creditsByPlan = useMemo(() => {
    const map: Record<string, { used: number; total: number }> = {};
    credits.forEach((c) => {
      const plan = c.plan || 'free';
      if (!map[plan]) map[plan] = { used: 0, total: 0 };
      map[plan].used += c.credits_used;
      map[plan].total += c.credits_total;
    });
    return Object.entries(map).map(([plan, v]) => ({
      plan: plan.charAt(0).toUpperCase() + plan.slice(1),
      used: v.used,
      total: v.total,
      color: plan === 'free' ? '#94a3b8' : plan === 'pro' ? '#006194' : '#FF9933',
    }));
  }, [credits]);

  // Monthly simulation counts
  const monthlyCounts = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map: Record<string, number> = {};
    simulations.forEach((s) => {
      const d = new Date(s.created_at);
      const key = `${months[d.getMonth()]}`;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([month, count]) => ({ month, count }));
  }, [simulations]);

  const timeAgo = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">DhanMitra AI Simulations</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-amber-500">cloud_off</span>
          <h2 className="text-xl font-bold mt-4 text-amber-800">Supabase Not Configured</h2>
          <p className="text-amber-700 mt-2 max-w-md mx-auto">
            Configure Supabase in <code className="bg-amber-100 px-2 py-0.5 rounded">.env.local</code> to see simulation data.
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
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">DhanMitra AI Simulations</h1>
          <p className="text-on-surface-variant mt-1">Monitor AI simulation engine and resource usage</p>
        </div>
        <button onClick={fetchData} className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gray-100 text-on-surface-variant font-medium text-sm hover:bg-gray-200 transition-colors">
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          <span>Refresh</span>
        </button>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="ml-3 text-on-surface-variant">Loading simulations...</span>
        </div>
      ) : (
        <>
          {/* Top stats */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-ambient">
              <div className="flex items-center space-x-2 mb-2">
                <span className="material-symbols-outlined text-primary text-[22px]">psychology</span>
                <span className="text-sm text-on-surface-variant">Total Simulations</span>
              </div>
              <p className="text-3xl font-mono font-bold text-on-surface">{simulations.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-ambient">
              <div className="flex items-center space-x-2 mb-2">
                <span className="material-symbols-outlined text-tertiary text-[22px]">play_circle</span>
                <span className="text-sm text-on-surface-variant">Active Now</span>
              </div>
              <p className="text-3xl font-mono font-bold text-on-surface">{active.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-ambient">
              <div className="flex items-center space-x-2 mb-2">
                <span className="material-symbols-outlined text-saffron text-[22px]">check_circle</span>
                <span className="text-sm text-on-surface-variant">Completed</span>
              </div>
              <p className="text-3xl font-mono font-bold text-on-surface">{simulations.filter((s) => s.status === 'completed').length}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-ambient">
              <div className="flex items-center space-x-2 mb-2">
                <span className="material-symbols-outlined text-error text-[22px]">error</span>
                <span className="text-sm text-on-surface-variant">Failed</span>
              </div>
              <p className="text-3xl font-mono font-bold text-error">{failed.length}</p>
            </div>
          </motion.div>

          {/* Active Simulations */}
          {active.length > 0 && (
            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-ambient">
              <h2 className="font-headline font-bold text-on-surface mb-4">Active Simulations</h2>
              <div className="space-y-3">
                {active.map((sim) => (
                  <div key={sim.id} className="p-4 rounded-2xl bg-gray-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-sm font-semibold text-primary">{sim.id.slice(0, 8)}</span>
                        <span className="text-sm text-on-surface font-medium">{sim.user_name}</span>
                        <span className="font-mono text-sm font-bold text-on-surface">{sim.stock_symbol}</span>
                        <span className={cn('px-2 py-0.5 rounded-lg text-xs font-semibold', scenarioColors[sim.scenario_type] || 'bg-gray-100 text-gray-600')}>
                          {sim.scenario_type}
                        </span>
                        <span className={cn('px-2 py-0.5 rounded-lg text-xs font-semibold', statusColors[sim.status] || 'bg-gray-100 text-gray-600')}>
                          {sim.status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-on-surface-variant">{timeAgo(sim.started_at || sim.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${sim.progress}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
                      </div>
                      <span className="font-mono text-sm font-semibold text-primary w-12 text-right">{sim.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Charts row */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Monthly simulations */}
            {monthlyCounts.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-ambient">
                <h2 className="font-headline font-bold text-on-surface mb-4">Simulations by Month</h2>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyCounts}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#707881' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#707881' }} />
                      <Tooltip formatter={(value: any) => [value, 'Simulations']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="count" fill="#006194" radius={[6, 6, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Credit usage */}
            {creditsByPlan.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-ambient">
                <h2 className="font-headline font-bold text-on-surface mb-4">Credit Usage by Plan</h2>
                <div className="space-y-4">
                  {creditsByPlan.map((tier) => {
                    const pct = tier.total > 0 ? (tier.used / tier.total) * 100 : 0;
                    return (
                      <div key={tier.plan} className="p-4 rounded-2xl bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-headline font-bold text-on-surface">{tier.plan}</span>
                          <span className="font-mono text-sm text-on-surface-variant">
                            {tier.used.toLocaleString('en-IN')} / {tier.total.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                          <motion.div className="h-full rounded-full" style={{ backgroundColor: tier.color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
                        </div>
                        <p className="text-xs text-on-surface-variant mt-2 font-mono">{pct.toFixed(1)}% used</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* Completed + Failed */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Completed */}
            <div className="bg-white rounded-2xl shadow-ambient overflow-hidden">
              <div className="p-5 pb-3">
                <h2 className="font-headline font-bold text-on-surface">Recently Completed</h2>
              </div>
              {completed.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-on-surface-variant text-left">
                        <th className="px-5 py-2.5 font-semibold">ID</th>
                        <th className="px-5 py-2.5 font-semibold">User</th>
                        <th className="px-5 py-2.5 font-semibold">Ticker</th>
                        <th className="px-5 py-2.5 font-semibold">Scenario</th>
                        <th className="px-5 py-2.5 font-semibold">Completed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {completed.map((sim) => (
                        <tr key={sim.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3 font-mono text-primary text-xs">{sim.id.slice(0, 8)}</td>
                          <td className="px-5 py-3 text-on-surface">{sim.user_name}</td>
                          <td className="px-5 py-3 font-mono font-bold text-on-surface">{sim.stock_symbol}</td>
                          <td className="px-5 py-3">
                            <span className={cn('px-2 py-0.5 rounded-lg text-xs font-semibold', scenarioColors[sim.scenario_type] || 'bg-gray-100 text-gray-600')}>
                              {sim.scenario_type}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-mono text-on-surface-variant text-xs">{timeAgo(sim.completed_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-on-surface-variant">No completed simulations yet</div>
              )}
            </div>

            {/* Failed */}
            <div className="bg-white rounded-2xl p-5 shadow-ambient">
              <div className="flex items-center space-x-2 mb-4">
                <span className="material-symbols-outlined text-error text-[22px]">error</span>
                <h2 className="font-headline font-bold text-on-surface">Failed Simulations</h2>
              </div>
              {failed.length > 0 ? (
                <div className="space-y-3">
                  {failed.map((sim) => (
                    <div key={sim.id} className="p-4 rounded-2xl bg-error/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-sm font-semibold text-error">{sim.id.slice(0, 8)}</span>
                          <span className="text-sm text-on-surface">{sim.user_name}</span>
                          <span className="font-mono text-sm font-bold text-on-surface">{sim.stock_symbol}</span>
                        </div>
                        <span className="text-xs text-on-surface-variant">{timeAgo(sim.completed_at || sim.created_at)}</span>
                      </div>
                      {sim.error_message && (
                        <div className="flex items-center space-x-2">
                          <span className="material-symbols-outlined text-error text-[16px]">bug_report</span>
                          <span className="text-sm text-error">{sim.error_message}</span>
                        </div>
                      )}
                      <button
                        onClick={() => setLogView(logView === sim.id ? null : sim.id)}
                        className="text-xs text-on-surface-variant font-semibold hover:underline"
                      >
                        {logView === sim.id ? 'Hide Details' : 'View Details'}
                      </button>
                      {logView === sim.id && (
                        <div className="mt-2 p-3 rounded-xl bg-gray-900 text-green-400 text-xs font-mono overflow-x-auto">
                          <p>ID: {sim.id}</p>
                          <p>User: {sim.user_name} ({sim.user_id})</p>
                          <p>Stock: {sim.stock_symbol}</p>
                          <p>Scenario: {sim.scenario_type}</p>
                          <p>Error: {sim.error_message || 'Unknown error'}</p>
                          <p>Created: {sim.created_at}</p>
                          <p>Started: {sim.started_at || 'N/A'}</p>
                          <p>Failed: {sim.completed_at || 'N/A'}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-tertiary text-[40px] block mb-2">check_circle</span>
                  No failed simulations
                </div>
              )}
            </div>
          </motion.div>

          {/* Empty state */}
          {simulations.length === 0 && (
            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-12 shadow-ambient text-center">
              <span className="material-symbols-outlined text-[48px] text-gray-300 mb-3 block">psychology</span>
              <h2 className="text-xl font-bold text-on-surface mb-2">No Simulations Yet</h2>
              <p className="text-on-surface-variant max-w-md mx-auto">
                When users run DhanMitra AI simulations, they will appear here with real-time status tracking.
              </p>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}