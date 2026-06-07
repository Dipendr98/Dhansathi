import { useTaxStore } from '@/stores/taxStore';

export default function SuggestionsAndWarnings() {
  const profile = useTaxStore((s) => s.profile);
  const salary = useTaxStore((s) => s.salary);

  const cg = useTaxStore((s) => s.capitalGains);
  const biz = useTaxStore((s) => s.business);
  const crypto = useTaxStore((s) => s.crypto);
  const fando = useTaxStore((s) => s.fando);

  const isOldRegime = profile.regime === 'old';
  const hasHraWithNewRegime = !isOldRegime && salary.hraReceived > 0;
  const hasProfTaxWithNewRegime = !isOldRegime && salary.professionalTax > 0;
  const hasCapitalGains = cg.stcgEquity111A > 0 || cg.ltcgEquity112A > 0 || cg.stcgOther > 0 || cg.ltcgOther > 0;
  const hasBusiness = profile.userType === 'Business' || profile.userType === 'Freelancer';
  const hasCrypto = crypto.cryptoProfit > 0;
  const hasFAndO = fando.turnover > 0;

  let itrForm = 'ITR-1 (Sahaj)';
  let itrDesc = 'For income up to ₹50 Lakhs from Salary, One House Property, and Other Sources.';
  if (hasBusiness || hasFAndO) {
    itrForm = (biz.presumptive && !hasFAndO) ? 'ITR-4 (Sugam)' : 'ITR-3';
    itrDesc = (biz.presumptive && !hasFAndO) ? 'For Business/Profession electing presumptive taxation (44AD/44ADA).' : 'For Individuals having income from profits and gains of Business, Profession, or F&O Trading.';
  } else if (hasCapitalGains || hasCrypto) {
    itrForm = 'ITR-2';
    itrDesc = 'For Individuals having Capital Gains or Crypto/VDA Income (without business income).';
  }

  return (
    <div className="space-y-6">
      {/* Warnings */}
      {(hasHraWithNewRegime || hasProfTaxWithNewRegime) && (
        <div className="bg-error/10 rounded-2xl p-5 border border-error/20">
          <h4 className="font-bold text-error flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined">warning</span>
            Mistakes Found
          </h4>
          <ul className="space-y-2 text-sm text-error/90 font-medium">
            {hasHraWithNewRegime && (
              <li>• You entered HRA Received but selected New Regime. HRA exemption is not allowed in New Regime.</li>
            )}
            {hasProfTaxWithNewRegime && (
              <li>• Professional Tax deduction is not allowed in New Regime.</li>
            )}
          </ul>
        </div>
      )}

      {/* ITR Suggestion */}
      <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6">
        <h4 className="font-bold mb-4 flex items-center gap-2 text-on-surface">
          <span className="material-symbols-outlined text-primary">description</span>
          Suggested ITR Form
        </h4>
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-primary/10 text-primary font-bold font-mono rounded-lg">{itrForm}</div>
            <p className="text-sm font-medium">Likely Form for your profile</p>
          </div>
          <p className="text-xs text-on-surface-variant mt-3 leading-relaxed">
            {itrDesc}
          </p>
        </div>
      </div>

      {/* Document Checklist */}
      <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6">
        <h4 className="font-bold mb-4 flex items-center gap-2 text-on-surface">
          <span className="material-symbols-outlined text-tertiary">checklist</span>
          Documents Needed to File
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-india-green text-lg">check_circle</span>
            <span>Form 16 from Employer</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-india-green text-lg">check_circle</span>
            <span>Form 26AS & AIS/TIS</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-india-green text-lg">check_circle</span>
            <span>PAN & Aadhaar Linked</span>
          </li>
          {salary.hraReceived > 0 && isOldRegime && (
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-india-green text-lg">check_circle</span>
              <span>Rent Receipts & Landlord PAN</span>
            </li>
          )}
          {isOldRegime && (
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-india-green text-lg">check_circle</span>
              <span>80C Investment Proofs (ELSS, PPF)</span>
            </li>
          )}
          {hasCapitalGains && (
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-india-green text-lg">check_circle</span>
              <span>Broker Capital Gains Statement</span>
            </li>
          )}
          {(hasBusiness || hasFAndO) && (
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-india-green text-lg">check_circle</span>
              <span>Business P&L / Expense Bills / Tax Audit Report</span>
            </li>
          )}
          {hasCrypto && (
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-india-green text-lg">check_circle</span>
              <span>Crypto Trading History & TDS proofs</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
