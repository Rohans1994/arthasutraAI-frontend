import React from 'react';
import { ExistingPortfolioAnalysis } from '../types';
import { 
  TrendingUp, 
  Globe, 
  Sparkles, 
  Target, 
  ShieldCheck, 
  Activity, 
  BarChart3, 
  FileDown, 
  Gauge, 
  Gem, 
  Zap, 
  ArrowRightLeft, 
  Loader2, 
  Coins, 
  Library 
} from 'lucide-react';

const ActionBadge: React.FC<{ action: string }> = ({ action }) => {
  const styles: Record<string, string> = {
    SELL: 'bg-rose-100 text-rose-700 border-rose-200',
    HOLD: 'bg-amber-100 text-amber-700 border-amber-200',
    ACCUMULATE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return (
    <span className={`px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tighter ${styles[action] || 'bg-slate-100 text-slate-600'}`}>
      {action === 'ACCUMULATE' ? 'BUY MORE' : action}
    </span>
  );
};

const SCORECARD_COLORS: Record<string, { bg: string, text: string, border: string, iconBg: string, hoverBorder: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', iconBg: 'bg-blue-600', hoverBorder: 'hover:border-blue-300' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', iconBg: 'bg-emerald-600', hoverBorder: 'hover:border-emerald-300' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', iconBg: 'bg-indigo-600', hoverBorder: 'hover:border-indigo-300' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', iconBg: 'bg-orange-600', hoverBorder: 'hover:border-orange-300' },
};

const ScorecardItem: React.FC<{ label: string; value: string; icon: React.ReactNode; color: string; isLoading?: boolean }> = ({ label, value, icon, color, isLoading }) => {
  const style = SCORECARD_COLORS[color] || SCORECARD_COLORS.blue;
  const isFinalValueReady = value && value.trim().length > 0;
  
  return (
    <div className={`p-4 rounded-2xl border bg-white shadow-sm flex items-center gap-4 group ${style.hoverBorder} transition-all ${(isLoading || !isFinalValueReady) ? 'animate-pulse' : ''}`}>
      <div className={`p-2.5 rounded-xl ${style.bg} ${style.text} group-hover:${style.iconBg} group-hover:text-white transition-colors`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        {(isLoading || !isFinalValueReady) ? (
          <div className="h-4 w-16 bg-slate-100 rounded mt-1" />
        ) : (
          <p className={`text-sm font-black text-slate-900`}>{value}</p>
        )}
      </div>
    </div>
  );
};

interface AnalysisResultProps {
  result: ExistingPortfolioAnalysis;
  isLoading?: boolean;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, isLoading }) => {
  const downloadCSV = () => {
    const headers = [
      'Ticker', 
      'Quantity', 
      'Buy Price', 
      'Current Price', 
      'Current Value', 
      'P/L Amount', 
      'P/L %', 
      'Action', 
      'Target Price', 
      'Metrics', 
      'Fundamental Analysis', 
      'Technical Analysis',
      'Score Performance', 
      'Score Profitability', 
      'Score Valuation', 
      'Score Growth', 
      'Red Flags'
    ];

    const rows = result.analysis.map(h => [
      h.ticker,
      h.quantity,
      h.buyPrice,
      h.currentPrice,
      h.currentValue,
      h.profitLoss.toFixed(2),
      h.profitLossPercentage.toFixed(2),
      h.action,
      h.targetPrice,
      h.keyMetrics.join('; '),
      h.fundamentalDeepDive.replace(/"/g, '""'),
      h.technicalDeepDive.replace(/"/g, '""'),
      h.scorecard.performance,
      h.scorecard.profitability,
      h.scorecard.valuation,
      h.scorecard.growth,
      h.scorecard.redFlags.join('; ')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ArthaSutra_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6">
      {/* Portfolio Summary Card */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                <Sparkles className={`w-8 h-8 text-blue-200 ${isLoading ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Strategy Intelligence</h3>
                <p className="text-blue-300 text-sm font-bold uppercase tracking-widest">
                  {isLoading ? 'AI Audit in Progress...' : 'AI Portfolio Diagnosis'}
                </p>
              </div>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                 <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                 <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
              </div>
            ) : (
              <p className="text-blue-50 leading-relaxed text-xl font-medium italic">
                "{result.portfolioSummary}"
              </p>
            )}
          </div>
          
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-sm">
                  <p className="text-[10px] font-black text-blue-300 uppercase mb-1">Proj. CAGR</p>
                  <p className="text-3xl font-black">{result.portfolioCagr}%</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-sm">
                  <p className="text-[10px] font-black text-blue-300 uppercase mb-1">Holdings</p>
                  <p className="text-3xl font-black">{result.analysis.length}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
               <button 
                  onClick={downloadCSV}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/10 border border-white/20 text-white font-black rounded-2xl shadow-xl hover:bg-white/20 transition-all text-xs disabled:opacity-50"
                >
                  <FileDown className="w-4 h-4" />
                  EXPORT CSV
                </button>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Recommendations List */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Ticker Audit & Deep Analysis</h3>
            <p className="text-xs font-bold text-blue-500 uppercase flex items-center gap-1.5 mt-1">
              <Globe className="w-3.5 h-3.5" /> Source: Investing.com, Screener.in, TradingView
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10">
          {result.analysis.map((holding, idx) => {
            const upside = holding.currentPrice > 0 ? ((holding.targetPrice - holding.currentPrice) / holding.currentPrice) * 100 : 0;
            const isHoldingReady = holding.fundamentalDeepDive && holding.fundamentalDeepDive.length > 5;
            const isEffectivelyLoading = isLoading || !isHoldingReady;

            const categoryIconMap: Record<string, React.ReactNode> = {
              'Global Portfolio Suggestion': <Globe className="w-4 h-4" />,
              'Debt Portfolio Suggestion': <Library className="w-4 h-4" />,
              'Gold Portfolio Suggestion': <Coins className="w-4 h-4" />,
              'Balanced Portfolio Suggestions (Domestic Equity)': <Sparkles className="w-4 h-4" />
            };

            return (
              <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden hover:border-blue-300 transition-all group">
                <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 md:gap-5 min-w-0">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors shrink-0 ${holding.action === 'SELL' ? 'bg-rose-600' : 'bg-slate-900 group-hover:bg-blue-600'}`}>
                      <span className="text-white font-black text-lg">{holding.ticker.substring(0, 2)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight break-words leading-tight">{holding.ticker}</h4>
                        <ActionBadge action={holding.action} />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {isEffectivelyLoading ? (
                          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                        ) : (
                          holding.keyMetrics.map((m, i) => (
                            <span key={i} className="text-[10px] font-black text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-lg border border-slate-200 uppercase whitespace-nowrap">
                              {m}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8 w-full md:w-auto border-t md:border-t-0 border-slate-200 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Current Price</p>
                      <p className="text-lg md:text-xl font-black text-slate-800">₹{holding.currentPrice.toLocaleString()}</p>
                    </div>
                    <div className="h-10 w-px bg-slate-200 hidden md:block" />
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-blue-500 uppercase mb-0.5">1Y Target</p>
                      <p className="text-lg md:text-xl font-black text-blue-600">₹{holding.targetPrice.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <ShieldCheck className="w-5 h-5 text-emerald-600" />
                       <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest">Fundamental Intelligence</h5>
                    </div>
                    <div className={`p-5 rounded-3xl relative overflow-hidden min-h-[120px] transition-all duration-500 ${isEffectivelyLoading ? 'bg-slate-50 border border-slate-200' : 'bg-emerald-50/30 border border-emerald-100'}`}>
                       {isEffectivelyLoading ? (
                         <div className="flex flex-col gap-3 animate-pulse">
                            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase">
                               <Loader2 className="w-3 h-3 animate-spin" /> Scanning Balance Sheets...
                            </div>
                            <div className="h-2.5 w-full bg-slate-200 rounded" />
                         </div>
                       ) : (
                         <p className="text-sm text-slate-700 leading-relaxed font-medium relative z-10 italic">
                           {holding.fundamentalDeepDive ? `"${holding.fundamentalDeepDive}"` : "Detailed data analysis fetching..."}
                         </p>
                       )}
                       <BarChart3 className="absolute -bottom-4 -right-4 w-16 h-16 text-emerald-500/5" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <Activity className="w-5 h-5 text-blue-600" />
                       <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest">Technical Intelligence</h5>
                    </div>
                    <div className={`p-5 rounded-3xl relative overflow-hidden min-h-[120px] transition-all duration-500 ${isEffectivelyLoading ? 'bg-slate-50 border border-slate-200' : 'bg-blue-50/30 border border-blue-100'}`}>
                       {isEffectivelyLoading ? (
                         <div className="flex flex-col gap-3 animate-pulse">
                            <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase">
                               <Loader2 className="w-3 h-3 animate-spin" /> Analyzing Price Momentum...
                            </div>
                            <div className="h-2.5 w-full bg-slate-200 rounded" />
                         </div>
                       ) : (
                         <p className="text-sm text-slate-700 leading-relaxed font-medium relative z-10 italic">
                           {holding.technicalDeepDive ? `"${holding.technicalDeepDive}"` : "Market momentum analysis fetching..."}
                         </p>
                       )}
                       <Activity className="absolute -bottom-4 -right-4 w-16 h-16 text-blue-500/5" />
                    </div>
                  </div>
                </div>

                {holding.action === 'SELL' && holding.alternativeRecommendation && (
                  <div className="px-6 md:px-8 pb-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="bg-indigo-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl border border-indigo-500">
                      <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                 <ArrowRightLeft className="w-5 h-5 text-indigo-100" />
                              </div>
                              <div>
                                 <h5 className="text-xs font-black uppercase tracking-widest">Capital Redeployment Suggestion</h5>
                              </div>
                           </div>
                           <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl w-fit">
                              {categoryIconMap[holding.alternativeRecommendation.category]}
                              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-50 truncate max-w-[200px]">
                                {holding.alternativeRecommendation.category}
                              </span>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                           <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                              <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <p className="text-[9px] font-black text-indigo-200 uppercase mb-1">Target Instrument</p>
                                    <h6 className="text-lg font-black">{holding.alternativeRecommendation.name}</h6>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-[9px] font-black text-indigo-200 uppercase mb-1">Expected Return</p>
                                    <p className="text-lg font-black text-emerald-300">{holding.alternativeRecommendation.projectedReturn}</p>
                                 </div>
                              </div>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-indigo-200 uppercase mb-1">Strategic Rationale</p>
                              <p className="text-xs text-indigo-50 leading-relaxed font-medium italic">"{holding.alternativeRecommendation.rationale}"</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="px-6 md:px-8 pb-8 space-y-6">
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                    <Gauge className="w-5 h-5 text-blue-800" />
                    <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest">Stock Scorecard</h5>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ScorecardItem label="Performance" value={holding.scorecard.performance} icon={<Activity className="w-5 h-5" />} color="blue" isLoading={isEffectivelyLoading} />
                    <ScorecardItem label="Profitability" value={holding.scorecard.profitability} icon={<Gem className="w-5 h-5" />} color="emerald" isLoading={isEffectivelyLoading} />
                    <ScorecardItem label="Valuation" value={holding.scorecard.valuation} icon={<Target className="w-5 h-5" />} color="indigo" isLoading={isEffectivelyLoading} />
                    <ScorecardItem label="Growth" value={holding.scorecard.growth} icon={<Zap className="w-5 h-5" />} color="orange" isLoading={isEffectivelyLoading} />
                  </div>
                </div>

                <div className="px-6 md:px-8 py-6 bg-slate-900 flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total P/L</p>
                      <p className={`text-lg font-black ${holding.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {holding.profitLoss >= 0 ? '+' : ''}₹{holding.profitLoss.toLocaleString()} ({holding.profitLossPercentage.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/10 px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                    <p className="text-[10px] font-black text-blue-300 uppercase leading-none">Upside Pot.</p>
                    <p className="text-xl font-black text-white leading-none">{upside.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;