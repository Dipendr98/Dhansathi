import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface UserRow {
  id: string;
  full_name: string | null;
  email: string;
  state: string | null;
  plan: string;
  created_at: string;
  updated_at: string;
}

type SortKey = 'full_name' | 'email' | 'plan' | 'created_at';
type SortDir = 'asc' | 'desc';

const planColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  pro: 'bg-primary/10 text-primary',
};

const planLabels: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
};

const PIE_COLORS = ['#94a3b8', '#006194'];
const ITEMS_PER_PAGE = 10;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, state, plan, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUsers(data as UserRow[]);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
    setLoading(false);
  }

  // Filter + search + sort
  const filtered = useMemo(() => {
    let list = [...users];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          (u.full_name || '').toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.state || '').toLowerCase().includes(q),
      );
    }
    if (filterPlan !== 'all') {
      list = list.filter((u) => u.plan === filterPlan);
    }
    list.sort((a, b) => {
      const aVal = (a as any)[sortKey] || '';
      const bVal = (b as any)[sortKey] || '';
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [users, search, filterPlan, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((u) => u.id)));
    }
  };

  const planDistribution = useMemo(() => {
    const counts: Record<string, number> = { free: 0, pro: 0 };
    users.forEach((u) => {
      if (counts[u.plan] !== undefined) counts[u.plan]++;
      else counts[u.plan] = 1;
    });
    return [
      { name: 'Free', value: counts.free || 0 },
      { name: 'Pro', value: counts.pro || 0 },
    ];
  }, [users]);

  const handleExportCSV = () => {
    const headers = 'Name,Email,State,Plan,Joined\n';
    const rows = filtered
      .map((u) => `${u.full_name || 'N/A'},${u.email},${u.state || 'N/A'},${planLabels[u.plan] || u.plan},${u.created_at}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dhansathi_users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: SortKey }) => {
    if (sortKey !== field) return <span className="material-symbols-outlined text-[14px] text-gray-300">unfold_more</span>;
    return (
      <span className="material-symbols-outlined text-[14px] text-primary">
        {sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
      </span>
    );
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">User Management</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-amber-500">cloud_off</span>
          <h2 className="text-xl font-bold mt-4 text-amber-800">Supabase Not Configured</h2>
          <p className="text-amber-700 mt-2 max-w-md mx-auto">
            Configure Supabase in <code className="bg-amber-100 px-2 py-0.5 rounded">.env.local</code> to see real user data.
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
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">User Management</h1>
          <p className="text-on-surface-variant mt-1">
            <span className="font-mono font-semibold">{users.length.toLocaleString('en-IN')}</span> total users from Supabase
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gray-100 text-on-surface-variant font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="ml-3 text-on-surface-variant">Loading users...</span>
        </div>
      ) : (
        <>
          {/* Stats + Pie chart row */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-ambient flex flex-col items-center justify-center">
              <h3 className="text-sm font-semibold text-on-surface-variant mb-2">Plan Distribution</h3>
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" strokeWidth={0}>
                      {planDistribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex space-x-3 mt-2 text-xs">
                {planDistribution.map((p, i) => (
                  <div key={p.name} className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-on-surface-variant">{p.name}</span>
                    <span className="font-mono font-semibold text-on-surface">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {[
              { label: 'Total Users', value: users.length, icon: 'group', color: 'text-primary' },
              { label: 'Pro Users', value: users.filter((u) => u.plan === 'pro').length, icon: 'workspace_premium', color: 'text-secondary' },
              {
                label: 'New This Week', value: users.filter((u) => {
                  const d = new Date(u.created_at);
                  const week = new Date();
                  week.setDate(week.getDate() - 7);
                  return d >= week;
                }).length, icon: 'person_add', color: 'text-india-green'
              },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-5 shadow-ambient">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={cn('material-symbols-outlined text-[20px]', s.color)}>{s.icon}</span>
                  <span className="text-sm text-on-surface-variant">{s.label}</span>
                </div>
                <p className="text-3xl font-mono font-bold text-on-surface">{s.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Filters */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-4 shadow-ambient">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                <input
                  type="text"
                  placeholder="Search by name, email, or state..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 text-sm text-on-surface placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <select
                value={filterPlan}
                onChange={(e) => { setFilterPlan(e.target.value); setPage(1); }}
                className="px-4 py-2.5 rounded-xl bg-gray-50 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
              </select>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-ambient overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-on-surface-variant text-left">
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox" checked={selectedIds.size === paginated.length && paginated.length > 0} onChange={toggleAll} className="rounded" />
                    </th>
                    {([
                      ['full_name', 'Name'],
                      ['email', 'Email'],
                      ['plan', 'Plan'],
                      ['created_at', 'Joined'],
                    ] as [SortKey, string][]).map(([key, label]) => (
                      <th key={key} className="px-4 py-3 font-semibold cursor-pointer hover:text-primary transition-colors select-none" onClick={() => handleSort(key)}>
                        <div className="flex items-center space-x-1">
                          <span>{label}</span>
                          <SortIcon field={key} />
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 font-semibold">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((user) => (
                    <tr key={user.id} className={cn('hover:bg-gray-50/50 transition-colors', selectedIds.has(user.id) && 'bg-primary/5')}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedIds.has(user.id)} onChange={() => toggleSelect(user.id)} className="rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                          </div>
                          <p className="font-semibold text-on-surface">{user.full_name || 'No name'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded-lg text-xs font-semibold', planColors[user.plan] || 'bg-gray-100 text-gray-600')}>
                          {planLabels[user.plan] || user.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-on-surface-variant text-xs">
                        {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant text-xs">{user.state || '—'}</td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-on-surface-variant">
                        {users.length === 0 ? 'No users registered yet.' : 'No users found matching your criteria.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
              <p className="text-sm text-on-surface-variant">
                Showing {filtered.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of{' '}
                <span className="font-mono font-semibold">{filtered.length}</span>
              </p>
              <div className="flex items-center space-x-1">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-colors', p === page ? 'bg-primary text-white' : 'hover:bg-gray-100 text-on-surface-variant')}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}