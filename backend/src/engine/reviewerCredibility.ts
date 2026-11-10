import { RawReview } from '../types';

export interface CredibilityScore {
  flaggedReviewIds: Set<string>;
  unverifiedRatio: number;
  genericAuthorRatio: number;
  shortLowEffortRatio: number;
  suspiciousAuthorCount: number;
}

const GENERIC_AUTHOR_PATTERNS = [
  /amazon\s*customer/i,
  /kindle\s*customer/i,
  /flipkart\s*buyer/i,
  /flipkart\s*customer/i,
  /walmart\s*shopper/i,
  /walmart\s*customer/i,
  /verified\s*buyer/i,
  /^user\d{4,}$/i,
  /^customer$/i,
  /^shopper$/i,
  /^reviewer$/i,
  /anonymous/i
];

const GENERIC_SHORT_PRAISES = new Set([
  'good', 'very good', 'nice', 'awesome', 'best', 'super', 'loved it',
  'great product', 'excellent', 'worth it', 'must buy', 'good product',
  'superb', 'wonderful', 'happy with it', 'fine', 'perfect', '5 stars',
  'ok ok', 'recommended', 'value for money', 'osm', 'mast'
]);

/**
 * Assesses reviewer credibility and flags low-trust reviewer profiles.
 */
export function evaluateReviewerCredibility(reviews: RawReview[]): CredibilityScore {
  const flaggedReviewIds = new Set<string>();
  let unverifiedCount = 0;
  let genericAuthorCount = 0;
  let shortLowEffortCount = 0;

  for (const r of reviews) {
    let flagsForThis = 0;

    // 1. Unverified purchase check
    if (!r.isVerifiedPurchase) {
      unverifiedCount++;
      // High rating without verified purchase is suspicious
      if (r.rating === 5) {
        flagsForThis++;
      }
    }

    // 2. Generic author name check
    const isGenericAuthor = GENERIC_AUTHOR_PATTERNS.some(pat => pat.test(r.author.trim())) || r.author.trim().length <= 2;
    if (isGenericAuthor) {
      genericAuthorCount++;
      if (r.rating >= 4) {
        flagsForThis++;
      }
    }

    // 3. Short low-effort generic praise check
    const cleanText = r.text.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
    if (wordCount <= 4 && (GENERIC_SHORT_PRAISES.has(cleanText) || cleanText.length < 15)) {
      shortLowEffortCount++;
      if (r.rating >= 4) {
        flagsForThis++;
      }
    }

    // If review accumulates multiple credibility flags, flag it
    if (flagsForThis >= 2 || (!r.isVerifiedPurchase && isGenericAuthor && r.rating >= 4)) {
      flaggedReviewIds.add(r.id);
    }
  }

  const total = Math.max(1, reviews.length);
  return {
    flaggedReviewIds,
    unverifiedRatio: unverifiedCount / total,
    genericAuthorRatio: genericAuthorCount / total,
    shortLowEffortRatio: shortLowEffortCount / total,
    suspiciousAuthorCount: genericAuthorCount
  };
}
