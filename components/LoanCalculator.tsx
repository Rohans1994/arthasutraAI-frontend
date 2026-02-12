import React, { useState, useMemo } from 'react';
import { LoanInput, LoanScheduleRow, PrepaymentStrategy } from '../types';
import { IndianRupee, Calendar, Percent, Shield, Receipt, BarChart3, Timer, Wallet, AlertTriangle, Clock, Edit3 } from 'lucide-react';

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

const LoanCalculator: React.FC = () => {
  const [loanInput, setLoanInput] = useState<LoanInput>({
    principal: 10000000,
    interestRate: 8.5,
    tenureYears: 20,
    prepaymentStrategy: 'TENURE',
    prepayments: {},
    interestRateOverrides: {},
    emiOverrides: {}
  });

  const [viewType, setViewType] = useState<'monthly' | 'yearly'>('yearly');
  
  // Local state to handle input changes without "snapping" due to recalculation
  const [editingCell, setEditingCell] = useState<{period: number, field: 'emi' | 'rate' | 'prepayment', value: string} | null>(null);

  const results = useMemo(() => {
    const P = loanInput.principal;
    const MAX_ALLOWED_MONTHS = 480; // Extended limit to allow tenure expansion
    const originalMonths = Math.min(360, loanInput.tenureYears * 12);
    
    let currentOutstanding = P;
    let totalInterest = 0;
    const monthlySchedule: LoanScheduleRow[] = [];
    let cumulativeInt = 0;
    let cumulativePrin = 0;
    
    let currentRate = loanInput.interestRate;
    let currentMonthlyRate = (currentRate / 100) / 12;
    
    // Initial Base EMI Calculation
    const baseEmi = P * currentMonthlyRate * Math.pow(1 + currentMonthlyRate, originalMonths) / (Math.pow(1 + currentMonthlyRate, originalMonths) - 1);
    
    let currentEmi = baseEmi;
    let activeManualEmi: number | null = null; // Track persistent manual EMI override
    let isCapTriggered = false;

    for (let m = 1; m <= MAX_ALLOWED_MONTHS; m++) {
      if (currentOutstanding <= 0.05) break;

      const remainingMonthsToOriginalEnd = Math.max(1, originalMonths - m + 1);
      const remainingMonthsToMaxCap = Math.max(1, 360 - m + 1);

      // 1. Update Interest Rate if overridden (Persistent)
      if (loanInput.interestRateOverrides[m] !== undefined) {
        currentRate = loanInput.interestRateOverrides[m];
        currentMonthlyRate = (currentRate / 100) / 12;
      }

      // 2. Check for Manual EMI Override (Persistent)
      if (loanInput.emiOverrides[m] !== undefined) {
        activeManualEmi = loanInput.emiOverrides[m];
      }

      // 3. Determine base EMI for this month
      if (activeManualEmi !== null) {
        // Use the persistent manual override
        currentEmi = activeManualEmi;
      } else if (loanInput.prepaymentStrategy === 'EMI') {
        // Auto-calc for "Reduce EMI" mode: Recalculate to finish on original date
        currentEmi = currentOutstanding * currentMonthlyRate * Math.pow(1 + currentMonthlyRate, remainingMonthsToOriginalEnd) / (Math.pow(1 + currentMonthlyRate, remainingMonthsToOriginalEnd) - 1);
      } else {
        // Auto-calc for "Reduce Tenure" mode: Default to the base EMI
        // If interest has increased so much that tenure would exceed 30 years, adjust up
        const minEmiToFinishByCap = currentOutstanding * currentMonthlyRate * Math.pow(1 + currentMonthlyRate, remainingMonthsToMaxCap) / (Math.pow(1 + currentMonthlyRate, remainingMonthsToMaxCap) - 1);
        
        if (minEmiToFinishByCap > baseEmi) {
          currentEmi = minEmiToFinishByCap;
          isCapTriggered = true;
        } else {
          currentEmi = baseEmi;
        }
      }

      // 4. Interest Safety Check
      // Ensure EMI always covers at least the monthly interest
      const interestForMonth = currentOutstanding * currentMonthlyRate;
      if (currentEmi <= interestForMonth && currentOutstanding > 0) {
        currentEmi = interestForMonth + 100; // Force minimal principal payment
      }

      const prepayment = loanInput.prepayments[m] || 0;
      let principalFromEmi = currentEmi - interestForMonth;
      
      // Prevent overpayment beyond outstanding balance
      if (principalFromEmi > currentOutstanding) {
        principalFromEmi = currentOutstanding;
      }

      const actualEmiThisMonth = principalFromEmi + interestForMonth;
      const totalMonthlyPmt = actualEmiThisMonth + prepayment;
      
      currentOutstanding -= (principalFromEmi + prepayment);
      cumulativeInt += interestForMonth;
      cumulativePrin += (principalFromEmi + prepayment);
      totalInterest += interestForMonth;

      monthlySchedule.push({
        period: m,
        emiPaid: actualEmiThisMonth,
        principalPaid: principalFromEmi,
        interestPaid: interestForMonth,
        totalPayment: totalMonthlyPmt,
        principalOutstanding: Math.max(0, currentOutstanding),
        cumulativeInterest: cumulativeInt,
        cumulativePrincipal: cumulativePrin,
        prepayment,
        interestRate: currentRate,
        monthName: new Date(2024, (m - 1) % 12).toLocaleString('default', { month: 'short' }),
        yearNumber: Math.ceil(m / 12)
      });
    }

    // Yearly Aggregation
    const yearlySchedule: LoanScheduleRow[] = [];
    const maxYear = Math.ceil(monthlySchedule.length / 12);
    for (let y = 1; y <= maxYear; y++) {
      const yearMonths = monthlySchedule.filter(m => m.yearNumber === y);
      if (yearMonths.length === 0) break;

      yearlySchedule.push({
        period: y,
        emiPaid: yearMonths.reduce((acc, curr) => acc + curr.emiPaid, 0) / yearMonths.length,
        principalPaid: yearMonths.reduce((acc, curr) => acc + curr.principalPaid, 0),
        interestPaid: yearMonths.reduce((acc, curr) => acc + curr.interestPaid, 0),
        totalPayment: yearMonths.reduce((acc, curr) => acc + curr.totalPayment, 0),
        principalOutstanding: yearMonths[yearMonths.length - 1].principalOutstanding,
        cumulativeInterest: yearMonths[yearMonths.length - 1].cumulativeInterest,
        cumulativePrincipal: yearMonths[yearMonths.length - 1].cumulativePrincipal,
        prepayment: yearMonths.reduce((acc, curr) => acc + curr.prepayment, 0),
        interestRate: yearMonths[0].interestRate 
      });
    }

    return {
      baseEmi,
      currentEmi: monthlySchedule[0]?.emiPaid || 0,
      lastEmi: monthlySchedule[monthlySchedule.length - 1]?.emiPaid || 0,
      totalInterest,
      totalPayment: P + totalInterest,
      monthlySchedule,
      yearlySchedule,
      actualTenureMonths: monthlySchedule.length,
      isCapTriggered,
      isNegativeAmortization: (currentRate / 1200 * P > baseEmi) && loanInput.prepaymentStrategy === 'TENURE'
    };
  }, [loanInput]);

  const handlePrepaymentChange = (period: number, amount: number) => {
    const monthIndex = viewType === 'yearly' ? (period - 1) * 12 + 1 : period;
    setLoanInput(prev => ({
      ...prev,
      prepayments: { ...prev.prepayments, [monthIndex]: amount }
    }));
  };

  const handleRateChange = (period: number, rate: number) => {
    const monthIndex = viewType === 'yearly' ? (period - 1) * 12 + 1 : period;
    setLoanInput(prev => ({
      ...prev,
      interestRateOverrides: { ...prev.interestRateOverrides, [monthIndex]: rate }
    }));
  };

  const handleEmiChange = (period: number, amount: number) => {
    const monthIndex = viewType === 'yearly' ? (period - 1) * 12 + 1 : period;
    setLoanInput(prev => ({
      ...prev,
      emiOverrides: { ...prev.emiOverrides, [monthIndex]: amount }
    }));
  };

  const formatCurrency = (val: number) => `₹${Math.round(val).toLocaleString()}`;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
      {/* Input Section */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Shield className="text-white w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Loan Shield</h2>
              <p className="text-sm text-slate-500 font-medium">Dynamic Multi-Variable Debt Modeling</p>
            </div>
          </div>
          
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200">
            <button 
              onClick={() => setLoanInput({...loanInput, prepaymentStrategy: 'TENURE'})}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${loanInput.prepaymentStrategy === 'TENURE' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Timer className="w-3.5 h-3.5" /> Reduce Tenure
            </button>
            <button 
              onClick={() => setLoanInput({...loanInput, prepaymentStrategy: 'EMI'})}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${loanInput.prepaymentStrategy === 'EMI' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Wallet className="w-3.5 h-3.5" /> Reduce EMI
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <IndianRupee className="w-3.5 h-3.5" /> Principal Amount
            </label>
            <input
              type="number"
              value={loanInput.principal}
              onChange={(e) => setLoanInput({...loanInput, principal: Number(e.target.value)})}
              className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-black text-xl transition-all"
            />
            {loanInput.principal > 0 && (
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-2 animate-in fade-in slide-in-from-top-1">
                {toIndianWords(loanInput.principal)}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Percent className="w-3.5 h-3.5" /> Base Interest Rate
            </label>
            <input
              type="number"
              step="0.1"
              value={loanInput.interestRate}
              onChange={(e) => setLoanInput({...loanInput, interestRate: Number(e.target.value)})}
              className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-black text-xl transition-all"
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Tenure (Years)
            </label>
            <input
              type="number"
              value={loanInput.tenureYears}
              max="30"
              onChange={(e) => setLoanInput({...loanInput, tenureYears: Math.min(30, Number(e.target.value))})}
              className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-black text-xl transition-all"
            />
          </div>
        </div>
      </div>

      {(results.isCapTriggered || results.isNegativeAmortization) && (
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-center gap-4 text-amber-800 animate-in fade-in slide-in-from-top-2">
          <Clock className="w-6 h-6 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-black uppercase tracking-tight">Persistence Guard Active</p>
            <p className="text-xs font-medium opacity-80 mt-1">
              {results.isCapTriggered 
                ? "Tenure reached 30 years. EMI has been auto-adjusted to clear debt. Manual overrides will still persist for future periods."
                : "Manual EMI is below monthly interest. Minimal clearing amount has been enforced for stability."}
            </p>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Initial EMI', 
            val: formatCurrency(results.baseEmi), 
            icon: <Receipt className="text-indigo-600" />, 
            sub: 'Benchmark installment' 
          },
          { 
            label: 'Total Interest', 
            val: formatCurrency(results.totalInterest), 
            icon: <Percent className="text-rose-600" />, 
            sub: `${((results.totalInterest / results.totalPayment) * 100).toFixed(1)}% Interest Cost` 
          },
          { 
            label: 'Total Payable', 
            val: formatCurrency(results.totalPayment), 
            icon: <IndianRupee className="text-emerald-600" />, 
            sub: 'Principal + Strategy Interest' 
          },
          { 
            label: 'Actual Tenure', 
            val: `${(results.actualTenureMonths / 12).toFixed(1)} Yrs`, 
            icon: <Calendar className="text-orange-600" />, 
            sub: results.actualTenureMonths >= 360 
              ? <span className="text-amber-600 font-bold">30 Year Cap Enforced</span>
              : results.actualTenureMonths < (loanInput.tenureYears * 12)
                ? `Saved: ${(((loanInput.tenureYears * 12) - results.actualTenureMonths) / 12).toFixed(1)} Yrs`
                : `Extended: ${((results.actualTenureMonths - (loanInput.tenureYears * 12)) / 12).toFixed(1)} Yrs`
          },
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-indigo-200 transition-all">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">{item.icon}</div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{item.val}</p>
              <div className="text-[10px] font-bold text-slate-400 mt-1">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Amortization Logs</h3>
              <p className="text-sm text-slate-500 font-medium">Overridden values persist for all future months until reset</p>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button onClick={() => setViewType('yearly')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${viewType === 'yearly' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>Yearly</button>
            <button onClick={() => setViewType('monthly')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${viewType === 'monthly' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>Monthly</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{viewType === 'yearly' ? 'Year' : 'Month'}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate (%)</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">EMI Paid</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Interest (I)</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prepayment</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Outstanding</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Flow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(viewType === 'yearly' ? results.yearlySchedule : results.monthlySchedule).map((row) => {
                const monthIndex = viewType === 'yearly' ? (row.period - 1) * 12 + 1 : row.period;
                // Check if this specific cell has a direct override
                const hasDirectOverride = loanInput.emiOverrides[monthIndex] !== undefined;
                const hasDirectRateOverride = loanInput.interestRateOverrides[monthIndex] !== undefined;

                return (
                  <tr key={row.period} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-slate-900">
                        {viewType === 'yearly' ? `Year ${row.period}` : `${row.monthName} ${2024 + Math.floor((row.period - 1) / 12)}`}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <input 
                        type="number" step="0.1"
                        value={editingCell?.period === row.period && editingCell.field === 'rate' ? editingCell.value : row.interestRate}
                        onFocus={() => setEditingCell({period: row.period, field: 'rate', value: row.interestRate.toString()})}
                        onBlur={() => setEditingCell(null)}
                        onChange={(e) => {
                          setEditingCell(prev => prev ? {...prev, value: e.target.value} : null);
                          handleRateChange(row.period, Number(e.target.value));
                        }}
                        className={`w-16 px-2 py-1.5 rounded-lg text-xs font-bold outline-none border transition-all ${
                          hasDirectRateOverride
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                          : 'bg-slate-50 border-slate-100 text-slate-600 focus:border-indigo-400'
                        }`}
                      />
                    </td>
                    <td className="px-8 py-5">
                      <div className="relative group/emi">
                        <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                        <input 
                          type="number"
                          value={editingCell?.period === row.period && editingCell.field === 'emi' ? editingCell.value : Math.round(row.emiPaid)}
                          onFocus={() => setEditingCell({period: row.period, field: 'emi', value: Math.round(row.emiPaid).toString()})}
                          onBlur={() => setEditingCell(null)}
                          onChange={(e) => {
                            setEditingCell(prev => prev ? {...prev, value: e.target.value} : null);
                            handleEmiChange(row.period, Number(e.target.value));
                          }}
                          className={`w-28 pl-6 pr-2 py-1.5 rounded-lg text-xs font-bold outline-none border transition-all ${
                            hasDirectOverride
                            ? 'bg-blue-600 border-blue-700 text-white' 
                            : 'bg-slate-50 border-slate-100 text-slate-700 focus:border-blue-400'
                          }`}
                        />
                        <div className="absolute -top-1 -right-1 opacity-0 group-hover/emi:opacity-100 transition-opacity">
                           <Edit3 className={`w-2.5 h-2.5 ${hasDirectOverride ? 'text-white' : 'text-blue-400'}`} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-500">₹{Math.round(row.interestPaid).toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <input 
                        type="number" placeholder="0"
                        value={editingCell?.period === row.period && editingCell.field === 'prepayment' ? editingCell.value : (row.prepayment || '')}
                        onFocus={() => setEditingCell({period: row.period, field: 'prepayment', value: (row.prepayment || '').toString()})}
                        onBlur={() => setEditingCell(null)}
                        onChange={(e) => {
                          setEditingCell(prev => prev ? {...prev, value: e.target.value} : null);
                          handlePrepaymentChange(row.period, Number(e.target.value));
                        }}
                        className="w-24 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                      />
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-700">₹{Math.round(row.principalOutstanding).toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-indigo-600">₹{Math.round(row.totalPayment).toLocaleString()}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Strategy Documentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`rounded-[2.5rem] p-10 border transition-all bg-indigo-50 border-indigo-200`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm bg-indigo-600 text-white`}>
              <Edit3 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Persistent Overrides</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Changes to <strong>Interest Rate</strong> or <strong>EMI Paid</strong> in the logs are now persistent.
            <br/><br/>
            • <strong>Carry Forward:</strong> If you change the EMI in Year 2, the engine will use that same value for Year 3, 4, and beyond, unless you override it again later.
            <br/>• <strong>Simulation Power:</strong> Easily test "Step-up" scenarios by changing the EMI at specific intervals (e.g., Year 1, Year 5, Year 10).
          </p>
        </div>

        <div className={`rounded-[2.5rem] p-10 border transition-all bg-slate-900 border-slate-800 text-white`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm bg-blue-500 text-white`}>
              <Timer className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black uppercase tracking-tight">Logic Persistence</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Our engine mirrors real-world variable-rate contracts. 
            <br/><br/>
            When you force an EMI value, you are essentially telling the bank to lock your monthly budget. The <strong>Actual Tenure</strong> will dynamically expand or contract based on how your manual EMI covers the (potentially fluctuating) interest.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;