import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  InvestmentInput, 
  PortfolioResult, 
  RiskProfile, 
  User, 
  View, 
  UserHolding, 
  ExistingPortfolioAnalysis, 
  XIRRInput, 
  SavedRebalancerStrategy, 
  RebalancerInput, 
  RebalancerAnalysis, 
  RebalancerRationale, 
  PlanTier, 
  SavedAuditReport 
} from './types';
import { generatePortfolio, analyzeExistingPortfolio } from './services/geminiService';
import { 
  auth, 
  db, 
  saveRebalancerStrategyToFirestore, 
  getRebalancerStrategiesFromFirestore, 
  deleteRebalancerStrategyFromFirestore, 
  saveAuditReportToFirestore, 
  getAuditReportsFromFirestore, 
  deleteAuditReportFromFirestore,
  saveArchitectStrategyToFirestore,
  getArchitectStrategiesFromFirestore,
  deleteArchitectStrategyFromFirestore
} from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Home from './components/Home';
import PortfolioForm from './components/PortfolioForm';
import PortfolioResults from './components/PortfolioResults';
import ExistingPortfolioForm from './components/ExistingPortfolioForm';
import LoanCalculator from './components/LoanCalculator'; 
import FIRECalculator from './components/FIRECalculator';
import XIRRCalculator from './components/XIRRCalculator';
import PortfolioRebalancer from './components/PortfolioRebalancer';
import Auth from './components/Auth';
import AnalysisResult from './components/AnalysisResult';
import PlansPage from './components/PlansPage';
import SubscriptionPlans from './components/SubscriptionPlans';
import RiskWarningModal from './components/RiskWarningModal';
import Profile from './components/Profile';
import { 
  Activity,
  Box,
  RefreshCw,
  Target,
  LayoutGrid,
  X,
  Shield,
  Flame,
  BarChart4,
  House,
  Coins,
  TrendingUp as TrendIcon,
  Menu,
  AlertCircle,
  CreditCard
} from 'lucide-react';

const AppLogo = ({ size = "md", className = "" }: { size?: 'sm' | 'md' | 'lg' | 'xl', className?: string }) => {
  const sizes = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-10 h-10 rounded-xl",
    lg: "w-12 h-12 rounded-[1rem]",
    xl: "w-24 h-24 rounded-[2rem]"
  };
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-12 h-12"
  };

  return (
    <div className={`${sizes[size]} bg-blue-800 flex items-center justify-center shadow-lg shadow-blue-900/20 ${className}`}>
      <div className="relative">
        <TrendIcon className={`${iconSizes[size]} text-white`} />
        <Coins className="w-1/2 h-1/2 text-blue-300 absolute -bottom-1 -right-1 stroke-[2.5]" />
      </div>
    </div>
  );
};

const InternalFooter = () => (
  <footer className="bg-slate-950 py-10 px-4 text-center border-t border-white/5 w-full mt-auto">
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-4">
        <AppLogo size="md" />
        <span className="text-lg font-black text-white uppercase tracking-tight">ArthaSutra AI</span>
      </div>
      <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.4em] max-w-md leading-relaxed">
        Institutional Wealth Intelligence &copy; 2026
      </p>
    </div>
  </footer>
);

const PLAN_LIMITS = {
  [PlanTier.FREE]: { architect: 3, rebalancer: 2, audits: 2 },
  [PlanTier.PLUS]: { architect: 10, rebalancer: 5, audits: 10 },
  [PlanTier.PREMIUM]: { architect: 50, rebalancer: 20, audits: 50 }
};

const GenieLoader = () => (
  <div className="fixed inset-0 bg-slate-50/40 backdrop-blur-sm z-[150] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
    <div className="relative mb-12">
      {/* Icon Container matching ArthaSutra Blue-800 */}
      <div className="w-36 h-36 bg-blue-800 rounded-[2.5rem] flex items-center justify-center shadow-[0_30px_60px_-12px_rgba(30,58,138,0.4)] relative overflow-hidden group">
        <div className="relative z-10 flex flex-col items-center">
          <TrendIcon className="w-16 h-16 text-white stroke-[3] mb-1" />
          <div className="flex items-center gap-1">
            <Coins className="w-8 h-8 text-blue-200 fill-blue-200/20" />
            <div className="w-4 h-4 border-2 border-blue-200 rounded-sm rotate-45 flex items-center justify-center">
               <div className="w-1 h-2 bg-blue-200 rotate-45" />
            </div>
          </div>
        </div>
        {/* Subtle light effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-900 rounded-full blur-2xl opacity-50" />
      </div>
      
      {/* Pulse rings */}
      <div className="absolute inset-0 bg-blue-800/10 rounded-[3rem] blur-xl scale-125 animate-pulse" />
      <div className="absolute inset-0 bg-blue-800/5 rounded-[3.5rem] blur-2xl scale-150 animate-pulse delay-700" />
    </div>

    <h2 className="text-2xl font-black text-slate-800 mb-8 tracking-tight uppercase text-center animate-in slide-in-from-bottom-2 duration-700">
      ArthaSutra Genie is working...
    </h2>

    {/* Progress Bar inspired by screenshot */}
    <div className="w-full max-w-sm h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner relative border border-slate-100">
      <div className="absolute inset-y-0 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 rounded-full animate-[loading_2s_infinite_ease-in-out] shadow-[0_0_15px_rgba(30,58,138,0.6)]" style={{ width: '40%' }} />
    </div>

    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes loading {
        0% { left: -40%; }
        50% { left: 30%; }
        100% { left: 100%; }
      }
    `}} />
    
    <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
      Synthesizing Financial Alpha
    </p>
  </div>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [result, setResult] = useState<PortfolioResult | null>(null);
  const [savedPortfolios, setSavedPortfolios] = useState<PortfolioResult[]>([]);
  const [savedRebalancerStrategies, setSavedRebalancerStrategies] = useState<SavedRebalancerStrategy[]>([]);
  const [savedAuditReports, setSavedAuditReports] = useState<SavedAuditReport[]>([]);
  const [analysisResult, setAnalysisResult] = useState<ExistingPortfolioAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState<InvestmentInput | null>(null);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [prefilledXirrData, setPrefilledXirrData] = useState<XIRRInput | null>(null);

  // Auto-scroll to top when user logs in
  useEffect(() => {
    if (currentUser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        let userData: User;
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          userData = {
            uid: user.uid,
            email: user.email || '',
            name: data.name || user.displayName || 'User',
            planTier: data.planTier || PlanTier.FREE
          };
        } else {
          userData = {
            uid: user.uid,
            email: user.email || '',
            name: user.displayName || user.email?.split('@')[0] || 'User',
            planTier: PlanTier.FREE
          };
        }
        setCurrentUser(userData);

        const userPKey = `as_portfolios_${user.uid}`;
        const userRKey = `as_rebalancers_${user.uid}`;
        const userAKey = `as_audits_${user.uid}`;
        
        const localP = localStorage.getItem(userPKey);
        const localR = localStorage.getItem(userRKey);
        const localA = localStorage.getItem(userAKey);
        if (localP) setSavedPortfolios(JSON.parse(localP));
        if (localR) setSavedRebalancerStrategies(JSON.parse(localR));
        if (localA) setSavedAuditReports(JSON.parse(localA));

        try {
           const [cloudArchitect, cloudR, cloudA] = await Promise.all([
              getArchitectStrategiesFromFirestore(user.uid),
              getRebalancerStrategiesFromFirestore(user.uid),
              getAuditReportsFromFirestore(user.uid)
           ]);
           setSavedPortfolios(cloudArchitect);
           setSavedRebalancerStrategies(cloudR);
           setSavedAuditReports(cloudA);
           localStorage.setItem(userPKey, JSON.stringify(cloudArchitect));
           localStorage.setItem(userRKey, JSON.stringify(cloudR));
           localStorage.setItem(userAKey, JSON.stringify(cloudA));
        } catch (err) {
           console.warn("Firestore sync failed.");
        }
      } else {
        setCurrentUser(null);
      }
      setIsAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  const currentPlanLimits = useMemo(() => {
    const tier = currentUser?.planTier || PlanTier.FREE;
    return PLAN_LIMITS[tier];
  }, [currentUser]);

  const isArchitectLimitReached = useMemo(() => {
    return savedPortfolios.length >= currentPlanLimits.architect;
  }, [savedPortfolios, currentPlanLimits]);

  const isRebalancerLimitReached = useMemo(() => {
    return savedRebalancerStrategies.length >= currentPlanLimits.rebalancer;
  }, [savedRebalancerStrategies, currentPlanLimits]);

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setCurrentView('home');
  };

  const handleSaveAudit = useCallback(async (resultData: ExistingPortfolioAnalysis) => {
    if (!currentUser) return;
    
    if (savedAuditReports.length >= currentPlanLimits.audits) {
      console.warn("Audit limit reached. Auto-save skipped.");
      return;
    }

    try {
      const docId = await saveAuditReportToFirestore(currentUser.uid, resultData);
      const newAudit: SavedAuditReport = {
        id: docId,
        timestamp: Date.now(),
        result: resultData
      };
      const updated = [newAudit, ...savedAuditReports];
      setSavedAuditReports(updated);
      localStorage.setItem(`as_audits_${currentUser.uid}`, JSON.stringify(updated));
    } catch (err) {
      console.error("Auto-save Audit Failed:", err);
    }
  }, [currentUser, savedAuditReports, currentPlanLimits]);

  const handleAnalyze = useCallback(async (holdings: UserHolding[], years: number) => {
    setError(null);
    setAnalysisResult(null);
    const inputTickers = holdings.map(h => h.ticker.toUpperCase()).sort();
    const existingAudit = savedAuditReports.find(saved => {
      if (saved.result.years !== years) return false;
      const savedTickers = saved.result.analysis.map(h => h.ticker.toUpperCase()).sort();
      if (inputTickers.length !== savedTickers.length) return false;
      return inputTickers.every((ticker, index) => ticker === savedTickers[index]);
    });
    if (existingAudit) {
      setAnalysisResult(existingAudit.result);
      return;
    }
    setLoading(true);
    try {
      const data = await analyzeExistingPortfolio(holdings, years);
      setAnalysisResult(data);
      if (currentUser) await handleSaveAudit(data);
    } catch (err) {
      setError("Failed to analyze holdings.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, handleSaveAudit, savedAuditReports]);

  const handleGenerate = async (input: InvestmentInput) => {
    setLoading(true);
    setResult(null);
    setLastInput(input);
    try {
      const data = await generatePortfolio(input);
      setResult(data);
      
      // AUTO SAVE ARCHITECT STRATEGY TO FIRESTORE
      if (currentUser && savedPortfolios.length < currentPlanLimits.architect) {
        try {
          const docId = await saveArchitectStrategyToFirestore(currentUser.uid, data);
          const newPortfolio: PortfolioResult = { 
            ...data, 
            id: docId, 
            timestamp: Date.now() 
          };
          const updated = [newPortfolio, ...savedPortfolios];
          setSavedPortfolios(updated);
          localStorage.setItem(`as_portfolios_${currentUser.uid}`, JSON.stringify(updated));
        } catch (saveErr) {
          console.error("Failed to auto-save strategy to Firestore", saveErr);
        }
      }

      if (data.riskProfile === RiskProfile.AGGRESSIVE) setShowRiskModal(true);
    } catch (err) {
      setError("Failed to generate portfolio.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBasket = async (newCounts: { large: number, mid: number, small: number }) => {
    if (!lastInput) return;
    const updatedInput = { ...lastInput, customDistribution: newCounts };
    await handleGenerate(updatedInput);
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!currentUser) return;
    try {
      await deleteArchitectStrategyFromFirestore(currentUser.uid, id);
      const updated = savedPortfolios.filter(p => p.id !== id);
      setSavedPortfolios(updated);
      localStorage.setItem(`as_portfolios_${currentUser.uid}`, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to delete strategy from Firestore", err);
      setError("Failed to delete strategy.");
    }
  };

  const switchView = (view: View) => {
    setCurrentView(view);
    setResult(null);
    setAnalysisResult(null);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <AppLogo size="xl" className="animate-pulse" />
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={setCurrentUser} />;
  }

  const navLinks = [
    { view: 'home', label: 'Home', icon: House, color: 'text-blue-800' },
    { view: 'architect', label: 'Architect', icon: Target, color: 'text-blue-800' },
    { view: 'health-check', label: 'Audit', icon: Activity, color: 'text-emerald-700' },
    { view: 'rebalancer', label: 'Rebalancer', icon: RefreshCw, color: 'text-indigo-800' },
    { view: 'fire', label: 'FIRE', icon: Flame, color: 'text-orange-700' },
    { view: 'xirr-vault', label: 'XIRR', icon: BarChart4, color: 'text-teal-700' },
    { view: 'loan-shield', label: 'Loans', icon: Shield, color: 'text-rose-700' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-inter flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <button onClick={() => switchView('home')} className="flex items-center gap-3">
            <AppLogo />
            <span className="text-xl font-black tracking-tight text-slate-800 uppercase hidden sm:block">ArthaSutra AI</span>
          </button>
          
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button 
                key={link.view}
                onClick={() => switchView(link.view)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${currentView === link.view ? `bg-blue-50 ${link.color}` : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <link.icon className="w-3.5 h-3.5" />
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => switchView('subscription')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black uppercase text-[10px] ${currentView === 'subscription' ? 'bg-blue-800 text-white' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <CreditCard className="w-4 h-4" /> Plans
            </button>
            <button 
              onClick={() => switchView('plans')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black uppercase text-[10px] ${currentView === 'plans' ? 'bg-blue-800 text-white' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <LayoutGrid className="w-4 h-4" /> Vault
            </button>
            <div onClick={() => switchView('profile')} className="ml-2 w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-black text-sm cursor-pointer hover:bg-blue-200 transition-colors">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-slate-600">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-white px-6 py-6 animate-in slide-in-from-top duration-300 flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <AppLogo />
                <span className="text-xl font-black tracking-tight text-slate-800 uppercase">ArthaSutra AI</span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-slate-600 bg-slate-50 rounded-full border border-slate-100 hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
           </div>
           
           <div className="flex flex-col gap-3 overflow-y-auto">
            {navLinks.map((link) => (
              <button 
                key={link.view}
                onClick={() => switchView(link.view)}
                className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${currentView === link.view ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-700'}`}
              >
                <link.icon className={`w-6 h-6 ${currentView === link.view ? 'text-white' : link.color}`} />
                {link.label}
              </button>
            ))}
            <div className="h-px bg-slate-100 my-2" />
            <button 
              onClick={() => switchView('subscription')}
              className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 text-indigo-700 font-bold"
            >
               <CreditCard className="w-6 h-6" /> Subscription Plans
            </button>
            <button 
              onClick={() => switchView('plans')}
              className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 text-amber-700 font-bold"
            >
               <LayoutGrid className="w-6 h-6" /> Strategy Vault
            </button>
            <button onClick={handleLogout} className="flex items-center gap-4 p-4 rounded-2xl bg-rose-50 text-rose-600 font-bold mt-2">
               <X className="w-6 h-6" /> Sign Out
            </button>
           </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 pt-10 pb-16 flex-1 w-full">
        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        {currentView === 'home' && <Home onNavigate={switchView} />}
        
        {currentView === 'architect' && (
          <div className="space-y-12">
            <div className="max-w-5xl mx-auto">
              <PortfolioForm 
                onGenerate={handleGenerate} 
                isLoading={loading} 
                initialData={lastInput} 
                isLimitReached={isArchitectLimitReached}
              />
            </div>
            {result && (
               <PortfolioResults 
                result={result} 
                onUpdateBasket={handleUpdateBasket}
                isUpdating={loading}
                isLimitReached={isArchitectLimitReached}
               />
            )}
          </div>
        )}

        {currentView === 'health-check' && (
          <div className="space-y-12">
             <div className="max-w-5xl mx-auto">
               <ExistingPortfolioForm 
                onAnalyze={handleAnalyze} 
                isLoading={loading} 
                isLimitReached={savedAuditReports.length >= currentPlanLimits.audits}
               />
             </div>
             {analysisResult && <AnalysisResult result={analysisResult} />}
          </div>
        )}

        {currentView === 'rebalancer' && (
          <PortfolioRebalancer 
            savedCount={savedRebalancerStrategies.length} 
            isLimitReached={isRebalancerLimitReached}
            onSave={async (input, analysis, aiRationale) => {
              if (!currentUser) return;
              try {
                const docId = await saveRebalancerStrategyToFirestore(currentUser.uid, input, analysis, aiRationale);
                const newStrategy: SavedRebalancerStrategy = {
                  id: docId,
                  timestamp: Date.now(),
                  input,
                  analysis,
                  aiRationale
                };
                const updated = [newStrategy, ...savedRebalancerStrategies];
                setSavedRebalancerStrategies(updated);
                localStorage.setItem(`as_rebalancers_${currentUser.uid}`, JSON.stringify(updated));
              } catch (err) {
                console.error("Failed to save rebalancer strategy:", err);
                setError("Failed to save rebalancer strategy to vault.");
              }
            }}
          />
        )}
        {currentView === 'fire' && <FIRECalculator onNavigate={switchView} onSimulateXIRR={setPrefilledXirrData} />}
        {currentView === 'xirr-vault' && <XIRRCalculator initialData={prefilledXirrData} />}
        {currentView === 'loan-shield' && <LoanCalculator />}
        {currentView === 'plans' && (
          <PlansPage 
            plans={savedPortfolios} 
            rebalancerStrategies={savedRebalancerStrategies}
            auditReports={savedAuditReports}
            architectLimit={currentPlanLimits.architect}
            rebalancerLimit={currentPlanLimits.rebalancer}
            auditLimit={currentPlanLimits.audits}
            onDelete={handleDeletePortfolio}
            onDeleteRebalancer={(id) => {
               deleteRebalancerStrategyFromFirestore(currentUser!.uid, id);
               setSavedRebalancerStrategies(prev => prev.filter(s => s.id !== id));
            }}
            onDeleteAudit={(id) => {
               deleteAuditReportFromFirestore(currentUser!.uid, id);
               setSavedAuditReports(prev => prev.filter(a => a.id !== id));
            }}
            onView={(plan) => { setResult(plan); switchView('architect'); }}
            onViewRebalancer={() => switchView('rebalancer')}
            onViewAudit={(audit) => { setAnalysisResult(audit.result); switchView('health-check'); }}
            onUpgrade={() => switchView('subscription')}
          />
        )}
        {currentView === 'subscription' && <SubscriptionPlans currentTier={currentUser.planTier} onEnroll={(tier) => setCurrentUser({...currentUser, planTier: tier})} />}
        {currentView === 'profile' && <Profile user={currentUser} onUpdate={setCurrentUser} onLogout={handleLogout} />}
      </main>

      <RiskWarningModal isOpen={showRiskModal} onClose={() => setShowRiskModal(false)} cagr={result?.cagr || 0} />

      <InternalFooter />

      {loading && <GenieLoader />}
    </div>
  );
};

export default App;