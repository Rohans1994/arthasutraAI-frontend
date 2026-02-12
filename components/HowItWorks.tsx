
import React from 'react';
import { 
  BarChart2, 
  ShieldCheck, 
  Activity, 
  Search, 
  Percent, 
  BookOpen, 
  Layers, 
  TrendingUp, 
  FileText, 
  Globe, 
  Cpu,
  BarChart3,
  Flame,
  Calculator,
  Timer
} from 'lucide-react';

const HowItWorks: React.FC = () => {
  const metrics = [
    {
      icon: <Percent className="w-6 h-6 text-blue-600" />,
      title: "CAGR Analysis",
      description: "We calculate the Compound Annual Growth Rate required to reach your target wealth from your initial capital over the specified period."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-green-600" />,
      title: "Fundamental Health",
      description: "Analysis of ROCE (Return on Capital Employed), Debt-to-Equity ratio, and EPS growth over the last 5 years to ensure long-term stability."
    },
    {
      icon: <Activity className="w-6 h-6 text-red-600" />,
      title: "Technical Momentum",
      description: "Evaluating RSI, Moving Averages (50-day and 200-day), and volume trends from the last 2 years of Nifty 100 historical data."
    },
    {
      icon: <Search className="w-6 h-6 text-purple-600" />,
      title: "Future Projections",
      description: "Gemini AI synthesizes latest market news, sector headwinds, and quarterly guidance to predict future earnings potential."
    }
  ];

  const healthCheckPillars = [
    {
      title: "Financial Fundamentals",
      icon: <BarChart3 className="w-5 h-5 text-emerald-600" />,
      items: [
        "P/E & P/B Ratios: Valuations relative to historical averages and industry peers.",
        "Debt-to-Equity: Assessing the leverage and financial risk of the company.",
        "Interest Coverage: Ability to service debt from operating profits.",
        "ROE/ROCE Trends: Efficiency of capital usage over a 3nd to 5-year cycle."
      ]
    },
    {
      title: "Technical Pulse",
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      items: [
        "RSI (Relative Strength Index): Identifying overbought or oversold conditions.",
        "Golden/Death Crosses: Analyzing 50-DMA vs 200-DMA for trend shifts.",
        "MACD Divergence: Spotting potential price reversals before they happen.",
        "Support & Resistance: Historical price floors and ceilings based on volume."
      ]
    },
    {
      title: "Forward-Looking Catalysts",
      icon: <Cpu className="w-5 h-5 text-orange-600" />,
      items: [
        "Government Policy: Impact of PLI schemes, tax changes, or regulatory shifts.",
        "Capex Guidance: Analyzing company plans for future expansion and R&D.",
        "Global Headwinds: Considering commodity prices, FX rates, and geo-politics.",
        "Earnings Momentum: Quarterly guidance versus actual performance trends."
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-bold mb-4">
          <BookOpen className="w-4 h-4" />
          The Methodology
        </div>
        <h2 className="text-4xl font-extrabold text-slate-900 mb-6">How ArthaSutra AI Works</h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Our intelligent algorithm processes millions of data points across the Nifty 100 to find the perfect equilibrium between risk and reward.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center">{m.icon}</div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{m.title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed">{m.description}</p>
          </div>
        ))}
      </div>

      {/* FIRE Section Deep Dive */}
      <div className="mb-20 space-y-12">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            <Flame className="w-3 h-3" />
            FIRE Mathematics
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">The Logic of Financial Freedom</h3>
          <p className="text-slate-500 max-w-2xl mt-2 font-medium">Understanding the core calculations behind FIRE (Financial Independence, Retire Early).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-50 rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-xl font-black text-slate-800 tracking-tight uppercase">The 4% Rule (Trinity Study)</h4>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
              The 4% Rule states that you can withdraw 4% of your initial retirement portfolio (inflation-adjusted) every year for 30 years without running out of money. 
            </p>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 font-mono text-xs text-slate-700">
               <p className="font-bold mb-2">Equation:</p>
               <p className="bg-white p-2 rounded border border-slate-200 text-center text-lg">Corpus = Annual Expenses × 25</p>
               <p className="mt-4 text-slate-500 italic">This implies a withdrawal rate that allows the remaining 96% of the corpus to stay invested and grow, counteracting inflation and market volatility.</p>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <Calculator className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-black text-slate-800 tracking-tight uppercase">Sustenance Modeling</h4>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
              A more precise calculation for retirees looking for a custom timeline (e.g., 40-50 years in retirement). It uses the **Present Value of an Annuity Due** formula with inflation-adjusted real returns.
            </p>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 font-mono text-xs text-slate-700">
               <p className="font-bold mb-2">Real Return Rate (R):</p>
               <p className="bg-white p-2 rounded border border-slate-200 text-center mb-4">R = [(1 + nominal_return) / (1 + inflation)] - 1</p>
               <p className="font-bold mb-2">Future Corpus:</p>
               <p className="bg-white p-2 rounded border border-slate-200 text-center">Corpus = E × [(1 - (1 + R)^-n) / R]</p>
               <p className="mt-2 text-[10px] text-slate-400">Where E = Future Annual Expense, n = Retirement Duration.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Health Check Deep Dive */}
      <div className="mb-20 space-y-10">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            <Activity className="w-3 h-3" />
            Deep Dive
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">The Portfolio Health Check Engine</h3>
          <p className="text-slate-500 max-w-2xl mt-2 font-medium">When you run a health check, our AI doesn't just look at prices. It performs a 360-degree audit of every ticker in your holdings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {healthCheckPillars.map((pillar, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:border-blue-200 transition-colors group">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                  {pillar.icon}
                </div>
                <h4 className="font-black text-slate-800 tracking-tight">{pillar.title}</h4>
              </div>
              <ul className="space-y-4">
                {pillar.items.map((item, i) => {
                  const [bold, rest] = item.split(': ');
                  return (
                    <li key={i} className="flex gap-3 text-xs leading-relaxed">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      <p className="text-slate-600">
                        <span className="font-bold text-slate-900">{bold}:</span> {rest}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Globe className="text-white w-8 h-8" />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-900 mb-1">Real-Time Search Grounding</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Unlike static models, our Health Check uses <span className="text-blue-600 font-bold">Google Search Grounding</span>. This means we fetch the absolute latest CMP (Current Market Price) from sources like TradingView and NSE India, and analyze current news cycles (e.g., quarterly results released just hours ago) to give you an accurate "Sell, Hold, or Accumulate" rating.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-10 text-white overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Layers className="w-6 h-6 text-blue-400" />
            <h3 className="text-2xl font-black uppercase tracking-tight">The Selection Process</h3>
          </div>
          <div className="space-y-8 max-w-2xl">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black flex-shrink-0 text-white shadow-lg shadow-blue-500/20">1</div>
              <div>
                <h4 className="font-bold text-slate-200 text-lg">Data Aggregation</h4>
                <p className="text-slate-400 text-sm leading-relaxed">Real-time scraping of NSE Nifty 100 stock list including historical OHLC data, balance sheets, and cash flow statements.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black flex-shrink-0 text-white shadow-lg shadow-blue-500/20">2</div>
              <div>
                <h4 className="font-bold text-slate-200 text-lg">Risk Profiling</h4>
                <p className="text-slate-400 text-sm leading-relaxed">Calculation of required CAGR. >18% triggers an 'Aggressive' profile, automatically shifting weights toward high-momentum Mid and Small-cap stocks.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black flex-shrink-0 text-white shadow-lg shadow-blue-500/20">3</div>
              <div>
                <h4 className="font-bold text-slate-200 text-lg">AI Filtering & Synthesis</h4>
                <p className="text-slate-400 text-sm leading-relaxed">Gemini 2.5/3 Pro executes complex multi-step reasoning to filter the 100 stocks into the top 15 picks that match your specific time horizon and capital target.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default HowItWorks;