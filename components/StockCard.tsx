import React from 'react';
import { Stock, MarketCap } from '../types';
import { ExternalLink } from 'lucide-react';

interface StockCardProps {
  stock: Stock;
  totalCapital?: number;
}

const StockCard: React.FC<StockCardProps> = ({ stock, totalCapital }) => {
  const capColor = {
    [MarketCap.LARGE]: 'bg-indigo-100 text-indigo-700',
    [MarketCap.MID]: 'bg-teal-100 text-teal-700',
    [MarketCap.SMALL]: 'bg-rose-100 text-rose-700',
  };

  const nseLink = `https://www.nseindia.com/get-quote/equity/${stock.ticker}`;
  const amount = totalCapital ? (totalCapital * (stock.allocation / 100)) : null;

  return (
    <div className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase">
              {stock.ticker}
            </h3>
            <a 
              href={nseLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-500 transition-colors"
              title="View on NSE"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-xs text-slate-500 truncate max-w-[140px] font-medium">{stock.name}</p>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${capColor[stock.marketCap as MarketCap] || 'bg-slate-100'}`}>
          {stock.marketCap}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-slate-50 p-2 rounded-lg">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Allocation</p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-sm font-black text-slate-700">{stock.allocation}%</p>
            {amount !== null && (
              <p className="text-[9px] font-black text-blue-600">₹{Math.round(amount).toLocaleString()}</p>
            )}
          </div>
        </div>
        <div className="bg-green-50 p-2 rounded-lg">
          <p className="text-[10px] text-green-500 uppercase font-bold tracking-tight">Target Ret.</p>
          <p className="text-sm font-black text-green-700">{stock.projectedReturn}</p>
        </div>
      </div>

      <div className="relative group/tooltip">
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic border-l-2 border-slate-200 pl-2">
          "{stock.rationale}"
        </p>
        <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-800 text-white text-[11px] rounded-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-10 shadow-xl border border-white/10">
          {stock.rationale}
        </div>
      </div>
    </div>
  );
};

export default StockCard;