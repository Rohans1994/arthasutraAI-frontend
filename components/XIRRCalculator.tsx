import React, { useState, useMemo, useEffect } from 'react';
import { XIRRInput, XIRRResult, InvestmentFrequency } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  BarChart4, 
  Calendar, 
  IndianRupee, 
  TrendingUp, 
  ArrowUpRight, 
  RefreshCw, 
  Info,
  CalendarDays,
  CircleDollarSign,
  PieChart,
  ChevronRight,
  Calculator,
  CalendarCheck,
  TrendingDown,
  AlertCircle,
  HelpCircle,
  Layers
} from 'lucide-react';

const FREQUENCY_LABELS: Record<InvestmentFrequency, string> = {
  '15DAYS': 'Fortnightly (15 Days)',
  'MONTHLY': 'Monthly',
  'QUARTERLY': 'Quarterly',
  'HALFYEARLY': 'Half Yearly',
  'YEARLY': 'Yearly'
};

interface XIRRCalculatorProps {
  initialData?: XIRRInput | null;
  onGeneratePortfolio?: (input: any) => void;
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

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-8">
            <span className="text-[10px] font-bold text-blue-400 uppercase">Invested</span>
            <span className="text-sm font-black text-white">₹{payload[0].value.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Earnings</span>
            <span className="text-sm font-black text-white">₹{payload[1].value.toLocaleString()}</span>
          </div>
          <div className="pt-1.5 mt-1.5 border-t border-white/10 flex items-center justify-between gap-8">
            <span className="text-[10px] font-black text-slate-300 uppercase">Total Value</span>
            <span className="text-sm font-black text-white">₹{(payload[0].value + payload[1].value).toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const XIRRCalculator: React.FC<XIRRCalculatorProps> = ({ initialData }) => {
  const [input, setInput] = useState<XIRRInput>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
    recurringAmount: 10000,
    frequency: 'MONTHLY',
    maturityAmount: 850000
  });

  useEffect(() => {
    if (initialData) {
      setInput(initialData);
    }
  }, [initialData]);

  const xirrResult = useMemo((): XIRRResult | null => {
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    if (start >= end) return null;

    const cashFlows: { date: string; amount: number }[] = [];
    let currentDate = new Date(start);
    let totalInvested = 0;

    while (currentDate < end) {
      cashFlows.push({ 
        date: currentDate.toISOString().split('T')[0], 
        amount: -input.recurringAmount 
      });
      totalInvested += input.recurringAmount;

      if (input.frequency === '15DAYS') {
        currentDate.setDate(currentDate.getDate() + 15);
      } else if (input.frequency === 'MONTHLY') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (input.frequency === 'QUARTERLY') {
        currentDate.setMonth(currentDate.getMonth() + 3);
      } else if (input.frequency === 'HALFYEARLY') {
        currentDate.setMonth(currentDate.getMonth() + 6);
      } else if (input.frequency === 'YEARLY') {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      }
    }

    cashFlows.push({ 
      date: end.toISOString().split('T')[0], 
      amount: input.maturityAmount 
    });

    const calculateNPV = (rate: number) => {
      let npv = 0;
      const firstDate = new Date(cashFlows[0].date).getTime();
      for (const flow of cashFlows) {
        const flowDate = new Date(flow.date).getTime();
        const diffDays = (flowDate - firstDate) / (1000 * 60 * 60 * 24);
        const base = Math.max(1 + rate, 0.0001);
        npv += flow.amount / Math.pow(base, diffDays / 365);
      }
      return npv;
    };

    const calculateDerivative = (rate: number) => {
      let derivative = 0;
      const firstDate = new Date(cashFlows[0].date).getTime();
      for (const flow of cashFlows) {
        const flowDate = new Date(flow.date).getTime();
        const diffDays = (flowDate - firstDate) / (1000 * 60 * 60 * 24);
        const t = diffDays / 365;
        const base = Math.max(1 + rate, 0.0001);
        derivative -= t * flow.amount * Math.pow(base, -t - 1);
      }
      return derivative;
    };

    let rate = 0.1; 
    if (input.maturityAmount < totalInvested) {
      rate = -0.1;
    }

    for (let i = 0; i < 100; i++) {
      const npv = calculateNPV(rate);
      const derivative = calculateDerivative(rate);
      if (Math.abs(derivative) < 0.0000001) break; 
      const nextRate = rate - npv / derivative;
      if (Math.abs(nextRate - rate) < 0.00001) {
        rate = nextRate;
        break;
      }
      rate = nextRate;
    }

    return {
      xirr: rate * 100,
      totalInvested,
      totalGains: input.maturityAmount - totalInvested,
      investmentCount: cashFlows.length - 1,
      cashFlows
    };
  }, [input]);

  const yearlyProjectionData = useMemo(() => {
    if (!xirrResult) return [];
    
    const data = [];
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    const rate = xirrResult.xirr / 100;
    
    const yearsCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    
    for (let i = 1; i <= yearsCount; i++) {
      const yearEndDate = new Date(start);
      yearEndDate.setFullYear(start.getFullYear() + i);
      const targetDate = yearEndDate > end ? end : yearEndDate;
      
      const investedSoFar = xirrResult.cashFlows
        .filter(cf => cf.amount < 0 && new Date(cf.date) <= targetDate)
        .reduce((sum, cf) => sum + Math.abs(cf.amount), 0);
        
      let valueSoFar = 0;
      xirrResult.cashFlows
        .filter(cf => cf.amount < 0 && new Date(cf.date) <= targetDate)
        .forEach(cf => {
          const flowDate = new Date(cf.date).getTime();
          const diffDays = (targetDate.getTime() - flowDate) / (1000 * 60 * 60 * 24);
          valueSoFar += Math.abs(cf.amount) * Math.pow(1 + rate, diffDays / 365);
        });
        
      data.push({
        year: i === yearsCount ? 'Maturity' : `Year ${i}`,
        invested: Math.round(investedSoFar),
        earnings: Math.round(Math.max(0, valueSoFar - investedSoFar))
      });
    }
    return data;
  }, [xirrResult, input]);

  const formatCurrency = (val: number) => {
    const absVal = Math.abs(Math.round(val));
    const prefix = val < 0 ? '-₹' : '₹';
    return `${prefix}${absVal.toLocaleString()}`;
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <BarChart4 className="text-white w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">XIRR Vault</h2>
              <p className="text-sm text-slate-500 font-medium">Precision Return Modeling for Irregular Flows</p>
            </div>
          </div>
          <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Growth Engine Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5" /> Start Date
              </label>
              <input
                type="date"
                value={input.startDate}
                onChange={(e) => setInput({...input, startDate: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CalendarCheck className="w-3.5 h-3.5" /> Maturity Date
              </label>
              <input
                type="date"
                value={input.endDate}
                onChange={(e) => setInput({...input, endDate: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold transition-all"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <IndianRupee className="w-3.5 h-3.5" /> Recurring Amount
              </label>
              <input
                type="number"
                value={input.recurringAmount}
                onChange={(e) => setInput({...input, recurringAmount: Number(e.target.value)})}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-black text-lg transition-all"
              />
              {input.recurringAmount > 0 && (
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2 animate-in fade-in slide-in-from-top-1">
                  {toIndianWords(input.recurringAmount)}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5" /> Frequency
              </label>
              <select
                value={input.frequency}
                onChange={(e) => setInput({...input, frequency: e.target.value as InvestmentFrequency})}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold transition-all"
              >
                {Object.entries(FREQUENCY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CircleDollarSign className="w-3.5 h-3.5" /> Maturity Amount
              </label>
              <input
                type="number"
                value={input.maturityAmount}
                onChange={(e) => setInput({...input, maturityAmount: Number(e.target.value)})}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-black text-lg transition-all"
              />
              {input.maturityAmount > 0 && (
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2 animate-in fade-in slide-in-from-top-1">
                  {toIndianWords(input.maturityAmount)}
                </p>
              )}
            </div>
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Total Installments</p>
                  <p className="text-2xl font-black text-emerald-700">{xirrResult?.investmentCount || 0}</p>
               </div>
               <Calculator className="w-8 h-8 text-emerald-400 opacity-30" />
            </div>
          </div>
        </div>
      </div>

      {xirrResult && (
        <>
          {xirrResult.totalGains < 0 ? (
            <div className="bg-rose-50 border-2 border-rose-100 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-8 animate-in zoom-in duration-300">
               <div className="w-20 h-20 bg-rose-600 rounded-3xl flex items-center justify-center shrink-0 shadow-xl shadow-rose-200">
                  <AlertCircle className="w-10 h-10 text-white" />
               </div>
               <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-2xl font-black text-rose-900 uppercase tracking-tight">Calculation Error: Absolute Loss Detected</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    The provided maturity amount (<span className="font-bold text-slate-900">{formatCurrency(input.maturityAmount)}</span>) is significantly lower than the total invested capital (<span className="font-bold text-slate-900">{formatCurrency(xirrResult.totalInvested)}</span>). 
                    Please verify your inputs as this scenario implies a drastic erosion of principal.
                  </p>
                  <div className="pt-4 flex flex-wrap gap-4">
                     <button 
                       onClick={() => setInput(prev => ({...prev, maturityAmount: Math.round(xirrResult.totalInvested * 1.2)}))}
                       className="px-6 py-3 bg-rose-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg"
                     >
                       Adjust Maturity (Example +20%)
                     </button>
                     <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest">
                        <HelpCircle className="w-4 h-4" /> Principal Safeguard Active
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                      <div className="p-3 rounded-2xl bg-emerald-600">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tight">Realized Returns</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated XIRR</p>
                        <p className="text-6xl font-black text-emerald-400">
                          {xirrResult.xirr.toFixed(2)}%
                        </p>
                        <p className="text-[10px] font-medium text-slate-500">Actual annualized internal rate of return</p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6">
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount Invested</p>
                          <p className="text-2xl font-black text-slate-100">{formatCurrency(xirrResult.totalInvested)}</p>
                        </div>
                        <div className="p-5 rounded-2xl border bg-emerald-400/10 border-emerald-400/20">
                          <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-emerald-400">Absolute Profit</p>
                          <p className="text-2xl font-black text-emerald-400">
                            +{formatCurrency(xirrResult.totalGains)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <PieChart className="absolute -bottom-10 -right-10 w-64 h-64 opacity-5 rotate-12 text-emerald-400" />
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <Info className="w-5 h-5 text-slate-600" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Understanding XIRR</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    XIRR (Extended Internal Rate of Return) is a more accurate measure than CAGR for SIPs and recurring investments because it accounts for the exact timing of each cash flow.
                  </p>
                  <ul className="space-y-4 pt-2">
                    <li className="flex gap-3 text-[11px] font-bold text-slate-600 leading-tight">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-emerald-50">
                        <ChevronRight className="w-3 h-3 text-emerald-600" />
                      </div>
                      Factorizes the 'time value' of every installment.
                    </li>
                    <li className="flex gap-3 text-[11px] font-bold text-slate-600 leading-tight">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-emerald-50">
                        <ChevronRight className="w-3 h-3 text-emerald-600" />
                      </div>
                      Ideal for SIPs, LIC policies, and FDs with recurring deposits.
                    </li>
                    <li className="flex gap-3 text-[11px] font-bold text-slate-600 leading-tight">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-emerald-50">
                        <ChevronRight className="w-3 h-3 text-emerald-600" />
                      </div>
                      XIRR for your target: <span className="text-emerald-600 font-black">{xirrResult.xirr.toFixed(2)}%</span>
                    </li>
                  </ul>
                  <div className="pt-4">
                    <button 
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="w-full py-4 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                    >
                      Re-Adjust Goals <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Yearly Growth Visualization */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Layers className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Wealth Projection Map</h3>
                      <p className="text-xs text-slate-500 font-medium">Invested Principal vs. Projected Earnings (based on {xirrResult.xirr.toFixed(2)}% XIRR)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 bg-blue-600 rounded-full" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invested</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Earnings</span>
                    </div>
                  </div>
                </div>

                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={yearlyProjectionData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="year" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Bar 
                        dataKey="invested" 
                        stackId="a" 
                        fill="#2563eb" 
                        radius={[0, 0, 4, 4]} 
                        barSize={32}
                      />
                      <Bar 
                        dataKey="earnings" 
                        stackId="a" 
                        fill="#10b981" 
                        radius={[4, 4, 0, 0]} 
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default XIRRCalculator;