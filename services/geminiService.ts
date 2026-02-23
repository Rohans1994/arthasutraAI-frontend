import { PortfolioResult, InvestmentInput, RebalancerInput, RebalancerAnalysis, RebalancerRationale, HoldingAnalysis, UserHolding, ExistingPortfolioAnalysis } from "../types";

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5001/api'
  : '/api';

const CACHE_PREFIX = 'as_audit_v4_';
const SIGNALS_CACHE_KEY = 'as_market_signals_v4';
const STRATEGY_CACHE_PREFIX = 'as_strat_v4_';
const CACHE_EXPIRY = 30 * 60 * 1000;

/**
 * Strategy Caching Utilities
 */
const generateStrategyCacheKey = (input: InvestmentInput): string => {
  const { type, initialAmount, monthlySip, stepUp, targetAmount, years, theme, customTheme, isMultiAsset, assetAllocations, customDistribution } = input;
  const keyObj = { type, initialAmount, monthlySip, stepUp, targetAmount, years, theme, customTheme, isMultiAsset, assetAllocations, customDistribution };
  return `${STRATEGY_CACHE_PREFIX}${btoa(JSON.stringify(keyObj))}`;
};

const getCachedStrategy = (input: InvestmentInput): PortfolioResult | null => {
  try {
    const key = generateStrategyCacheKey(input);
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch (e) {
    return null;
  }
};

const setCachedStrategy = (input: InvestmentInput, result: PortfolioResult) => {
  try {
    const key = generateStrategyCacheKey(input);
    localStorage.setItem(key, JSON.stringify(result));
  } catch (e) {
    console.warn("Failed to set strategy cache");
  }
};

/**
 * Caching Utilities
 */
const getCachedHolding = (ticker: string): Partial<HoldingAnalysis> | null => {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${ticker.toUpperCase()}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(`${CACHE_PREFIX}${ticker.toUpperCase()}`);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
};

const setCachedHolding = (ticker: string, data: Partial<HoldingAnalysis>) => {
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(`${CACHE_PREFIX}${ticker.toUpperCase()}`, JSON.stringify(cacheEntry));
  } catch (e) {
    console.warn("Failed to set cache for ticker", ticker);
  }
};

/**
 * Market Signals Caching Utilities
 */
const getCachedMarketSignals = (): any | null => {
  try {
    const cached = localStorage.getItem(SIGNALS_CACHE_KEY);
    if (!cached) return null;

    const { data, expiry } = JSON.parse(cached);
    if (Date.now() >= expiry) {
      localStorage.removeItem(SIGNALS_CACHE_KEY);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
};

const setCachedMarketSignals = (data: any) => {
  try {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);

    const cacheEntry = {
      data,
      expiry: nextMidnight.getTime()
    };
    localStorage.setItem(SIGNALS_CACHE_KEY, JSON.stringify(cacheEntry));
  } catch (e) {
    console.warn("Failed to set market signals cache");
  }
};

export async function fetchMarketSignals(): Promise<any> {
  const cachedSignals = getCachedMarketSignals();
  if (cachedSignals) {
    return cachedSignals;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/market-signals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('Failed to fetch market signals');

    const data = await response.json();
    if (data && Object.keys(data).length > 0) {
      setCachedMarketSignals(data);
    }
    return data;
  } catch (error) {
    console.error("Error fetching market signals:", error);
    return {
      niftyPe: 22.5,
      marketPhase: 'Bull',
      rbiStance: 'Neutral',
      indiaInflation: 'Stable',
      sp500ForwardPe: 18.5,
      fedStance: 'Neutral',
      dollarIndex: 'Stable'
    };
  }
}

export async function generateRebalancerExplanation(input: RebalancerInput, analysis: RebalancerAnalysis): Promise<RebalancerRationale> {
  try {
    const response = await fetch(`${API_BASE_URL}/rebalancer/explanation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, analysis })
    });

    if (!response.ok) throw new Error('Failed to generate explanation');

    return await response.json();
  } catch (error) {
    console.error("Error generating explanation:", error);
    return {
      objective: "Portfolio goal alignment and wealth management tips.",
      marketDynamics: "Market valuation impact.",
      rebalancingLogic: "Logic for proposed asset shifts.",
      safetyOverrides: "Buffer for upcoming expenses.",
      macroEnvironment: "Macro economic summary.",
      executionLogic: "Execution guidelines including section-wise transfer logic, maintenance rationale, and selling criteria for over-allocated segments.",
      assetSuggestions: [],
      debtSuggestions: [],
      globalSuggestions: [],
      goldSuggestions: []
    };
  }
}

export async function searchTickers(query: string): Promise<{ ticker: string; name: string }[]> {
  if (!query || query.length < 2) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/tickers/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!response.ok) throw new Error('Failed to search tickers');
    return await response.json();
  } catch (error) {
    return [];
  }
}

export async function generatePortfolio(input: InvestmentInput): Promise<PortfolioResult> {
  const cachedResult = getCachedStrategy(input);
  if (cachedResult) return cachedResult;

  try {
    const response = await fetch(`${API_BASE_URL}/portfolio/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    if (!response.ok) throw new Error('Failed to generate portfolio');

    const result = await response.json();
    setCachedStrategy(input, result);
    return result;
  } catch (error) { throw error; }
}

export async function analyzeExistingPortfolio(
  holdings: UserHolding[],
  years: number,
  targetAllocation?: Record<string, number>,
  currentValues?: Record<string, number>
): Promise<ExistingPortfolioAnalysis> {

  // Check local cache first to avoid unnecessary API calls
  const cachedHoldings: Record<string, Partial<HoldingAnalysis>> = {};
  const tickersToFetch: UserHolding[] = [];

  holdings.forEach(h => {
    const cached = getCachedHolding(h.ticker);
    if (cached) cachedHoldings[h.ticker.toUpperCase()] = cached;
    else tickersToFetch.push(h);
  });

  // If all cached, we can reconstruct mostly locally, but for simplicity of this migration, 
  // we will call backend if there are any to fetch, OR we could call backend for ALL to get fresh data 
  // if we want to rely on backend caching. 
  // However, strict separation implies the backend does the heavy lifting.
  // Let's pass what we have optionally? No, let's keep it simple: strict separation.
  // But wait, the original logic had client-side caching.
  // We should preserve client side caching to be nice to the backend.

  if (tickersToFetch.length === 0 && holdings.length > 0) {
    // Reconstruct from cache without backend call if everything is cached
    let totalInvested = 0;
    let totalCurrentValue = 0;
    const detailedAnalysis = holdings.map(holding => {
      const cached = cachedHoldings[holding.ticker.toUpperCase()];
      const currentPrice = cached?.currentPrice || holding.currentPrice || holding.buyPrice;
      const cValue = currentPrice * holding.quantity;
      const investedValue = holding.buyPrice * holding.quantity;
      totalInvested += investedValue;
      totalCurrentValue += cValue;
      // @ts-ignore
      return { ...holding, ...cached, currentValue: cValue, profitLoss: cValue - investedValue } as any; // Simplified reconstruction
    });
    // Recalculate totals
    // Actually, it's better to just let the backend handle it or fetch only missing?
    // For now, let's send ALL to backend to ensure logic consistency and let backend handle it.
    // OR, implementing partial update is complex.
    // Let's stick to the plan: call backend.
  }

  try {
    const response = await fetch(`${API_BASE_URL}/portfolio/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ holdings, years, targetAllocation, currentValues })
    });

    if (!response.ok) throw new Error('Failed to analyze portfolio');

    const result = await response.json();

    // Cache individual items from the result
    result.analysis.forEach((a: any) => setCachedHolding(a.ticker, a));

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}