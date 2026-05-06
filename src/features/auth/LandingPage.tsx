import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPlanConfigs } from '@/stores/subscriptionStore';

/* ── Animation helpers ─────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ── Data ──────────────────────────────────────── */

const TRUST_STATS = [
  { value: '10,000+', label: 'Users' },
  { value: '700+', label: 'Schemes' },
  { value: '1,800+', label: 'Stocks' },
  { value: '₹12 Cr+', label: 'Found' },
];

const HOW_STEPS = [
  {
    icon: 'person_search',
    title: 'Tell us about you',
    desc: 'Share your age, income, and state. We match you to every eligible scheme.',
  },
  {
    icon: 'search_insights',
    title: 'Discover what you\'re owed',
    desc: 'Our AI scans 700+ government schemes and unclaimed benefits in seconds.',
  },
  {
    icon: 'trending_up',
    title: 'Grow your money',
    desc: 'Smart stock screener + crossover alerts keep your portfolio one step ahead.',
  },
];

const BENTO_ITEMS = [
  {
    title: 'DhanMitra AI',
    desc: 'Personal AI financial advisor trained on Indian markets, tax rules, and government schemes.',
    icon: 'psychology',
    className: 'md:col-span-2 md:row-span-2 bg-primary text-on-primary',
    iconBg: 'bg-white/15',
    large: true,
  },
  {
    title: 'NSE Screener',
    desc: 'Real-time stock screening with crossover alerts and technical indicators.',
    icon: 'monitoring',
    className: 'bg-secondary-container text-on-secondary',
    iconBg: 'bg-white/20',
  },
  {
    title: 'Government Trust',
    desc: 'Track unclaimed deposits, insurance, dividends, and refunds across India.',
    icon: 'verified_user',
    className: 'bg-surface-container-high text-on-surface',
    iconBg: 'bg-primary/10',
  },
  {
    title: 'Scheme Direct',
    desc: 'Apply directly to eligible government schemes with pre-filled applications.',
    icon: 'assignment_turned_in',
    className: 'md:col-span-2 bg-tertiary-container text-on-tertiary',
    iconBg: 'bg-white/20',
  },
];

interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

function getDynamicPricing(): PricingTier[] {
  try {
    const configs = getPlanConfigs();
    return configs.map((c: any) => ({
      name: c.name,
      price: c.monthlyPrice === 0 ? '₹0' : `₹${c.monthlyPrice}`,
      period: c.monthlyPrice === 0 ? 'forever' : '/mo',
      features: c.displayFeatures
        .filter((f: any) => f.enabled)
        .slice(0, 5)
        .map((f: any) => f.text),
      cta: c.id === 'free' ? 'Get Started' : c.id === 'pro' ? 'Start Free Trial' : 'Contact Sales',
      popular: c.id === 'pro',
    }));
  } catch {
    return FALLBACK_PRICING;
  }
}

const FALLBACK_PRICING: PricingTier[] = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    features: [
      'Basic scheme eligibility',
      '5 stock screener searches/day',
      'Community support',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: '₹199',
    period: '/mo',
    popular: true,
    features: [
      'Unlimited scheme matching',
      'Unlimited stock screener',
      'Crossover alerts',
      'DhanMitra AI chat',
      'Priority support',
    ],
    cta: 'Start Free Trial',
  },
];

const PRICING: PricingTier[] = getDynamicPricing();

const NAV_LINKS = ['Features', 'Pricing', 'About'];

const FOOTER_PRODUCT = ['Scheme Finder', 'Stock Screener', 'DhanMitra AI', 'Crossover Alerts'];
const FOOTER_COMPANY = ['About', 'Blog', 'Careers', 'Press Kit'];
const FOOTER_SOCIAL = [
  { icon: 'public', label: 'Website' },
  { icon: 'share', label: 'Twitter' },
  { icon: 'groups', label: 'LinkedIn' },
];

/* ── Component ─────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen font-body antialiased relative">
      {/* ── Tricolor bar ── */}
      <div className="fixed top-0 left-0 w-full h-1 flex z-[60]">
        <div className="h-full flex-1 bg-saffron" />
        <div className="h-full flex-1 bg-white" />
        <div className="h-full flex-1 bg-india-green" />
      </div>

      {/* ── Navbar ── */}
      <header className="fixed top-1 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center space-x-2.5 no-underline">
            <div className="w-9 h-9 bg-gradient-to-br from-saffron via-white to-india-green rounded-xl flex items-center justify-center shadow-md">
              <span className="text-primary font-black text-lg leading-none">D</span>
            </div>
            <span className="font-headline font-bold text-xl text-primary tracking-tight">
              DhanSathi
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors no-underline"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-primary hover:text-primary-container transition-colors no-underline"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-sm font-bold text-on-primary bg-gradient-to-r from-primary to-primary-container px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all no-underline"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Mobile menu button */}
          <Link
            to="/login"
            className="md:hidden text-sm font-bold text-on-primary bg-primary px-4 py-2 rounded-xl no-underline"
          >
            Login
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 px-4 overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center space-x-2 bg-primary-fixed/60 text-primary text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-wide uppercase"
            >
              <span className="material-symbols-outlined text-base">verified</span>
              <span>India's Financial Intelligence Platform</span>
            </motion.p>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-headline text-4xl sm:text-5xl md:text-6xl font-extrabold text-on-surface leading-[1.1] tracking-tight"
            >
              Indians Leave{' '}
              <span className="font-mono text-secondary">₹2,00,000 Crore</span>{' '}
              Unclaimed Every Year.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 text-2xl sm:text-3xl md:text-4xl font-bold text-tertiary"
            >
              How Much Is Yours?
            </motion.p>

            <motion.p
              variants={fadeUp}
              custom={3}
              className="mt-6 text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed"
            >
              DhanSathi finds your unclaimed government benefits, screens NSE stocks,
              and gives you an AI-powered financial advisor — all in one place.
            </motion.p>

            <motion.div variants={fadeUp} custom={4} className="mt-10">
              <Link
                to="/signup"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-lg px-8 py-4 rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] transition-all no-underline"
              >
                <span className="material-symbols-outlined">search</span>
                <span>Check My Benefits — Free</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="py-12 border-y border-outline-variant/20 bg-surface-container-low/50">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={stagger}
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4 text-center"
        >
          {TRUST_STATS.map((stat, i) => (
            <motion.div key={stat.label} variants={fadeUp} custom={i}>
              <p className="font-mono text-3xl md:text-4xl font-extrabold text-primary">
                {stat.value}
              </p>
              <p className="text-sm text-on-surface-variant font-medium mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── How it works ── */}
      <section id="features" className="py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-sm font-bold text-secondary uppercase tracking-widest"
            >
              How It Works
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mt-3"
            >
              Precision Wealth Intelligence
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {HOW_STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                custom={i}
                className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20 hover:shadow-xl hover:shadow-primary/5 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-[28px]">
                    {step.icon}
                  </span>
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-3">
                  {step.title}
                </h3>
                <p className="text-on-surface-variant leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Bento feature grid ── */}
      <section className="py-20 md:py-28 px-4 bg-surface-container-low/40">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-sm font-bold text-tertiary uppercase tracking-widest"
            >
              Platform
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mt-3"
            >
              Everything You Need
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid md:grid-cols-4 gap-5 auto-rows-[200px]"
          >
            {BENTO_ITEMS.map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                custom={i}
                className={`rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group hover:scale-[1.01] transition-transform ${item.className}`}
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center mb-4`}
                  >
                    <span className="material-symbols-outlined text-[26px]">{item.icon}</span>
                  </div>
                  <h3 className={`font-headline font-bold mb-2 ${item.large ? 'text-2xl' : 'text-lg'}`}>
                    {item.title}
                  </h3>
                </div>
                <p className={`text-sm leading-relaxed ${item.large ? 'opacity-80 max-w-sm' : 'opacity-80'}`}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-sm font-bold text-primary uppercase tracking-widest"
            >
              Pricing
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mt-3"
            >
              Transparent Pricing
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-4 text-on-surface-variant max-w-xl mx-auto"
            >
              Start free. Upgrade when you're ready.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto"
          >
            {PRICING.map((tier, i) => (
              <motion.div
                key={tier.name}
                variants={fadeUp}
                custom={i}
                className={`relative rounded-3xl p-8 border transition-all hover:shadow-xl ${tier.popular
                  ? 'bg-surface-container-lowest border-primary/30 shadow-lg shadow-primary/10 scale-[1.03]'
                  : 'bg-surface-container-lowest border-outline-variant/20'
                  }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary-container text-on-primary text-xs font-bold px-4 py-1.5 rounded-full">
                    Most Popular
                  </div>
                )}
                <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">
                  {tier.name}
                </p>
                <div className="mt-4 flex items-baseline space-x-1">
                  <span className="font-mono text-4xl font-extrabold text-on-surface">
                    {tier.price}
                  </span>
                  <span className="text-on-surface-variant text-sm">{tier.period}</span>
                </div>
                <ul className="mt-8 space-y-4">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start space-x-3">
                      <span className="material-symbols-outlined text-tertiary text-lg mt-0.5">
                        check_circle
                      </span>
                      <span className="text-sm text-on-surface-variant">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`mt-8 block text-center font-bold text-sm py-3 rounded-xl transition-all no-underline ${tier.popular
                    ? 'bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-md hover:shadow-lg'
                    : 'bg-surface-container-high text-primary hover:bg-surface-container-highest'
                    }`}
                >
                  {tier.cta}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="about" className="bg-on-surface text-white">
        {/* Tricolor bar */}
        <div className="h-1 flex">
          <div className="h-full flex-1 bg-saffron" />
          <div className="h-full flex-1 bg-white" />
          <div className="h-full flex-1 bg-india-green" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-saffron via-white to-india-green rounded-xl flex items-center justify-center">
                  <span className="text-primary font-black text-lg leading-none">D</span>
                </div>
                <span className="font-headline font-bold text-xl tracking-tight">DhanSathi</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                India's financial intelligence platform. Find unclaimed benefits, screen stocks,
                and grow your wealth.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">
                Product
              </p>
              <ul className="space-y-3">
                {FOOTER_PRODUCT.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-white/70 hover:text-white transition-colors no-underline"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">
                Company
              </p>
              <ul className="space-y-3">
                {FOOTER_COMPANY.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-white/70 hover:text-white transition-colors no-underline"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">
                Connect
              </p>
              <div className="flex space-x-3">
                {FOOTER_SOCIAL.map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors no-underline"
                  >
                    <span className="material-symbols-outlined text-lg">{s.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-xs text-white/40">
              &copy; 2024 Digital Sovereign Financial Services. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-xs text-white/40 hover:text-white/70 transition-colors no-underline">
                Privacy Policy
              </a>
              <a href="#" className="text-xs text-white/40 hover:text-white/70 transition-colors no-underline">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-safe pt-2 bg-white/90 backdrop-blur-2xl z-50 rounded-t-2xl border-t border-outline-variant/20 shadow-[0_-10px_40px_rgba(0,97,148,0.08)]">
        {[
          { icon: 'home', label: 'Home', href: '#' },
          { icon: 'auto_awesome', label: 'Features', href: '#features' },
          { icon: 'payments', label: 'Pricing', href: '#pricing' },
          { icon: 'login', label: 'Login', to: '/login' },
        ].map((item) =>
          item.to ? (
            <Link
              key={item.label}
              to={item.to}
              className="flex flex-col items-center justify-center px-3 py-2 rounded-2xl text-primary no-underline"
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-[10px] font-bold mt-0.5">{item.label}</span>
            </Link>
          ) : (
            <a
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center px-3 py-2 rounded-2xl text-outline hover:text-primary transition-colors no-underline"
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-[10px] font-bold mt-0.5">{item.label}</span>
            </a>
          ),
        )}
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-16" />
    </div>
  );
}
