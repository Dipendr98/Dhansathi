import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/authStore';
import { INDIAN_STATES } from '@/lib/constants';
import { cn } from '@/lib/utils';

/* ── Types ─────────────────────────────────── */

interface OnboardingFormData {
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  marital_status: string;
  state: string;
  district: string;
  pincode: string;
  occupation: string;
  annual_income: number;
  category: 'general' | 'obc' | 'sc' | 'st' | 'ews';
  is_bpl: boolean;
  has_disability: boolean;
}

/* ── Constants ─────────────────────────────── */

const STEPS = [
  { label: 'Personal', icon: 'person' },
  { label: 'Location', icon: 'location_on' },
  { label: 'Financial', icon: 'account_balance' },
  { label: 'Review', icon: 'checklist' },
] as const;

const OCCUPATIONS = [
  'Farmer',
  'Student',
  'Government Employee',
  'Private Sector',
  'Self Employed',
  'Business Owner',
  'Daily Wage Worker',
  'Homemaker',
  'Retired',
  'Unemployed',
  'Other',
] as const;

const INCOME_RANGES = [
  { label: 'Below 1 Lakh', value: 100000 },
  { label: '1 - 2.5 Lakh', value: 250000 },
  { label: '2.5 - 5 Lakh', value: 500000 },
  { label: '5 - 10 Lakh', value: 1000000 },
  { label: '10 - 25 Lakh', value: 2500000 },
  { label: 'Above 25 Lakh', value: 5000000 },
] as const;

/* ── Animations ────────────────────────────── */

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const cardFade = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ── Component ─────────────────────────────── */

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const user = useAuthStore((s) => s.user);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormData>({
    defaultValues: {
      full_name: user?.full_name || '',
      date_of_birth: user?.date_of_birth || '',
      gender: user?.gender || 'male',
      marital_status: '',
      state: user?.state || '',
      district: user?.district || '',
      pincode: user?.pincode || '',
      occupation: user?.occupation || '',
      annual_income: user?.annual_income || 300000,
      category: user?.category || 'general',
      is_bpl: user?.is_bpl || false,
      has_disability: false,
    },
  });

  const formValues = watch();

  /* ── Navigation ────────────────────────────── */

  const goNext = async () => {
    let valid = false;
    if (step === 0) {
      valid = await trigger(['full_name', 'date_of_birth', 'gender']);
    } else if (step === 1) {
      valid = await trigger(['state', 'pincode']);
    } else if (step === 2) {
      valid = await trigger(['occupation', 'annual_income', 'category']);
    } else {
      valid = true;
    }
    if (valid && step < 3) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const skipOnboarding = () => {
    navigate('/dashboard');
  };

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      await updateProfile({
        full_name: data.full_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        state: data.state,
        district: data.district,
        pincode: data.pincode,
        occupation: data.occupation,
        annual_income: data.annual_income,
        category: data.category,
        is_bpl: data.is_bpl,
        onboarding_completed: true,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('[onboarding] Failed to save profile:', err);
    }
  };

  /* ── Input helpers ─────────────────────────── */

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full pl-12 pr-4 py-3 rounded-xl bg-surface-container-low border text-sm text-on-surface placeholder:text-outline-variant outline-none transition-colors',
      hasError ? 'border-error focus:border-error' : 'border-outline-variant/30 focus:border-primary',
    );

  const selectClass = (hasError: boolean) =>
    cn(
      'w-full pl-12 pr-4 py-3 rounded-xl bg-surface-container-low border text-sm text-on-surface outline-none transition-colors appearance-none cursor-pointer',
      hasError ? 'border-error focus:border-error' : 'border-outline-variant/30 focus:border-primary',
    );

  /* ── Step renderers ────────────────────────── */

  const renderStep0 = () => (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="font-headline text-xl font-extrabold text-on-surface">Personal Details</h2>
        <p className="text-sm text-on-surface-variant mt-1">Tell us about yourself</p>
      </div>

      {/* Full Name */}
      <div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            badge
          </span>
          <input
            type="text"
            placeholder="Full Name"
            className={inputClass(!!errors.full_name)}
            {...register('full_name', { required: 'Name is required' })}
          />
        </div>
        {errors.full_name && <p className="text-xs text-error mt-1.5 pl-1">{errors.full_name.message}</p>}
      </div>

      {/* Date of Birth */}
      <div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            calendar_today
          </span>
          <input
            type="date"
            className={inputClass(!!errors.date_of_birth)}
            {...register('date_of_birth', { required: 'Date of birth is required' })}
          />
        </div>
        {errors.date_of_birth && <p className="text-xs text-error mt-1.5 pl-1">{errors.date_of_birth.message}</p>}
      </div>

      {/* Gender */}
      <div>
        <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block pl-1">
          Gender
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['male', 'female', 'other'] as const).map((g) => (
            <label
              key={g}
              className={cn(
                'flex items-center justify-center space-x-2 py-3 rounded-xl border text-sm font-medium cursor-pointer transition-all',
                formValues.gender === g
                  ? 'border-primary bg-primary-fixed/50 text-primary'
                  : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:border-outline',
              )}
            >
              <input type="radio" value={g} className="sr-only" {...register('gender')} />
              <span className="material-symbols-outlined text-[18px]">
                {g === 'male' ? 'male' : g === 'female' ? 'female' : 'transgender'}
              </span>
              <span className="capitalize">{g}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Marital Status */}
      <div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            favorite
          </span>
          <select className={selectClass(false)} {...register('marital_status')}>
            <option value="">Marital Status (optional)</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="widowed">Widowed</option>
            <option value="divorced">Divorced</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="font-headline text-xl font-extrabold text-on-surface">Location</h2>
        <p className="text-sm text-on-surface-variant mt-1">Where are you located?</p>
      </div>

      {/* State */}
      <div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            map
          </span>
          <select
            className={selectClass(!!errors.state)}
            {...register('state', { required: 'State is required' })}
          >
            <option value="">Select State / UT</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {errors.state && <p className="text-xs text-error mt-1.5 pl-1">{errors.state.message}</p>}
      </div>

      {/* District */}
      <div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            location_city
          </span>
          <input
            type="text"
            placeholder="District (optional)"
            className={inputClass(false)}
            {...register('district')}
          />
        </div>
      </div>

      {/* Pincode */}
      <div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            pin_drop
          </span>
          <input
            type="text"
            placeholder="Pincode"
            maxLength={6}
            className={inputClass(!!errors.pincode)}
            {...register('pincode', {
              required: 'Pincode is required',
              pattern: { value: /^[1-9][0-9]{5}$/, message: 'Enter a valid 6-digit pincode' },
            })}
          />
        </div>
        {errors.pincode && <p className="text-xs text-error mt-1.5 pl-1">{errors.pincode.message}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="font-headline text-xl font-extrabold text-on-surface">Financial Profile</h2>
        <p className="text-sm text-on-surface-variant mt-1">This helps match government schemes</p>
      </div>

      {/* Occupation */}
      <div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            work
          </span>
          <select
            className={selectClass(!!errors.occupation)}
            {...register('occupation', { required: 'Occupation is required' })}
          >
            <option value="">Select Occupation</option>
            {OCCUPATIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        {errors.occupation && <p className="text-xs text-error mt-1.5 pl-1">{errors.occupation.message}</p>}
      </div>

      {/* Annual Income */}
      <div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            currency_rupee
          </span>
          <select
            className={selectClass(!!errors.annual_income)}
            {...register('annual_income', { required: 'Income range is required', valueAsNumber: true })}
          >
            <option value="">Annual Income Range</option>
            {INCOME_RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        {errors.annual_income && <p className="text-xs text-error mt-1.5 pl-1">{errors.annual_income.message}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block pl-1">
          Category
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {(['general', 'obc', 'sc', 'st', 'ews'] as const).map((cat) => (
            <label
              key={cat}
              className={cn(
                'flex items-center justify-center py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all uppercase',
                formValues.category === cat
                  ? 'border-primary bg-primary-fixed/50 text-primary'
                  : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:border-outline',
              )}
            >
              <input type="radio" value={cat} className="sr-only" {...register('category')} />
              {cat}
            </label>
          ))}
        </div>
      </div>

      {/* BPL Toggle */}
      <div className="flex items-center justify-between bg-surface-container-low rounded-xl border border-outline-variant/30 px-4 py-3">
        <div className="flex items-center space-x-3">
          <span className="material-symbols-outlined text-outline text-[20px]">shield</span>
          <div>
            <p className="text-sm font-medium text-on-surface">BPL Card Holder</p>
            <p className="text-xs text-on-surface-variant">Below Poverty Line</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" {...register('is_bpl')} />
          <div className="w-11 h-6 bg-outline-variant/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
        </label>
      </div>

      {/* Disability Toggle */}
      <div className="flex items-center justify-between bg-surface-container-low rounded-xl border border-outline-variant/30 px-4 py-3">
        <div className="flex items-center space-x-3">
          <span className="material-symbols-outlined text-outline text-[20px]">accessible</span>
          <div>
            <p className="text-sm font-medium text-on-surface">Person with Disability</p>
            <p className="text-xs text-on-surface-variant">PwD certificate holder</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" {...register('has_disability')} />
          <div className="w-11 h-6 bg-outline-variant/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
        </label>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const incomeLabel = INCOME_RANGES.find((r) => r.value === formValues.annual_income)?.label || 'Not set';

    const summaryItems = [
      { icon: 'badge', label: 'Name', value: formValues.full_name || 'Not set', step: 0 },
      { icon: 'calendar_today', label: 'Date of Birth', value: formValues.date_of_birth || 'Not set', step: 0 },
      { icon: 'person', label: 'Gender', value: formValues.gender ? formValues.gender.charAt(0).toUpperCase() + formValues.gender.slice(1) : 'Not set', step: 0 },
      { icon: 'map', label: 'State', value: formValues.state || 'Not set', step: 1 },
      { icon: 'pin_drop', label: 'Pincode', value: formValues.pincode || 'Not set', step: 1 },
      { icon: 'work', label: 'Occupation', value: formValues.occupation || 'Not set', step: 2 },
      { icon: 'currency_rupee', label: 'Annual Income', value: incomeLabel, step: 2 },
      { icon: 'category', label: 'Category', value: formValues.category?.toUpperCase() || 'Not set', step: 2 },
    ];

    return (
      <div className="space-y-5">
        <div className="text-center mb-6">
          <h2 className="font-headline text-xl font-extrabold text-on-surface">Review & Confirm</h2>
          <p className="text-sm text-on-surface-variant mt-1">Make sure everything looks correct</p>
        </div>

        <div className="space-y-3">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between bg-surface-container-low rounded-xl border border-outline-variant/30 px-4 py-3"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className="material-symbols-outlined text-outline text-[20px] shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs text-on-surface-variant">{item.label}</p>
                  <p className="text-sm font-medium text-on-surface truncate">{item.value}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDirection(-1);
                  setStep(item.step);
                }}
                className="text-xs font-semibold text-primary hover:text-primary-container transition-colors shrink-0 ml-2"
              >
                Edit
              </button>
            </div>
          ))}
        </div>

        {formValues.is_bpl && (
          <div className="flex items-center space-x-2 px-1">
            <span className="material-symbols-outlined text-tertiary text-[16px]">check_circle</span>
            <span className="text-xs text-on-surface-variant">BPL Card Holder</span>
          </div>
        )}
        {formValues.has_disability && (
          <div className="flex items-center space-x-2 px-1">
            <span className="material-symbols-outlined text-tertiary text-[16px]">check_circle</span>
            <span className="text-xs text-on-surface-variant">Person with Disability</span>
          </div>
        )}
      </div>
    );
  };

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3];

  /* ── Render ────────────────────────────────── */

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-start p-6 antialiased relative">
      {/* Tricolor bar */}
      <div className="fixed top-0 left-0 w-full h-1 flex z-50">
        <div className="h-full flex-1 bg-saffron" />
        <div className="h-full flex-1 bg-white" />
        <div className="h-full flex-1 bg-india-green" />
      </div>

      {/* Decorative blurs */}
      <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />

      <motion.div
        variants={cardFade}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[480px] mt-12"
      >
        {/* ── Progress Bar ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                    i < step
                      ? 'bg-primary text-white'
                      : i === step
                        ? 'bg-primary-fixed text-primary ring-2 ring-primary'
                        : 'bg-surface-container-low text-outline-variant',
                  )}
                >
                  {i < step ? (
                    <span className="material-symbols-outlined text-[20px]">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-semibold mt-1.5 uppercase tracking-wider',
                    i <= step ? 'text-primary' : 'text-outline-variant',
                  )}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Progress track */}
          <div className="h-1.5 bg-surface-container-low rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* ── Card ── */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-xl shadow-primary/5 border border-outline-variant/15 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 sm:p-8 min-h-[400px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  {stepRenderers[step]()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Footer ── */}
            <div className="border-t border-outline-variant/15 px-6 sm:px-8 py-4 flex items-center justify-between">
              <div>
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center space-x-1 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    <span>Back</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={skipOnboarding}
                    className="text-sm font-semibold text-outline hover:text-on-surface-variant transition-colors"
                  >
                    Skip for now
                  </button>
                )}
              </div>

              <div>
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="flex items-center space-x-1 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
                  >
                    <span>Next</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span>Complete Setup</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer text */}
        <p className="text-center text-[10px] text-outline-variant mt-6 font-mono uppercase tracking-[0.15em]">
          Your data is encrypted & stored securely
        </p>
      </motion.div>
    </div>
  );
}
