import { motion } from 'framer-motion';
import { useTaxStore } from '@/stores/taxStore';
import ProfileSection from './tax-calculator/ProfileSection';
import SalarySection from './tax-calculator/SalarySection';
import HousePropertySection from './tax-calculator/HousePropertySection';
import BusinessSection from './tax-calculator/BusinessSection';
import CapitalGainsSection from './tax-calculator/CapitalGainsSection';
import CryptoSection from './tax-calculator/CryptoSection';
import StockTraderSection from './tax-calculator/StockTraderSection';
import OtherIncomeSection from './tax-calculator/OtherIncomeSection';
import AdvanceTaxSection from './tax-calculator/AdvanceTaxSection';
import DeductionSection from './tax-calculator/DeductionSection';
import TaxSummary from './tax-calculator/TaxSummary';
import SuggestionsAndWarnings from './tax-calculator/SuggestionsAndWarnings';

export default function TaxCalculator() {
  const profile = useTaxStore((s) => s.profile);
  const reset = useTaxStore((s) => s.reset);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-on-primary text-2xl">calculate</span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">Advanced Tax Engine</h1>
            <p className="text-sm font-medium text-on-surface-variant uppercase tracking-wider mt-1">
              {profile.assessmentYear} • DhanSathi Intelligence
            </p>
          </div>
        </div>
        <button 
          onClick={reset}
          className="self-start sm:self-auto text-sm font-bold text-error bg-error/10 hover:bg-error/20 px-4 py-2 rounded-xl transition-colors"
        >
          Reset Calculator
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Data Entry */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <ProfileSection />
          
          <SalarySection />
          <HousePropertySection />
          <BusinessSection />
          <StockTraderSection />
          
          {profile.userType !== 'Salaried' && profile.userType !== 'Business' && profile.userType !== 'Freelancer' && profile.userType !== 'Trader' && profile.userType !== 'Investor' && (
            <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/30 text-center border-dashed">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">construction</span>
              <h3 className="font-bold text-on-surface">Module in Development</h3>
              <p className="text-sm text-on-surface-variant max-w-md mx-auto mt-2">
                The {profile.userType} module is currently being finalized. Please switch User Type to "Salaried", "Business", "Trader", or "Investor" to see the full UI.
              </p>
            </div>
          )}

          <CapitalGainsSection />
          <CryptoSection />
          <OtherIncomeSection />

          <DeductionSection />
          
          <AdvanceTaxSection />
        </div>

        {/* Right Column: Results & Analytics */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <TaxSummary />
          <SuggestionsAndWarnings />
        </div>

      </div>
    </motion.div>
  );
}
