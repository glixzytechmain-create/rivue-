import { RawReview } from '../types';

export interface VelocityDetectionResult {
  flaggedReviewIds: Set<string>;
  burstPeriodsDetected: number;
  maxBurstCount: number;
  velocityRiskScore: number; // 0 to 1
}

/**
 * Parses diverse date formats into timestamp.
 */
function parseReviewDate(dateStr: string): number {
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) return parsed;

  // Handle formats like "Reviewed in United States on October 24, 2024"
  const match = dateStr.match(/on\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i) ||
                dateStr.match(/([A-Za-z]+\s+\d{1,2},\s+\d{4})/i) ||
                dateStr.match(/(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i);
  if (match) {
    const subParsed = Date.parse(match[1]);
    if (!isNaN(subParsed)) return subParsed;
  }
  return 0;
}

/**
 * Analyzes temporal distribution of reviews to identify astroturfing velocity bursts.
 * Astroturfed products often have long periods of 0-1 reviews followed by 20-100 reviews in a 48-72 hour window.
 */
export function detectVelocitySpikes(reviews: RawReview[]): VelocityDetectionResult {
  const flaggedReviewIds = new Set<string>();
  if (reviews.length < 5) {
    return { flaggedReviewIds, burstPeriodsDetected: 0, maxBurstCount: 0, velocityRiskScore: 0 };
  }

  // Parse and sort reviews by date
  const datedReviews = reviews
    .map(r => ({ id: r.id, rating: r.rating, timestamp: parseReviewDate(r.date) }))
    .filter(r => r.timestamp > 0)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (datedReviews.length < 5) {
    return { flaggedReviewIds, burstPeriodsDetected: 0, maxBurstCount: 0, velocityRiskScore: 0 };
  }

  const WINDOW_MS = 3 * 24 * 60 * 60 * 1000; // 3-day sliding window
  let burstPeriods = 0;
  let maxBurstCount = 0;

  for (let i = 0; i < datedReviews.length; i++) {
    const windowStart = datedReviews[i].timestamp;
    const windowEnd = windowStart + WINDOW_MS;

    const windowReviews = datedReviews.slice(i).filter(r => r.timestamp <= windowEnd);
    const fiveStarCount = windowReviews.filter(r => r.rating >= 4).length;

    // A burst occurs if more than 30% of all reviews (and >= 4 reviews) are packed into a single 3-day window
    // with predominantly 4-5 stars.
    if (windowReviews.length >= 4 && (windowReviews.length / datedReviews.length >= 0.35) && (fiveStarCount / windowReviews.length >= 0.8)) {
      burstPeriods++;
      if (windowReviews.length > maxBurstCount) {
        maxBurstCount = windowReviews.length;
      }
      for (const r of windowReviews) {
        if (r.rating === 5) {
          flaggedReviewIds.add(r.id);
        }
      }
    }
  }

  const velocityRiskScore = Math.min(1, (burstPeriods * 0.25) + (maxBurstCount / Math.max(1, datedReviews.length)));

  return {
    flaggedReviewIds,
    burstPeriodsDetected: burstPeriods,
    maxBurstCount,
    velocityRiskScore
  };
}
