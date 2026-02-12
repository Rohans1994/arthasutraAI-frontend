import React, { useState, useMemo, useEffect, useRef } from 'react';
import { RebalancerInput, RebalancerAnalysis, RebalancerRationale, YearlyExpense, UserHolding, AssetSuggestion, ExistingPortfolioAnalysis } from '../types';
import { generateRebalancerExplanation, fetchMarketSignals, analyzeExistingPortfolio } from '../services/geminiService';
import { auth, syncPortfolioToFirestore } from '../services/firebase';
import AnalysisResult from './AnalysisResult';
import { 
  RefreshCcw, 
  Target, 
  Wallet, 
  TrendingUp, 
  ShieldAlert, 
  ArrowRight, 
  Info,
  CheckCircle2, 
  AlertTriangle,
  PieChart,
  Activity,
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  BarChart4,
  Flame,
  Globe,
  IndianRupee,
  Coins,
  Loader2,
  Search,
  MessageSquare,
  ShieldCheck,
  Scale,
  BookOpen,
  History,
  Timer,
  Calendar,
  Edit3,
  Upload,
  AlertCircle,
  LayoutGrid,
  Shield as ShieldIcon,
  Library,
  Briefcase,
  X,
  Scale as ScaleIcon,
  Clock,
  ArrowUpRight,
  TrendingUp as TrendingUpIcon,
  CheckCircle,
  GanttChartSquare,
  CheckCircle2 as CheckIcon,
  Copy,
  Check,
  Save
} from 'lucide-react';

const AGE_GUIDES = [
  {
    range: [20, 30],
    phase: "Aggressive Growth",
    focus: "Wealth creation, volatility acceptable",
    allocation: { indianEquity: "60–65", globalEquity: "20–25", debt: "5–10", gold: "5" },
    rules: ["Equity heavy", "SIP discipline critical", "Ignore short-term market noise"],
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-100"
  },
  {
    range: [30, 35],
    phase: "Structured Growth",
    focus: "Growth + responsibility balancing",
    allocation: { indianEquity: "55–60", globalEquity: "20–25", debt: "10–15", gold: "5–7" },
    rules: ["Slight risk moderation", "Emergency fund mandatory", "Global equity becomes important"],
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-100"
  },
  {
    range: [35, 45],
    phase: "Balanced Expansion",
    focus: "Capital growth + protection",
    allocation: { indianEquity: "45–50", globalEquity: "20–25", debt: "20–25", gold: "5–10" },
    rules: ["Lower drawdown risk", "Rebalancing discipline crucial", "Debt begins to matter"],
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100"
  },
  {
    range: [45, 55],
    phase: "Capital Preservation",
    focus: "Protect corpus, reduce volatility",
    allocation: { indianEquity: "35–40", globalEquity: "15–20", debt: "30–35", gold: "7–10" },
    rules: ["Equity risk gradually reduced", "Income stability prioritized"],
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100"
  },
  {
    range: [55, 60],
    phase: "Pre-Retirement",
    focus: "Income predictability",
    allocation: { indianEquity: "25–30", globalEquity: "10–15", debt: "40–45", gold: "8–10" },
    rules: ["Avoid large drawdowns", "Liquidity planning critical"],
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-100"
  },
  {
    range: [60, 100],
    phase: "Retirement Phase",
    focus: "Capital safety + income",
    allocation: { indianEquity: "15–20", globalEquity: "5–10", debt: "50–55", gold: "10" },
    rules: ["Equity only for inflation protection", "Capital safety is priority"],
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100"
  }
];

const INITIAL_INPUT: RebalancerInput = {
  age: 30,
  targetCorpus: 50000000,
  retirementAge: 50,
  monthlySurplus: 50000,
  expenses: {
    year1: { active: false, amount: 0, event: '' },
    year2: { active: false, amount: 0, event: '' },
    year3: { active: false, amount: 0, event: '' }
  },
  targetAllocation: {
    indianEquity: 50,
    globalEquity: 20,
    debt: 20,
    gold: 10
  },
  currentPortfolio: {
    indianEquity: 1000000,
    globalEquity: 300000,
    debt: 500000,
    gold: 200000
  },
  marketSignals: {
    niftyPe: 22.5,
    marketPhase: 'Bull',
    rbiStance: 'Neutral',
    indiaInflation: 'Stable',
    sp500ForwardPe: 18.5,
    fedStance: 'Neutral',
    dollarIndex: 'Stable'
  }
};

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

const TextToList = ({ text, dotColor = "bg-blue-400", isLoading }: { text?: string, dotColor?: string, isLoading?: boolean }) => {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="flex gap-3">
           <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
           <div className="h-3 w-full bg-slate-200/50 rounded" />
        </div>
        <div className="flex gap-3">
           <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
           <div className="h-3 w-5/6 bg-slate-200/50 rounded" />
        </div>
        <div className="flex gap-3">
           <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
           <div className="h-3 w-4/6 bg-slate-200/50 rounded" />
        </div>
      </div>
    );
  }

  if (!text) return <p className="text-xs text-slate-400 italic">Formulating intelligence...</p>;

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

interface PortfolioRebalancerProps {
  onSave?: (input: RebalancerInput, analysis: RebalancerAnalysis, aiRationale: RebalancerRationale | null) => void;
  savedCount?: number;
  isLimitReached?: boolean;
}

const PortfolioRebalancer: React.FC<PortfolioRebalancerProps> = ({ onSave, savedCount = 0, isLimitReached = false }) => {
  const [step, setStep] = useState(1);
  const [input, setInput] = useState<RebalancerInput>(INITIAL_INPUT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<RebalancerAnalysis | null>(null);
  const [aiRationale, setAiRationale] = useState<RebalancerRationale | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopyRules = () => {
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;
    navigator.clipboard.writeText(rules);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateExpense = (year: keyof typeof input.expenses, field: keyof YearlyExpense, value: any) => {
    setInput(prev => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        [year]: {
          ...prev.expenses[year],
          [field]: value
        }
      }
    }));
  };

  const totalValueRaw = useMemo(() => {
    return Object.values(input.currentPortfolio).reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0);
  }, [input.currentPortfolio]);

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setPermissionError(false);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        const rows = content.split('\n')
          .map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')))
          .filter(row => row.length > 1);
        
        if (rows.length < 2) throw new Error("CSV file is empty or invalid.");

        const headers = rows[0].map(h => h.toLowerCase());
        const typeIdx = headers.findIndex(h => h.includes('type') || h.includes('class') || h.includes('category'));
        const valueIdx = headers.findIndex(h => h.includes('value') || h.includes('amount') || h.includes('market value') || h.includes('current val'));
        const tickerIdx = headers.findIndex(h => h.includes('ticker') || h.includes('symbol') || h.includes('instrument'));
        const qtyIdx = headers.findIndex(h => h.includes('qty') || h.includes('quantity'));
        
        const buyPriceIdx = headers.findIndex(h => 
          h === 'avg. cost' || h === 'average cost price' || h.includes('avg price') || 
          h.includes('buy price') || h.includes('purchase price')
        );
        const ltpIdx = headers.findIndex(h => 
          h === 'ltp' || h === 'current price' || h.includes('last price') || 
          h.includes('market price') || h.includes('cmp')
        );

        const newPortfolio = { indianEquity: 0, globalEquity: 0, debt: 0, gold: 0 };
        const holdings: UserHolding[] = [];
        let extractedAny = false;

        rows.slice(1).forEach(row => {
          let rowValue = 0;
          let ticker = tickerIdx !== -1 ? row[tickerIdx]?.toUpperCase() || '' : '';
          
          if (valueIdx !== -1 && row[valueIdx]) {
            rowValue = parseFloat(row[valueIdx].replace(/[^0-9.]/g, '')) || 0;
          } else if (qtyIdx !== -1 && (ltpIdx !== -1 || buyPriceIdx !== -1)) {
            const qty = parseFloat(row[qtyIdx]?.replace(/[^0-9.]/g, '')) || 0;
            const price = parseFloat(row[ltpIdx !== -1 ? ltpIdx : buyPriceIdx]?.replace(/[^0-9.]/g, '')) || 0;
            rowValue = qty * price;
          }

          if (rowValue > 0) {
            extractedAny = true;
            const type = typeIdx !== -1 ? row[typeIdx]?.toLowerCase() || '' : '';
            if (type.includes('global') || type.includes('us') || type.includes('nasdaq')) {
              newPortfolio.globalEquity += rowValue;
            } else if (type.includes('debt') || type.includes('fixed') || type.includes('fd') || type.includes('bond') || type.includes('ppf')) {
              newPortfolio.debt += rowValue;
            } else if (type.includes('gold') || type.includes('sgb') || type.includes('silver') || type.includes('commodity')) {
              newPortfolio.gold += rowValue;
            } else {
              newPortfolio.indianEquity += rowValue;
              if (ticker) {
                holdings.push({
                  ticker,
                  quantity: qtyIdx !== -1 ? parseFloat(row[qtyIdx]?.replace(/[^0-9.]/g, '')) || 1 : 1,
                  buyPrice: buyPriceIdx !== -1 ? parseFloat(row[buyPriceIdx]?.replace(/[^0-9.]/g, '')) || 0 : 0,
                  currentPrice: ltpIdx !== -1 ? parseFloat(row[ltpIdx]?.replace(/[^0-9.]/g, '')) : undefined,
                });
              }
            }
          }
        });

        if (!extractedAny) throw new Error("Could not parse numeric data from CSV.");
        
        // Update state
        setInput(prev => ({ 
          ...prev, 
          currentPortfolio: {
            indianEquity: Math.round(newPortfolio.indianEquity),
            globalEquity: Math.round(newPortfolio.globalEquity),
            debt: Math.round(newPortfolio.debt),
            gold: Math.round(newPortfolio.gold)
          }, 
          currentHoldings: holdings 
        }));

        // SYNC TO FIRESTORE
        if (auth.currentUser) {
          setIsSyncing(true);
          try {
            await syncPortfolioToFirestore(auth.currentUser.uid, holdings);
            setIsSyncing(false);
          } catch (syncErr: any) {
            setIsSyncing(false);
            if (syncErr.message?.includes('permission') || syncErr.code === 'permission-denied') {
              setPermissionError(true);
              setImportError("Sync failed: Database permission denied.");
            } else {
              setImportError(`Sync failed: ${syncErr.message}`);
            }
          }
        }

      } catch (err: any) {
        setImportError(err.message || "Failed to import CSV.");
        setIsSyncing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    // Step 1: Deterministic Math - Calculate gaps immediately for rapid UI feedback
    const baseTotalValue = Object.values(input.currentPortfolio).reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0) as number;
    const initialActions: any[] = [];
    const initialActualAllocation: Record<string, number> = {};
    const initialDeviations: Record<string, number> = {};

    Object.entries(input.targetAllocation).forEach(([asset, target]) => {
      const currentVal = (input.currentPortfolio as any)[asset] || 0;
      const actualAlloc = (currentVal / baseTotalValue) * 100;
      const dev = actualAlloc - (target as number);
      initialActualAllocation[asset] = actualAlloc;
      initialDeviations[asset] = dev;

      let action: any = 'Maintain';
      let method: any = 'Maintain';
      let timeframe: any = 'None';
      const gapAmount = Math.abs((target as number / 100) * baseTotalValue - currentVal);

      if (Math.abs(dev) > 5) {
        if (dev > 0) { action = 'Decrease'; method = 'Partial trim'; timeframe = 'Immediate'; }
        else { action = 'Increase'; method = 'SIP redirection'; timeframe = 'Immediate'; }
      }
      initialActions.push({ asset, action, method, timeframe, gapAmount });
    });

    // Create a placeholder stockAudit for immediate skeleton rendering
    let placeholderAudit: ExistingPortfolioAnalysis | undefined = undefined;
    if (input.currentHoldings && input.currentHoldings.length > 0) {
      placeholderAudit = {
        totalInvested: input.currentPortfolio.indianEquity,
        currentValue: input.currentPortfolio.indianEquity,
        totalProfitLoss: 0,
        projectedValue: input.currentPortfolio.indianEquity * 1.5,
        portfolioCagr: 12,
        portfolioSummary: "Initializing detailed AI research...",
        analysis: input.currentHoldings.map(h => ({
          ...h,
          currentPrice: h.currentPrice || h.buyPrice,
          currentValue: (h.currentPrice || h.buyPrice) * h.quantity,
          profitLoss: 0,
          profitLossPercentage: 0,
          action: 'HOLD',
          recommendationRationale: "Auditing fundamentals...",
          fundamentalDeepDive: "",
          technicalDeepDive: "",
          keyMetrics: [],
          projectedGrowth: 0,
          targetPrice: 0,
          scorecard: { performance: "", profitability: "", valuation: "", growth: "", redFlags: [] }
        })),
        years: 5
      };
    }

    const tempAnalysis: RebalancerAnalysis = {
      totalValue: baseTotalValue,
      actualAllocation: initialActualAllocation,
      deviations: initialDeviations,
      requiresRebalancing: Object.values(initialDeviations).some(d => Math.abs(Number(d) || 0) > 5),
      marketRegimes: { india: 'Fair', us: 'Fair' },
      actions: initialActions,
      stockAudit: placeholderAudit
    };

    setAnalysis(tempAnalysis);
    setStep(5);

    // Step 2: Parallel AI Auditing
    try {
      // Fetch live market signals
      const fetchedSignals = await fetchMarketSignals();
      
      // Perform holding-level deep audit if tickers are present
      let finalAuditResult = undefined;
      let auditedTotalValue = baseTotalValue;
      let auditedIndianEquityValue = input.currentPortfolio.indianEquity;

      if (input.currentHoldings && input.currentHoldings.length > 0) {
        // Updated call passing the currentPortfolio values to help prioritized replacement logic
        finalAuditResult = await analyzeExistingPortfolio(input.currentHoldings, 5, input.targetAllocation, input.currentPortfolio);
        auditedIndianEquityValue = Math.round(finalAuditResult.currentValue);
        auditedTotalValue = (baseTotalValue - input.currentPortfolio.indianEquity) + auditedIndianEquityValue;
      }

      // Final mathematical recalculation with live price audit
      const finalActualAllocation: Record<string, number> = {};
      const finalDeviations: Record<string, number> = {};
      const finalActions: any[] = [];

      Object.entries(input.targetAllocation).forEach(([asset, target]) => {
        const currentVal = asset === 'indianEquity' ? auditedIndianEquityValue : (input.currentPortfolio as any)[asset] || 0;
        const actualAlloc = (currentVal / auditedTotalValue) * 100;
        const dev = actualAlloc - (target as number);
        finalActualAllocation[asset] = actualAlloc;
        finalDeviations[asset] = dev;
        let action: any = 'Maintain';
        const gapAmount = Math.abs((target as number / 100) * auditedTotalValue - currentVal);
        if (Math.abs(dev) > 5) { action = dev > 0 ? 'Decrease' : 'Increase'; }
        finalActions.push({ 
          asset, 
          action, 
          method: action === 'Decrease' ? 'Partial trim' : action === 'Increase' ? 'SIP redirection' : 'Maintain',
          timeframe: action === 'Maintain' ? 'None' : 'Immediate',
          gapAmount 
        });
      });

      const finalAnalysis: RebalancerAnalysis = {
        totalValue: auditedTotalValue,
        actualAllocation: finalActualAllocation,
        deviations: finalDeviations,
        requiresRebalancing: Object.values(finalDeviations).some(d => Math.abs(Number(d) || 0) > 5),
        marketRegimes: {
          india: fetchedSignals.niftyPe > 22 ? 'Overvalued' : fetchedSignals.niftyPe < 17 ? 'Undervalued' : 'Fair',
          us: fetchedSignals.sp500ForwardPe > 20 ? 'Cautious' : fetchedSignals.sp500ForwardPe < 15 ? 'Attractive' : 'Fair'
        },
        actions: finalActions,
        stockAudit: finalAuditResult
      };

      const updatedInput = { ...input, marketSignals: fetchedSignals };
      const rationale = await generateRebalancerExplanation(updatedInput, finalAnalysis);
      
      setAnalysis(finalAnalysis);
      setAiRationale(rationale);

      // AUTOMATICALLY SAVE AFTER SUCCESSFUL AUDIT COMPLETION
      if (onSave) {
        onSave(updatedInput, finalAnalysis, rationale);
      }
    } catch (e) {
      console.error("Audit background processing failed", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" /> Goal Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Age</label>
            <input type="number" value={input.age} onChange={(e) => setInput({...input, age: Number(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Retirement Age</label>
            <input type="number" value={input.retirementAge} onChange={(e) => setInput({...input, retirementAge: Number(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Corpus (₹)</label>
            <input type="number" value={input.targetCorpus} onChange={(e) => setInput({...input, targetCorpus: Number(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold" />
            {input.targetCorpus > 0 && <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2 animate-in fade-in slide-in-from-top-1">{toIndianWords(input.targetCorpus)}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Surplus (₹)</label>
            <input type="number" value={input.monthlySurplus} onChange={(e) => setInput({...input, monthlySurplus: Number(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold" />
            {input.monthlySurplus > 0 && <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2 animate-in fade-in slide-in-from-top-1">{toIndianWords(input.monthlySurplus)}</p>}
          </div>
        </div>
        <div className="mt-12 space-y-6">
           <div className="flex items-center gap-2 mb-2"><ShieldAlert className="w-5 h-5 text-rose-600" /><h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Near-Term Major Expenses</h4></div>
           <div className="grid grid-cols-1 gap-4">
              {(['year1', 'year2', 'year3'] as const).map((y, idx) => (
                <div key={y} className={`p-6 rounded-[2rem] border transition-all ${input.expenses[y].active ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl font-black text-xs ${input.expenses[y].active ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-500'}`}>T+{idx + 1}Y</div>
                      <div><p className="text-sm font-black text-slate-800 uppercase leading-none">In the coming {idx + 1} year(s)?</p><p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Expense realization window</p></div>
                    </div>
                    <div className="flex bg-white/50 p-1 rounded-xl">
                       <button onClick={() => updateExpense(y, 'active', true)} className={`px-6 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${input.expenses[y].active ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500'}`}>Yes</button>
                       <button onClick={() => updateExpense(y, 'active', false)} className={`px-6 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${!input.expenses[y].active ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500'}`}>No</button>
                    </div>
                  </div>
                  {input.expenses[y].active && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-rose-600 uppercase tracking-widest ml-1">Estimate Amount (₹)</label>
                          <input type="number" value={input.expenses[y].amount} onChange={(e) => updateExpense(y, 'amount', Number(e.target.value))} className="w-full px-4 py-3 bg-white border border-rose-200 rounded-xl outline-none font-bold text-sm" placeholder="e.g. 500000" />
                          {input.expenses[y].amount > 0 && <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest ml-1">{toIndianWords(input.expenses[y].amount)}</p>}
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-rose-600 uppercase tracking-widest ml-1">Event / Purpose</label>
                          <input type="text" value={input.expenses[y].event} onChange={(e) => updateExpense(y, 'event', e.target.value)} className="w-full px-4 py-3 bg-white border border-rose-200 rounded-xl outline-none font-bold text-sm" placeholder="e.g. Home Downpayment" />
                       </div>
                    </div>
                  )}
                </div>
              ))}
           </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button 
          onClick={() => setStep(2)} 
          disabled={isLimitReached}
          className={`px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-xl ${isLimitReached ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'}`}
        >
          Define Allocation <ChevronRight className="w-4 h-4" />
        </button>
        {isLimitReached && (
          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mr-4 mt-2">Upgrade Plan to rebalance your wealth</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => {
    const total = Object.values(input.targetAllocation).reduce((a, b) => (a as number) + (b as number), 0);
    const currentGuide = AGE_GUIDES.find(g => input.age >= g.range[0] && input.age < g.range[1]) || AGE_GUIDES[1];
    
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-3 bg-blue-50 rounded-2xl">
                    <PieChart className="w-6 h-6 text-blue-600" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Target Asset Allocation</h3>
              </div>
              <p className="text-sm text-slate-500 font-medium mb-10">Define your ideal split between different asset classes.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                {[
                  { key: 'indianEquity', label: 'Indian Equity', icon: <IndianRupee className="w-4 h-4 text-emerald-600" /> },
                  { key: 'globalEquity', label: 'Global Equity', icon: <Globe className="w-4 h-4 text-blue-600" /> },
                  { key: 'debt', label: 'Debt / Fixed Income', icon: <Wallet className="w-4 h-4 text-indigo-600" /> },
                  { key: 'gold', label: 'Gold / Alternatives', icon: <Coins className="w-4 h-4 text-amber-600" /> }
                ].map((asset) => (
                  <div key={asset.key} className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       {asset.icon} {asset.label} (%)
                    </label>
                    <input 
                      type="number" 
                      value={input.targetAllocation[asset.key as keyof typeof input.targetAllocation]} 
                      onChange={(e) => setInput({...input, targetAllocation: {...input.targetAllocation, [asset.key]: Number(e.target.value)}})} 
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-black text-xl transition-all" 
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Allocation</p>
                  <p className={`text-4xl font-black ${total === 100 ? 'text-emerald-600' : 'text-rose-600'}`}>{total}%</p>
                </div>
                {total !== 100 && (
                  <div className="flex items-center gap-2 text-rose-600 p-4 bg-rose-50 rounded-2xl border border-rose-100 animate-pulse">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Total must equal 100%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-8">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-black uppercase tracking-tight">Golden Rules of Rebalancing</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {[
                      "Age defines risk capacity, not returns",
                      "Use SIP redirection first",
                      "Discipline over emotions",
                      "Rebalance annually or at ±5% deviation",
                      "Market valuation affects where new money goes, not exits",
                      "Discipline > Timing the market"
                    ].map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                         <div className="mt-1 w-5 h-5 rounded-full border-2 border-emerald-500/50 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                         </div>
                         <p className="text-sm font-medium text-slate-300 leading-tight">{rule}</p>
                      </div>
                    ))}
                 </div>
              </div>
              <Activity className="absolute -bottom-10 -right-10 w-64 h-64 text-blue-400/5 rotate-12" />
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-4">
            <div className={`${currentGuide.bgColor} p-8 rounded-[2.5rem] border ${currentGuide.borderColor} shadow-sm space-y-8`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                   <Clock className={`w-8 h-8 ${currentGuide.color}`} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ideal Benchmark</p>
                   <h4 className="text-2xl font-black text-slate-900 uppercase leading-none">Age {input.age} Guide</h4>
                </div>
              </div>

              <div className="flex items-center justify-between border-b pb-4 border-slate-200/50">
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Phase</span>
                 <span className={`text-sm font-black uppercase ${currentGuide.color}`}>{currentGuide.phase}</span>
              </div>

              <div className="space-y-4">
                 {[
                   { label: 'Indian Equity', key: 'indianEquity', icon: <IndianRupee className="w-3 h-3" /> },
                   { label: 'Global / US', key: 'globalEquity', icon: <Globe className="w-3 h-3" /> },
                   { label: 'Debt / Fixed', key: 'debt', icon: <Wallet className="w-3 h-3" /> },
                   { label: 'Gold / Alts', key: 'gold', icon: <Coins className="w-3 h-3" /> }
                 ].map(item => (
                   <div key={item.key} className="flex justify-between items-center bg-white/60 p-4 rounded-2xl">
                      <div className="flex items-center gap-3 text-slate-600">
                         {item.icon}
                         <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                      </div>
                      <span className="text-sm font-black text-slate-900">{(currentGuide.allocation as any)[item.key]}%</span>
                   </div>
                 ))}
              </div>

              <div className="space-y-3 pt-2">
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Strategy Keys</p>
                 {currentGuide.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                       <CheckCircle className={`w-4 h-4 ${currentGuide.color}`} />
                       <p className="text-[11px] font-bold text-slate-700">{rule}</p>
                    </div>
                 ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
               <div className="flex items-center gap-3">
                  <ScaleIcon className="w-5 h-5 text-blue-600" />
                  <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Internal Equity Split</h4>
               </div>
               <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-2">Indian Segment</p>
                     <div className="flex justify-between items-center">
                        <div>
                           <p className="text-[11px] font-black text-slate-700">Large Cap</p>
                           <p className="text-xs font-bold text-blue-600">50–60%</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[11px] font-black text-slate-700">Mid/Small</p>
                           <p className="text-xs font-bold text-blue-600">30–40%</p>
                        </div>
                     </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-2">Global Segment</p>
                     <div className="flex justify-between items-center">
                        <div>
                           <p className="text-[11px] font-black text-slate-700">US Index</p>
                           <p className="text-xs font-bold text-blue-600">70–80%</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[11px] font-black text-slate-700">Developed</p>
                           <p className="text-xs font-bold text-blue-600">20–30%</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-start gap-4">
               <div className="p-3 bg-blue-50 rounded-2xl shrink-0">
                  <Timer className="w-6 h-6 text-blue-600" />
               </div>
               <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Glide Path Rule</h4>
                  <p className="text-[11px] font-medium text-slate-500 leading-snug italic">Every 5 years after age 35: -5% Equity, +5% Debt.</p>
               </div>
            </div>

            <button 
              onClick={() => setShowBenchmarkModal(true)}
              className="w-full py-5 bg-slate-50 text-blue-800 border border-blue-100 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-50 transition-all group"
            >
               View Full Age Benchmarks <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="flex justify-between pt-10">
          <button onClick={() => setStep(1)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-200 transition-all"><ChevronLeft className="w-4 h-4" /> Back</button>
          <button disabled={total !== 100} onClick={() => setStep(3)} className={`px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 ${total !== 100 ? 'opacity-50 cursor-not-allowed' : ''}`}>Snapshot Portfolio <ChevronRight className="w-4 h-4" /></button>
        </div>

        {showBenchmarkModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
             <div className="bg-white rounded-[3.5rem] w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl p-10 md:p-16 relative animate-in zoom-in-95 duration-300">
                <button 
                  onClick={() => setShowBenchmarkModal(false)}
                  className="absolute top-10 right-10 p-3 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                >
                   <X className="w-6 h-6" />
                </button>

                <div className="flex items-center justify-between mb-2">
                   <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Full Lifecycle Benchmarks</h2>
                   <ScaleIcon className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-500 font-medium mb-12">Standardized asset allocation across different age brackets.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {AGE_GUIDES.map((guide, idx) => (
                     <div key={idx} className={`${guide.bgColor} border ${guide.borderColor} rounded-[2.5rem] p-8 space-y-6 hover:shadow-lg transition-all`}>
                        <div>
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Age {guide.range[0]}-{guide.range[1]}</p>
                           <h4 className={`text-xl font-black uppercase tracking-tight ${guide.color}`}>{guide.phase}</h4>
                        </div>
                        
                        <div className="space-y-3">
                           <div className="flex justify-between text-xs font-bold text-slate-600"><span>Indian Equity</span><span className="font-black text-slate-900">{guide.allocation.indianEquity}%</span></div>
                           <div className="flex justify-between text-xs font-bold text-slate-600"><span>Global / US</span><span className="font-black text-slate-900">{guide.allocation.globalEquity}%</span></div>
                           <div className="flex justify-between text-xs font-bold text-slate-600"><span>Debt / Fixed</span><span className="font-black text-slate-900">{guide.allocation.debt}%</span></div>
                           <div className="flex justify-between text-xs font-bold text-slate-600"><span>Gold / Alts</span><span className="font-black text-slate-900">{guide.allocation.gold}%</span></div>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="mt-16 flex justify-center">
                   <button 
                    onClick={() => setShowBenchmarkModal(false)}
                    className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                   >
                      Close Benchmark Guide
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-50 pb-6">
          <div><h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-600" /> Portfolio Snapshot</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manual Input or CSV Smart Import & Sync</p></div>
          <div className="flex items-center gap-3">
            <input type="file" accept=".csv" onChange={handleCsvImport} ref={fileInputRef} className="hidden" />
            <button 
              disabled={isSyncing}
              onClick={() => fileInputRef.current?.click()} 
              className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} 
              Smart Import CSV
            </button>
          </div>
        </div>

        {permissionError && (
          <div className="mb-8 p-6 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3 text-rose-700">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <p className="text-sm font-black leading-tight">Firestore Rules Update Required</p>
            </div>
            <p className="text-xs font-medium text-rose-600 leading-relaxed">
              Standard rules are shallow; you must use a <b>recursive wildcard</b> to grant access to the <b>portfolio</b> subcollection in your Firebase Console:
            </p>
            <div className="bg-slate-900 p-4 rounded-xl relative group">
              <pre className="text-[9px] text-emerald-400 font-mono overflow-x-auto">
{`match /users/{userId}/{allPaths=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}`}
              </pre>
              <button 
                type="button"
                onClick={handleCopyRules}
                className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/50" />}
              </button>
            </div>
          </div>
        )}

        {importError && !permissionError && <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600"><AlertCircle className="w-5 h-5 shrink-0" /><p className="text-xs font-bold">{importError}</p></div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { key: 'indianEquity', label: 'Indian Equity', color: 'border-emerald-200' },
            { key: 'globalEquity', label: 'Global Equity', color: 'border-blue-200' },
            { key: 'debt', label: 'Debt / Fixed Income', color: 'border-indigo-200' },
            { key: 'gold', label: 'Gold / Alternatives', color: 'border-amber-200' }
          ].map((asset) => (
            <div key={asset.key} className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{asset.label} (₹)</label>
              <input type="number" value={input.currentPortfolio[asset.key as keyof typeof input.currentPortfolio]} onChange={(e) => setInput({...input, currentPortfolio: {...input.currentPortfolio, [asset.key]: Math.round(Number(e.target.value))}})} className={`w-full px-6 py-4 bg-slate-50 border-2 ${asset.color} rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold`} />
              {input.currentPortfolio[asset.key as keyof typeof input.currentPortfolio] > 0 && <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2">{toIndianWords(input.currentPortfolio[asset.key as keyof typeof input.currentPortfolio])}</p>}
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Assets Under Management</p><p className="text-4xl font-black text-slate-900">₹{Math.round(totalValueRaw).toLocaleString()}</p><p className="text-xs font-black text-blue-600 uppercase tracking-widest mt-1">{toIndianWords(Math.round(totalValueRaw))}</p></div>
      </div>
      <div className="flex justify-between">
        <button onClick={() => setStep(2)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-200 transition-all"><ChevronLeft className="w-4 h-4" /> Back</button>
        <button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing} 
          className="px-10 py-5 bg-blue-600 text-white rounded-3xl font-black text-lg flex items-center gap-3 hover:bg-blue-700 transition-all shadow-2xl disabled:opacity-50"
        >
          {isAnalyzing ? (
            <><RefreshCcw className="w-6 h-6 animate-spin" /> Running Diagnosis...</>
          ) : (
            <><Sparkles className="w-6 h-6 text-blue-400" /> Run Diagnosis</>
          )}
        </button>
      </div>
    </div>
  );

  const SuggestionGrid = ({ title, icon, data, colorClass = "blue", isLoading }: { title: string, icon: React.ReactNode, data: AssetSuggestion[], colorClass?: string, isLoading?: boolean }) => {
    if (isLoading) {
      return (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-slate-100 rounded-xl"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
             <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[1, 2, 3].map(i => (
               <div key={i} className="h-48 bg-slate-100 rounded-[2rem] border border-slate-200 animate-pulse" />
             ))}
          </div>
        </div>
      );
    }
    
    if (!data || data.length === 0) return null;
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
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

  const renderAnalysis = () => {
    if (!analysis) return null;
    const totalIncreaseGap = analysis.actions.filter(a => a.action === 'Increase').reduce((sum, a) => sum + a.gapAmount, 0);

    const assetLabels: Record<string, string> = {
      indianEquity: 'INDIAN EQUITY',
      globalEquity: 'GLOBAL EQUITY',
      debt: 'DEBT',
      gold: 'GOLD'
    };

    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6">
        {/* Summary Header Card */}
        <div className="bg-emerald-600 rounded-[2.5rem] p-10 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-6 flex-1">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                   {isAnalyzing ? <Loader2 className="w-10 h-10 animate-spin" /> : <BarChart4 className="w-10 h-10" />}
                </div>
                <div>
                   <h3 className="text-4xl font-black uppercase tracking-tight">Rebalancing Summary</h3>
                   <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mt-1">
                     {isAnalyzing ? 'Synthesizing Market Intelligence...' : 'Diagnosis Complete'}
                   </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="bg-white/10 p-6 rounded-3xl border border-white/10 min-w-[200px]">
                   <p className="text-[10px] font-black uppercase opacity-60 mb-2">Rebalancing Needed?</p>
                   <p className="text-3xl font-black">{analysis.requiresRebalancing ? 'YES' : 'NO'}</p>
                </div>
                <div className="bg-white/10 p-6 rounded-3xl border border-white/10 min-w-[200px]">
                   <p className="text-[10px] font-black uppercase opacity-60 mb-2">AUM</p>
                   <p className="text-3xl font-black">₹{Math.round(analysis.totalValue).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-right">
              <div className="flex flex-col gap-8 text-right pr-4">
                 <div>
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">India Regime</p>
                    <p className={`text-2xl font-black ${analysis.marketRegimes.india === 'Overvalued' ? 'text-rose-400' : 'text-emerald-100'}`}>
                      {analysis.marketRegimes.india}
                    </p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">US Regime</p>
                    <p className="text-2xl font-black text-emerald-100">{analysis.marketRegimes.us}</p>
                 </div>
              </div>
              <div className="mt-4 flex items-center gap-2 justify-end">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 border border-white/30 ${isAnalyzing ? 'opacity-50' : 'animate-in fade-in'}`}>
                  {isAnalyzing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> <span className="text-[10px] font-black uppercase">Auto-saving...</span></>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4 text-emerald-300" /> <span className="text-[10px] font-black uppercase">Report Finalized & Saved</span></>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Activity className={`absolute -bottom-10 -right-10 w-80 h-80 text-white/5 rotate-12 pointer-events-none ${isAnalyzing ? 'animate-pulse' : ''}`} />
        </div>

        {/* Individual Asset Allocation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {Object.keys(assetLabels).map((key) => {
             const actual = analysis.actualAllocation[key] || 0;
             const target = Number(input.targetAllocation[key as keyof typeof input.targetAllocation]) || 0;
             const deviation = analysis.deviations[key] || 0;
             const isBalanced = Math.abs(deviation) <= 5;

             return (
               <div key={key} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col">
                  <div className="flex items-center justify-between mb-10">
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{assetLabels[key]}</p>
                     <CheckIcon className={`w-5 h-5 ${isBalanced ? 'text-emerald-500' : 'text-rose-500'}`} />
                  </div>

                  <div className="flex items-end justify-between mb-8">
                     <div>
                        <p className="text-4xl font-black text-slate-900 leading-none mb-2">{actual.toFixed(1)}%</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Current</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xl font-black text-slate-800 leading-none mb-2">{target}%</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Target</p>
                     </div>
                  </div>

                  <div className="space-y-3 mb-8">
                     <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isBalanced ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                          style={{ width: `${Math.min(100, actual)}%` }}
                        />
                     </div>
                     <div className="h-1.5 w-full bg-slate-50 rounded-full border border-slate-100/50 relative">
                        <div 
                          className="absolute h-full bg-slate-300 w-0.5" 
                          style={{ left: `${target}%` }}
                        />
                     </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50 mt-auto">
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        Deviation: <span className={isBalanced ? 'text-emerald-500' : 'text-rose-500'}>
                           {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
                        </span>
                     </p>
                  </div>
               </div>
             );
           })}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-top-4">
           <div className="p-8 border-b border-slate-50 flex items-center gap-4">
             <div className="p-3 bg-indigo-50 rounded-xl"><Scale className="w-6 h-6 text-indigo-600" /></div>
             <div>
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recommended Allocation Actions</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Capital Deployment Roadmap</p>
             </div>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50 border-b border-slate-100">
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Class</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount (Monthly)</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {analysis.actions.map((action, idx) => {
                   let monthlyAmount = action.action === 'Increase' && totalIncreaseGap > 0 ? (action.gapAmount / totalIncreaseGap) * input.monthlySurplus : action.action === 'Decrease' ? action.gapAmount / 12 : 0;
                   return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6"><span className="text-sm font-black text-slate-900 uppercase">{action.asset.replace(/([A-Z])/g, ' $1')}</span></td>
                      <td className="px-8 py-6"><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${action.action === 'Increase' ? 'bg-emerald-100 text-emerald-700' : action.action === 'Decrease' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{action.action}</span></td>
                      <td className="px-8 py-6"><span className="text-sm font-bold text-slate-600">{action.method}</span></td>
                      <td className="px-8 py-6 text-right font-black text-slate-900">
                        {monthlyAmount > 0 ? (
                          <div className="flex flex-col items-end">
                            <span className={action.action === 'Increase' ? 'text-emerald-600' : 'text-rose-600'}>{action.action === 'Increase' ? '+' : '-'}₹{Math.round(monthlyAmount).toLocaleString()}</span>
                            <span className="text-[8px] text-slate-400 uppercase">per month</span>
                          </div>
                        ) : '—'}
                      </td>
                    </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
        </div>

        {/* Strategy Intelligence section below table and with bullet points */}
        <div className="space-y-10">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-900 rounded-xl"><BookOpen className="w-6 h-6 text-white" /></div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Strategy Intelligence</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Execution Logic (Moved to top as requested) */}
              <div className="bg-indigo-50/40 p-8 rounded-[2.5rem] border border-indigo-100 shadow-sm space-y-5 group hover:bg-indigo-50 transition-colors min-h-[160px]">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                       {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                    </div>
                    <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest">Execution Logic</h4>
                 </div>
                 <TextToList text={aiRationale?.executionLogic} dotColor="bg-indigo-600" isLoading={isAnalyzing} />
              </div>

              {/* Card 2: Financial Alignment */}
              <div className="bg-blue-50/40 p-8 rounded-[2.5rem] border border-blue-100 shadow-sm space-y-5 group hover:bg-blue-50 transition-colors min-h-[160px]">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                       {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
                    </div>
                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest">Financial Alignment</h4>
                 </div>
                 <TextToList text={aiRationale?.objective} dotColor="bg-blue-600" isLoading={isAnalyzing} />
              </div>

              {/* Card 3: Macro Environment */}
              <div className="bg-emerald-50/40 p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm space-y-5 group hover:bg-emerald-50 transition-colors min-h-[160px]">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-200">
                       {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
                    </div>
                    <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Macro Environment</h4>
                 </div>
                 <TextToList text={aiRationale?.macroEnvironment} dotColor="bg-emerald-600" isLoading={isAnalyzing} />
              </div>

              {/* Card 4: Safety Overrides */}
              <div className="bg-amber-50/40 p-8 rounded-[2.5rem] border border-amber-100 shadow-sm space-y-5 group hover:bg-amber-50 transition-colors min-h-[160px]">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-600 rounded-2xl text-white shadow-lg shadow-amber-200">
                       {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldIcon className="w-5 h-5" />}
                    </div>
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest">Safety Overrides</h4>
                 </div>
                 <TextToList text={aiRationale?.safetyOverrides} dotColor="bg-amber-600" isLoading={isAnalyzing} />
              </div>
           </div>
        </div>

        <div className="space-y-12">
          {analysis.actions.some(a => a.asset === 'globalEquity' && a.action === 'Increase') && <SuggestionGrid title="Global Portfolio Suggestion (NASDAQ 50 Focus)" icon={<Globe className="w-6 h-6 text-blue-600" />} data={aiRationale?.globalSuggestions || []} colorClass="blue" isLoading={isAnalyzing} />}
          {analysis.actions.some(a => a.asset === 'debt' && a.action === 'Increase') && <SuggestionGrid title="Debt Portfolio Suggestion" icon={<Library className="w-6 h-6 text-indigo-600" />} data={aiRationale?.debtSuggestions || []} colorClass="indigo" isLoading={isAnalyzing} />}
          {analysis.actions.some(a => a.asset === 'gold' && a.action === 'Increase') && <SuggestionGrid title="Gold Portfolio Suggestion" icon={<Coins className="w-6 h-6 text-amber-600" />} data={aiRationale?.goldSuggestions || []} colorClass="amber" isLoading={isAnalyzing} />}
        </div>

        {/* Conditional rendering for Domestic Equity suggestions: Only if 'Increase' action is recommended for indianEquity */}
        {analysis.actions.some(a => a.asset === 'indianEquity' && a.action === 'Increase') && (
          <SuggestionGrid 
            title="Balanced Portfolio Suggestions (Domestic Equity)" 
            icon={<Sparkles className="w-6 h-6 text-emerald-800" />} 
            data={aiRationale?.assetSuggestions || []} 
            colorClass="emerald" 
            isLoading={isAnalyzing}
          />
        )}

        {analysis.stockAudit && (
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl"><LayoutGrid className="w-6 h-6 text-blue-800" /></div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Holdings Level Audit</h3>
            </div>
            <AnalysisResult result={analysis.stockAudit} isLoading={isAnalyzing} />
          </div>
        )}
        
        <div className="flex justify-center pb-12">
          <button 
            onClick={() => setStep(1)} 
            className="flex items-center gap-2 px-8 py-4 bg-blue-800 text-white rounded-2xl font-black text-sm hover:bg-blue-900 transition-all shadow-xl shadow-blue-100"
          >
            <RefreshCcw className="w-4 h-4" /> Start New Rebalancer
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {step < 5 && (
        <div className="mb-12 px-4">
          <div className="flex items-center justify-between relative max-w-4xl mx-auto">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 -z-10" />
            <div className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 -z-10 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }} />
            {[1, 2, 3].map((s) => (
              <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${step >= s ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border-2 border-slate-100 text-slate-300'}`}>{s}</div>
            ))}
          </div>
        </div>
      )}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 5 && renderAnalysis()}
    </div>
  );
};

export default PortfolioRebalancer;