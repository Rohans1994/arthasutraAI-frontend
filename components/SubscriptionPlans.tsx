import React from 'react';
import { PlanTier } from '../types';
import { Check, Crown, Zap, ShieldCheck, ArrowRight, Wallet, Sparkles, BarChart4, RefreshCw, Activity, Target } from 'lucide-react';

interface SubscriptionPlansProps {
  currentTier?: PlanTier;
  onEnroll: (tier: PlanTier) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ currentTier = PlanTier.FREE, onEnroll }) => {
  const tiers = [
    {
      id: PlanTier.FREE,
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
      id: PlanTier.PLUS,
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
      id: PlanTier.PREMIUM, // Using Premium enum for Elite tier logic
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

  const handlePayment = async (plan: typeof tiers[0]) => {
    // Only process payment for non-free plans
    if (plan.price === '₹0') {
      onEnroll(plan.id);
      return;
    }

    try {
      const amount = parseInt(plan.price.replace('₹', ''));

      // 1. Create Order
      const response = await fetch('http://localhost:5001/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, receipt: `receipt_${plan.id}_${Date.now()}` })
      });
      const order = await response.json();

      if (order.error) {
        alert('Error creating order: ' + order.error);
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: "rzp_test_SC8ucdfZDu311D", // Replace with your actual key in production or env
        amount: order.amount,
        currency: "INR",
        name: "ArthaSutra AI",
        description: `Subscription for ${plan.name}`,
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch('http://localhost:5001/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          const verifyData = await verifyRes.json();

          if (verifyData.status === 'success') {
            onEnroll(plan.id);
            alert('Payment Successful! Welcome to ' + plan.name);
          } else {
            alert('Payment Verification Failed');
          }
        },
        prefill: {
          name: "User Name", // Ideally fetch from user profile
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#1e40af"
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();

    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment initialization failed");
    }
  };

  return (
    <div className="py-12 px-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
          <ShieldCheck className="w-3 h-3" /> Institutional Grade Intelligence
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-4">Elevate Your Strategy</h2>
        <p className="text-lg text-slate-500 font-medium">Choose a plan that fits your wealth management goals. Scale your financial autonomy with Gemini 3.1 Pro.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`relative rounded-[2.5rem] p-10 border-2 transition-all hover:shadow-2xl flex flex-col ${tier.color} ${currentTier === tier.id ? 'border-blue-600' : ''}`}
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
              {currentTier === tier.id && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-200">
                  Current
                </span>
              )}
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
              onClick={() => handlePayment(tier)}
              disabled={currentTier === tier.id}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${tier.btnColor}`}
            >
              {currentTier === tier.id ? 'Active Plan' : 'Select Plan'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-20 bg-slate-900 rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative shadow-2xl">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <h3 className="text-2xl font-black tracking-tight uppercase leading-none">Security First Architecture</h3>
          </div>
          <p className="text-slate-400 font-medium leading-relaxed">
            All intelligence processing is non-custodial. We never access your funds or brokerage accounts directly. Your data is encrypted and synced only to your private cloud instance for absolute privacy.
          </p>
        </div>
        <div className="relative z-10 shrink-0 flex gap-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-2">
            <Target className="w-8 h-8 text-blue-400" />
            <span className="text-[8px] font-black uppercase text-slate-500">Architect</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-2">
            <Activity className="w-8 h-8 text-emerald-400" />
            <span className="text-[8px] font-black uppercase text-slate-500">Audit</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-2">
            <RefreshCw className="w-8 h-8 text-indigo-400" />
            <span className="text-[8px] font-black uppercase text-slate-500">Rebalance</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>
    </div>
  );
};

export default SubscriptionPlans;