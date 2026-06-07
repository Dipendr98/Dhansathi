import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';

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
  { value: '1,000+', label: 'Schemes & Scholarships' },
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
    desc: 'Our AI scans 700+ government schemes and live scholarships in seconds.',
  },
  {
    icon: 'trending_up',
    title: 'Grow your money',
    desc: 'Smart stock screener + crossover alerts keep your portfolio one step ahead.',
  },
];

const BENTO_ITEMS = [
  {
    title: 'Ask DhanSathi AI',
    desc: 'Your personal chatbot assistant for instantly discovering eligible schemes, finding scholarships, and general finance.',
    icon: 'forum',
    className: 'md:col-span-2 bg-primary text-on-primary',
    iconBg: 'bg-white/15',
    large: true,
  },
  {
    title: 'DhanMitra AI Simulator',
    desc: 'Advanced AI engine trained on live NSE data to simulate stock scenarios and analyze crossover alerts.',
    icon: 'psychology',
    className: 'md:col-span-2 bg-secondary text-on-secondary',
    iconBg: 'bg-white/15',
    large: true,
  },
  {
    title: 'Live NSE Screener',
    desc: 'Real-time stock screening with delivery percentages and technical indicators.',
    icon: 'monitoring',
    className: 'md:col-span-2 bg-surface-container-high text-on-surface',
    iconBg: 'bg-primary/10',
  },
  {
    title: 'Schemes & Scholarships',
    desc: 'Apply to eligible government schemes and track 250+ live scholarships from central and state portals.',
    icon: 'school',
    className: 'md:col-span-2 bg-tertiary-container text-on-tertiary',
    iconBg: 'bg-white/20',
  },
];

const INCLUDED_FEATURES = [
  'Unlimited scheme matching',
  'Live scholarship feed',
  'All stock filters and screeners',
  'Crossover alerts',
  'DhanMitra AI chat',
  'AI simulator',
  'Tax calculator',
  'Budget analyzer',
  'Monthly reports',
  'Priority support',
];

const NAV_LINKS = ['Features', 'Access', 'About'];

const FOOTER_PRODUCT = ['Scheme Finder', 'Live Scholarships', 'Stock Screener', 'DhanMitra AI', 'Crossover Alerts'];
const FOOTER_COMPANY = ['About', 'Blog', 'Careers', 'Press Kit'];
const FOOTER_SOCIAL = [
  { icon: 'public', label: 'Website' },
  { icon: 'share', label: 'Twitter' },
  { icon: 'groups', label: 'LinkedIn' },
];

/* ── Component ─────────────────────────────────── */

export default function LandingPage() {
  const { user } = useAuthStore();

  return (
    <div className="bg-background min-h-screen font-sans antialiased text-on-surface selection:bg-primary/20 selection:text-primary">
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
            {user ? (
              <Link
                to="/dashboard"
                className="text-sm font-bold text-on-primary bg-gradient-to-r from-primary to-primary-container px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all no-underline"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Mobile menu button */}
          {user ? (
            <Link
              to="/dashboard"
              className="md:hidden text-sm font-bold text-on-primary bg-primary px-4 py-2 rounded-xl no-underline"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="md:hidden text-sm font-bold text-on-primary bg-primary px-4 py-2 rounded-xl no-underline"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 px-4 overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
        <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: '10s' }} />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-tertiary/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: '12s' }} />

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
              <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-secondary to-tertiary animate-pulse shadow-sm">
                ₹2,00,000 Crore
              </span>{' '}
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
              Discover unclaimed benefits, track live scholarships, and screen NSE stocks. 
              Powered by our Dual-AI: <strong className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container font-extrabold animate-pulse">Ask DhanSathi</strong> for personal finance and <strong className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-secondary-container font-extrabold animate-pulse delay-75">DhanMitra</strong> for stock simulations.
            </motion.p>

            <motion.div variants={fadeUp} custom={4} className="mt-10">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-lg px-8 py-4 rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] transition-all no-underline"
                >
                  <span className="material-symbols-outlined">dashboard</span>
                  <span>Open Dashboard</span>
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-lg px-8 py-4 rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] transition-all no-underline"
                >
                  <span className="material-symbols-outlined">search</span>
                  <span>Check My Benefits — Free</span>
                </Link>
              )}
            </motion.div>

            {/* Glassmorphic Product Preview */}
            <motion.div variants={fadeUp} custom={5} className="mt-16 md:mt-24 relative max-w-5xl mx-auto hidden sm:block">
               {/* Glow effect at the bottom */}
               <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
               <div className="relative rounded-[2rem] border border-outline-variant/30 bg-white/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden p-2">
                 <div className="rounded-[1.5rem] bg-surface-container-lowest/80 border border-outline-variant/20 overflow-hidden relative shadow-inner">
                   {/* Mock UI Header */}
                   <div className="h-12 border-b border-outline-variant/10 flex items-center px-4 bg-surface-container-lowest/50 backdrop-blur-md">
                     <div className="flex space-x-2">
                       <div className="w-3 h-3 rounded-full bg-error/80" />
                       <div className="w-3 h-3 rounded-full bg-saffron/80" />
                       <div className="w-3 h-3 rounded-full bg-india-green/80" />
                     </div>
                   </div>
                   {/* Mock UI Content */}
                   <div className="grid md:grid-cols-3 gap-0 h-[400px]">
                      {/* Sidebar */}
                      <div className="border-r border-outline-variant/10 p-6 bg-surface-container-low/30">
                        <div className="space-y-4">
                          <div className="h-8 bg-surface-container-high/50 rounded-lg w-full animate-pulse" />
                          <div className="h-4 bg-surface-container/50 rounded w-3/4 animate-pulse" />
                          <div className="h-4 bg-surface-container/50 rounded w-1/2 animate-pulse" />
                          <div className="h-4 bg-surface-container/50 rounded w-5/6 animate-pulse" />
                          <div className="mt-8 h-32 bg-primary/5 rounded-xl border border-primary/10" />
                        </div>
                      </div>
                      {/* Main Dashboard */}
                      <div className="md:col-span-2 p-6 md:p-8 bg-surface-container-lowest/60 relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
                        
                        {/* Floating Cards */}
                        <motion.div 
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: [0, -10, 0], opacity: 1 }}
                          transition={{ 
                            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                            opacity: { duration: 0.8, delay: 0.8 }
                          }}
                          className="absolute top-10 left-10 w-72 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-tertiary/20 p-5 transform -rotate-2 hover:rotate-0 transition-transform"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-tertiary text-2xl">school</span>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-tertiary uppercase tracking-wider">Perfect Match</p>
                              <p className="font-headline font-bold text-on-surface text-lg">₹50,000 Scholarship</p>
                            </div>
                          </div>
                          <p className="text-xs text-on-surface-variant font-medium">Post Matric Scholarship Scheme • Apply in 5 days</p>
                        </motion.div>

                        <motion.div 
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: [0, -10, 0], opacity: 1 }}
                          transition={{ 
                            y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                            opacity: { duration: 0.8, delay: 1.2 }
                          }}
                          className="absolute top-44 right-10 w-72 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-secondary/20 p-5 transform rotate-2 hover:rotate-0 transition-transform"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-secondary text-2xl">trending_up</span>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Stock Alert</p>
                              <p className="font-headline font-bold text-on-surface text-lg">RELIANCE</p>
                            </div>
                          </div>
                          <p className="text-xs text-on-surface-variant font-medium">Golden Crossover Detected (SMA 50 &gt; 200)</p>
                        </motion.div>

                      </div>
                   </div>
                 </div>
               </div>
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
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-fixed to-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-primary/10">
                  <span className="material-symbols-outlined text-primary text-[32px]">
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
            className="grid md:grid-cols-4 gap-5"
          >
            {BENTO_ITEMS.map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                custom={i}
                className={`rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl ${item.className} ${item.large ? 'shadow-primary/20 ring-1 ring-white/20' : ''}`}
              >
                {/* Decorative subtle background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                {/* Glow for AI cards */}
                {item.large && (
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/20 blur-3xl rounded-full group-hover:bg-white/30 transition-colors pointer-events-none" />
                )}
                
                <div className="relative z-10">
                  <div
                    className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                  >
                    <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
                  </div>
                  <h3 className={`font-headline font-bold mb-3 ${item.large ? 'text-3xl' : 'text-xl'}`}>
                    {item.title}
                  </h3>
                </div>
                <p className={`relative z-10 text-sm leading-relaxed ${item.large ? 'opacity-90 max-w-sm text-base' : 'opacity-80'}`}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Included Access ── */}
      <section id="access" className="py-20 md:py-28 px-4">
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
              Access
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mt-3"
            >
              Everything Included
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-4 text-on-surface-variant max-w-xl mx-auto"
            >
              DhanSathi's financial tools are free for every user.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-6 md:p-8 max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp} custom={0} className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-outline-variant/20 pb-6 mb-6">
              <div>
                <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Full Access</p>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="font-mono text-4xl font-extrabold text-on-surface">Free</span>
                  <span className="text-on-surface-variant text-sm">for everyone</span>
                </div>
              </div>
              <Link
                to="/signup"
                className="inline-flex justify-center font-bold text-sm py-3 px-6 rounded-xl transition-all no-underline bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </motion.div>
            <div className="grid sm:grid-cols-2 gap-4">
              {INCLUDED_FEATURES.map((feature, i) => (
                <motion.div key={feature} variants={fadeUp} custom={i + 1} className="flex items-start space-x-3">
                  <span className="material-symbols-outlined text-tertiary text-lg mt-0.5">check_circle</span>
                  <span className="text-sm text-on-surface-variant">{feature}</span>
                </motion.div>
              ))}
            </div>
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
          { icon: 'verified', label: 'Access', href: '#access' },
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
