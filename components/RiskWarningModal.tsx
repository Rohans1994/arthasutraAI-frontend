import React from 'react';
import { AlertTriangle, TrendingUp, ShieldAlert, X, ArrowRight } from 'lucide-react';

interface RiskWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  cagr: number;
}

const RiskWarningModal: React.FC<RiskWarningModalProps> = ({ isOpen, onClose, cagr }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[120] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] max-w-xl w-full relative shadow-2xl animate-in zoom-in duration-300 my-auto overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Close Button - Fixed at top */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 sm:top-8 sm:right-8 p-2 text-slate-400 hover:text-slate-600 transition-colors z-20 bg-white/80 backdrop-blur-sm rounded-full"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto p-8 sm:p-10 custom-scrollbar">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mb-6 sm:mb-8 animate-bounce">
              <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-rose-600" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase">Aggressive Profile Alert</h3>
            
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-2xl text-base sm:text-lg font-black shadow-lg shadow-rose-200">
              <TrendingUp className="w-4 h-4 sm:w-5 h-5" />
              {cagr}% CAGR REQ.
            </div>

            <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 text-slate-600 font-medium leading-relaxed text-sm sm:text-base">
              <p>
                Your wealth target requires an annual growth rate significantly higher than the market benchmark (Nifty 50: ~12-14%). 
              </p>
              
              <div className="bg-slate-50 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 text-left space-y-4">
                <div className="flex gap-3 sm:gap-4">
                  <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 shrink-0" />
                  <p className="text-xs sm:text-sm">
                    <span className="font-black text-slate-900 block uppercase text-[9px] sm:text-[10px] tracking-widest mb-1">Volatility Warning</span>
                    To achieve this return, the AI has selected high-beta Mid and Small-cap stocks. These assets can experience price swings of 30-50% in short durations.
                  </p>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 shrink-0" />
                  <p className="text-xs sm:text-sm">
                    <span className="font-black text-slate-900 block uppercase text-[9px] sm:text-[10px] tracking-widest mb-1">Sustainability</span>
                    Double-digit outperformance is rarely linear. Ensure you have a 5+ year horizon and do not invest emergency funds here.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 w-full gap-4 mt-8 sm:mt-10">
              <button 
                onClick={onClose}
                className="w-full py-4 sm:py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 text-sm sm:text-base"
              >
                I Understand & Proceed <ArrowRight className="w-4 h-4 sm:w-5 h-5" />
              </button>
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Always consult a financial advisor before investing</p>
            </div>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
};

export default RiskWarningModal;