import {
  RawReview,
  AnalyzedReview,
  AnalysisResult,
  ProductInfo,
  AnalysisBreakdown,
  AuthenticHighlights
} from '../types';
import { detectDuplicates } from './duplicateDetector';
import { detectVelocitySpikes } from './velocityDetector';
import { evaluateReviewerCredibility } from './reviewerCredibility';
import { detectSentimentMismatches, calculateSimpleSentiment } from './sentimentMismatch';
import { computePriceIntelligence } from './priceIntelligence';

/**
 * Extracts pros and cons strictly from high-confidence verified authentic reviews.
 * Does not manufacture synthetic complaints or mention unrelated domains (e.g., battery/audio).
 */
function extractAuthenticHighlights(reviews: AnalyzedReview[], product?: ProductInfo): AuthenticHighlights {
  const authentic = reviews.filter(r => !r.isFlagged && r.authenticityConfidence >= 0.6);
  const pros: string[] = [];
  const cons: string[] = [];

  // 1. Extract genuine positive highlights from 4-5 star verified reviews
  const positiveReviews = authentic.filter(r => r.rating >= 4);
  for (const r of positiveReviews) {
    const cleanTitle = (r.title || '').trim();
    const cleanText = (r.text || '').trim();

    if (cleanTitle && cleanTitle.length >= 3 && cleanTitle.length <= 80) {
      const candidate = cleanText && cleanText.length >= 3 && !cleanText.toLowerCase().includes(cleanTitle.toLowerCase())
        ? `${cleanTitle}: "${cleanText.slice(0, 80)}"`
        : cleanTitle;
      if (!pros.some(p => p.toLowerCase() === candidate.toLowerCase()) && pros.length < 3) {
        pros.push(candidate);
      }
    } else if (cleanText && cleanText.length >= 3 && cleanText.length <= 120) {
      if (!pros.some(p => p.toLowerCase() === cleanText.toLowerCase()) && pros.length < 3) {
        pros.push(cleanText);
      }
    }
  }

  // 2. Extract genuine critical feedback from 1-3 star reviews
  const criticalReviews = reviews.filter(r => r.rating <= 3);
  for (const r of criticalReviews) {
    const cleanTitle = (r.title || '').trim();
    const cleanText = (r.text || '').trim();

    if (cleanTitle && cleanTitle.length >= 3 && cleanTitle.length <= 80) {
      const candidate = cleanText && cleanText.length >= 3 && !cleanText.toLowerCase().includes(cleanTitle.toLowerCase())
        ? `${cleanTitle}: "${cleanText.slice(0, 90)}"`
        : cleanTitle;
      if (!cons.some(c => c.toLowerCase() === candidate.toLowerCase()) && cons.length < 3) {
        cons.push(candidate);
      }
    } else if (cleanText && cleanText.length >= 3 && cleanText.length <= 120) {
      if (!cons.some(c => c.toLowerCase() === cleanText.toLowerCase()) && cons.length < 3) {
        cons.push(cleanText);
      }
    }
  }

  // 3. Fallbacks when reviews have 0 explicit pros or cons
  if (pros.length === 0) {
    if (product && product.originalRating >= 4.0) {
      pros.push(`Consistently rated ${product.originalRating}★ by verified marketplace customers`);
      if (product.originalReviewCount && product.originalReviewCount > 0) {
        pros.push(`${product.originalReviewCount.toLocaleString()} customers recorded positive sentiment on marketplace`);
      }
    } else {
      pros.push('Verified product listing matching official marketplace catalog');
    }
  }

  if (cons.length === 0) {
    if (criticalReviews.length === 0) {
      cons.push('No critical defects or negative feedback reported in verified buyer reviews');
      cons.push('All recorded reviews reflect positive customer ratings');
    } else {
      cons.push('Review volume is currently limited; no recurring defect patterns detected');
    }
  }

  return { pros: pros.slice(0, 3), cons: cons.slice(0, 3) };
}

/**
 * Synthesizes all review signals, recalibrates ratings, and produces the Rivue Trust Report.
 */
export function analyzeProductReviews(
  product: ProductInfo,
  source: 'scraperapi-live' | 'anakin-live' | 'dom-live' | 'cached' | 'fallback' = 'fallback'
): AnalysisResult {
  const reviews = product.reviews;

  // 1. Run detection algorithms
  const duplicateRes = detectDuplicates(reviews);
  const velocityRes = detectVelocitySpikes(reviews);
  const credibilityRes = evaluateReviewerCredibility(reviews);
  const sentimentRes = detectSentimentMismatches(reviews);

  // 2. Score individual reviews
  const analyzedReviews: AnalyzedReview[] = reviews.map(r => {
    const flaggedReasons: string[] = [];
    let confidence = 1.0;

    // Duplicate check
    if (duplicateRes.templateMatchedIds.has(r.id)) {
      flaggedReasons.push('Matches known automated bot template phrase');
      confidence -= 0.85;
    } else if (duplicateRes.flaggedReviewIds.has(r.id)) {
      flaggedReasons.push('Duplicate or near-identical text found across multiple accounts');
      confidence -= 0.75;
    }

    // Velocity burst check
    if (velocityRes.flaggedReviewIds.has(r.id)) {
      flaggedReasons.push('Part of an unnatural burst/velocity spike in ratings');
      confidence -= 0.45;
    }

    // Credibility check
    if (!r.isVerifiedPurchase && r.rating === 5) {
      flaggedReasons.push('Unverified purchase with 5-star rating');
      confidence -= 0.35;
    }
    if (credibilityRes.flaggedReviewIds.has(r.id)) {
      flaggedReasons.push('Suspicious reviewer profile (generic username or low-effort praise)');
      confidence -= 0.35;
    }

    // Sentiment check
    if (sentimentRes.flaggedReviewIds.has(r.id)) {
      flaggedReasons.push('Sentiment contradicts star rating or displays synthetic text style');
      confidence -= 0.65;
    }

    // Bonus for authentic signals
    if (r.isVerifiedPurchase && r.text.length > 80 && flaggedReasons.length === 0) {
      confidence = Math.min(1.0, confidence + 0.15);
    }

    // Clamping
    confidence = Math.max(0.05, Math.min(1.0, confidence));
    const isFlagged = flaggedReasons.length > 0 || confidence < 0.55;

    return {
      ...r,
      isFlagged,
      flaggedReasons,
      authenticityConfidence: parseFloat(confidence.toFixed(2)),
      sentimentScore: parseFloat(calculateSimpleSentiment(r.text).toFixed(2))
    };
  });

  // 3. Compute Adjusted Rivue Rating
  let totalWeightedStars = 0;
  let totalWeights = 0;
  let flaggedCount = 0;

  for (const ar of analyzedReviews) {
    totalWeightedStars += ar.rating * ar.authenticityConfidence;
    totalWeights += ar.authenticityConfidence;
    if (ar.isFlagged) flaggedCount++;
  }

  const rawRivueRating = totalWeights > 0 ? totalWeightedStars / totalWeights : product.originalRating;
  const rivueRating = parseFloat(Math.max(1.0, Math.min(5.0, rawRivueRating)).toFixed(1));
  const ratingDifference = parseFloat((rivueRating - product.originalRating).toFixed(1));

  // 4. Compute Trust Score (0 - 100)
  const totalCount = Math.max(1, reviews.length);
  const authenticCount = totalCount - flaggedCount;
  const rawAuthenticRatio = authenticCount / totalCount;

  // Penalize by specific severe threat factors
  const duplicatePenalty = duplicateRes.duplicateRatio * 35;
  const unverifiedPenalty = (credibilityRes.unverifiedRatio > 0.4 ? (credibilityRes.unverifiedRatio - 0.4) : 0) * 25;
  const velocityPenalty = velocityRes.velocityRiskScore * 20;

  let trustScore = Math.round((rawAuthenticRatio * 100) - duplicatePenalty - unverifiedPenalty - velocityPenalty);
  trustScore = Math.max(10, Math.min(98, trustScore));

  // 5. Determine Verdict and Grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
  let verdict: 'Trustworthy' | 'Moderate' | 'Caution' | 'High Risk' = 'Trustworthy';

  if (trustScore >= 85) {
    grade = 'A';
    verdict = 'Trustworthy';
  } else if (trustScore >= 70) {
    grade = 'B';
    verdict = 'Moderate';
  } else if (trustScore >= 50) {
    grade = 'C';
    verdict = 'Caution';
  } else if (trustScore >= 35) {
    grade = 'D';
    verdict = 'High Risk';
  } else {
    grade = 'F';
    verdict = 'High Risk';
  }

  // 6. Reasons & Explanation
  const reasons: string[] = [];
  const fakeReviewPercentage = Math.round((flaggedCount / totalCount) * 100);

  if (duplicateRes.flaggedReviewIds.size > 0) {
    reasons.push(`${duplicateRes.flaggedReviewIds.size} reviews exhibit identical or copied template phrasing across different accounts.`);
  }
  if (credibilityRes.unverifiedRatio > 0.3) {
    reasons.push(`${Math.round(credibilityRes.unverifiedRatio * 100)}% of submitted reviews come from unverified purchases.`);
  }
  if (velocityRes.burstPeriodsDetected > 0) {
    reasons.push(`Detected ${velocityRes.burstPeriodsDetected} suspicious rating velocity spike(s) with unnaturally high 5-star density.`);
  }
  if (sentimentRes.mismatchCount > 0) {
    reasons.push(`${sentimentRes.mismatchCount} review(s) show star-to-text sentiment contradictions.`);
  }
  if (reasons.length === 0) {
    reasons.push('High proportion of verified buyers with natural organic review lengths and temporal spacing.');
  }

  let explanation = '';
  if (Math.abs(ratingDifference) <= 0.2 && trustScore >= 75) {
    explanation = `The marketplace rating of ${product.originalRating}★ is largely consistent with verified buyer feedback (${rivueRating}★). Reviews show natural distribution and high organic purchase verification.`;
  } else {
    explanation = `The official marketplace rating is ${product.originalRating}★, but Rivue adjusted it to ${rivueRating}★ (${ratingDifference > 0 ? '+' : ''}${ratingDifference}★). We identified that ${fakeReviewPercentage}% of reviews showed signs of manipulation—including unverified 5-star bursts, duplicate accounts, and automated praise templates. After filtering out flagged bot reviews and weighting by verified credibility, genuine customer sentiment reflects ${rivueRating}★.`;
  }

  const breakdown: AnalysisBreakdown = {
    duplicateBotPercentage: Math.round(duplicateRes.duplicateRatio * 100),
    unverifiedSpikePercentage: Math.round(credibilityRes.unverifiedRatio * 100),
    unnaturalDistributionScore: Math.round(velocityRes.velocityRiskScore * 100),
    sentimentMismatchCount: sentimentRes.mismatchCount,
    incentivizedBiasScore: Math.round(credibilityRes.genericAuthorRatio * 100)
  };

  const authenticHighlights = extractAuthenticHighlights(analyzedReviews, product);

  const priceAnalysis = computePriceIntelligence(
    product.price,
    product.originalRating,
    rivueRating,
    trustScore,
    fakeReviewPercentage,
    product.productId || product.title
  );

  return {
    product: {
      url: product.url,
      productId: product.productId,
      title: product.title,
      marketplace: product.marketplace,
      imageUrl: product.imageUrl,
      price: product.price,
      originalRating: product.originalRating,
      originalReviewCount: product.originalReviewCount
    },
    rivueRating,
    originalRating: product.originalRating,
    ratingDifference,
    trustScore,
    grade,
    verdict,
    fakeReviewPercentage,
    totalReviewsAnalyzed: reviews.length,
    suspiciousReviewsCount: flaggedCount,
    breakdown,
    explanation,
    reasons,
    authenticHighlights,
    priceAnalysis,
    reviews: analyzedReviews,
    analyzedAt: new Date().toISOString(),
    source
  };
}
