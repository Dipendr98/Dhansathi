import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SECTIONS = [
  { id: 'introduction', label: 'Introduction', icon: 'auto_stories' },
  { id: 'getting-started', label: 'Getting Started', icon: 'rocket_launch' },
  { id: 'scheme-finder', label: 'Scheme Finder', icon: 'account_balance' },
  { id: 'scholarships', label: 'Live Scholarships', icon: 'school' },
  { id: 'stock-screener', label: 'Stock Screener', icon: 'monitoring' },
  { id: 'crossover-engine', label: 'Crossover Engine', icon: 'ssid_chart' },
  { id: 'dhanmitra-ai', label: 'DhanMitra AI', icon: 'smart_toy' },
  { id: 'ai-simulator', label: 'AI Simulator', icon: 'model_training' },
  { id: 'pro-tools', label: 'Pro Tools', icon: 'home_repair_service' },
];

export default function DocsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('introduction');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition && element.offsetTop + element.offsetHeight > scrollPosition) {
          setActiveSection(section.id);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white selection:bg-primary/20 selection:text-primary">
      {/* Tricolor bar */}
      <div className="fixed top-0 left-0 w-full h-1 flex z-[60]">
        <div className="h-full flex-1 bg-saffron" />
        <div className="h-full flex-1 bg-white" />
        <div className="h-full flex-1 bg-india-green" />
      </div>

      {/* Header */}
      <header className="fixed top-1 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/')} className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-bold text-sm">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Home
            </button>
            <div className="h-6 w-px bg-outline-variant/30" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-saffron via-white to-india-green rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-sky-900 font-black text-sm">D</span>
              </div>
              <span className="font-headline font-bold text-lg text-primary">DhanSathi Docs</span>
            </div>
          </div>
          <a href="/login" className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all">
            Dashboard
          </a>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 flex flex-col md:flex-row gap-8 items-start">
        
        {/* Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 pl-3">Table of Contents</h3>
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${
                  activeSection === s.id ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${activeSection === s.id ? 'text-primary' : 'text-on-surface-variant/50'}`}>
                  {s.icon}
                </span>
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 max-w-3xl space-y-16">
          
          <motion.section id="introduction" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="scroll-mt-24">
            <h1 className="text-4xl font-headline font-black text-primary mb-4 tracking-tight">DhanSathi User Guide</h1>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              Welcome to DhanSathi — India's Sovereign Financial Intelligence Platform. This documentation covers everything you need to know to harness the full power of our platform, from discovering government schemes to running AI-driven market simulations.
            </p>
          </motion.section>

          <section id="getting-started" className="scroll-mt-24 border-t border-outline-variant/20 pt-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-3xl text-saffron">rocket_launch</span>
              <h2 className="text-3xl font-headline font-bold text-on-surface">Getting Started</h2>
            </div>
            <div className="prose prose-slate max-w-none text-on-surface-variant">
              <h3>1. Creating an Account</h3>
              <p>Sign up securely using your Google account or email. Upon initial login, you will go through a quick onboarding wizard.</p>
              <h3>2. Setting up your Profile</h3>
              <p>DhanSathi's intelligence is personalized. We strongly recommend filling out your profile settings (Age, Income, Category, State) to allow the Scheme Finder to accurately recommend government subsidies specifically tailored for you.</p>
              <h3>3. Navigating the Dashboard</h3>
              <p>Your dashboard provides a high-level summary. The left sidebar contains all tools categorized by: <strong>Intelligence</strong> (Schemes, Stocks), <strong>Pro Tools</strong> (Tax, Budget, Reports), and <strong>AI Services</strong> (DhanMitra, Simulator).</p>
            </div>
          </section>

          <section id="scheme-finder" className="scroll-mt-24 border-t border-outline-variant/20 pt-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-3xl text-india-green">account_balance</span>
              <h2 className="text-3xl font-headline font-bold text-on-surface">Scheme Finder</h2>
            </div>
            <div className="prose prose-slate max-w-none text-on-surface-variant">
              <p>The Scheme Finder aggregates hundreds of Central and State government schemes.</p>
              <ul>
                <li><strong>Eligibility Engine:</strong> Click "Find My Eligibility" to filter schemes based on your profile data.</li>
                <li><strong>Categories:</strong> Filter by Farmers, Students, MSME, Women, Healthcare, etc.</li>
                <li><strong>Applying:</strong> Click "View Details" to read scheme benefits and click the "Apply Now" button to be redirected to the official government portal.</li>
              </ul>
            </div>
          </section>

          <section id="scholarships" className="scroll-mt-24 border-t border-outline-variant/20 pt-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-3xl text-blue-500">school</span>
              <h2 className="text-3xl font-headline font-bold text-on-surface">Live Scholarships</h2>
            </div>
            <div className="prose prose-slate max-w-none text-on-surface-variant">
              <p>Track live scholarships scraped from the National Scholarship Portal (NSP) and state boards.</p>
              <ul>
                <li><strong>Urgency Flags:</strong> Scholarships closing soon are highlighted in <span className="text-red-500 font-bold">Red</span>.</li>
                <li><strong>Eligibility Check:</strong> The system automatically tags scholarships you are eligible for based on your profile's Caste/Category and Education Level.</li>
                <li><strong>Daily Updates:</strong> Our automated GitHub Actions scraper updates the feed every night at 12:00 AM IST.</li>
              </ul>
            </div>
          </section>

          <section id="stock-screener" className="scroll-mt-24 border-t border-outline-variant/20 pt-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-3xl text-purple-500">monitoring</span>
              <h2 className="text-3xl font-headline font-bold text-on-surface">Stock Screener</h2>
            </div>
            <div className="prose prose-slate max-w-none text-on-surface-variant">
              <p>A powerful real-time stock screener tracking NIFTY 50 and BSE companies.</p>
              <ul>
                <li><strong>Filtering:</strong> Use the sliders to filter by Market Cap, P/E Ratio, and Dividend Yield.</li>
                <li><strong>Screener Rules:</strong> Apply predefined rules like "Undervalued Growth" or "High Dividend" to instantly find matching stocks.</li>
                <li><strong>Stock Detail Page:</strong> Click on any stock to view its interactive TradingView chart, RSI, MACD, and historical prices.</li>
                <li><strong>Watchlist:</strong> Click the "Star" icon to save a stock to your personal watchlist for quick access.</li>
              </ul>
            </div>
          </section>

          <section id="crossover-engine" className="scroll-mt-24 border-t border-outline-variant/20 pt-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-3xl text-amber-500">ssid_chart</span>
              <h2 className="text-3xl font-headline font-bold text-on-surface">Crossover Engine</h2>
            </div>
            <div className="prose prose-slate max-w-none text-on-surface-variant">
              <p>Plan your path to financial independence using the SIP crossover calculator.</p>
              <ul>
                <li><strong>SIP Target:</strong> Enter your monthly investment amount, expected return rate, and target corpus.</li>
                <li><strong>Crossover Year:</strong> The engine calculates the exact year when your passive investment returns "cross over" and exceed your active job income.</li>
                <li><strong>Visual Charts:</strong> View a beautifully rendered area chart showing the growth of your invested amount vs. total returns over time.</li>
              </ul>
            </div>
          </section>

          <section id="dhanmitra-ai" className="scroll-mt-24 border-t border-outline-variant/20 pt-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-3xl text-sky-500">smart_toy</span>
              <h2 className="text-3xl font-headline font-bold text-on-surface">DhanMitra AI</h2>
            </div>
            <div className="prose prose-slate max-w-none text-on-surface-variant">
              <p>Your personal financial advisor, powered by Google's Gemini AI.</p>
              <ul>
                <li><strong>Ask Anything:</strong> Ask about tax laws, investment strategies, or specific stock fundamentals.</li>
                <li><strong>Context-Aware:</strong> DhanMitra knows your profile! If you ask "Which schemes apply to me?", it will read your saved profile data and give accurate advice.</li>
                <li><strong>Quick Prompts:</strong> Use the suggested prompt pills to quickly analyze your portfolio or get tax-saving tips.</li>
              </ul>
            </div>
          </section>

          <section id="ai-simulator" className="scroll-mt-24 border-t border-outline-variant/20 pt-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-3xl text-pink-500">model_training</span>
              <h2 className="text-3xl font-headline font-bold text-on-surface">AI Simulator</h2>
            </div>
            <div className="prose prose-slate max-w-none text-on-surface-variant">
              <p>Test your portfolio against hypothetical market scenarios.</p>
              <ul>
                <li><strong>Select a Scenario:</strong> Choose from events like "Global Tech Crash", "India Infrastructure Boom", or "High Inflation Era".</li>
                <li><strong>Input Holdings:</strong> Enter the stocks or sectors you hold.</li>
                <li><strong>Run Simulation:</strong> The multi-agent AI system simulates the event and outputs a detailed report showing the potential positive or negative impact on your specific holdings, along with actionable advice.</li>
              </ul>
            </div>
          </section>

          <section id="pro-tools" className="scroll-mt-24 border-t border-outline-variant/20 pt-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-3xl text-emerald-600">home_repair_service</span>
              <h2 className="text-3xl font-headline font-bold text-on-surface">Pro Tools</h2>
            </div>
            <div className="prose prose-slate max-w-none text-on-surface-variant space-y-8">
              <div>
                <h3 className="text-xl font-bold text-primary border-b border-outline-variant/20 pb-2 mb-3">Tax Calculator</h3>
                <p>A comprehensive Indian Income Tax calculator supporting AY 2026-27 (FY 2025-26).</p>
                <ul>
                  <li><strong>Multiple Income Sources:</strong> Calculate taxes on Salary, Business Income, Capital Gains (STCG/LTCG), Crypto, and Rental Income.</li>
                  <li><strong>Old vs New Regime:</strong> Instantly compares your tax liability under both regimes and recommends the cheaper option.</li>
                  <li><strong>Advance Tax:</strong> Calculates your quarter-wise advance tax liability based on your estimated income.</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-primary border-b border-outline-variant/20 pb-2 mb-3">Budget Analyzer</h3>
                <p>Analyze your monthly spending using the 50/30/20 rule.</p>
                <ul>
                  <li><strong>Custom Rules:</strong> Select between Standard, High-Cost City (60/20/20), or Aggressive Saver (40/20/40) rules.</li>
                  <li><strong>Health Insights:</strong> The app categorizes your spending and warns you if your Needs or Wants are exceeding recommended limits.</li>
                  <li><strong>Visual Breakdown:</strong> Generates beautiful Recharts bar and pie charts of your spending habits.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-primary border-b border-outline-variant/20 pb-2 mb-3">Monthly Reports</h3>
                <p>A professional-grade Net Worth and cash flow tracker.</p>
                <ul>
                  <li><strong>Profile-Aware Entry:</strong> Form fields adapt based on whether you are Salaried, a Business Owner, or a Student.</li>
                  <li><strong>Emergency Fund Tracking:</strong> Calculates exactly how many months of essential expenses your emergency fund can cover.</li>
                  <li><strong>Trend Analysis:</strong> View 12-month historical line charts of your Net Worth and Income vs. Expenses.</li>
                  <li><strong>PDF Export:</strong> Click the "Export PDF" button to download a pristine A4-sized financial report for any given month.</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="mt-16 pt-8 border-t border-outline-variant/20 text-center pb-12">
            <h3 className="text-xl font-bold text-primary mb-4">Ready to take control of your finances?</h3>
            <a href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 hover:-translate-y-1 transition-all">
              Launch Dashboard
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </a>
          </div>

        </main>
      </div>
    </div>
  );
}
