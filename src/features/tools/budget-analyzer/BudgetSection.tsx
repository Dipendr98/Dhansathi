import { useState } from 'react';
import type { BudgetItem } from '@/stores/proToolsStore';

interface Props {
  title: string;
  icon: string;
  items: BudgetItem[];
  setItems: (v: BudgetItem[]) => void;
  color: string;
  bg: string;
}

export default function BudgetSection({ title, icon, items, setItems, color, bg }: Props) {
  const [customLabel, setCustomLabel] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const total = items.reduce((a, b) => a + b.amount, 0);
  const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  const updateItem = (idx: number, val: string) => {
    // Prevent negative numbers
    const amount = Math.max(0, Number(val));
    const copy = [...items];
    copy[idx] = { ...copy[idx], amount };
    setItems(copy);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLabel.trim()) return;
    setItems([...items, { label: customLabel.trim(), amount: 0 }]);
    setCustomLabel('');
    setShowAdd(false);
  };

  const removeItem = (idx: number) => {
    const copy = [...items];
    copy.splice(idx, 1);
    setItems(copy);
  };

  return (
    <div className={`rounded-2xl shadow-sm border border-outline-variant/20 p-5 space-y-4 bg-white`}>
      <div className={`flex items-center gap-3 border-b border-outline-variant/10 pb-3`}>
        <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
          <span className={`material-symbols-outlined ${color}`}>{icon}</span>
        </div>
        <div>
          <h3 className="font-bold text-on-surface leading-tight">{title}</h3>
          <p className="font-mono font-bold text-sm text-on-surface-variant mt-1">{fmt(total)}</p>
        </div>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 group">
            <span className="text-xs font-medium text-on-surface-variant flex-1 min-w-0 truncate" title={item.label}>
              {item.label}
            </span>
            <div className="relative w-28">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-outline-variant font-mono text-xs">₹</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={item.amount === 0 ? '' : item.amount}
                onChange={(e) => updateItem(i, e.target.value)}
                className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-outline-variant/30 font-mono text-sm text-right focus:ring-2 focus:ring-primary/30 outline-none transition-shadow"
                style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
              />
            </div>
            <button
              onClick={() => removeItem(i)}
              className="text-error/50 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove Item"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        ))}
      </div>

      {showAdd ? (
        <form onSubmit={handleAddCustom} className="flex items-center gap-2 pt-2 border-t border-outline-variant/10">
          <input
            autoFocus
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="E.g. Netflix, Gym..."
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-outline-variant/30 focus:ring-2 focus:ring-primary/30 outline-none"
          />
          <button type="submit" className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[18px]">check</span>
          </button>
          <button type="button" onClick={() => setShowAdd(false)} className="text-on-surface-variant hover:bg-surface-container p-1.5 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-2 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg border border-dashed border-primary/30 transition-colors flex items-center justify-center gap-1 mt-2"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Custom Item
        </button>
      )}
    </div>
  );
}
