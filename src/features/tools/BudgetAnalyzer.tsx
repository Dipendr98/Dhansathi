import { motion } from 'framer-motion';
import { useProToolsStore, type BudgetItem } from '@/stores/proToolsStore';
import BudgetSection from './budget-analyzer/BudgetSection';
import BudgetSummary from './budget-analyzer/BudgetSummary';
import BudgetCharts from './budget-analyzer/BudgetCharts';
import BudgetInsights from './budget-analyzer/BudgetInsights';

function sum(items: BudgetItem[]) { return items.reduce((a, b) => a + b.amount, 0); }

export default function BudgetAnalyzer() {
    const {
        budgetRule, setBudgetRule,
        budgetIncomes, setBudgetIncomes,
        budgetNeeds, setBudgetNeeds,
        budgetWants, setBudgetWants,
        budgetSavings, setBudgetSavings,
        budgetDebt, setBudgetDebt
    } = useProToolsStore();

    const totalIncome = sum(budgetIncomes);
    const totalNeeds = sum(budgetNeeds);
    const totalWants = sum(budgetWants);
    const totalSavings = sum(budgetSavings);
    const totalDebt = sum(budgetDebt);

    const emergencyFundAmount = budgetSavings.find(s => s.label.toLowerCase().includes('emergency'))?.amount || 0;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6 tax-calculator-container">
            <div className="flex items-center space-x-3 mb-8 print-hidden">
                <span className="material-symbols-outlined text-primary text-4xl p-3 bg-primary/10 rounded-xl">account_balance_wallet</span>
                <div>
                    <h1 className="text-3xl font-headline font-bold m-0 tracking-tight">Advanced Budget Analyzer</h1>
                    <p className="text-sm text-on-surface-variant m-0 mt-1">Plan your monthly budget, track debt, and optimize your savings.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Data Entry */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BudgetSection 
                            title="Monthly Income" 
                            icon="payments" 
                            color="text-india-green" 
                            bg="bg-green-100" 
                            items={budgetIncomes} 
                            setItems={setBudgetIncomes} 
                        />
                        <BudgetSection 
                            title="Needs (Essentials)" 
                            icon="home" 
                            color="text-red-500" 
                            bg="bg-red-100" 
                            items={budgetNeeds} 
                            setItems={setBudgetNeeds} 
                        />
                        <BudgetSection 
                            title="Wants (Lifestyle)" 
                            icon="shopping_bag" 
                            color="text-amber-500" 
                            bg="bg-amber-100" 
                            items={budgetWants} 
                            setItems={setBudgetWants} 
                        />
                        <BudgetSection 
                            title="Debt Repayment" 
                            icon="credit_card" 
                            color="text-purple-500" 
                            bg="bg-purple-100" 
                            items={budgetDebt} 
                            setItems={setBudgetDebt} 
                        />
                        <div className="md:col-span-2">
                            <BudgetSection 
                                title="Savings & Investments" 
                                icon="savings" 
                                color="text-primary" 
                                bg="bg-primary/10" 
                                items={budgetSavings} 
                                setItems={setBudgetSavings} 
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Analytics & Summaries */}
                <div className="lg:col-span-4 space-y-6">
                    <BudgetSummary 
                        income={totalIncome}
                        needs={totalNeeds}
                        wants={totalWants}
                        savings={totalSavings}
                        debt={totalDebt}
                        rule={budgetRule}
                        setRule={setBudgetRule}
                    />

                    <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6">
                        <h3 className="font-bold text-on-surface mb-4">Budget Breakdown</h3>
                        <BudgetCharts 
                            income={totalIncome}
                            needs={totalNeeds}
                            wants={totalWants}
                            savings={totalSavings}
                            debt={totalDebt}
                        />
                    </div>

                    <BudgetInsights 
                        income={totalIncome}
                        needs={totalNeeds}
                        wants={totalWants}
                        savings={totalSavings}
                        debt={totalDebt}
                        rule={budgetRule}
                        emergencyFund={emergencyFundAmount}
                    />
                </div>
            </div>
        </motion.div>
    );
}
