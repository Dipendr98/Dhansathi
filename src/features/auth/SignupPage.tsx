import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
/* ── Types ─────────────────────────────────────── */

interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
}

/* ── Animation ─────────────────────────────────── */

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ── Component ─────────────────────────────────── */

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>();

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signUp(data.email, data.password, data.fullName);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[420px]"
    >
      <div className="bg-surface-container-lowest rounded-3xl shadow-xl shadow-primary/5 border border-outline-variant/15 overflow-hidden">
        {/* Tricolor bar */}
        <div className="h-1 flex">
          <div className="h-full flex-1 bg-saffron" />
          <div className="h-full flex-1 bg-white" />
          <div className="h-full flex-1 bg-india-green" />
        </div>

        <div className="p-8 sm:p-10">
          {/* Brand */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2.5 no-underline mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-saffron via-white to-india-green rounded-xl flex items-center justify-center shadow-md">
                <span className="text-primary font-black text-xl leading-none">D</span>
              </div>
              <span className="font-headline font-bold text-2xl text-primary tracking-tight">
                DhanSathi
              </span>
            </Link>
            <h1 className="font-headline text-2xl font-extrabold text-on-surface">
              Create your account
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Start discovering your unclaimed benefits
            </p>
          </div>

          {/* Google sign up */}
          <button
            type="button"
            className="w-full flex items-center justify-center space-x-3 bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 rounded-xl py-3 px-4 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-semibold text-on-surface">Sign up with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center space-x-4 my-6">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="text-xs font-semibold text-outline uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  person
                </span>
                <input
                  type="text"
                  placeholder="Full name"
                  autoComplete="name"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-surface-container-low border text-sm text-on-surface placeholder:text-outline-variant outline-none transition-colors ${
                    errors.fullName
                      ? 'border-error focus:border-error'
                      : 'border-outline-variant/30 focus:border-primary'
                  }`}
                  {...register('fullName', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-error mt-1.5 pl-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  mail
                </span>
                <input
                  type="email"
                  placeholder="Email address"
                  autoComplete="email"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-surface-container-low border text-sm text-on-surface placeholder:text-outline-variant outline-none transition-colors ${
                    errors.email
                      ? 'border-error focus:border-error'
                      : 'border-outline-variant/30 focus:border-primary'
                  }`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-error mt-1.5 pl-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  lock
                </span>
                <input
                  type="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-surface-container-low border text-sm text-on-surface placeholder:text-outline-variant outline-none transition-colors ${
                    errors.password
                      ? 'border-error focus:border-error'
                      : 'border-outline-variant/30 focus:border-primary'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-error mt-1.5 pl-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm py-3.5 rounded-xl shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center space-x-2">
                  <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  <span>Creating account...</span>
                </span>
              ) : (
                'Create Account — Free'
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="text-center text-xs text-outline mt-6 leading-relaxed">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-primary font-semibold hover:text-primary-container transition-colors no-underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary font-semibold hover:text-primary-container transition-colors no-underline">
              Privacy Policy
            </a>
          </p>

          {/* Sign in link */}
          <p className="text-center text-sm text-on-surface-variant mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-primary hover:text-primary-container transition-colors no-underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
