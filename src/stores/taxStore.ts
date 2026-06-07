import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AssessmentYear = 'AY 2026-27' | 'AY 2025-26';
export type ResidentialStatus = 'Resident' | 'NRI' | 'RNOR';
export type AgeCategory = 'Below 60' | '60-79' | '80+';
export type UserType = 'Salaried' | 'Business' | 'Freelancer' | 'Student' | 'Pensioner' | 'Investor' | 'Trader' | 'Landlord' | 'NRI';
export type TaxRegime = 'new' | 'old';
export type CityType = 'Metro' | 'Non-metro';

export interface TaxProfile {
  assessmentYear: AssessmentYear;
  residentialStatus: ResidentialStatus;
  ageCategory: AgeCategory;
  userType: UserType;
  regime: TaxRegime;
  state: string;
}

export interface SalaryIncome {
  basicSalary: number;
  dearnessAllowance: number;
  hraReceived: number;
  rentPaid: number;
  cityType: CityType;
  standardDeduction: number; // 75k for new regime, 50k for old
  professionalTax: number;
  employerPf: number;
  employeePf: number;
  employerNps: number;
  bonus: number;
  leaveEncashment: number;
  gratuity: number;
  lta: number;
  perquisites: number;
  mealCoupons: number;
  esopIncome: number;
}

export interface Deductions {
  sec80c: number;
  sec80ccc: number;
  sec80ccd1: number;
  sec80ccd1b: number; // NPS Extra 50k
  sec80ccd2: number; // Employer NPS
  sec80d: number;
  sec80dd: number;
  sec80ddb: number;
  sec80e: number;
  sec80g: number;
  sec80gg: number;
  sec80tta: number;
  sec80ttb: number;
  sec80u: number;
  sec24b: number; // Home Loan Interest
  sec80ee: number;
  sec80eea: number;
  sec80eeb: number;
}

export interface CapitalGains {
  stcgEquity111A: number; // Listed Equity STCG (20%)
  ltcgEquity112A: number; // Listed Equity LTCG (12.5% above 1.25L)
  stcgOther: number;      // Added to slab income
  ltcgOther: number;      // Real estate/unlisted (12.5% without indexation, or 20% with old rules)
}

export interface BusinessIncome {
  grossReceipts: number;
  presumptive: boolean;   // If true, 44AD/44ADA applies
  presumptiveRate: number; // 6%, 8% for 44AD, or 50% for 44ADA
  expenses: number;       // Only if presumptive is false
  depreciation: number;
}

export interface CryptoIncome {
  cryptoProfit: number; // Flat 30% tax, no basic exemption
  tdsDeducted: number;
}

export interface FAndOIncome {
  turnover: number;
  netProfit: number;
  expenses: number;
}

export interface OtherIncome {
  savingsInterest: number; // 80TTA/80TTB applicable
  fdInterest: number;
  dividend: number;
  other: number;
}

export interface AdvanceTaxState {
  tdsAlreadyDeducted: number;
  tcsCollected: number;
  advanceTaxPaid: number;
}

export interface HousePropertyIncome {
  propertyType: 'Self-Occupied' | 'Let-Out';
  grossRent: number;
  propertyTaxes: number;
  homeLoanInterest: number;
}

export interface TaxState {
  profile: TaxProfile;
  salary: SalaryIncome;
  deductions: Deductions;
  capitalGains: CapitalGains;
  business: BusinessIncome;
  crypto: CryptoIncome;
  fando: FAndOIncome;
  otherIncome: OtherIncome;
  houseProperty: HousePropertyIncome;
  advanceTax: AdvanceTaxState;

  // Actions
  setProfile: (profile: Partial<TaxProfile>) => void;
  setSalary: (salary: Partial<SalaryIncome>) => void;
  setDeductions: (deductions: Partial<Deductions>) => void;
  setCapitalGains: (cg: Partial<CapitalGains>) => void;
  setBusiness: (biz: Partial<BusinessIncome>) => void;
  setCrypto: (crypto: Partial<CryptoIncome>) => void;
  setFAndO: (fando: Partial<FAndOIncome>) => void;
  setOtherIncome: (other: Partial<OtherIncome>) => void;
  setHouseProperty: (hp: Partial<HousePropertyIncome>) => void;
  setAdvanceTax: (adv: Partial<AdvanceTaxState>) => void;
  reset: () => void;
}

const DEFAULT_PROFILE: TaxProfile = {
  assessmentYear: 'AY 2026-27',
  residentialStatus: 'Resident',
  ageCategory: 'Below 60',
  userType: 'Salaried',
  regime: 'new',
  state: '',
};

const DEFAULT_SALARY: SalaryIncome = {
  basicSalary: 0,
  dearnessAllowance: 0,
  hraReceived: 0,
  rentPaid: 0,
  cityType: 'Non-metro',
  standardDeduction: 75000,
  professionalTax: 0,
  employerPf: 0,
  employeePf: 0,
  employerNps: 0,
  bonus: 0,
  leaveEncashment: 0,
  gratuity: 0,
  lta: 0,
  perquisites: 0,
  mealCoupons: 0,
  esopIncome: 0,
};

const DEFAULT_DEDUCTIONS: Deductions = {
  sec80c: 0,
  sec80ccc: 0,
  sec80ccd1: 0,
  sec80ccd1b: 0,
  sec80ccd2: 0,
  sec80d: 0,
  sec80dd: 0,
  sec80ddb: 0,
  sec80e: 0,
  sec80g: 0,
  sec80gg: 0,
  sec80tta: 0,
  sec80ttb: 0,
  sec80u: 0,
  sec24b: 0,
  sec80ee: 0,
  sec80eea: 0,
  sec80eeb: 0,
};

const DEFAULT_CG: CapitalGains = {
  stcgEquity111A: 0,
  ltcgEquity112A: 0,
  stcgOther: 0,
  ltcgOther: 0,
};

const DEFAULT_BIZ: BusinessIncome = {
  grossReceipts: 0,
  presumptive: false,
  presumptiveRate: 50,
  expenses: 0,
  depreciation: 0,
};

const DEFAULT_CRYPTO: CryptoIncome = {
  cryptoProfit: 0,
  tdsDeducted: 0,
};

const DEFAULT_FANDO: FAndOIncome = {
  turnover: 0,
  netProfit: 0,
  expenses: 0,
};

const DEFAULT_OTHER: OtherIncome = {
  savingsInterest: 0,
  fdInterest: 0,
  dividend: 0,
  other: 0,
};

const DEFAULT_ADVANCE: AdvanceTaxState = {
  tdsAlreadyDeducted: 0,
  tcsCollected: 0,
  advanceTaxPaid: 0,
};

const DEFAULT_HP: HousePropertyIncome = {
  propertyType: 'Self-Occupied',
  grossRent: 0,
  propertyTaxes: 0,
  homeLoanInterest: 0,
};

export const useTaxStore = create<TaxState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      salary: DEFAULT_SALARY,
      deductions: DEFAULT_DEDUCTIONS,
      capitalGains: DEFAULT_CG,
      business: DEFAULT_BIZ,
      crypto: DEFAULT_CRYPTO,
      fando: DEFAULT_FANDO,
      otherIncome: DEFAULT_OTHER,
      houseProperty: DEFAULT_HP,
      advanceTax: DEFAULT_ADVANCE,

      setProfile: (profileUpdates) =>
        set((state) => ({
          profile: { ...state.profile, ...profileUpdates },
        })),
      setSalary: (salaryUpdates) =>
        set((state) => ({
          salary: { ...state.salary, ...salaryUpdates },
        })),
      setDeductions: (deductionUpdates) =>
        set((state) => ({
          deductions: { ...state.deductions, ...deductionUpdates },
        })),
      setCapitalGains: (cgUpdates) =>
        set((state) => ({
          capitalGains: { ...state.capitalGains, ...cgUpdates },
        })),
      setBusiness: (bizUpdates) =>
        set((state) => ({
          business: { ...state.business, ...bizUpdates },
        })),
      setCrypto: (cryptoUpdates) =>
        set((state) => ({
          crypto: { ...state.crypto, ...cryptoUpdates },
        })),
      setFAndO: (fandoUpdates) =>
        set((state) => ({
          fando: { ...state.fando, ...fandoUpdates },
        })),
      setOtherIncome: (otherUpdates) =>
        set((state) => ({
          otherIncome: { ...state.otherIncome, ...otherUpdates },
        })),
      setHouseProperty: (hpUpdates) =>
        set((state) => ({
          houseProperty: { ...state.houseProperty, ...hpUpdates },
        })),
      setAdvanceTax: (advUpdates) =>
        set((state) => ({
          advanceTax: { ...state.advanceTax, ...advUpdates },
        })),
      reset: () =>
        set({
          profile: DEFAULT_PROFILE,
          salary: DEFAULT_SALARY,
          deductions: DEFAULT_DEDUCTIONS,
          capitalGains: DEFAULT_CG,
          business: DEFAULT_BIZ,
          crypto: DEFAULT_CRYPTO,
          fando: DEFAULT_FANDO,
          otherIncome: DEFAULT_OTHER,
          houseProperty: DEFAULT_HP,
          advanceTax: DEFAULT_ADVANCE,
        }),
    }),
    {
      name: 'dhansathi-tax-engine',
    }
  )
);
