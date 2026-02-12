import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  AlertCircle, 
  TrendingUp, 
  Coins, 
  Loader2, 
  Globe, 
  Copy, 
  Check, 
  ShieldAlert,
  Target,
  Activity,
  RefreshCw,
  Flame,
  Zap,
  Sparkles,
  ShieldCheck,
  BrainCircuit,
  Rocket,
  Crown,
  ChevronDown
} from 'lucide-react';
import { User, PlanTier } from '../types';
import { auth, googleProvider, db } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthProps {
  onLogin: (user: User) => void;
}

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
        <TrendingUp className={`${iconSizes[size]} text-white`} />
        <Coins className="w-1/2 h-1/2 text-blue-300 absolute -bottom-1 -right-1 stroke-[2.5]" />
      </div>
    </div>
  );
};

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const authSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setError(null);
    setUnauthorizedDomain(null);
    setPermissionDenied(false);
  }, [isLogin]);

  const scrollToAuth = () => {
    authSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopyDomain = () => {
    if (unauthorizedDomain) {
      navigator.clipboard.writeText(unauthorizedDomain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  const syncUserToFirestore = async (fbUser: any, displayName?: string) => {
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: fbUser.uid,
          email: fbUser.email,
          name: displayName || fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          photoURL: fbUser.photoURL || '',
          createdAt: Date.now(),
          planTier: PlanTier.FREE
        });
        return {
          uid: fbUser.uid,
          email: fbUser.email || '',
          name: displayName || fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          planTier: PlanTier.FREE
        };
      } else {
        const data = userSnap.data();
        return {
          uid: fbUser.uid,
          email: fbUser.email || '',
          name: data.name || fbUser.displayName || 'User',
          planTier: data.planTier || PlanTier.FREE
        };
      }
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        setPermissionDenied(true);
        throw new Error("Firestore Permission Denied: Rules update required.");
      }
      throw err;
    }
  };

  const handleAuthError = (err: any) => {
    console.error("Auth Error:", err.code, err.message);
    if (err.message?.includes("Permission Denied")) return;
    switch (err.code) {
      case 'auth/unauthorized-domain':
        const domain = window.location.hostname;
        setUnauthorizedDomain(domain);
        setError(`Domain Authorization Required: Please add '${domain}' to Authorized Domains in Firebase Console.`);
        break;
      case 'auth/invalid-credential':
        setError("Invalid email or password. Please check your credentials.");
        break;
      default:
        setError(err.message || "An authentication error occurred.");
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setUnauthorizedDomain(null);
    setPermissionDenied(false);
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userProfile = await syncUserToFirestore(result.user);
      onLogin(userProfile);
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnauthorizedDomain(null);
    setPermissionDenied(false);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userProfile = await syncUserToFirestore(userCredential.user);
        onLogin(userProfile);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        await updateProfile(fbUser, {
          displayName: name || email.split('@')[0]
        });
        const userProfile = await syncUserToFirestore(fbUser, name);
        onLogin(userProfile);
      }
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const appTools = [
    { icon: <Target className="w-5 h-5 text-blue-400" />, title: "Wealth Architect", desc: "Equity & Multi-Asset architectures." },
    { icon: <Activity className="w-5 h-5 text-emerald-400" />, title: "Portfolio Audit", desc: "360° AI health diagnostics." },
    { icon: <RefreshCw className="w-5 h-5 text-indigo-400" />, title: "Asset Rebalancer", desc: "Risk-adjusted tactical shifts." },
    { icon: <Flame className="w-5 h-5 text-orange-400" />, title: "FIRE Planner", desc: "Modeling early independence." }
  ];

  const tiers = [
    {
      name: 'ARTHA FREE',
      price: '₹0',
      period: 'forever',
      desc: 'Essential entry-level tools for casual investors.',
      features: [
        '3 Architect Strategies (Nifty 100)',
        '2 Deep-dive Audits per month',
        'Basic Fundamental stock data',
        'Unlimited FIRE & Loan Calculators',
        'Standard Community Support'
      ],
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      color: 'bg-white border-slate-200',
      btnColor: 'bg-slate-900 text-white hover:bg-slate-800'
    },
    {
      name: 'ARTHA PLUS',
      price: '₹299',
      period: 'per month',
      yearlyPrice: '₹2,499 / yr',
      desc: 'Advanced power tools for the active DIY investor.',
      features: [
        '10 Architect Strategies + Custom Themes',
        '10 Deep-dive Audits per month',
        'Technical Signal Analysis',
        'Full Indian Equity Rebalancer',
        'CSV Bulk Import & Cloud Sync',
        'Priority Email Support'
      ],
      icon: <Sparkles className="w-6 h-6 text-indigo-500" />,
      color: 'bg-indigo-50/30 border-indigo-100 ring-2 ring-indigo-500/20',
      btnColor: 'bg-indigo-600 text-white hover:bg-indigo-700',
      popular: true
    },
    {
      name: 'ARTHA ELITE',
      price: '₹799',
      period: 'per month',
      yearlyPrice: '₹6,999 / yr',
      desc: 'The complete AI family-office suite for HNIs.',
      features: [
        'Unlimited Architect + Multi-Asset Support (US Stocks, Gold, Debt, REITs)',
        'Unlimited Audits + Real-time Grounding',
        'Includes Tax-Harvesting suggestions (identifying stocks to sell to offset capital gains)',
        'Advanced Correlation Matrix (shows if your portfolio is too heavily tied to one factor)',
        'Forensic Audit (Red Flags & Pledges)',
        '24/7 Dedicated Concierge Chat'
      ],
      icon: <Crown className="w-6 h-6 text-amber-500" />,
      color: 'bg-amber-50/30 border-amber-200 ring-2 ring-amber-500/20',
      btnColor: 'bg-amber-600 text-white hover:bg-amber-700'
    }
  ];

  return (
    <div className="bg-slate-950 min-h-screen flex flex-col">
      {/* Updated Login Page Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-8 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AppLogo size="md" />
            <span className="text-xl font-black text-slate-900 uppercase tracking-tight">ArthaSutra AI</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institutional Wealth Intelligence</p>
          </div>
        </div>
      </header>

      {/* Auth Main Section */}
      <div ref={authSectionRef} className="flex-1 flex flex-col lg:flex-row animate-in fade-in duration-700 pt-20">
        {/* Left Column: Educational/Branding Section */}
        <div className="lg:w-[60%] p-8 lg:p-20 flex flex-col justify-center relative overflow-hidden bg-slate-900">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
              <Zap className="w-3 h-3" /> Professional Financial Intelligence
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-8">
              Precision Wealth for a <span className="text-blue-500">Volatile Generation.</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-500/20 rounded-lg"><Rocket className="w-5 h-5 text-blue-400" /></div>
                   <h4 className="text-xl font-bold text-white uppercase tracking-tight">The Modern Mandate</h4>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  Today's investors face unprecedented challenges: decoupling from traditional pensions, soaring lifestyle inflation, and a 24/7 noise cycle. Wealth management is no longer a luxury—it's the core survival skill for financial autonomy in the 21st century.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-emerald-500/20 rounded-lg"><BrainCircuit className="w-5 h-5 text-emerald-400" /></div>
                   <h4 className="text-xl font-bold text-white uppercase tracking-tight">AI Synergy</h4>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  ArthaSutra leverages Gemini 3.1 Pro to eliminate emotional bias. We perform multi-step reasoning across Nifty 100 datasets, auditing fundamentals and momentum signals in milliseconds to architect deterministic roadmaps for your future.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Integrated Tool Ecosystem</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {appTools.map((tool, i) => (
                   <div key={i} className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                      <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">{tool.icon}</div>
                      <div>
                         <p className="text-sm font-black text-slate-100 uppercase tracking-tight">{tool.title}</p>
                         <p className="text-xs font-medium text-slate-500">{tool.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
            
            <button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} className="mt-12 flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 tracking-widest hover:text-blue-300 transition-colors animate-bounce">
              Explore Plans <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
          <TrendingUp className="absolute -bottom-20 -right-20 w-[600px] h-[600px] text-white/5 -rotate-12 pointer-events-none" />
        </div>

        {/* Right Column: Authentication Form */}
        <div className="lg:w-[40%] bg-white flex flex-col justify-center p-8 lg:p-20 relative">
          <div className="max-w-md w-full mx-auto space-y-10 animate-in fade-in slide-in-from-right-10 duration-1000">
            <div className="text-center lg:text-left">
               <div className="flex justify-center lg:justify-start mb-6">
                  <AppLogo size="lg" className="hover:scale-105 transition-transform duration-500" />
               </div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                 {isLogin ? 'Welcome Back' : 'Create Account'}
               </h2>
               <p className="text-slate-500 mt-2 font-medium">
                 {isLogin ? 'Access ArthaSutra Professional Suite' : 'Join the elite AI-driven investors'}
               </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50 active:scale-95"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                <span className="px-4 bg-white text-slate-400">Or use credentials</span>
              </div>
            </div>

            {permissionDenied && (
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col gap-4 animate-in shake duration-300">
                <div className="flex items-center gap-3 text-rose-700">
                  <ShieldAlert className="w-6 h-6 shrink-0" />
                  <p className="text-sm font-black leading-tight">Firestore Rules Update Required</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl relative group">
                  <pre className="text-[9px] text-emerald-400 font-mono overflow-x-auto">
{`match /users/{userId}/{allPaths=**} {
  allow read, write: 
    if request.auth != null && request.auth.uid == userId;
}`}
                  </pre>
                  <button onClick={handleCopyRules} className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/50" />}
                  </button>
                </div>
              </div>
            )}

            {error && !permissionDenied && (
              <div className={`p-4 rounded-2xl flex flex-col gap-3 animate-in shake duration-300 ${unauthorizedDomain ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-rose-50 border border-rose-100 text-rose-600'}`}>
                <div className="flex items-center gap-3">
                  {unauthorizedDomain ? <Globe className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  <p className="text-sm font-bold leading-tight">{error}</p>
                </div>
                {unauthorizedDomain && (
                  <div className="bg-white/50 p-3 rounded-xl border border-amber-200 mt-2">
                     <button onClick={handleCopyDomain} className="w-full flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-amber-300">
                        <code className="text-xs font-black text-amber-900">{unauthorizedDomain}</code>
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-600" />}
                     </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-slate-400 outline-none font-bold text-slate-700 transition-all" placeholder="John Doe" />
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-slate-400 outline-none font-bold text-slate-700 transition-all" placeholder="name@domain.com" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-slate-400 outline-none font-bold text-slate-700 transition-all" placeholder="••••••••" minLength={6} />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full py-5 bg-blue-800 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{isLogin ? 'Sign In' : 'Join the Alpha'} <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>

            <div className="pt-6 text-center">
              <button onClick={() => setIsLogin(!isLogin)} disabled={isLoading} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                {isLogin ? "New to ArthaSutra? Create an account" : "Already registered? Sign in"}
              </button>
            </div>

            <div className="flex items-center gap-4 justify-center opacity-40 grayscale group hover:grayscale-0 transition-all duration-700 pt-8">
               <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /><span className="text-[8px] font-black uppercase tracking-widest">Enterprise Grade Security</span></div>
               <div className="w-1 h-1 bg-slate-400 rounded-full" />
               <div className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" /><span className="text-[8px] font-black uppercase tracking-widest">Powered by Gemini 3.1</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plans Section */}
      <section className="bg-white py-32 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              <ShieldCheck className="w-3 h-3" /> Institutional Grade Intelligence
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-4">Elevate Your Strategy</h2>
            <p className="text-lg text-slate-500 font-medium">Choose a plan that fits your wealth management goals. Scale your financial autonomy with Gemini 3.1 Pro.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, idx) => (
              <div 
                key={idx} 
                className={`relative rounded-[2.5rem] p-10 border-2 transition-all hover:shadow-2xl flex flex-col ${tier.color}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                    Best Value
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-8">
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                    {tier.icon}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-black text-slate-900">{tier.price}</span>
                    <span className="text-sm font-bold text-slate-400 ml-1">{tier.period}</span>
                  </div>
                  {tier.yearlyPrice && (
                    <p className="text-[10px] font-black text-emerald-600 mt-1 uppercase tracking-tighter">SAVE 30% WITH YEARLY: {tier.yearlyPrice}</p>
                  )}
                  <p className="text-slate-500 text-sm mt-4 font-medium leading-relaxed">{tier.desc}</p>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium Features</p>
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 p-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={scrollToAuth}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${tier.btnColor}`}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Updated Footer to match internal style exactly */}
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
    </div>
  );
};

export default Auth;