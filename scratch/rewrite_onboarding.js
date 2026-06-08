const fs = require('fs');

const code = `import { useState, useMemo } from 'react';
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

  // Student specific
  education_level?: 'school' | 'diploma' | 'graduation' | 'postgraduation' | 'phd' | 'technical' | 'abroad';
  current_course?: string;
  institution_name?: string;
  current_year?: string;
  last_exam_percentage?: number;
  is_hosteller?: boolean;
  stream?: string;
  board_university?: string;
  passing_year?: string;
  institution_type?: 'government' | 'private' | 'aided';
  parent_occupation?: string;
  
  // Extra specific demographic flags for schemes
  is_minority?: boolean;
  is_farmer_family?: boolean;
  is_orphan_single_parent?: boolean;
  is_ex_serviceman_family?: boolean;

  // Documents
  has_income_certificate?: boolean;
  has_caste_certificate?: boolean;
  has_domicile_certificate?: boolean;
  is_aadhaar_bank_linked?: boolean;
}

/* ── Constants ─────────────────────────────── */

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

const EDUCATION_LEVELS = [
  { label: 'School (1st to 12th)', value: 'school' },
  { label: 'Diploma / ITI', value: 'diploma' },
  { label: 'Graduation (UG)', value: 'graduation' },
  { label: 'Post-Graduation (PG)', value: 'postgraduation' },
  { label: 'PhD / Research', value: 'phd' },
  { label: 'Technical / Professional', value: 'technical' },
  { label: 'Studying Abroad', value: 'abroad' },
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
  const [stepIndex, setStepIndex] = useState(0);
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
      has_disability: user?.has_disability || false,
      education_level: user?.education_level || 'school',
      current_course: user?.current_course || '',
      institution_name: user?.institution_name || '',
      current_year: user?.current_year || '',
      last_exam_percentage: user?.last_exam_percentage || undefined,
      is_hosteller: user?.is_hosteller || false,
      stream: user?.stream || '',
      board_university: user?.board_university || '',
      passing_year: user?.passing_year || '',
      institution_type: user?.institution_type || 'government',
      parent_occupation: user?.parent_occupation || '',
      is_minority: user?.is_minority || false,
      is_farmer_family: user?.is_farmer_family || false,
      is_orphan_single_parent: user?.is_orphan_single_parent || false,
      is_ex_serviceman_family: user?.is_ex_serviceman_family || false,
      has_income_certificate: user?.has_income_certificate || false,
      has_caste_certificate: user?.has_caste_certificate || false,
      has_domicile_certificate: user?.has_domicile_certificate || false,
      is_aadhaar_bank_linked: user?.is_aadhaar_bank_linked || false,
    },
  });

  const formValues = watch();
  const isStudent = formValues.occupation === 'Student';

  const STEPS = useMemo(() => {
    const base = [
      { id: 'personal', label: 'Personal', icon: 'person' },
      { id: 'location', label: 'Location', icon: 'location_on' },
      { id: 'financial', label: 'Financial', icon: 'account_balance' },
    ];
    if (isStudent) {
      base.push({ id: 'education', label: 'Education', icon: 'school' });
    }
    base.push({ id: 'review', label: 'Review', icon: 'checklist' });
    return base;
  }, [isStudent]);

  /* ── Navigation ────────────────────────────── */

  const goNext = async () => {
    let valid = false;
    const currentStepId = STEPS[stepIndex].id;

    if (currentStepId === 'personal') {
      valid = await trigger(['full_name', 'date_of_birth', 'gender']);
    } else if (currentStepId === 'location') {
      valid = await trigger(['state', 'pincode']);
    } else if (currentStepId === 'financial') {
      valid = await trigger(['occupation', 'annual_income', 'category']);
    } else if (currentStepId === 'education') {
      valid = await trigger(['education_level', 'current_course', 'institution_name']);
    } else {
      valid = true;
    }

    if (valid && stepIndex < STEPS.length - 1) {
      setDirection(1);
      setStepIndex((s) => s + 1);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setDirection(-1);
      setStepIndex((s) => s - 1);
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
        has_disability: data.has_disability,
        is_minority: data.is_minority,
        is_farmer_family: data.is_farmer_family,
        is_orphan_single_parent: data.is_orphan_single_parent,
        is_ex_serviceman_family: data.is_ex_serviceman_family,
        has_income_certificate: data.has_income_certificate,
        has_caste_certificate: data.has_caste_certificate,
        has_domicile_certificate: data.has_domicile_certificate,
        is_aadhaar_bank_linked: data.is_aadhaar_bank_linked,
        onboarding_completed: true,
        ...(isStudent && {
          education_level: data.education_level,
          current_course: data.current_course,
          institution_name: data.institution_name,
          current_year: data.current_year,
          last_exam_percentage: data.last_exam_percentage,
          is_hosteller: data.is_hosteller,
          stream: data.stream,
          board_university: data.board_university,
          passing_year: data.passing_year,
          institution_type: data.institution_type,
          parent_occupation: data.parent_occupation,
        })
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

  const CheckboxItem = ({ name, label, subtitle, icon }: { name: keyof OnboardingFormData, label: string, subtitle?: string, icon: string }) => (
    <div className="flex items-center justify-between bg-surface-container-low rounded-xl border border-outline-variant/30 px-4 py-3">
      <div className="flex items-center space-x-3">
        <span className="material-symbols-outlined text-outline text-[20px]">{icon}</span>
        <div>
          <p className="text-sm font-medium text-on-surface">{label}</p>
          {subtitle && <p className="text-xs text-on-surface-variant">{subtitle}</p>}
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" {...register(name as any)} />
        <div className="w-11 h-6 bg-outline-variant/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
      </label>
    </div>
  );

  /* ── Step renderers ────────────────────────── */

  const renderStepPersonal = () => (
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

      <CheckboxItem name="is_minority" label="Minority Community" subtitle="Belong to minority religion" icon="groups" />
    </div>
  );

  const renderStepLocation = () => (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="font-headline text-xl font-extrabold text-on-surface">Location & Docs</h2>
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

      {/* District & Pincode */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              location_city
            </span>
            <input
              type="text"
              placeholder="District"
              className={inputClass(false)}
              {...register('district')}
            />
          </div>
        </div>
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
                pattern: { value: /^[1-9][0-9]{5}$/, message: 'Valid 6-digit PIN' },
              })}
            />
          </div>
          {errors.pincode && <p className="text-xs text-error mt-1.5 pl-1">{errors.pincode.message}</p>}
        </div>
      </div>

      {/* Basic Document Flags */}
      <div className="pt-2">
        <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block pl-1">
          Documents Available
        </label>
        <div className="space-y-3">
          <CheckboxItem name="has_domicile_certificate" label="Domicile Certificate" subtitle="Proof of state residence" icon="home_pin" />
          <CheckboxItem name="is_aadhaar_bank_linked" label="Aadhaar-Bank Linked" subtitle="For DBT scheme payments" icon="account_balance" />
        </div>
      </div>
    </div>
  );

  const renderStepFinancial = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
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
            <option value="">Family Annual Income</option>
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
                'flex items-center justify-center py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all uppercase',
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

      {/* Extra attributes (scrollable if needed) */}
      <div className="space-y-2 mt-4 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
        <CheckboxItem name="is_bpl" label="BPL Card Holder" icon="shield" />
        <CheckboxItem name="has_disability" label="Person with Disability" icon="accessible" />
        <CheckboxItem name="is_farmer_family" label="Farmer Family" icon="agriculture" />
        <CheckboxItem name="has_income_certificate" label="Income Certificate" icon="receipt_long" />
        <CheckboxItem name="has_caste_certificate" label="Caste Certificate" icon="badge" />
        <CheckboxItem name="is_orphan_single_parent" label="Orphan / Single Parent" icon="family_restroom" />
        <CheckboxItem name="is_ex_serviceman_family" label="Ex-Serviceman Family" icon="military_tech" />
      </div>
    </div>
  );

  const renderStepEducation = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="font-headline text-xl font-extrabold text-on-surface">Education Profile</h2>
        <p className="text-sm text-on-surface-variant mt-1">Crucial for scholarship matching</p>
      </div>

      {/* Education Level */}
      <div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            school
          </span>
          <select
            className={selectClass(!!errors.education_level)}
            {...register('education_level', { required: 'Education Level is required for students' })}
          >
            <option value="">Current Education Level</option>
            {EDUCATION_LEVELS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Course Name */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            menu_book
          </span>
          <input
            type="text"
            placeholder="Course / Class"
            className={inputClass(!!errors.current_course)}
            {...register('current_course', { required: 'Course is required' })}
          />
        </div>
        
        {/* Year/Semester */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            timeline
          </span>
          <input
            type="text"
            placeholder="Current Year/Sem"
            className={inputClass(false)}
            {...register('current_year')}
          />
        </div>
      </div>

      {/* Institution */}
      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            account_balance
          </span>
          <input
            type="text"
            placeholder="Institution Name"
            className={inputClass(!!errors.institution_name)}
            {...register('institution_name', { required: 'Institution is required' })}
          />
        </div>
        <select
          className={selectClass(false)}
          {...register('institution_type')}
        >
          <option value="government">Govt</option>
          <option value="private">Private</option>
          <option value="aided">Aided</option>
        </select>
      </div>

      {/* Marks & Board */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            percent
          </span>
          <input
            type="number"
            placeholder="Last Exam %"
            className={inputClass(false)}
            {...register('last_exam_percentage', { valueAsNumber: true, min: 0, max: 100 })}
          />
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            apartment
          </span>
          <input
            type="text"
            placeholder="Board / Univ"
            className={inputClass(false)}
            {...register('board_university')}
          />
        </div>
      </div>

      {/* Hosteller Toggle */}
      <CheckboxItem name="is_hosteller" label="Hosteller" subtitle="Living in a registered hostel" icon="bed" />
    </div>
  );

  const renderStepReview = () => {
    const incomeLabel = INCOME_RANGES.find((r) => r.value === formValues.annual_income)?.label || 'Not set';

    const summaryItems = [
      { icon: 'badge', label: 'Name', value: formValues.full_name || 'Not set', stepId: 'personal' },
      { icon: 'person', label: 'Gender', value: formValues.gender ? formValues.gender.charAt(0).toUpperCase() + formValues.gender.slice(1) : 'Not set', stepId: 'personal' },
      { icon: 'map', label: 'State', value: formValues.state || 'Not set', stepId: 'location' },
      { icon: 'work', label: 'Occupation', value: formValues.occupation || 'Not set', stepId: 'financial' },
      { icon: 'currency_rupee', label: 'Annual Income', value: incomeLabel, stepId: 'financial' },
      { icon: 'category', label: 'Category', value: formValues.category?.toUpperCase() || 'Not set', stepId: 'financial' },
    ];
    
    if (isStudent) {
      const eduLevel = EDUCATION_LEVELS.find(e => e.value === formValues.education_level)?.label || 'Not set';
      summaryItems.push({ icon: 'school', label: 'Education', value: eduLevel, stepId: 'education' });
      summaryItems.push({ icon: 'menu_book', label: 'Course', value: formValues.current_course || 'Not set', stepId: 'education' });
    }

    const editStep = (id: string) => {
      const idx = STEPS.findIndex(s => s.id === id);
      if (idx !== -1) {
        setDirection(-1);
        setStepIndex(idx);
      }
    };

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="font-headline text-xl font-extrabold text-on-surface">Review & Confirm</h2>
          <p className="text-sm text-on-surface-variant mt-1">Make sure everything looks correct</p>
        </div>

        <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between bg-surface-container-low rounded-xl border border-outline-variant/30 px-4 py-2"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className="material-symbols-outlined text-outline text-[18px] shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <p className="text-[11px] text-on-surface-variant">{item.label}</p>
                  <p className="text-sm font-medium text-on-surface truncate">{item.value}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => editStep(item.stepId)}
                className="text-xs font-semibold text-primary hover:text-primary-container transition-colors shrink-0 ml-2"
              >
                Edit
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {formValues.is_bpl && <span className="text-[10px] bg-tertiary-container text-on-tertiary-container px-2 py-1 rounded-md font-bold">BPL</span>}
          {formValues.has_disability && <span className="text-[10px] bg-tertiary-container text-on-tertiary-container px-2 py-1 rounded-md font-bold">PwD</span>}
          {formValues.is_minority && <span className="text-[10px] bg-tertiary-container text-on-tertiary-container px-2 py-1 rounded-md font-bold">Minority</span>}
          {formValues.has_income_certificate && <span className="text-[10px] bg-primary-container text-on-primary-container px-2 py-1 rounded-md font-bold">Income Cert.</span>}
        </div>
      </div>
    );
  };

  const currentStepData = STEPS[stepIndex];
  
  let currentRenderer = renderStepPersonal;
  if (currentStepData.id === 'location') currentRenderer = renderStepLocation;
  if (currentStepData.id === 'financial') currentRenderer = renderStepFinancial;
  if (currentStepData.id === 'education') currentRenderer = renderStepEducation;
  if (currentStepData.id === 'review') currentRenderer = renderStepReview;

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
              <div key={s.id} className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                    i < stepIndex
                      ? 'bg-primary text-white'
                      : i === stepIndex
                        ? 'bg-primary-fixed text-primary ring-2 ring-primary'
                        : 'bg-surface-container-low text-outline-variant',
                  )}
                >
                  {i < stepIndex ? (
                    <span className="material-symbols-outlined text-[20px]">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-semibold mt-1.5 uppercase tracking-wider',
                    i <= stepIndex ? 'text-primary' : 'text-outline-variant',
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
              animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* ── Card ── */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-xl shadow-primary/5 border border-outline-variant/15 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 sm:p-8 min-h-[460px] flex flex-col justify-center">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStepData.id}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full"
                >
                  {currentRenderer()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Footer ── */}
            <div className="border-t border-outline-variant/15 px-6 sm:px-8 py-4 flex items-center justify-between">
              <div>
                {stepIndex > 0 ? (
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
                {stepIndex < STEPS.length - 1 ? (
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
`

fs.writeFileSync('src/features/onboarding/OnboardingPage.tsx', code);
