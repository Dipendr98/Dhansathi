import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Regime = 'old' | 'new';

export interface BudgetItem {
    label: string;
    amount: number;
}

export interface MonthData {
    income: number;
    expenses: number;
    investments: number;
    portfolioValue: number;
}

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
    budgetIncomes: BudgetItem[];
    budgetExpenses: BudgetItem[];
    budgetSavings: BudgetItem[];

    // Monthly Reports
    monthlyData: Record<string, MonthData>;

    // Actions
    setTaxData: (data: Partial<Pick<ProToolsState, 'taxRegime' | 'taxIncome' | 'taxHra' | 'taxSec80c' | 'taxSec80d' | 'taxNps' | 'taxHomeLoan' | 'taxOtherDed' | 'taxStcg' | 'taxLtcg'>>) => void;
    setBudgetIncomes: (incomes: BudgetItem[]) => void;
    setBudgetExpenses: (expenses: BudgetItem[]) => void;
    setBudgetSavings: (savings: BudgetItem[]) => void;
    setMonthlyDataField: (month: string, field: keyof MonthData, value: number) => void;
}

const DEFAULT_INCOME: BudgetItem[] = [
    { label: 'Salary', amount: 0 },
    { label: 'Freelance / Side Income', amount: 0 },
    { label: 'Rental Income', amount: 0 },
    { label: 'Dividends / Interest', amount: 0 },
];

const DEFAULT_EXPENSES: BudgetItem[] = [
    { label: 'Rent / EMI', amount: 0 },
    { label: 'Groceries & Food', amount: 0 },
    { label: 'Utilities & Bills', amount: 0 },
    { label: 'Transport / Fuel', amount: 0 },
    { label: 'Insurance Premiums', amount: 0 },
    { label: 'Education / Courses', amount: 0 },
    { label: 'Entertainment', amount: 0 },
    { label: 'Shopping / Personal', amount: 0 },
    { label: 'Medical / Health', amount: 0 },
    { label: 'Other Expenses', amount: 0 },
];

const SAVINGS_TARGETS: BudgetItem[] = [
    { label: 'Emergency Fund', amount: 0 },
    { label: 'SIP / Mutual Funds', amount: 0 },
    { label: 'PPF / NPS', amount: 0 },
    { label: 'Stocks / Trading', amount: 0 },
    { label: 'Fixed Deposits', amount: 0 },
    { label: 'Gold / Other', amount: 0 },
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
            budgetIncomes: DEFAULT_INCOME,
            budgetExpenses: DEFAULT_EXPENSES,
            budgetSavings: SAVINGS_TARGETS,

            // Monthly initial state
            monthlyData: {},

            // Actions
            setTaxData: (data) => set((state) => ({ ...state, ...data })),
            setBudgetIncomes: (budgetIncomes) => set({ budgetIncomes }),
            setBudgetExpenses: (budgetExpenses) => set({ budgetExpenses }),
            setBudgetSavings: (budgetSavings) => set({ budgetSavings }),
            setMonthlyDataField: (month, field, value) =>
                set((state) => ({
                    monthlyData: {
                        ...state.monthlyData,
                        [month]: {
                            ...(state.monthlyData[month] || { income: 0, expenses: 0, investments: 0, portfolioValue: 0 }),
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
