<div align="center">
  <img src="https://via.placeholder.com/150/f97316/ffffff?text=D" alt="DhanSathi Logo" width="80" height="80" />
  <h1>DhanSathi - India's Sovereign Financial Intelligence Platform</h1>
  <p><strong>Government Schemes • Scholarships • Stock Screener • AI Advisory • Pro Tools</strong></p>
</div>

---

## 🌟 What is DhanSathi?

DhanSathi is an open-source, full-stack financial benefits and intelligence platform designed specifically for the Indian ecosystem. It bridges the gap between Indian citizens and financial opportunities by aggregating government schemes, state scholarships, and stock market intelligence into a single, AI-driven dashboard.

With our proprietary Eligibility Engine and **DhanMitra AI** (powered by Google Gemini), DhanSathi acts as a personalized financial companion for every citizen — whether you are a student looking for a scholarship, a farmer applying for state subsidies, or an investor tracking NIFTY 50 crossovers.

### ⚠️ Disclaimer
**NOT SEBI REGISTERED.** DhanSathi is for educational and informational purposes only. We are not registered investment advisors. Do not make financial decisions based solely on our AI simulations or stock screeners. Always consult a SEBI-registered advisor before investing.

---

## ✨ Features

- 🏛️ **Scheme & Subsidy Finder**: A strict eligibility engine matching users with 100+ Central and State government schemes based on their demographic and financial profile.
- 🎓 **Live Scholarships**: Automated scraper pulling live scholarships from NSP and state boards with deadline urgency tracking.
- 📈 **Stock Screener**: Real-time NIFTY/BSE screener with RSI, MACD, Volume analysis, and TradingView charts.
- 🤖 **DhanMitra AI & Simulator**: Context-aware AI advisory using Google Gemini. Run hypothetical "Market Crash" or "Bull Run" scenarios against your portfolio.
- 💼 **Pro Tools**: 
  - **Tax Calculator**: Old vs. New regime comparisons (AY 2026-27).
  - **Budget Analyzer**: 50/30/20 rule tracking with health insights.
  - **Crossover Engine**: Calculate exact years until passive SIP income exceeds active income.
  - **Monthly Reports**: Professional Net Worth tracking with PDF export.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **State Management**: Zustand, React Query
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Edge Functions)
- **AI Engine**: Google Gemini Pro / NVIDIA Nemotron 70B (via API)
- **Data Pipelines**: GitHub Actions (Daily Scholarship Scrapers)
- **Charting**: Recharts, TradingView Lightweight Charts

---

## 🚀 Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Dipendr98/Dhansathi.git
   cd Dhansathi
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add your keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_DEV_NVIDIA_KEY=your_nvidia_api_key_optional
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🗄️ Database Setup (Supabase)

The project relies on a PostgreSQL database hosted on Supabase. Execute the SQL migrations located in the `supabase/migrations/` folder in your Supabase SQL Editor to set up:
- `profiles` (User demographic data)
- `government_schemes` (Scheme data)
- `scholarships_feed` (Scraped scholarship data)
- `user_alerts` & `simulations`

Row Level Security (RLS) is strictly enforced on the `profiles` table.

---

## 🗺️ Roadmap

- [x] Integrate Gemini AI for DhanMitra
- [x] Build 50/30/20 Budget Analyzer & Tax Calculator
- [x] Set up Supabase Authentication & RLS
- [x] **Structured Scholarship Matching**
- [x] **Document Readiness Score & Application Tracker**
- [x] **State-wise SEO pages for organic traffic**
- [x] **Admin Verification Workflows for Scheme Data**

---

## 📄 License & Legal

This project is licensed under the MIT License.
Please review our [Privacy Policy](/privacy) and [Terms of Service](/terms) for information regarding data collection (compliant with DPDPA 2023) and our API usage guidelines.
