export type Marketplace = 'amazon' | 'flipkart' | 'walmart' | 'bestbuy' | 'generic';

export interface RawReview {
  id: string;
  author: string;
  rating: number; // 1 to 5
  date: string; // ISO date or string
  title?: string;
  text: string;
  isVerifiedPurchase: boolean;
  helpfulVotes?: number;
}

export interface AnalyzedReview extends RawReview {
  isFlagged: boolean;
  flaggedReasons: string[];
  authenticityConfidence: number; // 0 to 1
  sentimentScore?: number; // -1 to 1
}

export interface ProductInfo {
  url: string;
  productId: string;
  title: string;
  marketplace: Marketplace;
  imageUrl?: string;
  price?: string;
  originalRating: number;
  originalReviewCount: number;
  reviews: RawReview[];
}

export interface AnalysisBreakdown {
  duplicateBotPercentage: number;
  unverifiedSpikePercentage: number;
  unnaturalDistributionScore: number;
  sentimentMismatchCount: number;
  incentivizedBiasScore: number;
}

export interface AuthenticHighlights {
  pros: string[];
  cons: string[];
}

export interface PricePoint {
  date: string;
  price: number;
  formattedPrice: string;
  label?: string; // e.g. "90-Day Low", "Flash Sale", "Current Price"
}

export interface PriceAnalysis {
  currency: string;
  currentPrice: number;
  formattedCurrentPrice: string;
  averagePrice: number;
  formattedAveragePrice: string;
  lowestPrice: number;
  formattedLowestPrice: string;
  highestPrice: number;
  formattedHighestPrice: string;
  worthItPrice: number;
  formattedWorthItPrice: string;
  priceDifference: number; // currentPrice - worthItPrice
  dealVerdict: 'GREAT_DEAL' | 'FAIR_PRICE' | 'OVERPRICED';
  dealBadge: string; // e.g. "Great Deal", "Fair Value", "Overpriced"
  dealExplanation: string;
  history: PricePoint[];
}

export interface AnalysisResult {
  product: {
    url: string;
    productId: string;
    title: string;
    marketplace: Marketplace;
    imageUrl?: string;
    price?: string;
    originalRating: number;
    originalReviewCount: number;
  };
  rivueRating: number;
  originalRating: number;
  ratingDifference: number; // rivueRating - originalRating (e.g. -1.4)
  trustScore: number; // 0 to 100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  verdict: 'Trustworthy' | 'Moderate' | 'Caution' | 'High Risk';
  fakeReviewPercentage: number;
  totalReviewsAnalyzed: number;
  suspiciousReviewsCount: number;
  breakdown: AnalysisBreakdown;
  explanation: string;
  reasons: string[];
  authenticHighlights: AuthenticHighlights;
  priceAnalysis?: PriceAnalysis;
  reviews: AnalyzedReview[];
  analyzedAt: string;
  source: 'anakin-live' | 'cached' | 'fallback';
}
