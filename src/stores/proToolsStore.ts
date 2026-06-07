import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Regime = 'old' | 'new';

export interface BudgetItem {
    label: string;
    amount: number;
}

export type ReportProfile = 'Salaried' | 'Student' | 'Freelancer' | 'Business Owner' | 'Family Budget' | 'Investor' | 'Loan/EMI Heavy User';

export interface ReportGoal {
    id: string;
    label: string;
    targetAmount: number;
    currentSaved: number;
    monthlyContribution: number;
    targetDate: string; // YYYY-MM
}

export interface MonthData {
    income: number;
    expenses: number;
    investments: number;
    portfolioValue: number;
    
    // Detailed tracking
    incomeDetails: Record<string, number>;
    expenseDetails: Record<string, number>;
    savingsDetails: Record<string, number>;
    assetDetails: Record<string, number>;
    liabilityDetails: Record<string, number>;
    
    goals: ReportGoal[];
    notes: string;
}

export type BudgetRule = '50/30/20 Standard' | '60/20/20 High Cost City' | '70/20/10 Low Income / Starting Career' | '40/20/40 Aggressive Saver' | 'Custom Rule';

export interface ProToolsState {
    // Tax Calculator
    taxRegime: Regime;
    taxIncome: number;
    taxHra: number;
    taxSec80c: number;
    taxSec80d: number;
    taxNps: number;
    taxHomeLoan: number;
    taxOtherDed: number;
    taxStcg: number;
    taxLtcg: number;

    // Budget Analyzer
    budgetRule: BudgetRule;
    budgetIncomes: BudgetItem[];
    budgetNeeds: BudgetItem[];
    budgetWants: BudgetItem[];
    budgetSavings: BudgetItem[];
    budgetDebt: BudgetItem[];

    // Monthly Reports
    reportProfile: ReportProfile;
    monthlyData: Record<string, MonthData>;

    // Actions
    setTaxData: (data: Partial<Pick<ProToolsState, 'taxRegime' | 'taxIncome' | 'taxHra' | 'taxSec80c' | 'taxSec80d' | 'taxNps' | 'taxHomeLoan' | 'taxOtherDed' | 'taxStcg' | 'taxLtcg'>>) => void;
    setBudgetRule: (rule: BudgetRule) => void;
    setBudgetIncomes: (incomes: BudgetItem[]) => void;
    setBudgetNeeds: (needs: BudgetItem[]) => void;
    setBudgetWants: (wants: BudgetItem[]) => void;
    setBudgetSavings: (savings: BudgetItem[]) => void;
    setBudgetDebt: (debt: BudgetItem[]) => void;
    setReportProfile: (profile: ReportProfile) => void;
    setMonthlyData: (month: string, data: Partial<MonthData>) => void;
    setMonthlyDataField: (month: string, field: keyof MonthData, value: any) => void;
}

const DEFAULT_INCOME: BudgetItem[] = [
    { label: 'Salary', amount: 0 },
    { label: 'Freelance / Side Income', amount: 0 },
    { label: 'Business Income', amount: 0 },
    { label: 'Rental Income', amount: 0 },
    { label: 'Pension', amount: 0 },
    { label: 'Interest / Dividend', amount: 0 },
    { label: 'Family Support', amount: 0 },
    { label: 'Other Income', amount: 0 },
];

const DEFAULT_NEEDS: BudgetItem[] = [
    { label: 'Rent / EMI', amount: 0 },
    { label: 'Groceries', amount: 0 },
    { label: 'Electricity', amount: 0 },
    { label: 'Water', amount: 0 },
    { label: 'Gas', amount: 0 },
    { label: 'Internet / Mobile', amount: 0 },
    { label: 'Transport / Fuel', amount: 0 },
    { label: 'School / College Fees', amount: 0 },
    { label: 'Insurance Premiums', amount: 0 },
    { label: 'Medical / Health', amount: 0 },
    { label: 'Childcare / Family Support', amount: 0 },
];

const DEFAULT_WANTS: BudgetItem[] = [
    { label: 'Entertainment', amount: 0 },
    { label: 'Eating Out', amount: 0 },
    { label: 'Shopping', amount: 0 },
    { label: 'Travel', amount: 0 },
    { label: 'OTT / Subscriptions', amount: 0 },
    { label: 'Gym / Hobbies', amount: 0 },
    { label: 'Gifts', amount: 0 },
    { label: 'Personal Care', amount: 0 },
    { label: 'Luxury / Non-essential', amount: 0 },
];

const SAVINGS_TARGETS: BudgetItem[] = [
    { label: 'Emergency Fund', amount: 0 },
    { label: 'SIP / Mutual Funds', amount: 0 },
    { label: 'PPF / NPS', amount: 0 },
    { label: 'Fixed Deposit / RD', amount: 0 },
    { label: 'Stocks', amount: 0 },
    { label: 'Gold', amount: 0 },
    { label: 'Retirement', amount: 0 },
    { label: 'Child Education Fund', amount: 0 },
    { label: 'Goal Savings', amount: 0 },
];

const DEFAULT_DEBT: BudgetItem[] = [
    { label: 'Credit Card Payment', amount: 0 },
    { label: 'Personal Loan EMI', amount: 0 },
    { label: 'Education Loan EMI', amount: 0 },
    { label: 'Vehicle Loan EMI', amount: 0 },
    { label: 'Home Loan EMI', amount: 0 },
    { label: 'BNPL / Pay Later', amount: 0 },
    { label: 'Friend / Family Loan', amount: 0 },
];

export const useProToolsStore = create<ProToolsState>()(
    persist(
        (set) => ({
            // Tax initial state
            taxRegime: 'new',
            taxIncome: 0,
            taxHra: 0,
            taxSec80c: 0,
            taxSec80d: 0,
            taxNps: 0,
            taxHomeLoan: 0,
            taxOtherDed: 0,
            taxStcg: 0,
            taxLtcg: 0,

            // Budget initial state
            budgetRule: '50/30/20 Standard',
            budgetIncomes: DEFAULT_INCOME,
            budgetNeeds: DEFAULT_NEEDS,
            budgetWants: DEFAULT_WANTS,
            budgetSavings: SAVINGS_TARGETS,
            budgetDebt: DEFAULT_DEBT,

            // Monthly initial state
            reportProfile: 'Salaried',
            monthlyData: {},

            // Actions
            setTaxData: (data) => set((state) => ({ ...state, ...data })),
            setBudgetRule: (budgetRule) => set({ budgetRule }),
            setBudgetIncomes: (budgetIncomes) => set({ budgetIncomes }),
            setBudgetNeeds: (budgetNeeds) => set({ budgetNeeds }),
            setBudgetWants: (budgetWants) => set({ budgetWants }),
            setBudgetSavings: (budgetSavings) => set({ budgetSavings }),
            setBudgetDebt: (budgetDebt) => set({ budgetDebt }),
            setReportProfile: (reportProfile) => set({ reportProfile }),
            setMonthlyData: (month, data) => 
                set((state) => ({
                    monthlyData: {
                        ...state.monthlyData,
                        [month]: {
                            ...(state.monthlyData[month] || { income: 0, expenses: 0, investments: 0, portfolioValue: 0, incomeDetails: {}, expenseDetails: {}, savingsDetails: {}, assetDetails: {}, liabilityDetails: {}, goals: [], notes: '' }),
                            ...data,
                        },
                    },
                })),
            setMonthlyDataField: (month, field, value) =>
                set((state) => ({
                    monthlyData: {
                        ...state.monthlyData,
                        [month]: {
                            ...(state.monthlyData[month] || { income: 0, expenses: 0, investments: 0, portfolioValue: 0, incomeDetails: {}, expenseDetails: {}, savingsDetails: {}, assetDetails: {}, liabilityDetails: {}, goals: [], notes: '' }),
                            [field]: value,
                        },
                    },
                })),
        }),
        {
            name: 'dhansathi-pro-tools-storage',
        }
    )
);
