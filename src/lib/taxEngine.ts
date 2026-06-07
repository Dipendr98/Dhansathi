import type { TaxProfile, SalaryIncome, Deductions, CapitalGains, BusinessIncome, CryptoIncome, FAndOIncome, OtherIncome, AdvanceTaxState, HousePropertyIncome } from '@/stores/taxStore';

export interface TaxResult {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number; // Normal slab income
  baseTax: number;       // Normal slab tax
  specialTax: number;    // Tax from capital gains and crypto
  cryptoTax: number;
  surcharge: number;
  rebate87a: number;
  marginalRelief: number;
  cess: number;
  totalTax: number;
  netTaxPayable: number;
}

const OLD_SLABS_NON_SENIOR = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
];

const OLD_SLABS_SENIOR = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
];

const OLD_SLABS_SUPER_SENIOR = [
  { min: 0, max: 500000, rate: 0 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
];

// AY 2026-27 (FY 2025-26) New Tax Regime Slabs
const NEW_SLABS_AY2627 = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 5 },
  { min: 800000, max: 1200000, rate: 10 },
  { min: 1200000, max: 1600000, rate: 15 },
  { min: 1600000, max: 2000000, rate: 20 },
  { min: 2000000, max: 2400000, rate: 25 },
  { min: 2400000, max: Infinity, rate: 30 },
];

export function calculateHraExemption(salary: SalaryIncome): number {
  if (salary.hraReceived === 0 || salary.rentPaid === 0 || salary.basicSalary === 0) return 0;
  
  const actualHra = salary.hraReceived;
  const rentMinus10PercentBasic = Math.max(0, salary.rentPaid - (0.10 * salary.basicSalary));
  const basicMultiplier = salary.cityType === 'Metro' ? 0.50 : 0.40;
  const percentOfBasic = salary.basicSalary * basicMultiplier;

  return Math.min(actualHra, rentMinus10PercentBasic, percentOfBasic);
}

function calculateBaseTax(income: number, slabs: { min: number; max: number; rate: number }[]): number {
  let tax = 0;
  for (const slab of slabs) {
    if (income <= slab.min) break;
    const amt = Math.min(income, slab.max) - slab.min;
    tax += amt * (slab.rate / 100);
  }
  return tax;
}

function calculateSurcharge(tax: number, income: number, regime: 'old' | 'new'): number {
  if (income <= 50_000_000) return 0;
  if (income <= 100_000_000) return tax * 0.10;
  if (income <= 200_000_000) return tax * 0.15;
  if (income <= 500_000_000) return tax * 0.25;
  
  // Above 5Cr
  if (regime === 'new') return tax * 0.25; // Capped at 25% for new regime
  return tax * 0.37;
}

export function calculateTax(
  profile: TaxProfile,
  salary: SalaryIncome,
  ded: Deductions,
  cg: CapitalGains,
  biz: BusinessIncome,
  crypto: CryptoIncome,
  fando: FAndOIncome,
  other: OtherIncome,
  hp: HousePropertyIncome,
  adv: AdvanceTaxState
): TaxResult {
  // 1. Gross Salary
  const grossSalary = 
    salary.basicSalary + 
    salary.dearnessAllowance + 
    salary.hraReceived + 
    salary.bonus + 
    salary.leaveEncashment + 
    salary.gratuity + 
    salary.lta + 
    salary.perquisites + 
    salary.mealCoupons + 
    salary.esopIncome;

  // 2. Exemptions
  let hraExemption = 0;
  if (profile.regime === 'old') {
    hraExemption = calculateHraExemption(salary);
  }
  
  const netSalary = grossSalary - hraExemption;
  
  // 3. Business Income
  let businessProfit = 0;
  if (profile.userType === 'Business' || profile.userType === 'Freelancer') {
    if (biz.presumptive) {
      businessProfit = biz.grossReceipts * (biz.presumptiveRate / 100);
    } else {
      businessProfit = Math.max(0, biz.grossReceipts - biz.expenses - biz.depreciation);
    }
  }

  // 4. F&O and Intraday (Business Income)
  let fandoProfit = 0;
  if (profile.userType === 'Trader' || profile.userType === 'Business') {
    fandoProfit = Math.max(0, fando.netProfit - fando.expenses);
  }

  // 5. Other Income
  const totalOtherIncome = other.savingsInterest + other.fdInterest + other.dividend + other.other;

  // 6. House Property Income
  let housePropertyIncome = 0;
  if (hp.propertyType === 'Let-Out') {
    const nav = Math.max(0, hp.grossRent - hp.propertyTaxes);
    const standardDeduction30 = nav * 0.30;
    housePropertyIncome = nav - standardDeduction30 - hp.homeLoanInterest;
  } else {
    // Self-Occupied
    // Under new regime, loss from self-occupied property cannot be set off against other income.
    // Under old regime, loss up to ₹2,00,000 can be set off.
    if (profile.regime === 'old') {
      housePropertyIncome = -Math.min(200000, hp.homeLoanInterest);
    } else {
      housePropertyIncome = 0; // New regime does not allow self-occupied interest set-off
    }
  }

  // 7. Gross Total Income (Normal Slab Income)
  // STCG Other is added to normal slab income
  // Note: If housePropertyIncome is negative, it reduces the gross total income (only in old regime for self-occupied, or let-out generally cap at 2L overall, but keeping simple)
  let grossIncome = netSalary + businessProfit + fandoProfit + totalOtherIncome + cg.stcgOther + housePropertyIncome;
  // If overall is negative, cap at 0
  grossIncome = Math.max(0, grossIncome);

  // 8. Deductions
  let totalDeductions = 0;
  
  if (profile.regime === 'old') {
    // Old Regime Deductions
    const sd = Math.min(50000, netSalary);
    const pt = salary.professionalTax;
    
    // Chapter VI-A
    const sec80cTotal = Math.min(150000, ded.sec80c + ded.sec80ccc + ded.sec80ccd1 + salary.employeePf);
    const sec80ccd1b = Math.min(50000, ded.sec80ccd1b);
    const sec80ccd2 = ded.sec80ccd2; // 14% of Basic for Govt, 10% for others (Assuming verified at UI)
    
    // Other common deductions
    const others = ded.sec80d + ded.sec80dd + ded.sec80ddb + ded.sec80e + ded.sec80g + ded.sec80gg + ded.sec80tta + ded.sec80ttb + ded.sec80u + ded.sec24b + ded.sec80ee + ded.sec80eea + ded.sec80eeb;

    totalDeductions = sd + pt + sec80cTotal + sec80ccd1b + sec80ccd2 + others;
  } else {
    // New Regime Deductions
    // AY 26-27 Standard Deduction is ₹75,000 for salaried
    const sd = Math.min(75000, netSalary);
    
    // In new regime, only Employer NPS 80CCD(2) and Agniveer are allowed from Chapter VI-A
    const sec80ccd2 = ded.sec80ccd2;
    
    totalDeductions = sd + sec80ccd2;
  }

  // 9. Taxable Normal Income
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  // 10. Slabs
  let slabs;
  if (profile.regime === 'new') {
    slabs = NEW_SLABS_AY2627;
  } else {
    if (profile.ageCategory === '80+') slabs = OLD_SLABS_SUPER_SENIOR;
    else if (profile.ageCategory === '60-79') slabs = OLD_SLABS_SENIOR;
    else slabs = OLD_SLABS_NON_SENIOR;
  }

  // 11. Base Tax (Normal Income)
  let baseTax = calculateBaseTax(taxableIncome, slabs);

  // 12. Special Tax (Capital Gains & Crypto)
  const stcgEquityTax = cg.stcgEquity111A * 0.20; // 20% flat
  const ltcgEquityTax = Math.max(0, cg.ltcgEquity112A - 125000) * 0.125; // 12.5% above 1.25L
  const ltcgOtherTax = cg.ltcgOther * 0.125; // 12.5% flat (assuming new rules for simplicity)
  const cryptoTax = crypto.cryptoProfit * 0.30; // 30% flat on VDA profit
  
  const specialTax = stcgEquityTax + ltcgEquityTax + ltcgOtherTax + cryptoTax;
  const totalTaxBeforeRebate = baseTax + specialTax;

  // 13. Rebate 87A
  // Total Income for Rebate check includes special income
  const totalIncomeForRebate = taxableIncome + cg.stcgEquity111A + cg.ltcgEquity112A + cg.ltcgOther + crypto.cryptoProfit;
  
  let rebate87a = 0;
  let marginalRelief = 0;

  if (profile.regime === 'new') {
    // New Regime Rebate: Up to ₹25,000 if income <= 7,00,000
    if (totalIncomeForRebate <= 700000) {
      // 87A is available against baseTax + stcgEquityTax + ltcgOtherTax. NOT against ltcgEquityTax (112A).
      const taxEligibleForRebate = baseTax + stcgEquityTax + ltcgOtherTax;
      rebate87a = Math.min(taxEligibleForRebate, 25000);
    } else {
      // Marginal Relief on Rebate
      const taxOn7L = calculateBaseTax(700000, NEW_SLABS_AY2627);
      const incomeAbove7L = totalIncomeForRebate - 700000;
      // Simplified marginal relief for normal income
      if (baseTax > incomeAbove7L && totalIncomeForRebate < 750000) {
        marginalRelief = baseTax - incomeAbove7L;
      }
    }
  } else {
    // Old Regime Rebate: Up to ₹12,500 if income <= 5,00,000
    if (totalIncomeForRebate <= 500000) {
      const taxEligibleForRebate = baseTax + stcgEquityTax + ltcgOtherTax;
      rebate87a = Math.min(taxEligibleForRebate, 12500);
    }
  }

  const taxAfterRebate = Math.max(0, totalTaxBeforeRebate - rebate87a - marginalRelief);

  // 14. Surcharge
  const surcharge = calculateSurcharge(taxAfterRebate, totalIncomeForRebate, profile.regime);
  
  // 15. Cess
  const cess = (taxAfterRebate + surcharge) * 0.04;

  const totalTax = taxAfterRebate + surcharge + cess;

  // 16. Net Tax Payable (Deducting Advance Tax/TDS)
  // TDS on crypto is available as a credit
  const totalTdsTcs = adv.tdsAlreadyDeducted + adv.tcsCollected + crypto.tdsDeducted;
  const netTaxPayable = totalTax - totalTdsTcs - adv.advanceTaxPaid;

  return {
    grossIncome: totalIncomeForRebate, // Including special income for display
    totalDeductions,
    taxableIncome,
    baseTax,
    specialTax,
    cryptoTax,
    rebate87a,
    marginalRelief,
    surcharge,
    cess,
    totalTax,
    netTaxPayable,
  };
}
