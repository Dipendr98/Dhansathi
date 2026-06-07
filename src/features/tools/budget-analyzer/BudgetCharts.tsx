import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { BudgetItem } from '@/stores/proToolsStore';

interface Props {
  income: number;
  needs: number;
  wants: number;
  savings: number;
  debt: number;
}

export default function BudgetCharts({ income, needs, wants, savings, debt }: Props) {
  if (income === 0 && needs === 0 && wants === 0 && savings === 0 && debt === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">pie_chart</span>
        <p className="text-sm">Add data to view chart</p>
      </div>
    );
  }

  const surplus = Math.max(0, income - needs - wants - savings - debt);
  
  const data = [
    { name: 'Needs (Essentials)', value: needs, color: '#f87171' }, // red-400
    { name: 'Wants (Lifestyle)', value: wants, color: '#fbbf24' }, // amber-400
    { name: 'Debt Repayment', value: debt, color: '#a78bfa' }, // purple-400
    { name: 'Savings & Invest', value: savings, color: '#60a5fa' }, // blue-400
  ];

  if (surplus > 0) {
    data.push({ name: 'Unallocated Surplus', value: surplus, color: '#34d399' }); // emerald-400
  }

  const filteredData = data.filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-container-high border border-outline-variant/20 p-3 rounded-lg shadow-xl text-sm">
          <p className="font-bold text-on-surface">{payload[0].name}</p>
          <p className="font-mono text-primary mt-1">₹{payload[0].value.toLocaleString('en-IN')}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legend below the chart */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {filteredData.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
