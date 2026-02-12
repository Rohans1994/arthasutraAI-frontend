import React, { useState, useMemo } from 'react';
import { PortfolioResult, MarketCap, InvestmentInput } from '../types';
import StockCard from './StockCard';
import SectorDistribution from './SectorDistribution';
import { 
  TrendingUp, 
  Target, 
  IndianRupee, 
  PieChart, 
  Layers, 
  ArrowRight, 
  Info,
  ShieldCheck,
  Zap,
  Globe,
  Coins,
  Library,
  Wallet,
  Briefcase,
  Gem,
  LayoutGrid,
  Activity,
  Heart,
  Settings2,
  RefreshCw,
  X
} from 'lucide-react';

interface PortfolioResultsProps {
  result: PortfolioResult;
  onUpdateBasket?: (newCounts: { large: number, mid: number, small: number }) => void;
  isUpdating?: boolean;
  hideRefine?: boolean;
  isLimitReached?: boolean;
}

const PortfolioResults: React.FC<PortfolioResultsProps> = ({ result, onUpdateBasket, isUpdating, hideRefine = false, isLimitReached = false }) => {
  const totalCapital = result.investmentType === 'LUMPSUM' ? result.initialAmount : (result.monthlySip || 0);
  const formatCurrency = (val: number) => `₹${Math.round(val).toLocaleString('en-IN')}`;

  const [basketCounts, setBasketCounts] = useState({
    large: result.capCounts.large,
    mid: result.capCounts.mid,
    small: result.capCounts.small
  });

  const activeCount = basketCounts.large + basketCounts.mid + basketCounts.small;
  const isLimitExceeded = activeCount > 20;
  const hasChanges = basketCounts.large !== result.capCounts.large || 
                     basketCounts.mid !== result.capCounts.mid || 
                     basketCounts.small !== result.capCounts.small;

  const isUpdateDisabled = isLimitExceeded || activeCount === 0 || !hasChanges || isUpdating || isLimitReached;

  const handleUpdate = () => {
    if (onUpdateBasket) {
      onUpdateBasket(basketCounts);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Top Banner Summary */}
      <div className="bg-slate-900 rounded-[3rem] p-10 md:p-12 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-500/20">
              <Target className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tight">Architect Strategy</h2>
              <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mt-1">Engineered for {result.years} Year Horizon</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="p-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Strategy Auto-Saved to Vault</p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Target Corpus', val: formatCurrency(result.targetAmount), sub: 'Required Wealth Goal', color: 'text-blue-400' },
            { label: 'Projected Value', val: formatCurrency(result.projectedAmount), sub: 'Expected realization', color: 'text-emerald-400' },
            { label: 'Required CAGR', val: `${result.cagr}% p.a.`, sub: 'Return benchmark', color: 'text-orange-400' },
            { label: 'Risk Mandate', val: result.riskProfile.toUpperCase(), sub: 'Portfolio volatility', color: 'text-rose-400' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm group hover:bg-white/10 transition-colors">
              <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${stat.color}`}>{stat.label}</p>
              <p className="text-2xl font-black">{stat.val}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Refine Equity Basket UI - Conditionally Hidden */}
      {!hideRefine && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                    <Settings2 className="w-6 h-6 text-white" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Refine Equity Basket</h3>
                    <p className="text-xs font-bold text-slate-400">Customize ticker counts for market cap segments.</p>
                 </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-stretch gap-4 h-20">
                   <div className={`px-8 py-3 rounded-3xl flex flex-col items-center justify-center min-w-[140px] border transition-colors ${isLimitExceeded ? 'bg-rose-50 border-rose-100 shadow-sm' : 'bg-slate-900 border-slate-900 shadow-xl'}`}>
                      <p className={`text-[9px] font-black uppercase mb-1 ${isLimitExceeded ? 'text-rose-500' : 'text-slate-400'}`}>
                        {isLimitExceeded ? 'Limit Exceeded' : 'Active Count'}
                      </p>
                      <p className={`text-2xl font-black leading-none ${isLimitExceeded ? 'text-rose-600' : 'text-white'}`}>
                        {activeCount} <span className={`text-sm ${isLimitExceeded ? 'text-rose-400' : 'opacity-40'}`}>/ 20</span>
                      </p>
                   </div>
                   <button 
                    onClick={handleUpdate}
                    disabled={isUpdateDisabled}
                    className={`px-10 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all min-h-full ${isUpdateDisabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200'}`}
                   >
                      {isUpdating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      {isLimitReached ? 'Limit Reached' : 'Update Basket'}
                   </button>
                </div>
                {isLimitReached && (
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mr-4">Strategy slots full. Upgrade to unlock updates.</p>
                )}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { key: 'large', label: 'Large Cap', color: 'bg-blue-600' },
                { key: 'mid', label: 'Mid Cap', color: 'bg-emerald-600' },
                { key: 'small', label: 'Small Cap', color: 'bg-rose-600' }
              ].map((cap) => (
                <div key={cap.key} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${cap.color}`} />
                         <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{cap.label}</span>
                      </div>
                      <span className={`text-2xl font-black ${cap.key === 'small' ? 'text-rose-600' : cap.key === 'mid' ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {basketCounts[cap.key as keyof typeof basketCounts]}
                      </span>
                   </div>
                   <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    step="1"
                    value={basketCounts[cap.key as keyof typeof basketCounts]}
                    onChange={(e) => setBasketCounts({ ...basketCounts, [cap.key]: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-800"
                   />
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Conditional Multi-Asset Row */}
      {result.isMultiAsset && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Asset Class Mix</h3>
              <span className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-400 uppercase rounded-full">Portfolio Assets</span>
            </div>
            <SectorDistribution data={result.assetClassDistribution} title="" label="" />
          </div>
          <div className="lg:col-span-8 space-y-8">
            {result.mutualFunds.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 rounded-xl"><Library className="w-6 h-6 text-indigo-700" /></div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Mutual Fund Picks</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.mutualFunds.map((mf, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-400 transition-all group shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-2">
                            <Library className="w-4 h-4 text-indigo-400" />
                            <h4 className="font-black text-slate-900 uppercase text-sm leading-tight max-w-[140px]">{mf.name}</h4>
                          </div>
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[8px] font-black uppercase tracking-widest">{mf.category}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-slate-50 p-3 rounded-2xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Alloc.</p>
                            <p className="text-sm font-black text-slate-900">{mf.allocation}% <span className="text-blue-600 text-[10px]">₹{Math.round(totalCapital * (mf.allocation / 100)).toLocaleString()}</span></p>
                          </div>
                          <div className="bg-emerald-50 p-3 rounded-2xl">
                            <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">Exp. Ret.</p>
                            <p className="text-sm font-black text-emerald-600">{mf.expectedReturn}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium italic border-l-2 border-slate-100 pl-3">"{mf.rationale}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.otherAssets.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-50 rounded-xl"><Gem className="w-6 h-6 text-amber-600" /></div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Diversification Assets</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.otherAssets.map((asset, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-amber-400 transition-all shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <h4 className="font-black text-slate-900 uppercase text-sm leading-tight">{asset.name}</h4>
                        </div>
                        <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded text-[8px] font-black uppercase tracking-widest">{asset.type}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 p-3 rounded-2xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Alloc.</p>
                          <p className="text-sm font-black text-slate-900">{asset.allocation}% <span className="text-blue-600 text-[10px]">₹{Math.round(totalCapital * (asset.allocation / 100)).toLocaleString()}</span></p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-2xl">
                          <p className="text-[9px] font-black text-blue-400 uppercase mb-1">Proj. Ret.</p>
                          <p className="text-sm font-black text-blue-600">{asset.projectedReturn}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium italic border-l-2 border-slate-100 pl-3">"{asset.rationale}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sector Allocation and Direct Equity Basket - SIDE BY SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Sector Allocation Pie */}
        <div className="lg:col-span-4 space-y-8 h-full">
           <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm h-fit">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Sector Allocation</h3>
                 <span className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-400 uppercase rounded-full">Equity Breakdown</span>
              </div>
              <SectorDistribution data={result.sectorDistribution} title="" label="" />
           </div>
           
           <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-200 flex items-start gap-6">
             <Info className="w-8 h-8 text-slate-400 shrink-0" />
             <div className="space-y-2">
               <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Strategy Insight</p>
               <p className="text-xs text-slate-600 leading-relaxed font-medium">
                 Your architecture is built to realize <span className="font-black text-slate-900">{result.cagr}% CAGR</span>. The sector weights are optimized for momentum and fundamental safety.
               </p>
             </div>
           </div>
        </div>

        {/* Right Column: Direct Equity Basket Cards */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl"><Briefcase className="w-6 h-6 text-blue-800" /></div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Direct Equity Basket</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.stocks.map((stock, idx) => (
              <StockCard key={idx} stock={stock} totalCapital={totalCapital} />
            ))}
          </div>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-white/10 flex items-start gap-6 text-white shadow-xl">
        <ShieldCheck className="w-8 h-8 text-blue-400 shrink-0" />
        <div className="space-y-2">
          <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em]">Institutional Risk Notice</p>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            This architecture is dynamically built using Nifty 100 liquidity pools. Allocations are calculated based on your required CAGR of <span className="font-black text-white">{result.cagr}%</span>. Equity markets involve risk; quarterly rebalancing is mandatory for strategy efficacy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioResults;