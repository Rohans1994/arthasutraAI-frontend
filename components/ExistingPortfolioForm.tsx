import React, { useState, useRef, useEffect } from 'react';
import { UserHolding } from '../types';
import { searchTickers } from '../services/geminiService';
import { auth, syncPortfolioToFirestore } from '../services/firebase';
import { Plus, Trash2, Activity, PieChart, IndianRupee, Hash, Calculator, Loader2, Upload, FileText, AlertCircle, CheckCircle2, ShieldAlert, Copy, Check, Download } from 'lucide-react';

interface Suggestion {
  ticker: string;
  name: string;
}

interface ExistingPortfolioFormProps {
  onAnalyze: (holdings: UserHolding[], years: number) => void;
  isLoading: boolean;
  isLimitReached?: boolean;
}

const ExistingPortfolioForm: React.FC<ExistingPortfolioFormProps> = ({ onAnalyze, isLoading, isLimitReached }) => {
  const [holdings, setHoldings] = useState<UserHolding[]>([
    { ticker: 'RELIANCE', quantity: 10, buyPrice: 2400 }
  ]);
  const [years, setYears] = useState(5);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveSuggestionIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const performSearch = async (index: number, query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    const results = await searchTickers(query);
    setSuggestions(results);
    setIsSearching(false);
    setActiveSuggestionIndex(index);
  };

  const addHolding = () => {
    setHoldings([...holdings, { ticker: '', quantity: 1, buyPrice: 0 }]);
  };

  const removeHolding = (index: number) => {
    setHoldings(holdings.filter((_, i) => i !== index));
    if (activeSuggestionIndex === index) setActiveSuggestionIndex(null);
  };

  const updateHolding = (index: number, field: keyof UserHolding, value: any) => {
    const newHoldings = [...holdings];
    const updatedValue = field === 'ticker' ? value.toUpperCase() : Number(value);
    newHoldings[index] = { ...newHoldings[index], [field]: updatedValue };
    setHoldings(newHoldings);

    if (field === 'ticker') {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      
      if (value.length >= 2) {
        searchTimeoutRef.current = window.setTimeout(() => {
          performSearch(index, value);
        }, 300);
      } else {
        setSuggestions([]);
        setActiveSuggestionIndex(null);
      }
    }
  };

  const selectSuggestion = (index: number, suggestion: Suggestion) => {
    const newHoldings = [...holdings];
    newHoldings[index].ticker = suggestion.ticker;
    setHoldings(newHoldings);
    setActiveSuggestionIndex(null);
    setSuggestions([]);
  };

  const downloadSampleCSV = () => {
    const headers = ['Instrument', 'Qty.', 'Avg. cost', 'LTP'];
    const rows = [
      ['RELIANCE', '10', '2500', '2950'],
      ['TCS', '5', '3200', '4100'],
      ['HDFCBANK', '20', '1450', '1600'],
      ['INFY', '15', '1300', '1700'],
      ['ICICIBANK', '30', '950', '1050']
    ];
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'ArthaSutra_Sample_Portfolio.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSVLine = (line: string) => {
    const cells = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    return cells.map(cell => cell.replace(/^"|"$/g, '').trim());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);
    setPermissionError(false);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        const rawRows = content.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (rawRows.length < 2) throw new Error("File is empty or missing data rows.");

        const rows = rawRows.map(parseCSVLine);
        const headers = rows[0].map(h => h.toLowerCase());
        
        const tickerIdx = headers.findIndex(h => 
          h === 'instrument' || h === 'ticker' || h === 'stock symbol' || h.includes('symbol') || h.includes('stock')
        );
        const quantityIdx = headers.findIndex(h => 
          h === 'qty.' || h === 'qty' || h.includes('quantity') || h.includes('units')
        );
        const priceIdx = headers.findIndex(h => 
          h === 'avg. cost' || h === 'average cost price' || h.includes('avg price') || h.includes('buy price') || h.includes('cost') || h.includes('purchase price')
        );
        const currentPriceIdx = headers.findIndex(h => 
          h === 'ltp' || h === 'current market price' || h.includes('current price') || h.includes('last traded price')
        );

        if (tickerIdx === -1 || quantityIdx === -1 || priceIdx === -1) {
          throw new Error("Missing required columns: Instrument, Qty., or Avg. cost.");
        }

        const parsedHoldings: UserHolding[] = rows.slice(1)
          .filter(row => row.length > Math.max(tickerIdx, quantityIdx, priceIdx) && row[tickerIdx])
          .map(row => {
            const qtyStr = row[quantityIdx].replace(/[^0-9.-]/g, '');
            const priceStr = row[priceIdx].replace(/[^0-9.-]/g, '');
            const currentPriceStr = currentPriceIdx !== -1 ? row[currentPriceIdx].replace(/[^0-9.-]/g, '') : null;
            
            return {
              ticker: row[tickerIdx].toUpperCase(),
              quantity: parseFloat(qtyStr) || 0,
              buyPrice: parseFloat(priceStr) || 0,
              currentPrice: currentPriceStr ? parseFloat(currentPriceStr) : undefined
            };
          })
          .filter(h => h.ticker.length > 0 && h.quantity > 0);

        if (parsedHoldings.length === 0) throw new Error("No valid holdings were found.");

        setHoldings(parsedHoldings);

        if (auth.currentUser) {
          setIsSyncing(true);
          try {
            await syncPortfolioToFirestore(auth.currentUser.uid, parsedHoldings);
            setIsSyncing(false);
            setImportSuccess(`Imported ${parsedHoldings.length} stocks and synced to cloud.`);
          } catch (syncErr: any) {
            setIsSyncing(false);
            if (syncErr.message?.includes('permission') || syncErr.code === 'permission-denied') {
              setPermissionError(true);
              setImportError("Database access denied. Firestore rules update required.");
            } else {
              setImportError(`Sync failed: ${syncErr.message}`);
            }
          }
        } else {
          setImportSuccess(`Imported ${parsedHoldings.length} stocks locally.`);
        }
        
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setImportSuccess(null), 5000);
      } catch (err: any) {
        setImportError(err.message || "Failed to parse CSV.");
        setIsSyncing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (holdings.length > 0 && !isLimitReached) {
      onAnalyze(holdings, years);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Analyze Portfolio
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">LTP from CSV prioritized & Cloud Synced</p>
          </div>
          
          <div className="flex items-center gap-3">
            <input type="file" accept=".csv" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
            <button
              type="button"
              onClick={downloadSampleCSV}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors border border-slate-200"
              title="Download template CSV with required columns"
            >
              <Download className="w-4 h-4" />
              Sample CSV
            </button>
            <button
              type="button"
              disabled={isSyncing}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors border border-slate-200 group disabled:opacity-50"
            >
              {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />}
              Upload CSV
            </button>
            <button
              type="button"
              onClick={addHolding}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Manual
            </button>
          </div>
        </div>

        {permissionError && (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
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

        {importError && !permissionError && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in zoom-in duration-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-bold">{importError}</p>
          </div>
        )}

        {importSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-bold">{importSuccess}</p>
          </div>
        )}

        <div className="space-y-4 max-h-[400px] overflow-visible pr-2 scrollbar-thin overflow-y-auto">
          {holdings.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <FileText className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">No holdings yet. Upload a CSV to begin.</p>
            </div>
          ) : (
            holdings.map((holding, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-2xl relative group border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                <div className="space-y-1 relative">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ticker</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={holding.ticker}
                      onChange={(e) => updateHolding(index, 'ticker', e.target.value)}
                      onFocus={() => holding.ticker.length >= 2 && suggestions.length > 0 && setActiveSuggestionIndex(index)}
                      className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold uppercase shadow-sm"
                      placeholder="e.g. RELIANCE"
                      required
                    />
                    {isSearching && activeSuggestionIndex === index && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />}
                    {activeSuggestionIndex === index && suggestions.length > 0 && (
                      <div ref={dropdownRef} className="absolute z-[60] left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden max-h-60 overflow-y-auto">
                        {suggestions.map((s) => (
                          <button key={s.ticker} type="button" onClick={() => selectSuggestion(index, s)} className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-slate-50 last:border-0 group/item">
                            <span className="block text-sm font-black text-slate-800">{s.ticker}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{s.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Qty</label>
                  <input
                    type="number"
                    value={holding.quantity}
                    onChange={(e) => updateHolding(index, 'quantity', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold shadow-sm"
                    placeholder="0"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Avg Price</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="number"
                      value={holding.buyPrice}
                      onChange={(e) => updateHolding(index, 'buyPrice', e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold shadow-sm"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {holding.currentPrice && (
                    <div className="flex flex-col items-end justify-center h-[42px] px-3 bg-blue-50 rounded-xl border border-blue-100">
                      <span className="text-[8px] font-black text-blue-400 uppercase">LTP extracted</span>
                      <span className="text-xs font-black text-blue-700">₹{holding.currentPrice}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeHolding(index)}
                    className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-orange-500" />
              Projection Period (Years)
            </label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold shadow-sm"
              min="1" max="30" required
            />
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <button
              type="submit"
              disabled={isLoading || holdings.length === 0 || isLimitReached}
              className={`
                px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl flex items-center gap-2 hover:bg-slate-800 transition-all
                ${(isLoading || holdings.length === 0 || isLimitReached) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
              `}
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <PieChart className="w-5 h-5" />}
              Deep Audit Portfolio
            </button>
            {isLimitReached && (
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Upgrade Plan to audit your portfolio</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ExistingPortfolioForm;