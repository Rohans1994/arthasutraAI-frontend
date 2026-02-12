
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, writeBatch, doc, addDoc, getDocs, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { RebalancerInput, RebalancerAnalysis, RebalancerRationale, SavedRebalancerStrategy, ExistingPortfolioAnalysis, SavedAuditReport, PortfolioResult } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyBGYung2gLQxNKW_XOccXJBGLEh9GWXFa0",
  authDomain: "arthasutra-ai.firebaseapp.com",
  projectId: "arthasutra-ai",
  storageBucket: "arthasutra-ai.firebasestorage.app",
  messagingSenderId: "774703485872",
  appId: "1:774703485872:web:c6e3e40c628bdfe33c3c75",
  measurementId: "G-95EE6X21NV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Utility to deep-clean objects of 'undefined' values which Firestore doesn't support.
 */
const sanitizeForFirestore = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(v => sanitizeForFirestore(v));
  
  const result: any = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== undefined) {
      result[key] = sanitizeForFirestore(value);
    }
  });
  return result;
};

/**
 * Synchronizes a list of holdings to the user's Firestore portfolio subcollection.
 */
export const syncPortfolioToFirestore = async (uid: string, holdings: any[]) => {
  try {
    const portfolioRef = collection(db, 'users', uid, 'portfolio');
    const batch = writeBatch(db);

    holdings.forEach((h) => {
      const ticker = (h.ticker || '').toUpperCase().trim();
      const quantity = Number(h.quantity) || 0;
      const docId = `${ticker}${quantity}`;
      const docRef = doc(portfolioRef, docId);

      batch.set(docRef, sanitizeForFirestore({
        tickerName: ticker,
        quantity: quantity,
        averagePrice: Number(h.buyPrice) || 0,
        lastTradedPrice: Number(h.currentPrice) || Number(h.buyPrice) || 0,
        currentPrice: Number(h.currentPrice) || Number(h.buyPrice) || 0,
        updatedAt: Date.now(),
        source: 'CSV_UPLOAD'
      }), { merge: true });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error syncing portfolio to Firestore:", error);
    throw error;
  }
};

/**
 * Stores a complete Architect Wealth Strategy in Firestore.
 */
export const saveArchitectStrategyToFirestore = async (uid: string, result: PortfolioResult) => {
  try {
    const totalCapital = result.investmentType === 'LUMPSUM' ? result.initialAmount : (result.monthlySip || 0);
    
    // Enrich with calculated amounts
    const enrichedResult = {
      ...result,
      stocks: result.stocks.map(s => ({ ...s, allocationAmount: (s.allocation / 100) * totalCapital })),
      mutualFunds: result.mutualFunds.map(m => ({ ...m, allocationAmount: (m.allocation / 100) * totalCapital })),
      otherAssets: result.otherAssets.map(a => ({ ...a, allocationAmount: (a.allocation / 100) * totalCapital }))
    };

    const strategiesRef = collection(db, 'users', uid, 'architect_strategies');
    const docData = sanitizeForFirestore({
      ...enrichedResult,
      timestamp: Date.now(),
      createdAt: serverTimestamp(),
      metadata: { version: "1.0", app: "ArthaSutra AI" }
    });
    const docRef = await addDoc(strategiesRef, docData);
    return docRef.id;
  } catch (error) {
    console.error("Error storing architect strategy:", error);
    throw error;
  }
};

/**
 * Fetches all architect strategies for a user.
 */
export const getArchitectStrategiesFromFirestore = async (uid: string): Promise<PortfolioResult[]> => {
  try {
    const strategiesRef = collection(db, 'users', uid, 'architect_strategies');
    const q = query(strategiesRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as PortfolioResult));
  } catch (error) {
    console.error("Error fetching architect strategies:", error);
    throw error;
  }
};

/**
 * Deletes an architect strategy.
 */
export const deleteArchitectStrategyFromFirestore = async (uid: string, docId: string) => {
  try {
    const strategyRef = doc(db, 'users', uid, 'architect_strategies', docId);
    await deleteDoc(strategyRef);
  } catch (error) {
    console.error("Error deleting architect strategy:", error);
    throw error;
  }
};

/**
 * Stores a complete Rebalancer Audit Report in Firestore.
 */
export const saveRebalancerStrategyToFirestore = async (
  uid: string, 
  input: RebalancerInput, 
  analysis: RebalancerAnalysis, 
  aiIntelligence: RebalancerRationale | null
) => {
  try {
    const strategiesRef = collection(db, 'users', uid, 'rebalancer_strategies');
    
    const docData = sanitizeForFirestore({
      timestamp: Date.now(),
      createdAt: serverTimestamp(),
      inputSnapshot: input,
      analysisResult: analysis,
      aiIntelligence: aiIntelligence,
      metadata: {
        version: "1.0",
        app: "ArthaSutra AI"
      }
    });

    const docRef = await addDoc(strategiesRef, docData);
    return docRef.id;
  } catch (error) {
    console.error("Error storing rebalancer strategy:", error);
    throw error;
  }
};

/**
 * Stores a complete Portfolio Audit Report in Firestore.
 */
export const saveAuditReportToFirestore = async (uid: string, result: ExistingPortfolioAnalysis) => {
  try {
    const auditsRef = collection(db, 'users', uid, 'portfolio_audits');
    const docData = sanitizeForFirestore({
      timestamp: Date.now(),
      createdAt: serverTimestamp(),
      result: result,
      metadata: { version: "1.0", app: "ArthaSutra AI" }
    });
    const docRef = await addDoc(auditsRef, docData);
    return docRef.id;
  } catch (error) {
    console.error("Error storing portfolio audit:", error);
    throw error;
  }
};

/**
 * Fetches all portfolio audits for a user.
 */
export const getAuditReportsFromFirestore = async (uid: string): Promise<SavedAuditReport[]> => {
  try {
    const auditsRef = collection(db, 'users', uid, 'portfolio_audits');
    const q = query(auditsRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      timestamp: doc.data().timestamp || Date.now(),
      result: doc.data().result
    } as SavedAuditReport));
  } catch (error) {
    console.error("Error fetching portfolio audits:", error);
    throw error;
  }
};

/**
 * Deletes a portfolio audit.
 */
export const deleteAuditReportFromFirestore = async (uid: string, docId: string) => {
  try {
    const auditRef = doc(db, 'users', uid, 'portfolio_audits', docId);
    await deleteDoc(auditRef);
  } catch (error) {
    console.error("Error deleting portfolio audit:", error);
    throw error;
  }
};

/**
 * Fetches all rebalancer strategies for a specific user from Firestore.
 */
export const getRebalancerStrategiesFromFirestore = async (uid: string): Promise<SavedRebalancerStrategy[]> => {
  try {
    const strategiesRef = collection(db, 'users', uid, 'rebalancer_strategies');
    const q = query(strategiesRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        timestamp: data.timestamp || Date.now(),
        input: data.inputSnapshot,
        analysis: data.analysisResult,
        aiRationale: data.aiIntelligence
      } as SavedRebalancerStrategy;
    });
  } catch (error) {
    console.error("Error fetching rebalancer strategies:", error);
    throw error;
  }
};

/**
 * Deletes a specific rebalancer strategy from Firestore.
 */
export const deleteRebalancerStrategyFromFirestore = async (uid: string, docId: string) => {
  try {
    const strategyRef = doc(db, 'users', uid, 'rebalancer_strategies', docId);
    await deleteDoc(strategyRef);
  } catch (error) {
    console.error("Error deleting rebalancer strategy:", error);
    throw error;
  }
};
