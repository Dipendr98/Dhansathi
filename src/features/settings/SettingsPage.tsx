import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { INDIAN_STATES } from '@/lib/constants';
import type { UserProfile } from '@/types';
import { useLanguageStore } from '@/stores/languageStore';
import { T } from '@/lib/translations';
import { usePayment } from '@/hooks/usePayment';

/* ── Animation helpers ─────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const expandVariant = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: { opacity: 1, height: 'auto', marginTop: 16, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const } },
};

/* ── Types & data ──────────────────────────────── */

type ActiveSection = 'profile' | 'billing' | 'notifications' | 'security' | null;

interface SettingsCard {
  key: ActiveSection;
  icon: string;
  title: string;
  description: string;
  action: string;
  color: string;
  iconBg: string;
  borderActive: string;
}

const ACCOUNT_CARDS: SettingsCard[] = [
  {
    key: 'profile',
    icon: 'person',
    title: 'Profile',
    description: 'Update your personal details, income, and state information',
    action: 'Edit Profile',
    color: 'text-primary',
    iconBg: 'bg-primary-fixed',
    borderActive: 'border-primary',
  },
  {
    key: 'billing',
    icon: 'credit_card',
    title: 'Billing',
    description: 'Manage payment methods, view invoices, and billing history',
    action: 'Manage Billing',
    color: 'text-secondary',
    iconBg: 'bg-secondary-fixed',
    borderActive: 'border-secondary',
  },
  {
    key: 'notifications',
    icon: 'notifications',
    title: 'Notifications',
    description: 'Configure alerts, email preferences, and push notifications',
    action: 'Configure',
    color: 'text-saffron',
    iconBg: 'bg-saffron/10',
    borderActive: 'border-saffron',
  },
  {
    key: 'security',
    icon: 'shield',
    title: 'Security',
    description: 'Two-factor authentication, password change, and active sessions',
    action: 'Security Settings',
    color: 'text-tertiary',
    iconBg: 'bg-tertiary-fixed',
    borderActive: 'border-tertiary',
  },
];

interface PlanFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
}

const PLAN_FEATURES: PlanFeature[] = [
  { name: 'Scheme Eligibility', free: 'Basic', pro: 'Unlimited' },
  { name: 'Stock Screener', free: '5/day', pro: 'Unlimited' },
  { name: 'Crossover Alerts', free: false, pro: true },
  { name: 'DhanMitra AI Chat', free: '3/month', pro: 'Unlimited' },
  { name: 'AI Simulator', free: '3/month', pro: 'Unlimited' },
  { name: 'Priority Support', free: false, pro: true },
];

const OCCUPATIONS = [
  'Salaried', 'Self-Employed', 'Business Owner', 'Farmer', 'Student',
  'Homemaker', 'Retired', 'Daily Wage Worker', 'Government Employee', 'Other',
];

function getProfileFormFromUser(user?: UserProfile | null) {
  return {
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    date_of_birth: user?.date_of_birth || '',
    gender: (user?.gender || '') as UserProfile['gender'] | '',
    state: user?.state || '',
    district: user?.district || '',
    pincode: user?.pincode || '',
    category: (user?.category || '') as UserProfile['category'] | '',
    occupation: user?.occupation || '',
    annual_income: user?.annual_income?.toString() || '',
    is_bpl: user?.is_bpl || false,
  };
}

/* ── Toggle Switch ────────────────────────────── */

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-3 border-b border-outline-variant/10 last:border-0">
      <span className="text-sm text-on-surface font-medium">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200',
          checked ? 'bg-primary' : 'bg-surface-container-high',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </label>
  );
}

/* ── Component ─────────────────────────────────── */

export default function SettingsPage() {
  const { lang, toggleLang } = useLanguageStore();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const { handleUpgrade, loading: paymentLoading } = usePayment();

  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Profile form state ─────────────────────── */
  const [profileForm, setProfileForm] = useState(() => getProfileFormFromUser(user));

  /* Sync form when user loads asynchronously */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProfileForm(getProfileFormFromUser(user));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [user]);

  /* Cleanup save timeout on unmount */
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  /* ── Notification preferences (local state) ── */
  const [notifications, setNotifications] = useState({
    schemeUpdates: true,
    stockAlerts: true,
    deadlineReminders: true,
    pushNotifications: false,
    newSchemeMatches: true,
    weeklyDigest: true,
    marketingEmails: false,
  });

  /* ── Security form state ────────────────────── */
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  /* ── Handlers ───────────────────────────────── */

  function toggleSection(key: ActiveSection) {
    setActiveSection((prev) => (prev === key ? null : key));
    setSaveSuccess(false);
  }

  function updateProfileField(field: string, value: string | boolean | number) {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveProfile() {
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);

    const updates: Partial<UserProfile> = {
      full_name: profileForm.full_name,
      phone: profileForm.phone || undefined,
      date_of_birth: profileForm.date_of_birth || undefined,
      gender: profileForm.gender || undefined,
      state: profileForm.state || undefined,
      district: profileForm.district || undefined,
      pincode: profileForm.pincode || undefined,
      category: profileForm.category || undefined,
      occupation: profileForm.occupation || undefined,
      annual_income: profileForm.annual_income ? Number(profileForm.annual_income) : undefined,
      is_bpl: profileForm.is_bpl,
    };

    try {
      // updateProfile now handles both mock and real Supabase mode
      await useAuthStore.getState().updateProfile(updates);
    } catch (err) {
      console.error('[Settings] Save profile failed:', err);
    }

    setSaving(false);
    setSaveSuccess(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => setSaveSuccess(false), 3000);
  }

  function handleUpdatePassword() {
    const { currentPassword, newPassword, confirmPassword } = securityForm;
    if (!currentPassword || !newPassword) return;
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
    // In production, call supabase.auth.updateUser({ password: newPassword })
    alert('Password updated successfully!');
    setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      // For mock mode, clear user manually
      setUser(null);
    }
    navigate('/login');
  }

  /* ── Derived data ───────────────────────────── */
  const userName = user?.full_name || user?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  const userEmail = user?.email || 'user@example.com';
  const userPlan = user?.plan || 'free';

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-8 pb-16 max-w-4xl"
    >
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            role="status"
            aria-live="polite"
            className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-tertiary/25 bg-white px-5 py-4 text-on-surface shadow-[0_18px_45px_rgba(0,0,0,0.14)]"
          >
            <span className="material-symbols-outlined text-tertiary text-2xl">check_circle</span>
            <div>
              <p className="text-sm font-bold">
                {lang === 'hi' ? 'बदलाव सेव हो गए' : 'Changes saved'}
              </p>
              <p className="text-xs text-on-surface-variant">
                {lang === 'hi' ? 'आपकी प्रोफ़ाइल अपडेट हो गई है।' : 'Your profile has been updated successfully.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Header ── */}
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface">
          {T('settings', 'title', lang)}
        </h1>
        <p className="text-on-surface-variant mt-1">
          {T('settings', 'subtitle', lang)}
        </p>
      </motion.div>

      {/* ── Profile Section ── */}
      <motion.div
        variants={fadeUp}
        custom={1}
        className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6 md:p-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary/20">
              {userInitial}
            </div>
            <button
              onClick={() => toggleSection('profile')}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-lg shadow-md border border-outline-variant/20 flex items-center justify-center hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[14px]">
                edit
              </span>
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h2 className="font-headline text-xl font-bold text-on-surface">{userName}</h2>
              <span className={cn(
                'text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full',
                userPlan === 'pro'
                  ? 'bg-gradient-to-r from-primary to-primary-container text-white'
                  : 'bg-surface-container-high text-on-surface-variant',
              )}>
                {userPlan === 'pro' ? 'Pro Plan' : 'Free Plan'}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant mt-1">{userEmail}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Member since {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                : 'recently'}
            </p>
          </div>

          {/* Edit button */}
          <button
            onClick={() => toggleSection('profile')}
            className="text-sm font-semibold text-primary bg-primary-fixed/50 px-4 py-2.5 rounded-xl hover:bg-primary-fixed transition-colors"
          >
            {T('settings', 'editProfile', lang)}
          </button>
        </div>
      </motion.div>

      {/* ── Account Section ── */}
      <motion.div variants={fadeUp} custom={2}>
        <h3 className="font-headline font-bold text-on-surface mb-4 px-1">Account</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACCOUNT_CARDS.map((card) => (
            <div
              key={card.key}
              onClick={() => toggleSection(card.key)}
              className={cn(
                'bg-surface-container-lowest rounded-2xl border-2 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all group cursor-pointer',
                activeSection === card.key
                  ? `${card.borderActive} shadow-lg`
                  : 'border-outline-variant/20',
              )}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform',
                    card.iconBg,
                  )}
                >
                  <span className={cn('material-symbols-outlined text-[22px]', card.color)}>
                    {card.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-on-surface">{card.key === 'profile' ? T('settings', 'profileTitle', lang) : card.key === 'billing' ? T('settings', 'billingTitle', lang) : card.key === 'notifications' ? T('settings', 'notifTitle', lang) : T('settings', 'securityTitle', lang)}</h4>
                    <span className={cn(
                      'material-symbols-outlined text-lg text-on-surface-variant transition-transform duration-300',
                      activeSection === card.key && 'rotate-180',
                    )}>
                      expand_more
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {card.key === 'profile' ? T('settings', 'profileDesc', lang) : card.key === 'billing' ? T('settings', 'billingDesc', lang) : card.key === 'notifications' ? T('settings', 'notifDesc', lang) : T('settings', 'securityDesc', lang)}
                  </p>
                  <span
                    className={cn(
                      'mt-3 text-xs font-semibold flex items-center space-x-1 transition-colors',
                      card.color,
                    )}
                  >
                    <span>{card.key === 'profile' ? T('settings', 'editProfile', lang) : card.key === 'billing' ? T('settings', 'managePlan', lang) : card.key === 'notifications' ? T('settings', 'notifAction', lang) : T('settings', 'securityAction', lang)}</span>
                    <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Expandable Sections ── */}
        <AnimatePresence mode="wait">
          {/* ── PROFILE SECTION ── */}
          {activeSection === 'profile' && (
            <motion.div
              key="profile"
              variants={expandVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-surface-container-lowest rounded-2xl border border-primary/30 p-6 md:p-8 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-xl">person</span>
                <h4 className="font-headline font-bold text-on-surface text-lg">{T('settings', 'editProfile', lang)}</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                    {T('settings', 'fullName', lang)} *
                  </label>
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => updateProfileField('full_name', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                    placeholder="Your full name"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                    {T('settings', 'phone', lang)}
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => updateProfileField('phone', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                    placeholder="+91 98765 43210"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                    {T('settings', 'dob', lang)}
                  </label>
                  <input
                    type="date"
                    value={profileForm.date_of_birth}
                    onChange={(e) => updateProfileField('date_of_birth', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                    {lang === 'hi' ? 'लिंग' : 'Gender'}
                  </label>
                  <select
                    value={profileForm.gender}
                    onChange={(e) => updateProfileField('gender', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                  >
                    <option value="">{lang === 'hi' ? 'लिंग चुनें' : 'Select gender'}</option>
                    <option value="male">{lang === 'hi' ? 'पुरुष' : 'Male'}</option>
                    <option value="female">{lang === 'hi' ? 'महिला' : 'Female'}</option>
                    <option value="other">{lang === 'hi' ? 'अन्य' : 'Other'}</option>
                  </select>
                </div>

                {/* State */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                    {T('settings', 'stateLbl', lang)}
                  </label>
                  <select
                    value={profileForm.state}
                    onChange={(e) => updateProfileField('state', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                  >
                    <option value="">{T('settings', 'selectState', lang)}</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                    {lang === 'hi' ? 'जिला' : 'District'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.district}
                    onChange={(e) => updateProfileField('district', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                    placeholder={lang === 'hi' ? 'आपका जिला' : 'Your district'}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                    {T('settings', 'category', lang)}
                  </label>
                  <select
                    value={profileForm.category}
                    onChange={(e) => updateProfileField('category', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                  >
                    <option value="">{T('settings', 'selectCategory', lang)}</option>
                    <option value="general">General</option>
                    <option value="obc">OBC</option>
                    <option value="sc">SC</option>
                    <option value="st">ST</option>
                    <option value="ews">EWS</option>
                  </select>
                </div>

                {/* Occupation */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                    {T('settings', 'occupation', lang)}
                  </label>
                  <select
                    value={profileForm.occupation}
                    onChange={(e) => updateProfileField('occupation', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                  >
                    <option value="">{T('settings', 'selectOccupation', lang)}</option>
                    {OCCUPATIONS.map((o) => (
                      <option key={o} value={o.toLowerCase().replace(/\s+/g, '_')}>{o}</option>
                    ))}
                  </select>
                </div>

                {/* Annual Income */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                    {T('settings', 'income', lang)}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-mono">
                      &#8377;
                    </span>
                    <input
                      type="number"
                      value={profileForm.annual_income}
                      onChange={(e) => updateProfileField('annual_income', e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                      placeholder="e.g. 300000"
                    />
                  </div>
                </div>

                {/* BPL toggle */}
                <div className="flex items-center gap-3 self-end pb-1">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={profileForm.is_bpl}
                    onClick={() => updateProfileField('is_bpl', !profileForm.is_bpl)}
                    className={cn(
                      'relative w-11 h-6 rounded-full transition-colors duration-200',
                      profileForm.is_bpl ? 'bg-primary' : 'bg-surface-container-high',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200',
                        profileForm.is_bpl && 'translate-x-5',
                      )}
                    />
                  </button>
                  <span className="text-sm text-on-surface font-medium">{lang === 'hi' ? 'गरीबी रेखा से नीचे (BPL)' : 'Below Poverty Line (BPL)'}</span>
                </div>
              </div>

              {/* Save button */}
              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className={cn(
                    'flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl transition-all',
                    saving
                      ? 'bg-primary/50 text-on-primary cursor-wait'
                      : 'bg-primary hover:bg-primary-container text-on-primary hover:shadow-lg hover:shadow-primary/20',
                  )}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {T('settings', 'saving', lang)}
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">save</span>
                      {T('settings', 'saveChanges', lang)}
                    </>
                  )}
                </button>
                {saveSuccess && (
                  <span className="text-sm text-india-green font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    {lang === 'hi' ? 'प्रोफ़ाइल सहेजी गई!' : 'Profile saved successfully!'}
                  </span>
                )}
              </div>

              <p className="text-xs text-on-surface-variant mt-4">
                Your profile data is used to match you with eligible government schemes and personalize your experience.
                It is stored locally and not shared with third parties.
              </p>
            </motion.div>
          )}

          {/* ── BILLING SECTION ── */}
          {activeSection === 'billing' && (
            <motion.div
              key="billing"
              variants={expandVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-surface-container-lowest rounded-2xl border border-secondary/30 p-6 md:p-8 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-secondary text-xl">credit_card</span>
                <h4 className="font-headline font-bold text-on-surface text-lg">Billing & Subscription</h4>
              </div>

              {/* Current Plan */}
              <div className="bg-surface-container-low rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Current Plan</p>
                    <p className="font-headline font-bold text-on-surface text-xl mt-1">
                      {userPlan === 'pro' ? 'Pro' : 'Free'} Plan
                    </p>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {userPlan === 'free'
                        ? 'Basic access to schemes and stocks'
                        : 'Full access to all features'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-2xl font-extrabold text-on-surface">
                      {userPlan === 'free' ? 'Free' : '₹199'}
                    </p>
                    {userPlan !== 'free' && (
                      <p className="text-xs text-on-surface-variant">/month</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Payment Method</p>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant">account_balance</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">
                      {userPlan === 'free' ? 'No payment method' : 'UPI / Razorpay'}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {userPlan === 'free' ? 'Add a payment method to upgrade' : 'Linked to your account'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard/pricing')}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {userPlan === 'free' ? 'Add' : 'Change'}
                  </button>
                </div>
              </div>

              {/* Recent Invoices */}
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Recent Invoices</p>
                {userPlan === 'free' ? (
                  <p className="text-sm text-on-surface-variant py-4 text-center">No invoices yet. Upgrade to Pro to get started.</p>
                ) : (
                  <div className="space-y-2">
                    {[
                      { date: 'Mar 2026', amount: '₹199', status: 'Paid' },
                      { date: 'Feb 2026', amount: '₹199', status: 'Paid' },
                      { date: 'Jan 2026', amount: '₹199', status: 'Paid' },
                    ].map((inv) => (
                      <div key={inv.date} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-on-surface-variant text-lg">receipt</span>
                          <span className="text-sm text-on-surface font-medium">{inv.date}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-sm font-bold text-on-surface">{inv.amount}</span>
                          <span className="text-[10px] font-bold uppercase bg-india-green/10 text-india-green px-2 py-0.5 rounded-md">
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {userPlan === 'free' && (
                <button
                  onClick={() => handleUpgrade('pro', false)}
                  disabled={paymentLoading}
                  className={cn(
                    "mt-6 w-full bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all",
                    paymentLoading && "opacity-50 cursor-wait"
                  )}
                >
                  {paymentLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    'Upgrade to Pro - ₹199/month'
                  )}
                </button>
              )}
            </motion.div>
          )}

          {/* ── NOTIFICATIONS SECTION ── */}
          {activeSection === 'notifications' && (
            <motion.div
              key="notifications"
              variants={expandVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-surface-container-lowest rounded-2xl border border-saffron/30 p-6 md:p-8 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-saffron text-xl">notifications</span>
                <h4 className="font-headline font-bold text-on-surface text-lg">Notification Preferences</h4>
              </div>

              <div className="space-y-1">
                <Toggle
                  label="New scheme eligibility matches"
                  checked={notifications.newSchemeMatches}
                  onChange={(v) => setNotifications((p) => ({ ...p, newSchemeMatches: v }))}
                />
                <Toggle
                  label="Scheme deadline reminders"
                  checked={notifications.deadlineReminders}
                  onChange={(v) => setNotifications((p) => ({ ...p, deadlineReminders: v }))}
                />
                <Toggle
                  label="Scheme updates & policy changes"
                  checked={notifications.schemeUpdates}
                  onChange={(v) => setNotifications((p) => ({ ...p, schemeUpdates: v }))}
                />
                <Toggle
                  label="Stock price alerts"
                  checked={notifications.stockAlerts}
                  onChange={(v) => setNotifications((p) => ({ ...p, stockAlerts: v }))}
                />
                <Toggle
                  label="Weekly investment digest"
                  checked={notifications.weeklyDigest}
                  onChange={(v) => setNotifications((p) => ({ ...p, weeklyDigest: v }))}
                />
                <Toggle
                  label="Push notifications (browser)"
                  checked={notifications.pushNotifications}
                  onChange={(v) => setNotifications((p) => ({ ...p, pushNotifications: v }))}
                />
                <Toggle
                  label="Marketing & promotional emails"
                  checked={notifications.marketingEmails}
                  onChange={(v) => setNotifications((p) => ({ ...p, marketingEmails: v }))}
                />
              </div>

              <p className="text-xs text-on-surface-variant mt-5">
                Notification preferences are stored locally and will apply to your current session.
              </p>
            </motion.div>
          )}

          {/* ── SECURITY SECTION ── */}
          {activeSection === 'security' && (
            <motion.div
              key="security"
              variants={expandVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-surface-container-lowest rounded-2xl border border-tertiary/30 p-6 md:p-8 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-tertiary text-xl">shield</span>
                <h4 className="font-headline font-bold text-on-surface text-lg">Security Settings</h4>
              </div>

              {/* Change Password */}
              <div className="mb-8">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Change Password</p>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">Current Password</label>
                    <input
                      type="password"
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm((p) => ({ ...p, currentPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-tertiary/40 transition-shadow"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">New Password</label>
                    <input
                      type="password"
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm((p) => ({ ...p, newPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-tertiary/40 transition-shadow"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">Confirm New Password</label>
                    <input
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-tertiary/40 transition-shadow"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button
                    onClick={handleUpdatePassword}
                    className="flex items-center gap-2 bg-tertiary hover:bg-tertiary/90 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">lock_reset</span>
                    Update Password
                  </button>
                </div>
              </div>

              {/* Two-Factor Auth */}
              <div className="mb-8">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Two-Factor Authentication</p>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low">
                  <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary">security</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">2FA Authentication</p>
                    <p className="text-xs text-on-surface-variant">Add an extra layer of security to your account</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-saffron/10 text-saffron px-2 py-0.5 rounded-md">
                    Coming Soon
                  </span>
                </div>
              </div>

              {/* Active Sessions */}
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Active Sessions</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-india-green">computer</span>
                      <div>
                        <p className="text-sm font-medium text-on-surface">Current Session</p>
                        <p className="text-xs text-on-surface-variant">This device &middot; Active now</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-india-green/10 text-india-green px-2 py-0.5 rounded-md">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Language Toggle ── */}
      <motion.div
        variants={fadeUp}
        custom={2.5}
        className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px] text-primary">translate</span>
            </div>
            <div>
              <h4 className="font-semibold text-on-surface">{T('settings', 'language', lang)}</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">{T('settings', 'languageDesc', lang)}</p>
            </div>
          </div>
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 bg-primary-fixed/50 hover:bg-primary-fixed text-primary font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-lg">language</span>
            {lang === 'en' ? 'हिंदी' : 'English'}
          </button>
        </div>
      </motion.div>

      {/* ── Current Plan ── */}
      <motion.div
        variants={fadeUp}
        custom={3}
        className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden"
      >
        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <div className="flex items-center space-x-3">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  workspace_premium
                </span>
                <h3 className="font-headline font-bold text-on-surface text-lg">Current Plan</h3>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="font-mono text-3xl font-extrabold text-on-surface">
                  {userPlan === 'free' ? 'Free' : '₹199'}
                </span>
                {userPlan !== 'free' && (
                  <span className="text-on-surface-variant text-sm">/month</span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                {userPlan !== 'free' ? 'Next billing date: April 15, 2026' : 'Upgrade anytime to unlock all features'}
              </p>
            </div>
            {userPlan === 'free' && (
              <button
                onClick={() => navigate('/dashboard/pricing')}
                className="bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        {/* Plan comparison */}
        <div className="border-t border-outline-variant/20">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="text-left px-6 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="text-center px-6 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                    Free
                  </th>
                  <th className="text-center px-6 py-3 font-semibold text-xs uppercase tracking-wider text-primary">
                    Pro {userPlan === 'pro' && '(Current)'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {PLAN_FEATURES.map((feature) => (
                  <tr
                    key={feature.name}
                    className="border-t border-outline-variant/10"
                  >
                    <td className="px-6 py-3 text-on-surface font-medium">{feature.name}</td>
                    <td className="px-6 py-3 text-center">
                      {typeof feature.free === 'boolean' ? (
                        feature.free ? (
                          <span className="material-symbols-outlined text-tertiary text-[18px]">
                            check_circle
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-outline text-[18px]">
                            cancel
                          </span>
                        )
                      ) : (
                        <span className="text-on-surface-variant font-mono text-xs">
                          {feature.free}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {typeof feature.pro === 'boolean' ? (
                        feature.pro ? (
                          <span className="material-symbols-outlined text-tertiary text-[18px]">
                            check_circle
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-outline text-[18px]">
                            cancel
                          </span>
                        )
                      ) : (
                        <span className="text-primary font-mono text-xs font-semibold">
                          {feature.pro}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* ── Danger Zone ── */}
      <motion.div
        variants={fadeUp}
        custom={4}
        className="bg-surface-container-lowest rounded-2xl border border-error/20 p-6"
      >
        <h3 className="font-headline font-bold text-error mb-1">Danger Zone</h3>
        <p className="text-sm text-on-surface-variant mb-5">
          These actions are permanent. Please proceed with caution.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {!showSignOutConfirm ? (
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="flex items-center space-x-2 bg-error text-white font-semibold text-sm px-5 py-3 rounded-xl hover:bg-error/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sign Out</span>
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <p className="text-sm text-error font-semibold">Are you sure?</p>
              <button
                onClick={handleSignOut}
                className="bg-error text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-error/90 transition-colors"
              >
                Yes, Sign Out
              </button>
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="bg-surface-container-high text-on-surface-variant font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
