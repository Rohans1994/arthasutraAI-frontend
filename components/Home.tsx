import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Target, 
  Activity, 
  RefreshCw, 
  Flame, 
  BarChart4, 
  Shield, 
  CheckCircle2, 
  Zap,
  LayoutGrid,
  ShieldCheck,
  TrendingUp,
  Search,
  BookOpen,
  PieChart,
  ChevronRight,
  Coins
} from 'lucide-react';
import { View } from '../types';

interface HomeProps {
  onNavigate: (view: View) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const features = [
    {
      id: 'architect',
      icon: <Target className="w-8 h-8 text-blue-800" />,
      title: "Wealth Architect",
      desc: "Define your financial goals and timeline. Our engine builds a diversified basket of Nifty 100 stocks optimized for your required CAGR.",
      color: "bg-blue-50 border-blue-100",
      accent: "blue"
    },
    {
      id: 'health-check',
      icon: <Activity className="w-8 h-8 text-emerald-700" />,
      title: "Portfolio Audit",
      desc: "Deep-dive into your current holdings. Get real-time fundamental & technical diagnosis for every ticker in your portfolio.",
      color: "bg-emerald-50 border-emerald-100",
      accent: "emerald"
    },
    {
      id: 'rebalancer',
      icon: <RefreshCw className="w-8 h-8 text-indigo-800" />,
      title: "Asset Rebalancer",
      desc: "Stay aligned with your target risk. Analyze deviations from ideal asset allocation and get precise, valuation-based tilt signals.",
      color: "bg-indigo-50 border-indigo-100",
      accent: "indigo"
    },
    {
      id: 'fire',
      icon: <Flame className="w-8 h-8 text-orange-700" />,
      title: "FIRE Planner",
      desc: "Model your journey to early retirement. Calculate inflation-adjusted sustenance corpus and required monthly surplus.",
      color: "bg-orange-50 border-orange-100",
      accent: "orange"
    },
    {
      id: 'xirr-vault',
      icon: <BarChart4 className="w-8 h-8 text-teal-700" />,
      title: "XIRR Vault",
      desc: "Precision return tracking for irregular cash flows. The only true way to measure SIP and lump-sum CAGR over time.",
      color: "bg-teal-50 border-teal-100",
      accent: "teal"
    },
    {
      id: 'loan-shield',
      icon: <Shield className="w-8 h-8 text-rose-700" />,
      title: "Loan Optimizer",
      desc: "Strategize debt clearing. Simulate prepayments and interest rate overrides to reduce tenure or monthly EMI burden.",
      color: "bg-rose-50 border-rose-100",
      accent: "rose"
    }
  ];

  const methodologyPillars = [
    {
      icon: <Target className="w-6 h-6 text-blue-800" />,
      title: "CAGR Realism",
      description: "We don't just pick 'best' stocks. We calculate the exact mathematical growth rate needed for your target goal."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-700" />,
      title: "Nifty 100 Filtering",
      description: "Our universe is strictly limited to India's top 100 listed entities, ensuring liquidity and quality benchmarks."
    },
    {
      icon: <Search className="w-6 h-6 text-indigo-800" />,
      title: "Search Grounding",
      description: "Gemini 3 Pro scans real-time financial news and NSE data, ensuring audits aren't based on stale values."
    },
    {
      icon: <BookOpen className="w-6 h-6 text-orange-700" />,
      title: "Deterministic Safety",
      description: "Logic trees prevent selling in bear markets or excessive risk-taking when goals are nearly met."
    }
  ];

  return (
    <div className="space-y-24 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative py-12">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
            <Zap className="w-3 h-3" /> Powered by Gemini 3.1
          </div>
          <h1 className="text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
            Architecting <span className="text-blue-800">Artha</span> through Intelligence.
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mb-10">
            ArthaSutra AI is a professional suite of deterministic financial tools designed to eliminate guesswork from your investment journey.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => onNavigate('architect')}
              className="px-8 py-4 bg-blue-800 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-900 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-100"
            >
              Start Building <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => document.getElementById('methodology')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all"
            >
              View Methodology
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -z-10 opacity-[0.03] rotate-12 flex">
           <TrendingUp className="w-96 h-96 text-blue-800" />
           <Coins className="w-64 h-64 text-blue-900 absolute -bottom-20 -left-20" />
        </div>
      </section>

      {/* Feature Grid */}
      <section>
        <div className="mb-12">
           <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Operational Modules</h2>
           <p className="text-slate-500 font-medium mt-2">Specialized tools for every stage of your wealth management lifecycle.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {features.map((f) => (
             <div 
              key={f.id} 
              className={`${f.color} border p-8 rounded-[2.5rem] transition-all hover:shadow-2xl hover:-translate-y-1 group cursor-pointer`}
              onClick={() => onNavigate(f.id as View)}
             >
                <div className="bg-white p-4 rounded-2xl shadow-sm inline-flex mb-6 group-hover:scale-110 transition-transform">
                   {f.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3 uppercase">{f.title}</h3>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mb-8">
                   {f.desc}
                </p>
                <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest">
                   Open Tool <ChevronRight className="w-4 h-4" />
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Methodology Section */}
      <section id="methodology" className="bg-slate-900 rounded-[3.5rem] p-12 lg:p-20 text-white relative overflow-hidden">
         <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              <BookOpen className="w-3 h-3" /> The Engine Core
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-8">Precision-First Methodology</h2>
            <p className="text-lg text-slate-400 font-medium leading-relaxed mb-16">
              ArthaSutra isn't a prediction engine. It's a deterministic framework built on financial mathematics, historical Nifty 100 data, and real-time market signals.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {methodologyPillars.map((p, i) => (
                 <div key={i} className="space-y-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 w-fit">
                       {p.icon}
                    </div>
                    <h4 className="text-xl font-black tracking-tight uppercase">{p.title}</h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                       {p.description}
                    </p>
                 </div>
               ))}
            </div>

            <div className="mt-20 p-8 bg-white/5 rounded-[2rem] border border-white/10 flex flex-col md:flex-row items-center gap-8">
               <div className="w-20 h-20 bg-blue-800 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl shadow-blue-500/20">
                  <PieChart className="w-10 h-10" />
               </div>
               <div>
                  <h5 className="text-xl font-black mb-2 uppercase tracking-tight">Data Integrity</h5>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed italic">
                    "Every recommendation is cross-referenced with live Current Market Prices (CMP) from official sources. We prioritize Liquidity and Balance Sheet health over speculative growth."
                  </p>
               </div>
            </div>
         </div>
         <div className="absolute -bottom-20 -right-20 w-96 h-96 opacity-[0.03] rotate-12 flex">
            <TrendingUp className="w-full h-full text-white" />
         </div>
      </section>

      {/* Trust Factors */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
         {[
           { icon: <ShieldCheck className="text-emerald-500" />, title: "Non-Custodial", desc: "We never ask for your broker login or sensitive keys." },
           { icon: <CheckCircle2 className="text-blue-500" />, title: "Conflict Free", desc: "No commissions. No hidden stock promotions. Pure data." },
           { icon: <TrendingUp className="text-blue-800" />, title: "Nifty 100 Focus", desc: "Safety in Bluechips. Liquidity in every recommendation." }
         ].map((t, i) => (
           <div key={i} className="flex gap-5 items-start">
              <div className="p-3 bg-slate-100 rounded-xl">
                 {t.icon}
              </div>
              <div>
                 <h4 className="font-black text-slate-900 uppercase text-sm mb-1 tracking-tight">{t.title}</h4>
                 <p className="text-slate-500 text-xs font-medium leading-relaxed">{t.desc}</p>
              </div>
           </div>
         ))}
      </section>
    </div>
  );
};

export default Home;