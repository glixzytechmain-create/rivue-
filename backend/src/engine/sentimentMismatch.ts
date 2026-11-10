import { RawReview } from '../types';

export interface SentimentMismatchResult {
  flaggedReviewIds: Set<string>;
  mismatchCount: number;
  syntheticTextCount: number;
}

const NEGATIVE_WORDS = [
  'terrible', 'horrible', 'waste of money', 'broken', 'defective', 'worst',
  'garbage', 'useless', 'broke after', 'does not work', 'dont buy',
  'fake product', 'stopped working', 'poor quality', 'disappointed',
  'damaged', 'cheap plastic', 'not satisfied', 'return', 'refund'
];

const POSITIVE_WORDS = [
  'excellent', 'amazing', 'perfect', 'love it', 'fantastic', 'superb',
  'great quality', 'highly recommend', 'works wonderfully', 'flawless'
];

const SYNTHETIC_LLM_PATTERNS = [
  /as an avid (enthusiast|user|shopper)/i,
  /in conclusion,/i,
  /all in all,/i,
  /it stands as a testament/i,
  /unparalleled in its category/i,
  /i am thoroughly impressed with its ability to/i,
  /surpassed all my expectations/i,
  /a quintessential choice for/i
];

/**
 * Calculates a rough sentiment score (-1 to +1) based on keyword valence.
 */
export function calculateSimpleSentiment(text: string): number {
  const lower = text.toLowerCase();
  let pos = 0;
  let neg = 0;

  for (const word of POSITIVE_WORDS) {
    if (lower.includes(word)) pos++;
  }
  for (const word of NEGATIVE_WORDS) {
    if (lower.includes(word)) neg++;
  }

  if (pos === 0 && neg === 0) return 0;
  return (pos - neg) / (pos + neg);
}

/**
 * Flags reviews where star rating contradicts review text or appears overtly machine-generated.
 */
export function detectSentimentMismatches(reviews: RawReview[]): SentimentMismatchResult {
  const flaggedReviewIds = new Set<string>();
  let mismatchCount = 0;
  let syntheticTextCount = 0;

  for (const r of reviews) {
    const text = r.text.toLowerCase();
    const sentiment = calculateSimpleSentiment(r.text);

    // Mismatch Case 1: 5-star review containing harsh negative criticism
    let hasStrongNegative = false;
    for (const neg of NEGATIVE_WORDS) {
      if (text.includes(neg)) {
        hasStrongNegative = true;
        break;
      }
    }

    if (r.rating >= 4 && hasStrongNegative && sentiment < -0.3) {
      flaggedReviewIds.add(r.id);
      mismatchCount++;
    }

    // Mismatch Case 2: 1-star review praising product (seller sabotage / misclick)
    if (r.rating === 1 && sentiment > 0.6) {
      flaggedReviewIds.add(r.id);
      mismatchCount++;
    }

    // Check for synthetic AI-generated review tone
    const isSynthetic = SYNTHETIC_LLM_PATTERNS.some(pat => pat.test(r.text));
    if (isSynthetic) {
      flaggedReviewIds.add(r.id);
      syntheticTextCount++;
    }
  }

  return {
    flaggedReviewIds,
    mismatchCount,
    syntheticTextCount
  };
}
