import React, { useState, useMemo } from 'react';
import { FIREInput, FIREResult, View, XIRRInput } from '../types';
import { 
  Flame, 
  IndianRupee, 
  TrendingUp, 
  ShieldAlert, 
  Calendar, 
  ArrowUpRight, 
  Wallet, 
  HeartPulse, 
  Timer,
  Info,
  ChevronRight,
  Calculator,
  BarChart4
} from 'lucide-react';

interface FIRECalculatorProps {
  onNavigate: (view: View) => void;
  onSimulateXIRR: (data: XIRRInput) => void;
}

/**
 * Helper to convert number to Indian words
 */
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

const FIRECalculator: React.FC<FIRECalculatorProps> = ({ onNavigate, onSimulateXIRR }) => {
  const [input, setInput] = useState<FIREInput>({
    monthlyIncome: 150000,
    monthlyExpense: 60000,
    inflationRate: 6,
    currentAge: 30,
    retirementAge: 50,
    lifeExpectancy: 85,
    postRetirementReturn: 8
  });

  const results = useMemo((): FIREResult => {
    const monthlySurplus = input.monthlyIncome - input.monthlyExpense;
    const emergencyFund = input.monthlyExpense * 6;
    const yearsToRetirement = input.retirementAge - input.currentAge;
    const yearsInRetirement = input.lifeExpectancy - input.retirementAge;
    
    const futureMonthlyExpense = input.monthlyExpense * Math.pow(1 + input.inflationRate / 100, yearsToRetirement);
    const annualFutureExpense = futureMonthlyExpense * 12;

    const fireCorpus4Percent = annualFutureExpense * 25;

    const r = input.postRetirementReturn / 100;
    const i = input.inflationRate / 100;
    const realReturn = (1 + r) / (1 + i) - 1;

    let sustenanceCorpus = 0;
    if (realReturn === 0) {
      sustenanceCorpus = annualFutureExpense * yearsInRetirement;
    } else {
      sustenanceCorpus = annualFutureExpense * ((1 - Math.pow(1 + realReturn, -yearsInRetirement)) / realReturn);
    }

    return {
      monthlySurplus,
      emergencyFund,
      yearsToRetirement,
      yearsInRetirement,
      futureMonthlyExpense,
      fireCorpus4Percent,
      sustenanceCorpus
    };
  }, [input]);

  const handleTriggerXIRR = () => {
    const start = new Date();
    const end = new Date();
    end.setFullYear(start.getFullYear() + results.yearsToRetirement);

    onSimulateXIRR({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      recurringAmount: Math.round(results.monthlySurplus),
      frequency: 'MONTHLY',
      maturityAmount: Math.round(results.sustenanceCorpus)
    });
  };

  const formatCurrency = (val: number) => `₹${Math.round(val).toLocaleString()}`;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
              <Flame className="text-white w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">FIRE Architect</h2>
              <p className="text-sm text-slate-500 font-medium">Financial Independence, Retire Early modeling</p>
            </div>
          </div>
          <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-black text-orange-700 uppercase tracking-widest">Buffer: {formatCurrency(results.emergencyFund)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5" /> Monthly Income
              </label>
              <input
                type="number"
                value={input.monthlyIncome}
                onChange={(e) => setInput({...input, monthlyIncome: Number(e.target.value)})}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-black text-lg transition-all"
              />
              {input.monthlyIncome > 0 && (
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2 animate-in fade-in slide-in-from-top-1">
                  {toIndianWords(input.monthlyIncome)}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ArrowUpRight className="w-3.5 h-3.5" /> Monthly Expense
              </label>
              <input
                type="number"
                value={input.monthlyExpense}
                onChange={(e) => setInput({...input, monthlyExpense: Number(e.target.value)})}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-black text-lg transition-all"
              />
              {input.monthlyExpense > 0 && (
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2 animate-in fade-in slide-in-from-top-1">
                  {toIndianWords(input.monthlyExpense)}
                </p>
              )}
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
               <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Monthly Surplus</p>
               <p className="text-2xl font-black text-emerald-700">{formatCurrency(results.monthlySurplus)}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Current & Retire Age
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={input.currentAge}
                  onChange={(e) => setInput({...input, currentAge: Number(e.target.value)})}
                  className="w-1/2 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-black text-lg transition-all"
                  placeholder="Now"
                />
                <input
                  type="number"
                  value={input.retirementAge}
                  onChange={(e) => setInput({...input, retirementAge: Number(e.target.value)})}
                  className="w-1/2 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-black text-lg transition-all"
                  placeholder="FIRE"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <HeartPulse className="w-3.5 h-3.5" /> Life Expectancy
              </label>
              <input
                type="number"
                value={input.lifeExpectancy}
                onChange={(e) => setInput({...input, lifeExpectancy: Number(e.target.value)})}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-black text-lg transition-all"
              />
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
               <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Retirement Horizon</p>
               <p className="text-2xl font-black text-blue-700">{results.yearsInRetirement} Years</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Timer className="w-3.5 h-3.5" /> Expected Inflation (%)
              </label>
              <input
                type="number"
                value={input.inflationRate}
                onChange={(e) => setInput({...input, inflationRate: Number(e.target.value)})}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" /> Post-Retire Return (%)
              </label>
              <input
                type="number"
                value={input.postRetirementReturn}
                onChange={(e) => setInput({...input, postRetirementReturn: Number(e.target.value)})}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold transition-all"
              />
            </div>
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black text-orange-600 uppercase mb-1">Time to FIRE</p>
                  <p className="text-2xl font-black text-orange-700">{results.yearsToRetirement} Yrs</p>
               </div>
               <Timer className="w-8 h-8 text-orange-400 opacity-30" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-600 rounded-2xl">
                <IndianRupee className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight">FIRE Target Corpus</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calculator className="w-3 h-3" /> Core FIRE (4% Rule)
                </p>
                <p className="text-3xl font-black">{formatCurrency(results.fireCorpus4Percent)}</p>
                <p className="text-[10px] font-medium text-slate-500">Based on 25x Annual Expenses</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                   <HeartPulse className="w-3 h-3" /> Sustenance Corpus
                </p>
                <p className="text-3xl font-black text-orange-500">{formatCurrency(results.sustenanceCorpus)}</p>
                <p className="text-[10px] font-medium text-slate-500">Duration-adjusted for {results.yearsInRetirement} Yrs</p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Future Monthly Outflow</p>
                  <p className="text-xl font-black text-slate-100">{formatCurrency(results.futureMonthlyExpense)}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>
                  <p className="text-xl font-black text-emerald-400">Optimal Growth</p>
               </div>
            </div>
          </div>
          <Flame className="absolute -bottom-10 -right-10 w-64 h-64 text-orange-600/5 rotate-12" />
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-start gap-6 group">
            <div className="p-4 bg-orange-50 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
              <Info className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">The 4% Rule Explained</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Established by the Trinity Study, this rule suggests that if you withdraw 4% of your total corpus annually (adjusted for inflation), your money has a high probability of lasting 30 years.
              </p>
              <div className="pt-2">
                 <button 
                  onClick={() => onNavigate('how-it-works')}
                  className="text-[10px] font-black text-orange-600 uppercase flex items-center gap-1 hover:gap-2 transition-all"
                 >
                    Read the study <ChevronRight className="w-3 h-3" />
                 </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-start gap-6 group">
            <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Sustenance Modeling</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Our advanced model calculates the exact corpus needed to sustain you until age {input.lifeExpectancy}, factoring in your specific {input.postRetirementReturn}% return expectations and inflation.
              </p>
              <div className="pt-2">
                 <button 
                  onClick={() => onNavigate('how-it-works')}
                  className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 hover:gap-2 transition-all"
                 >
                    Learn Math <ChevronRight className="w-3 h-3" />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-orange-600 to-rose-700 p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="space-y-4 max-w-2xl">
          <h3 className="text-2xl font-black uppercase tracking-tight">Ready to verify your journey?</h3>
          <p className="text-sm font-medium opacity-90 leading-relaxed">
            To reach {formatCurrency(results.sustenanceCorpus)} by age {input.retirementAge}, you'll need a precise investment roadmap. Use the XIRR Vault to simulate your exact monthly surplus contributions and verify the growth rate.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <button 
              onClick={handleTriggerXIRR}
              className="px-8 py-4 bg-white text-orange-700 font-black rounded-2xl shadow-xl hover:bg-orange-50 transition-all flex items-center gap-2 active:scale-95"
            >
              <BarChart4 className="w-5 h-5" /> Simulate in XIRR Vault
            </button>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-4">
           <div className="p-6 bg-white/10 rounded-[2rem] border border-white/20 text-center">
              <p className="text-[10px] font-black uppercase mb-1">Monthly Surplus Ratio</p>
              <p className="text-3xl font-black">{((results.monthlySurplus / input.monthlyIncome) * 100).toFixed(1)}%</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FIRECalculator;