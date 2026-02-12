import React, { useState } from 'react';
import { PortfolioResult, RiskProfile, SavedRebalancerStrategy, SavedAuditReport, AssetSuggestion } from '../types';
import { 
  Trash2, 
  Eye, 
  Calendar, 
  TrendingUp, 
  Target, 
  Layers, 
  ArrowRight, 
  RefreshCw, 
  IndianRupee, 
  Activity, 
  X, 
  ShieldCheck, 
  ShieldAlert,
  Globe, 
  BookOpen,
  ArrowRightLeft,
  Scale,
  Library,
  Coins,
  ChevronRight,
  PieChart,
  Gauge,
  LayoutGrid,
  Sparkles
} from 'lucide-react';
import AnalysisResult from './AnalysisResult';
import PortfolioResults from './PortfolioResults';

interface PlansPageProps {
  plans: PortfolioResult[];
  rebalancerStrategies: SavedRebalancerStrategy[];
  auditReports: SavedAuditReport[];
  architectLimit: number;
  rebalancerLimit: number;
  auditLimit: number;
  onDelete: (id: string) => void;
  onDeleteRebalancer: (id: string) => void;
  onDeleteAudit: (id: string) => void;
  onView: (plan: PortfolioResult) => void;
  onViewRebalancer: (strat: SavedRebalancerStrategy) => void;
  onViewAudit: (audit: SavedAuditReport) => void;
  onUpgrade: () => void;
}

const TextToList = ({ text, dotColor = "bg-blue-400" }: { text?: string, dotColor?: string }) => {
  if (!text) return <p className="text-xs text-slate-400 italic">No logic captured.</p>;

  const items = text
    .split(/(?<=[.!?])\s+|[;\n]/)
    .map(s => s.trim().replace(/^["'•\-*]\s*|\s*["']$/g, ''))
    .filter(s => s.length > 5);

  if (items.length === 0) return <p className="text-xs text-slate-500 italic">{text}</p>;

  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-xs leading-relaxed items-start text-slate-600 font-medium">
          <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};

const SuggestionGrid = ({ title, icon, data, colorClass = "blue" }: { title: string, icon: React.ReactNode, data: AssetSuggestion[], colorClass?: string }) => {
  if (!data || data.length === 0) return null;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={`p-3 bg-${colorClass}-50 rounded-xl`}>{icon}</div>
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-blue-400 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <h4 className="font-black text-slate-900 uppercase text-sm">{item.name}</h4>
              </div>
              {item.ticker && (
                <span className="px-2 py-1 bg-slate-50 text-slate-700 rounded text-[9px] font-black uppercase">{item.ticker}</span>
              )}
            </div>
            <div className="bg-slate-50 p-4 rounded-xl mb-4">
               <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Expected Return</p>
               <p className="text-lg font-black text-slate-800">{item.expectedReturn}</p>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed italic border-l-2 border-blue-100 pl-3">"{item.rationale}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlansPage: React.FC<PlansPageProps> = ({ 
  plans, 
  rebalancerStrategies, 
  auditReports,
  architectLimit,
  rebalancerLimit,
  auditLimit,
  onDelete, 
  onDeleteRebalancer, 
  onDeleteAudit,
  onView, 
  onViewRebalancer,
  onViewAudit,
  onUpgrade
}) => {
  const [activeTab, setActiveTab] = useState<'architect' | 'rebalancer' | 'audit'>('architect');
  const [selectedStrategy, setSelectedStrategy] = useState<SavedRebalancerStrategy | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<SavedAuditReport | null>(null);
  const [selectedArchitect, setSelectedArchitect] = useState<PortfolioResult | null>(null);

  const isEmpty = (activeTab === 'architect' && plans.length === 0) || 
                  (activeTab === 'rebalancer' && rebalancerStrategies.length === 0) ||
                  (activeTab === 'audit' && auditReports.length === 0);

  // Calculate values for rebalancer modal actions
  const totalIncreaseGap = selectedStrategy?.analysis.actions
    .filter(a => a.action === 'Increase')
    .reduce((sum, a) => sum + (a.gapAmount || 0), 0) || 0;

  // Helper to check if an asset class needs to be increased
  const needsIncrease = (assetKey: string) => {
    if (!selectedStrategy) return false;
    return selectedStrategy.analysis.actions.some(a => a.asset === assetKey && a.action === 'Increase');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Strategy Vault</h2>
          <p className="text-slate-500 font-medium mt-1">Access your curated architectures and portfolio audits.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto overflow-x-auto max-w-full">
          <button 
            onClick={() => setActiveTab('architect')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase whitespace-nowrap ${activeTab === 'architect' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Target className="w-4 h-4" /> Architect
          </button>
          <button 
            onClick={() => setActiveTab('rebalancer')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase whitespace-nowrap ${activeTab === 'rebalancer' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <RefreshCw className="w-4 h-4" /> Rebalancer
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase whitespace-nowrap ${activeTab === 'audit' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Activity className="w-4 h-4" /> Diagnosis
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            {activeTab === 'architect' ? <Target className="w-10 h-10 text-slate-300" /> : activeTab === 'rebalancer' ? <RefreshCw className="w-10 h-10 text-slate-300" /> : <Activity className="w-10 h-10 text-slate-300" />}
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">No Saved {activeTab === 'architect' ? 'Strategies' : activeTab === 'rebalancer' ? 'Audits' : 'Diagnostic Reports'}</h2>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto">
            {activeTab === 'architect' 
              ? 'Use the Investment Architect to generate and save your first portfolio strategy.' 
              : activeTab === 'rebalancer'
              ? 'Complete a Rebalancer analysis to save your portfolio rebalancing audit.'
              : 'Perform a Portfolio Audit to save your detailed diagnostic health-check reports.'}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between px-4">
             <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
               {activeTab === 'architect' ? 'My Investment Strategies' : activeTab === 'rebalancer' ? 'My Rebalancer Strategies' : 'Portfolio Health Reports'}
             </h3>
             <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
               {activeTab === 'architect' ? `${plans.length} / ${architectLimit}` : activeTab === 'rebalancer' ? `${rebalancerStrategies.length} / ${rebalancerLimit}` : `${auditReports.length} / ${auditLimit}`} Plan Limit
             </span>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Saved</th>
                    {activeTab === 'architect' ? (
                      <>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Capital</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Goal</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">CAGR</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Holdings</th>
                      </>
                    ) : activeTab === 'rebalancer' ? (
                      <>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Portfolio AUM</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Profile</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Status</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</th>
                      </>
                    ) : (
                      <>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invested Amount</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Value</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">CAGR</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Horizon</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Required</th>
                      </>
                    )}
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeTab === 'architect' && plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="text-sm font-bold text-slate-700">
                            {new Date(plan.timestamp!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-slate-900">₹{plan.initialAmount.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-lg font-black text-slate-900">₹{plan.targetAmount.toLocaleString('en-IN')}</span>
                        <p className="text-[10px] font-bold text-slate-400">in {plan.years} Years</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm font-black">{plan.cagr}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-bold text-slate-600">{plan.stocks.length} Tickers</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setSelectedArchitect(plan)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Eye className="w-5 h-5" /></button>
                          <button onClick={() => onDelete(plan.id!)} className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'rebalancer' && rebalancerStrategies.map((strat) => (
                    <tr key={strat.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                          </div>
                          <span className="text-sm font-bold text-slate-700">
                            {new Date(strat.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6"><span className="text-sm font-black text-slate-900">₹{Math.round(strat.analysis.totalValue).toLocaleString('en-IN')}</span></td>
                      <td className="px-8 py-6"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[9px] font-black uppercase tracking-widest border border-blue-100">Strategic</span></td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <Activity className={`w-4 h-4 ${strat.analysis.requiresRebalancing ? 'text-rose-500' : 'text-emerald-500'}`} />
                           <span className="text-xs font-bold text-slate-600">{strat.analysis.requiresRebalancing ? 'Action Required' : 'Balanced'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6"><span className="text-sm font-black text-slate-900">Age {strat.input.age}</span></td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setSelectedStrategy(strat)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Eye className="w-5 h-5" /></button>
                          <button onClick={() => onDeleteRebalancer(strat.id)} className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'audit' && auditReports.map((audit) => (
                    <tr key={audit.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                          </div>
                          <span className="text-sm font-bold text-slate-700">
                            {new Date(audit.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6"><span className="text-sm font-black text-slate-900">₹{Math.round(audit.result.totalInvested).toLocaleString('en-IN')}</span></td>
                      <td className="px-8 py-6"><span className="text-sm font-black text-blue-600">₹{Math.round(audit.result.currentValue).toLocaleString('en-IN')}</span></td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-1.5 text-emerald-600 font-black">
                            <TrendingUp className="w-4 h-4" /> {audit.result.portfolioCagr}%
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-sm font-bold text-slate-700">{audit.result.years} Years</span>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-xs font-bold text-slate-600">{audit.result.analysis.filter(h => h.action === 'SELL').length} Exits Needed</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setSelectedAudit(audit)} className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Eye className="w-5 h-5" /></button>
                          <button onClick={() => onDeleteAudit(audit.id)} className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Architect Detail Modal */}
      {selectedArchitect && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-slate-50 rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-300 custom-scrollbar">
            <div className="bg-slate-900 p-6 md:p-12 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 sticky top-0 z-20 relative">
               <div className="flex items-start md:items-center gap-4 md:gap-6 pr-10 md:pr-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shrink-0">
                     <Target className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="min-w-0">
                     <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                        <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight break-words">
                           Architect Report: ₹{selectedArchitect.investmentType === 'SIP' ? (selectedArchitect.monthlySip?.toLocaleString('en-IN') || '0') : (selectedArchitect.initialAmount?.toLocaleString('en-IN') || '0')}
                        </h3>
                        <span className="w-fit px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-200">
                           {selectedArchitect.investmentType}
                        </span>
                     </div>
                     <p className="text-blue-300 text-xs md:text-sm font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" /> {new Date(selectedArchitect.timestamp!).toLocaleDateString(undefined, { dateStyle: 'full' })}
                     </p>
                  </div>
               </div>
               <button onClick={() => setSelectedArchitect(null)} className="absolute top-6 right-6 md:static p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"><X className="w-5 h-5 md:w-6 md:h-6" /></button>
            </div>

            <div className="p-8 md:p-12">
               <PortfolioResults result={selectedArchitect} hideRefine={true} />
               <div className="flex justify-center pt-10 pb-4">
                 <button 
                  onClick={() => setSelectedArchitect(null)} 
                  className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                 >
                   Close Report View
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Diagnosis Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-slate-50 rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-300 custom-scrollbar">
            <div className="bg-slate-900 p-6 md:p-12 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 sticky top-0 z-20 relative">
               <div className="flex items-start md:items-center gap-4 md:gap-6 pr-10 md:pr-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shrink-0">
                     <Activity className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="min-w-0">
                     <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight break-words">Diagnosis Report</h3>
                     <p className="text-emerald-300 text-xs md:text-sm font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" /> {new Date(selectedAudit.timestamp).toLocaleDateString(undefined, { dateStyle: 'full' })}
                     </p>
                  </div>
               </div>
               <button onClick={() => setSelectedAudit(null)} className="absolute top-6 right-6 md:static p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"><X className="w-5 h-5 md:w-6 md:h-6" /></button>
            </div>

            <div className="p-8 md:p-12">
               <AnalysisResult result={selectedAudit.result} />
               <div className="flex justify-center pt-10 pb-4">
                 <button 
                  onClick={() => setSelectedAudit(null)} 
                  className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                 >
                   Close Diagnosis Report
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Rebalancer Detail Modal */}
      {selectedStrategy && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-slate-50 rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-300 custom-scrollbar">
            <div className="bg-slate-900 p-6 md:p-12 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 sticky top-0 z-20 relative">
               <div className="flex items-start md:items-center gap-4 md:gap-6 pr-10 md:pr-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shrink-0">
                     <RefreshCw className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="min-w-0">
                     <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight break-words">Rebalancer Report: Age {selectedStrategy.input.age}</h3>
                     <p className="text-blue-300 text-xs md:text-sm font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" /> {new Date(selectedStrategy.timestamp).toLocaleDateString(undefined, { dateStyle: 'full' })}
                     </p>
                  </div>
               </div>
               <button onClick={() => setSelectedStrategy(null)} className="absolute top-6 right-6 md:static p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"><X className="w-5 h-5 md:w-6 md:h-6" /></button>
            </div>

            <div className="p-8 md:p-12 space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                     <div className={`p-3 rounded-xl ${selectedStrategy.analysis.requiresRebalancing ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{selectedStrategy.analysis.requiresRebalancing ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}</div>
                     <div><p className="text-[10px] font-black text-slate-400 uppercase">Rebalance Status</p><p className={`text-lg font-black ${selectedStrategy.analysis.requiresRebalancing ? 'text-rose-600' : 'text-emerald-600'}`}>{selectedStrategy.analysis.requiresRebalancing ? 'Action Required' : 'Optimally Balanced'}</p></div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                     <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Globe className="w-6 h-6" /></div>
                     <div><p className="text-[10px] font-black text-slate-400 uppercase">Market Regime</p><p className="text-lg font-black text-slate-800">{selectedStrategy.analysis.marketRegimes.india}</p></div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                     <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><Target className="w-6 h-6" /></div>
                     <div><p className="text-[10px] font-black text-slate-400 uppercase">Strategic Goal</p><p className="text-lg font-black text-slate-800">₹{selectedStrategy.input.targetCorpus.toLocaleString('en-IN')}</p></div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Financial Alignment Card */}
                  <div className="bg-blue-50/40 p-8 rounded-[2.5rem] border border-blue-100 shadow-sm space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                        <Target className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest">Financial Alignment</h4>
                    </div>
                    <TextToList text={selectedStrategy.aiRationale?.objective || ""} dotColor="bg-blue-600" />
                  </div>

                  {/* Execution Logic Card */}
                  <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-[2.5rem] shadow-sm space-y-5">
                    <div className="flex items-center gap-3">
                       <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                          <Activity className="w-5 h-5" />
                       </div>
                       <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest">Execution Intelligence</h4>
                    </div>
                    <TextToList text={selectedStrategy.aiRationale?.executionLogic || ""} dotColor="bg-indigo-600" />
                  </div>
               </div>

               <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-100 flex items-center gap-4"><div className="p-3 bg-slate-900 rounded-xl"><Scale className="w-6 h-6 text-white" /></div><div><h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Allocation Decisions</h4></div></div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Class</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deviation</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Target Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedStrategy.analysis.actions.map((action, idx) => {
                          const deviation = selectedStrategy.analysis.deviations[action.asset] || 0;
                          let monthlyAmount = action.action === 'Increase' && totalIncreaseGap > 0 
                            ? (action.gapAmount / totalIncreaseGap) * selectedStrategy.input.monthlySurplus 
                            : action.action === 'Decrease' 
                            ? action.gapAmount / 12 
                            : 0;

                          return (
                           <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-8 py-6"><span className="text-sm font-black text-slate-900 uppercase">{action.asset.replace(/([A-Z])/g, ' $1')}</span></td>
                             <td className="px-8 py-6"><span className={`text-sm font-bold ${deviation > 0 ? 'text-rose-600' : deviation < 0 ? 'text-emerald-600' : 'text-slate-500'}`}>{deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%</span></td>
                             <td className="px-8 py-6"><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${action.action === 'Increase' ? 'bg-emerald-100 text-emerald-700' : action.action === 'Decrease' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{action.action}</span></td>
                             <td className="px-8 py-6 text-right">
                               <div className="flex flex-col items-end">
                                 <span className="text-xs font-bold text-slate-500">{action.method}</span>
                                 <span className="text-[10px] font-black text-slate-900 uppercase mt-0.5">₹{Math.round(action.gapAmount).toLocaleString('en-IN')} (Target Gap)</span>
                                 {monthlyAmount > 0 && (
                                   <span className="text-[10px] font-black text-blue-600 uppercase mt-0.5">₹{Math.round(monthlyAmount).toLocaleString('en-IN')} / mo</span>
                                 )}
                               </div>
                             </td>
                           </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
               </div>

               {/* Suggestions Section - Only show sections that need an 'Increase' as per allocation decisions */}
               <div className="space-y-12">
                  {needsIncrease('indianEquity') && (
                    <SuggestionGrid 
                      title="Indian Equity Suggestions" 
                      icon={<Sparkles className="w-6 h-6 text-emerald-800" />} 
                      data={selectedStrategy.aiRationale?.assetSuggestions || []} 
                      colorClass="emerald" 
                    />
                  )}
                  {needsIncrease('globalEquity') && (
                    <SuggestionGrid 
                      title="Global Equity Suggestions" 
                      icon={<Globe className="w-6 h-6 text-blue-600" />} 
                      data={selectedStrategy.aiRationale?.globalSuggestions || []} 
                      colorClass="blue" 
                    />
                  )}
                  {needsIncrease('debt') && (
                    <SuggestionGrid 
                      title="Debt Suggestions" 
                      icon={<Library className="w-6 h-6 text-indigo-600" />} 
                      data={selectedStrategy.aiRationale?.debtSuggestions || []} 
                      colorClass="indigo" 
                    />
                  )}
                  {needsIncrease('gold') && (
                    <SuggestionGrid 
                      title="Gold Suggestions" 
                      icon={<Coins className="w-6 h-6 text-amber-600" />} 
                      data={selectedStrategy.aiRationale?.goldSuggestions || []} 
                      colorClass="amber" 
                    />
                  )}
               </div>

               {selectedStrategy.analysis.stockAudit && (
                 <div className="space-y-10">
                    <div className="flex items-center gap-3">
                       <div className="p-3 bg-blue-100 rounded-xl"><LayoutGrid className="w-6 h-6 text-blue-800" /></div>
                       <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Holdings Level Audit</h3>
                    </div>
                    <AnalysisResult result={selectedStrategy.analysis.stockAudit} />
                 </div>
               )}

               <div className="flex justify-center pt-6 pb-4"><button onClick={() => setSelectedStrategy(null)} className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95">Close Strategy Report</button></div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-700 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-blue-200 overflow-hidden relative">
        <div className="relative z-10 space-y-2">
          <h3 className="text-2xl font-black tracking-tight uppercase">Upgrade Your Financial Intelligence</h3>
          <p className="text-blue-100 text-sm font-medium max-w-xl">Premium users get unlimited vault space, advanced multi-asset correlation matrices, and daily automated rebalancing alerts via email.</p>
        </div>
        <button 
          onClick={onUpgrade}
          className="relative z-10 px-10 py-5 bg-white text-blue-700 font-black rounded-2xl text-sm flex items-center gap-3 hover:bg-blue-50 transition-all shadow-lg active:scale-95 shrink-0"
        >
          Unlock Full Suite <ArrowRight className="w-5 h-5" />
        </button>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>
    </div>
  );
};

export default PlansPage;