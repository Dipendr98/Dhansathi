import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const quickActions = [
  { label: 'Add Scheme', icon: 'add_circle', link: '/admin/schemes' },
  { label: 'View Reports', icon: 'analytics', link: '/admin/revenue' },
  { label: 'Manage Users', icon: 'manage_accounts', link: '/admin/users' },
  { label: 'Query Center', icon: 'support_agent', link: '/admin/queries' },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [proUsers, setProUsers] = useState(0);
  const [freeUsers, setFreeUsers] = useState(0);
  const [pendingQueries, setPendingQueries] = useState(0);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<{ month: string; users: number }[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      // Fetch all profiles
      const { data: profiles, error: profilesErr } = await supabase
        .from('profiles')
        .select('id, email, full_name, plan, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (!profilesErr && profiles) {
        setTotalUsers(profiles.length);
        setProUsers(profiles.filter((p: any) => p.plan === 'pro').length);
        setFreeUsers(profiles.filter((p: any) => p.plan === 'free').length);
        setRecentUsers(profiles.slice(0, 10));

        // Build user growth data by month
        const monthCounts: Record<string, number> = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        profiles.forEach((p: any) => {
          const d = new Date(p.created_at);
          const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
          monthCounts[key] = (monthCounts[key] || 0) + 1;
        });
        // Cumulative
        let cumulative = 0;
        const growthArr = Object.entries(monthCounts).reverse().map(([month, count]) => {
          cumulative += count;
          return { month, users: cumulative };
        });
        setUserGrowthData(growthArr.length > 0 ? growthArr : []);
      }

      // Fetch pending queries count
      const { count: qCount } = await supabase
        .from('support_queries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setPendingQueries(qCount || 0);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    }
    setLoading(false);
  }

  if (!isSupabaseConfigured) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">Dashboard Overview</h1>
          <p className="text-on-surface-variant mt-1">Welcome back, Admin.</p>
        </motion.div>
        <motion.div variants={fadeUp} className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-amber-500">cloud_off</span>
          <h2 className="text-xl font-bold mt-4 text-amber-800">Supabase Not Configured</h2>
          <p className="text-amber-700 mt-2 max-w-md mx-auto">
            Set <code className="bg-amber-100 px-2 py-0.5 rounded">VITE_SUPABASE_URL</code> and{' '}
            <code className="bg-amber-100 px-2 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> in your{' '}
            <code className="bg-amber-100 px-2 py-0.5 rounded">.env.local</code> file to see real data.
          </p>
        </motion.div>
        {/* Quick Actions still available */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-ambient">
          <h2 className="font-headline font-bold text-on-surface mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => { window.location.href = action.link; }}
                className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gray-50 hover:bg-primary/5 hover:text-primary text-on-surface-variant transition-colors group"
              >
                <span className="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform">{action.icon}</span>
                <span className="text-sm font-medium mt-2">{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const stats = [
    { label: 'Total Users', value: totalUsers.toLocaleString('en-IN'), icon: 'group', color: 'bg-primary/10 text-primary' },
    { label: 'Pro Users', value: proUsers.toLocaleString('en-IN'), icon: 'workspace_premium', color: 'bg-secondary/10 text-secondary' },
    { label: 'Free Users', value: freeUsers.toLocaleString('en-IN'), icon: 'person', color: 'bg-gray-100 text-gray-600' },
    { label: 'Pending Queries', value: pendingQueries.toLocaleString('en-IN'), icon: 'support_agent', color: 'bg-amber-100 text-amber-700' },
    {
      label: 'New Today', value: recentUsers.filter((u: any) => {
        const d = new Date(u.created_at);
        const today = new Date();
        return d.toDateString() === today.toDateString();
      }).length.toString(), icon: 'person_add', color: 'bg-india-green/10 text-india-green'
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">Dashboard Overview</h1>
        <p className="text-on-surface-variant mt-1">Welcome back, Admin. Real-time data from Supabase.</p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="ml-3 text-on-surface-variant">Loading dashboard data...</span>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-ambient hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-on-surface-variant font-medium">{stat.label}</p>
                    <p className="text-2xl font-mono font-bold text-on-surface mt-1">{stat.value}</p>
                  </div>
                  <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center', stat.color)}>
                    <span className="material-symbols-outlined text-[22px]">{stat.icon}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts + Recent Users */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-ambient">
              <h2 className="font-headline font-bold text-on-surface mb-6">User Growth</h2>
              <div className="h-72">
                {userGrowthData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#707881' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#707881' }} />
                      <Tooltip
                        formatter={(value: any) => [value.toLocaleString('en-IN'), 'Users']}
                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      />
                      <defs>
                        <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#056c00" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#056c00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="users" stroke="#056c00" strokeWidth={3} fill="url(#userGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-on-surface-variant">
                    <span>No user data available yet</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-2xl p-6 shadow-ambient">
              <h2 className="font-headline font-bold text-on-surface mb-4">Recent Signups</h2>
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {recentUsers.length === 0 ? (
                  <p className="text-on-surface-variant text-sm text-center py-8">No users yet</p>
                ) : (
                  recentUsers.map((user: any) => (
                    <div key={user.id} className="flex items-start space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-on-surface font-semibold truncate">{user.full_name || 'No name'}</p>
                        <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', user.plan === 'pro' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500')}>
                            {user.plan === 'pro' ? 'PRO' : 'FREE'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-ambient">
            <h2 className="font-headline font-bold text-on-surface mb-5">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => { window.location.href = action.link; }}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gray-50 hover:bg-primary/5 hover:text-primary text-on-surface-variant transition-colors group"
                >
                  <span className="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform">{action.icon}</span>
                  <span className="text-sm font-medium mt-2">{action.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}