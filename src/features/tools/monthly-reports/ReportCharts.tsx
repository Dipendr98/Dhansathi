import { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  BarChart, Bar, ReferenceLine,
  PieChart, Pie, Cell
} from 'recharts';
import type { MonthData } from '@/stores/proToolsStore';

interface Props {
  months: string[];
  data: Record<string, MonthData>;
  currentMonthKey: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ReportCharts({ months, data, currentMonthKey }: Props) {
  const trendData = useMemo(() => {
    return months.map(m => {
      const d = new Date(m + '-01');
      const md = data[m];
      
      const totalAssets = Object.values(md.assetDetails || {}).reduce((a, b) => a + b, 0);
      const totalLiabilities = Object.values(md.liabilityDetails || {}).reduce((a, b) => a + b, 0);
      const netWorth = totalAssets - totalLiabilities;
      
      return {
        name: `${MONTHS[d.getMonth()]}`,
        Income: md.income,
        Expenses: md.expenses,
        Investments: md.investments,
        NetWorth: netWorth,
        Surplus: md.income - md.expenses - md.investments
      };
    });
  }, [months, data]);

  const currentMonthData = data[currentMonthKey];
  
  const expensePieData = useMemo(() => {
    const details = currentMonthData.expenseDetails || {};
    return Object.keys(details)
      .filter(k => details[k] > 0)
      .map(k => ({ name: k, value: details[k] }));
  }, [currentMonthData]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#f43f5e', '#facc15'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-container-high border border-outline-variant/20 p-3 rounded-lg shadow-xl text-sm z-50">
          <p className="font-bold text-on-surface mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-mono text-xs">
              {entry.name}: ₹{entry.value.toLocaleString('en-IN')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 12-Month Line Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-5">
          <h3 className="font-bold mb-4 text-on-surface">12-Month Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="NetWorth" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Surplus / Deficit Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-5">
          <h3 className="font-bold mb-4 text-on-surface">Monthly Surplus / Deficit</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <ReferenceLine y={0} stroke="#9ca3af" />
                <Bar dataKey="Surplus">
                  {trendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.Surplus >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expense Breakdown Donut */}
      {expensePieData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-5">
          <h3 className="font-bold mb-4 text-on-surface">Expense Breakdown ({MONTHS[new Date(currentMonthKey + '-01').getMonth()]})</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="h-64 w-full md:w-1/2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 md:w-1/2">
              {expensePieData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-on-surface-variant w-[45%]">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="truncate" title={entry.name}>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
