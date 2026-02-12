import React, { useMemo, useEffect } from 'react';
import { InvestmentInput, PortfolioTheme, InvestmentType, AssetAllocations } from '../types';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  IndianRupee, 
  Percent, 
  Layers, 
  Cpu, 
  CreditCard, 
  Activity, 
  ShoppingBag, 
  ShieldAlert,
  Sparkles,
  Search,
  Wallet,
  ArrowUpCircle,
  Briefcase,
  Coins,
  Library,
  FileText
} from 'lucide-react';

interface PortfolioFormProps {
  onGenerate: (input: InvestmentInput) => void;
  isLoading: boolean;
  initialData?: InvestmentInput | null;
  isLimitReached?: boolean;
}

const THEMES: { id: PortfolioTheme; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'MIXTURE', label: 'Mixture', icon: <Layers className="w-4 h-4" />, desc: 'Diversified all-rounder' },
  { id: 'IT', label: 'IT', icon: <Cpu className="w-4 h-4" />, desc: 'Software & Digital' },
  { id: 'FINTECH', label: 'Fintech', icon: <CreditCard className="w-4 h-4" />, desc: 'Banking & Payments' },
  { id: 'HEALTHCARE', label: 'Healthcare', icon: <Activity className="w-4 h-4" />, desc: 'Pharma & Hospitals' },
  { id: 'RETAIL', label: 'Retail', icon: <ShoppingBag className="w-4 h-4" />, desc: 'FMCG & Consumer' },
  { id: 'DEFENSE', label: 'Defense', icon: <ShieldAlert className="w-4 h-4" />, desc: 'Aerospace & Military' },
  { id: 'CUSTOM', label: 'Custom', icon: <Sparkles className="w-4 h-4 text-blue-500" />, desc: 'Define your niche' },
];

const toIndianWords = (num: number): string => {
  if (num === 0) return "Zero";
  if (!num || isNaN(num)) return "";

  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const formatBelowThousand = (n: number) => {
    let str = "";
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n >= 10) {
      str += teens[n - 10] + " ";
      n = 0;
    }
    if (n > 0) {
      str += units[n] + " ";
    }
    return str.trim();
  };

  let result = "";
  let crores = Math.floor(num / 10000000);
  num %= 10000000;
  let lakhs = Math.floor(num / 100000);
  num %= 100000;
  let thousands = Math.floor(num / 1000);
  num %= 1000;
  let remaining = num;

  if (crores > 0) result += formatBelowThousand(crores) + " Crore ";
  if (lakhs > 0) result += formatBelowThousand(lakhs) + " Lakh ";
  if (thousands > 0) result += formatBelowThousand(thousands) + " Thousand ";
  if (remaining > 0) result += formatBelowThousand(remaining);

  return result.trim() + " Rupees Only";
};

const calculateRequiredXirr = (monthlySip: number, targetAmount: number, years: number, stepUp: number): number => {
  if (years <= 0 || monthlySip <= 0) return 0;
  const months = years * 12;
  const calculateMaturity = (rate: number) => {
    let currentBalance = 0;
    let currentSip = monthlySip;
    const monthlyRate = rate / 1200;
    for (let m = 1; m <= months; m++) {
      currentBalance = (currentBalance + currentSip) * (1 + monthlyRate);
      if (m % 12 === 0) currentSip = currentSip * (1 + stepUp / 100);
    }
    return currentBalance;
  };
  let low = -50;
  let high = 500;
  for (let i = 0; i < 40; i++) {
    let mid = (low + high) / 2;
    if (calculateMaturity(mid) < targetAmount) low = mid;
    else high = mid;
  }
  return parseFloat(high.toFixed(2));
};

const PortfolioForm: React.FC<PortfolioFormProps> = ({ onGenerate, isLoading, initialData, isLimitReached }) => {
  const defaultState: InvestmentInput = {
    type: 'LUMPSUM',
    initialAmount: 100000,
    monthlySip: 10000,
    stepUp: 10,
    targetAmount: 500000,
    years: 5,
    theme: 'MIXTURE',
    customTheme: '',
    isMultiAsset: false,
    assetAllocations: {
      equity: 50,
      mutualFunds: 20,
      gold: 10,
      debt: 10,
      ppf: 5,
      nps: 5
    },
    customDistribution: {
      large: 5,
      mid: 8,
      small: 2
    }
  };

  const [formData, setFormData] = React.useState<InvestmentInput>(() => {
    if (!initialData) return defaultState;
    return { ...defaultState, ...initialData };
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const requiredReturn = useMemo(() => {
    if (formData.years <= 0) return "0.00";
    try {
      if (formData.type === 'LUMPSUM') {
        if (formData.initialAmount > 0 && formData.targetAmount > 0) {
          const cagr = (Math.pow(formData.targetAmount / formData.initialAmount, 1 / formData.years) - 1) * 100;
          return isNaN(cagr) ? "0.00" : cagr.toFixed(2);
        }
      } else {
        const sipVal = formData.monthlySip || 0;
        if (sipVal > 0 && formData.targetAmount > 0) {
          const xirr = calculateRequiredXirr(sipVal, formData.targetAmount, formData.years, formData.stepUp || 0);
          return xirr.toFixed(2);
        }
      }
    } catch (e) { return "0.00"; }
    return "0.00";
  }, [formData.type, formData.initialAmount, formData.monthlySip, formData.targetAmount, formData.years, formData.stepUp]);

  const totalAllocation = useMemo(() => {
    if (!formData.isMultiAsset || !formData.assetAllocations) return 100;
    return (Object.values(formData.assetAllocations) as number[]).reduce((a, b) => a + b, 0);
  }, [formData.isMultiAsset, formData.assetAllocations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.isMultiAsset && totalAllocation !== 100) {
      alert("Total asset allocation must equal 100%");
      return;
    }
    onGenerate(formData);
  };

  const updateAllocation = (field: keyof AssetAllocations, value: number) => {
    setFormData({
      ...formData,
      assetAllocations: {
        ...formData.assetAllocations!,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12">
        <div className="flex flex-col items-center gap-6 mb-10">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200">
            <button type="button" onClick={() => setFormData({ ...formData, type: 'LUMPSUM' })} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black transition-all ${formData.type === 'LUMPSUM' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>
              <IndianRupee className="w-3.5 h-3.5" /> LUMPSUM
            </button>
            <button type="button" onClick={() => setFormData({ ...formData, type: 'SIP' })} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black transition-all ${formData.type === 'SIP' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>
              <Wallet className="w-3.5 h-3.5" /> SIP PLAN
            </button>
          </div>

          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200">
            <button type="button" onClick={() => setFormData({ ...formData, isMultiAsset: false })} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black transition-all ${!formData.isMultiAsset ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>
              <Briefcase className="w-3.5 h-3.5" /> EQUITY ONLY
            </button>
            <button type="button" onClick={() => setFormData({ ...formData, isMultiAsset: true })} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black transition-all ${formData.isMultiAsset ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>
              <Library className="w-3.5 h-3.5" /> MULTI-ASSET
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {formData.type === 'LUMPSUM' ? (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><IndianRupee className="w-3.5 h-3.5" /> Initial Capital</label>
              <input type="number" value={formData.initialAmount} onChange={(e) => setFormData({ ...formData, initialAmount: Number(e.target.value) })} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-black text-xl text-slate-800 transition-all" required />
              {formData.initialAmount > 0 && <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2 animate-in fade-in slide-in-from-top-1">{toIndianWords(formData.initialAmount)}</p>}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Wallet className="w-3.5 h-3.5" /> Monthly SIP</label>
                <input type="number" value={formData.monthlySip} onChange={(e) => setFormData({ ...formData, monthlySip: Number(e.target.value) })} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-black text-xl text-slate-800 transition-all" required />
                {formData.monthlySip && formData.monthlySip > 0 && <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2 animate-in fade-in slide-in-from-top-1">{toIndianWords(formData.monthlySip)}</p>}
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><ArrowUpCircle className="w-3.5 h-3.5 text-blue-500" /> Step-Up (%)</label>
                <input type="number" value={formData.stepUp} onChange={(e) => setFormData({ ...formData, stepUp: Number(e.target.value) })} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-black text-xl text-slate-800 transition-all" min="0" max="100" required />
              </div>
            </>
          )}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Target className="w-3.5 h-3.5" /> Target Wealth</label>
            <input type="number" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-black text-xl text-slate-800 transition-all" required />
            {formData.targetAmount > 0 && <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2 animate-in fade-in slide-in-from-top-1">{toIndianWords(formData.targetAmount)}</p>}
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Horizon (Yrs)</label>
            <input type="number" value={formData.years} onChange={(e) => setFormData({ ...formData, years: Number(e.target.value) })} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 outline-none font-black text-xl text-slate-800 transition-all" min="1" max="30" required />
          </div>
        </div>

        {formData.isMultiAsset && (
          <div className="space-y-6 mb-10 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" /> Asset Allocation Weights
              </label>
              <div className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${totalAllocation === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                Total: {totalAllocation}%
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'equity', label: 'Stocks (Direct)', icon: <TrendingUp className="w-4 h-4 text-blue-600" /> },
                { id: 'mutualFunds', label: 'Mutual Funds', icon: <Library className="w-4 h-4 text-indigo-600" /> },
                { id: 'gold', label: 'Gold / SGB', icon: <Coins className="w-4 h-4 text-amber-600" /> },
                { id: 'debt', label: 'Debt / FD', icon: <Wallet className="w-4 h-4 text-emerald-600" /> },
                { id: 'ppf', label: 'PPF', icon: <ShieldAlert className="w-4 h-4 text-rose-600" /> },
                { id: 'nps', label: 'NPS', icon: <FileText className="w-4 h-4 text-blue-600" /> },
              ].map((asset) => (
                <div key={asset.id} className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">{asset.icon} {asset.label}</p>
                    <span className="text-xs font-black text-slate-800">{formData.assetAllocations?.[asset.id as keyof AssetAllocations]}%</span>
                  </div>
                  <input type="range" min="0" max="100" step="5" value={formData.assetAllocations?.[asset.id as keyof AssetAllocations]} onChange={(e) => updateAllocation(asset.id as keyof AssetAllocations, Number(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6 mb-10">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Layers className="w-3.5 h-3.5" /> Portfolio Strategy Theme</label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {THEMES.map((t) => (
              <button key={t.id} type="button" onClick={() => setFormData({ ...formData, theme: t.id })} className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition-all ${formData.theme === t.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-300'}`}>
                <div className={`p-2 rounded-xl ${formData.theme === t.id ? 'bg-white/20' : 'bg-slate-50'}`}>{t.icon}</div>
                <p className="text-xs font-black uppercase tracking-tight">{t.label}</p>
              </button>
            ))}
          </div>
          {formData.theme === 'CUSTOM' && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500"><Search className="w-5 h-5" /></div>
                  <input type="text" value={formData.customTheme} onChange={(e) => setFormData({ ...formData, customTheme: e.target.value })} className="w-full pl-14 pr-6 py-5 bg-blue-50/30 border border-blue-100 rounded-3xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-lg text-slate-800 transition-all placeholder:text-slate-400" placeholder="Enter niche (e.g. EV, Renewable Energy, Railway...)" required={formData.theme === 'CUSTOM'} />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2"><Sparkles className="w-5 h-5 text-blue-400 animate-pulse" /></div>
               </div>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-100">
          <div className="flex items-center gap-5 bg-slate-900 px-8 py-5 rounded-[2rem] shadow-xl">
            <div className="p-3 bg-blue-500 rounded-2xl shadow-lg"><Percent className="w-6 h-6 text-white" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Required Return ({formData.type === 'SIP' ? 'XIRR' : 'CAGR'})</p>
              <p className="text-2xl font-black text-white leading-none">{requiredReturn}% <span className="text-xs font-medium text-slate-500">p.a.</span></p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button 
              type="submit" 
              disabled={isLoading || isLimitReached || (formData.isMultiAsset && totalAllocation !== 100)} 
              className={`w-full md:w-auto flex items-center justify-center gap-4 px-12 py-6 font-black rounded-[2rem] shadow-2xl transition-all ${isLoading || isLimitReached || (formData.isMultiAsset && totalAllocation !== 100) ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'}`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <TrendingUp className="w-6 h-6" /> 
                  Build My Strategy
                </>
              )}
            </button>
            {isLimitReached && (
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mr-4">Upgrade Plan to Architect your wealth strategy</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PortfolioForm;