import { useTaxStore } from '@/stores/taxStore';

export default function CryptoSection() {
  const crypto = useTaxStore((s) => s.crypto);
  const setCrypto = useTaxStore((s) => s.setCrypto);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">currency_bitcoin</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-on-surface">Crypto / VDA Income</h3>
          <p className="text-xs text-on-surface-variant">Taxed at flat 30% under Section 115BBH</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
            Crypto / VDA Net Profit
          </label>
          <span className="text-[10px] text-on-surface-variant mb-2 block">Total profit from trades. Losses cannot be offset against other income or crypto profits.</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={crypto.cryptoProfit || ''}
              onChange={(e) => setCrypto({ cryptoProfit: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
            TDS Deducted (194S)
          </label>
          <span className="text-[10px] text-on-surface-variant mb-2 block">1% TDS deducted by exchange. Used as tax credit.</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant font-mono">₹</span>
            <input
              type="number"
              min="0"
              value={crypto.tdsDeducted || ''}
              onChange={(e) => setCrypto({ tdsDeducted: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant/30 font-mono text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-error/5 p-4 rounded-xl border border-error/20 flex items-start gap-3 mt-4">
        <span className="material-symbols-outlined text-error">warning</span>
        <div className="text-xs text-on-surface-variant leading-relaxed">
          <strong className="text-error">Strict Crypto Rules:</strong> 
          <ul className="list-disc ml-4 mt-1 space-y-1">
            <li>No basic exemption limit applies to Crypto. Even if your total income is ₹10,000, crypto is taxed at 30%.</li>
            <li>Losses from one crypto asset CANNOT be set off against gains from another.</li>
            <li>No deductions (except cost of acquisition) are allowed.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
