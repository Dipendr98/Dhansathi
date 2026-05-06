import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AdminScheme {
  id: string;
  name: string;
  name_hi: string;
  scheme_type: string;
  ministry: string;
  is_active: boolean;
  is_verified: boolean;
  updated_at: string;
  matchCount: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function AdminSchemes() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [schemes, setSchemes] = useState<AdminScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [newNameHi, setNewNameHi] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newMinistry, setNewMinistry] = useState('');

  useEffect(() => {
    fetchSchemes();
  }, []);

  async function fetchSchemes() {
    setLoading(true);
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    try {
      // Fetch all schemes
      const { data: schemesData, error } = await supabase
        .from('government_schemes')
        .select('id, name, name_hi, scheme_type, ministry, is_active, is_verified, updated_at')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Fetch match counts per scheme
      const { data: matchData } = await supabase
        .from('scheme_matches')
        .select('scheme_id');

      const matchCounts: Record<string, number> = {};
      if (matchData) {
        matchData.forEach((m: any) => {
          matchCounts[m.scheme_id] = (matchCounts[m.scheme_id] || 0) + 1;
        });
      }

      const mapped: AdminScheme[] = (schemesData || []).map((s: any) => ({
        id: s.id,
        name: s.name || '',
        name_hi: s.name_hi || '',
        scheme_type: s.scheme_type || 'Other',
        ministry: s.ministry || 'Unknown',
        is_active: s.is_active ?? true,
        is_verified: s.is_verified ?? false,
        updated_at: s.updated_at ? new Date(s.updated_at).toISOString().split('T')[0] : '',
        matchCount: matchCounts[s.id] || 0,
      }));

      setSchemes(mapped);
    } catch (err) {
      console.error('Failed to fetch schemes:', err);
    }
    setLoading(false);
  }

  const categories = useMemo(() => {
    const cats = new Set(schemes.map((s) => s.scheme_type).filter(Boolean));
    return [...cats];
  }, [schemes]);

  const filtered = useMemo(() => {
    let list = [...schemes];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.name_hi.includes(search) || s.ministry.toLowerCase().includes(q),
      );
    }
    if (filterCategory !== 'all') {
      list = list.filter((s) => s.scheme_type === filterCategory);
    }
    if (filterStatus !== 'all') {
      list = list.filter((s) => (filterStatus === 'active' ? s.is_active : !s.is_active));
    }
    return list;
  }, [search, filterCategory, filterStatus, schemes]);

  const topMatched = useMemo(() => {
    return [...schemes]
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, 6)
      .map((s) => ({ name: s.name.length > 18 ? s.name.slice(0, 18) + '...' : s.name, matches: s.matchCount }));
  }, [schemes]);

  const toggleActive = async (id: string) => {
    const scheme = schemes.find((s) => s.id === id);
    if (!scheme) return;
    const newActive = !scheme.is_active;
    setSchemes((prev) => prev.map((s) => (s.id === id ? { ...s, is_active: newActive } : s)));
    if (isSupabaseConfigured) {
      await supabase.from('government_schemes').update({ is_active: newActive, updated_at: new Date().toISOString() }).eq('id', id);
    }
  };

  const startEdit = (scheme: AdminScheme) => {
    setEditingId(scheme.id);
    setEditName(scheme.name);
  };

  const saveEdit = async (id: string) => {
    setSchemes((prev) => prev.map((s) => (s.id === id ? { ...s, name: editName } : s)));
    setEditingId(null);
    if (isSupabaseConfigured) {
      await supabase.from('government_schemes').update({ name: editName, updated_at: new Date().toISOString() }).eq('id', id);
    }
  };

  const addScheme = async () => {
    if (!newName || !newCategory) return;
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('government_schemes')
        .insert({
          name: newName,
          name_hi: newNameHi || null,
          scheme_type: newCategory,
          ministry: newMinistry || null,
          is_active: true,
          is_verified: false,
        })
        .select()
        .single();

      if (!error && data) {
        setSchemes((prev) => [{
          id: data.id,
          name: data.name,
          name_hi: data.name_hi || '',
          scheme_type: data.scheme_type || 'Other',
          ministry: data.ministry || 'Unknown',
          is_active: true,
          is_verified: false,
          updated_at: new Date().toISOString().split('T')[0],
          matchCount: 0,
        }, ...prev]);
      }
    }
    setNewName('');
    setNewNameHi('');
    setNewCategory('');
    setNewMinistry('');
    setShowAddForm(false);
  };

  const deleteScheme = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheme?')) return;
    setSchemes((prev) => prev.filter((s) => s.id !== id));
    if (isSupabaseConfigured) {
      await supabase.from('government_schemes').delete().eq('id', id);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">Scheme Management</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-amber-500">cloud_off</span>
          <h2 className="text-xl font-bold mt-4 text-amber-800">Supabase Not Configured</h2>
          <p className="text-amber-700 mt-2 max-w-md mx-auto">
            Configure Supabase in <code className="bg-amber-100 px-2 py-0.5 rounded">.env.local</code> to manage schemes.
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
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">Scheme Management</h1>
          <p className="text-on-surface-variant mt-1">
            <span className="font-mono font-semibold">{schemes.length}</span> schemes in database
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchSchemes}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gray-100 text-on-surface-variant font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Scheme</span>
          </button>
        </div>
      </motion.div>

      {/* Add Scheme Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-white rounded-2xl p-6 shadow-ambient space-y-4">
              <h3 className="font-headline font-bold text-on-surface">Add New Scheme</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-on-surface-variant block mb-1">Scheme Name (English) *</label>
                  <input type="text" placeholder="e.g. PM Kisan Samman Nidhi" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-on-surface-variant block mb-1">Scheme Name (Hindi)</label>
                  <input type="text" placeholder="e.g. पीएम किसान सम्मान निधि" value={newNameHi} onChange={(e) => setNewNameHi(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-on-surface-variant block mb-1">Category *</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Select category</option>
                    {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
                    <option value="Agriculture">Agriculture</option>
                    <option value="Housing">Housing</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Business">Business</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-on-surface-variant block mb-1">Ministry</label>
                  <input type="text" placeholder="e.g. Ministry of Agriculture" value={newMinistry} onChange={(e) => setNewMinistry(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="flex space-x-3">
                <button onClick={addScheme} disabled={!newName || !newCategory} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Save Scheme</button>
                <button onClick={() => setShowAddForm(false)} className="px-5 py-2.5 rounded-xl bg-gray-100 text-on-surface-variant text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="ml-3 text-on-surface-variant">Loading schemes...</span>
        </div>
      ) : (
        <>
          {/* Top Matched Chart */}
          {topMatched.length > 0 && topMatched.some(t => t.matches > 0) && (
            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-ambient">
              <h2 className="font-headline font-bold text-on-surface mb-4">Most Matched Schemes</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topMatched} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#707881' }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#707881' }} width={140} />
                    <Tooltip formatter={(value: any) => [value.toLocaleString('en-IN'), 'Matches']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="matches" fill="#006194" radius={[0, 6, 6, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-4 shadow-ambient">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                <input type="text" placeholder="Search schemes by name, Hindi name, or ministry..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 text-sm text-on-surface placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-2.5 rounded-xl bg-gray-50 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="all">All Categories</option>
                {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-2.5 rounded-xl bg-gray-50 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </motion.div>

          {/* Scheme list */}
          <motion.div variants={fadeUp} className="space-y-3">
            {filtered.map((scheme) => (
              <motion.div key={scheme.id} layout className="bg-white rounded-2xl p-5 shadow-ambient hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      {editingId === scheme.id ? (
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEdit(scheme.id)} className="px-3 py-1.5 rounded-lg bg-gray-50 text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" autoFocus />
                      ) : (
                        <h3 className="font-headline font-bold text-on-surface truncate">{scheme.name}</h3>
                      )}
                      {scheme.is_verified ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-tertiary/10 text-tertiary text-xs font-semibold shrink-0">
                          <span className="material-symbols-outlined text-[14px]">verified</span>
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-saffron/10 text-saffron text-xs font-semibold shrink-0">
                          <span className="material-symbols-outlined text-[14px]">pending</span>
                          <span>Unverified</span>
                        </span>
                      )}
                    </div>
                    {scheme.name_hi && <p className="text-sm text-on-surface-variant">{scheme.name_hi}</p>}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-on-surface-variant">
                      <span className="flex items-center space-x-1">
                        <span className="material-symbols-outlined text-[14px]">category</span>
                        <span>{scheme.scheme_type}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="material-symbols-outlined text-[14px]">account_balance</span>
                        <span>{scheme.ministry}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="material-symbols-outlined text-[14px]">update</span>
                        <span>{scheme.updated_at}</span>
                      </span>
                      <span className="flex items-center space-x-1 font-mono font-semibold text-primary">
                        <span className="material-symbols-outlined text-[14px]">people</span>
                        <span>{scheme.matchCount.toLocaleString('en-IN')} matches</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 shrink-0">
                    <button onClick={() => toggleActive(scheme.id)} className={cn('relative w-11 h-6 rounded-full transition-colors', scheme.is_active ? 'bg-tertiary' : 'bg-gray-300')}>
                      <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', scheme.is_active ? 'translate-x-5.5' : 'translate-x-0.5')} />
                    </button>
                    {editingId === scheme.id ? (
                      <button onClick={() => saveEdit(scheme.id)} className="p-2 rounded-xl hover:bg-tertiary/10 text-tertiary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">check</span>
                      </button>
                    ) : (
                      <button onClick={() => startEdit(scheme)} className="p-2 rounded-xl hover:bg-gray-100 text-on-surface-variant transition-colors">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                    )}
                    <button onClick={() => deleteScheme(scheme.id)} className="p-2 rounded-xl hover:bg-error/10 text-error transition-colors">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && !loading && (
              <div className="bg-white rounded-2xl p-12 shadow-ambient text-center">
                <span className="material-symbols-outlined text-[48px] text-gray-300 mb-3 block">search_off</span>
                <p className="text-on-surface-variant">
                  {schemes.length === 0 ? 'No schemes in database yet. Add your first scheme above.' : 'No schemes found matching your criteria.'}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}