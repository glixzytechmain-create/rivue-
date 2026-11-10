import { detectDuplicates } from '../src/engine/duplicateDetector';
import { detectVelocitySpikes } from '../src/engine/velocityDetector';
import { evaluateReviewerCredibility } from '../src/engine/reviewerCredibility';
import { detectSentimentMismatches } from '../src/engine/sentimentMismatch';
import { analyzeProductReviews } from '../src/engine/ratingRecalculator';
import { SAMPLE_PRODUCTS } from '../src/fixtures/sampleProducts';
import { RawReview } from '../src/types';

describe('Rivue Fake Review Detection Engine', () => {
  describe('Duplicate Review Detector', () => {
    it('should detect identical and near-identical reviews', () => {
      const reviews: RawReview[] = [
        {
          id: '1',
          author: 'Alice',
          rating: 5,
          date: '2024-01-01',
          text: 'This is the greatest product ever made, absolutely loved it!',
          isVerifiedPurchase: true
        },
        {
          id: '2',
          author: 'Bob',
          rating: 5,
          date: '2024-01-02',
          text: 'This is the greatest product ever made, absolutely loved it!',
          isVerifiedPurchase: false
        },
        {
          id: '3',
          author: 'Charlie',
          rating: 3,
          date: '2024-01-03',
          text: 'Sound quality was reasonable but charging wire broke very quickly.',
          isVerifiedPurchase: true
        }
      ];

      const res = detectDuplicates(reviews);
      expect(res.flaggedReviewIds.has('1')).toBe(true);
      expect(res.flaggedReviewIds.has('2')).toBe(true);
      expect(res.flaggedReviewIds.has('3')).toBe(false);
      expect(res.duplicateClusters.length).toBeGreaterThan(0);
    });

    it('should detect known bot template phrases', () => {
      const reviews: RawReview[] = [
        {
          id: 'bot-1',
          author: 'BotMaster',
          rating: 5,
          date: '2024-01-01',
          text: 'Super fast delivery genuine product awesome. Five stars best product ever!',
          isVerifiedPurchase: false
        }
      ];

      const res = detectDuplicates(reviews);
      expect(res.flaggedReviewIds.has('bot-1')).toBe(true);
      expect(res.templateMatchedIds.has('bot-1')).toBe(true);
    });
  });

  describe('Reviewer Credibility Evaluator', () => {
    it('should flag unverified 5-star reviews with generic names', () => {
      const reviews: RawReview[] = [
        {
          id: 'u1',
          author: 'Amazon Customer',
          rating: 5,
          date: '2024-01-01',
          text: 'good product',
          isVerifiedPurchase: false
        },
        {
          id: 'u2',
          author: 'Real Human Buyer',
          rating: 4,
          date: '2024-01-01',
          text: 'Great device, battery lasted around 6 hours during my flight yesterday.',
          isVerifiedPurchase: true
        }
      ];

      const res = evaluateReviewerCredibility(reviews);
      expect(res.flaggedReviewIds.has('u1')).toBe(true);
      expect(res.flaggedReviewIds.has('u2')).toBe(false);
    });
  });

  describe('Sentiment Mismatch Detector', () => {
    it('should flag 5-star ratings containing negative criticism', () => {
      const reviews: RawReview[] = [
        {
          id: 's1',
          author: 'Unhappy Buyer',
          rating: 5,
          date: '2024-01-01',
          text: 'Terrible garbage! Broke after two days of use and seller refused refund. Complete waste of money.',
          isVerifiedPurchase: true
        }
      ];

      const res = detectSentimentMismatches(reviews);
      expect(res.flaggedReviewIds.has('s1')).toBe(true);
      expect(res.mismatchCount).toBe(1);
    });
  });

  describe('Rating Recalculator & Trust Score', () => {
    it('should downgrade rating and score low trust for astroturfed product', () => {
      const product = SAMPLE_PRODUCTS['amazon-earbuds'];
      const result = analyzeProductReviews(product, 'fallback');

      expect(result.originalRating).toBe(4.8);
      expect(result.rivueRating).toBeLessThan(4.0); // Severely adjusted
      expect(result.ratingDifference).toBeLessThan(-0.5);
      expect(result.trustScore).toBeLessThan(60); // Low trust
      expect(result.verdict).toMatch(/Caution|High Risk/);
      expect(result.fakeReviewPercentage).toBeGreaterThan(30);
      expect(result.explanation).toContain('adjusted');
      expect(result.authenticHighlights.pros.length).toBeGreaterThan(0);
      expect(result.authenticHighlights.cons.length).toBeGreaterThan(0);
    });

    it('should preserve rating and score high trust for organic product', () => {
      const product = SAMPLE_PRODUCTS['walmart-chair'];
      const result = analyzeProductReviews(product, 'fallback');

      expect(result.originalRating).toBe(4.5);
      expect(result.trustScore).toBeGreaterThanOrEqual(75);
      expect(result.verdict).toMatch(/Trustworthy|Moderate/);
      expect(result.fakeReviewPercentage).toBeLessThan(20);
    });

    it('should include comprehensive price intelligence in analysis result', () => {
      const product = SAMPLE_PRODUCTS['amazon-earbuds'];
      const result = analyzeProductReviews(product, 'fallback');

      expect(result.priceAnalysis).toBeDefined();
      const pa = result.priceAnalysis!;
      expect(pa.currentPrice).toBe(39.99);
      expect(pa.currency).toBe('$');
      expect(pa.averagePrice).toBeGreaterThan(0);
      expect(pa.lowestPrice).toBeLessThan(pa.highestPrice);
      expect(pa.worthItPrice).toBeGreaterThan(0);
      expect(pa.worthItPrice).toBeLessThan(pa.currentPrice); // Astroturfed earbuds should be worth less!
      expect(pa.dealVerdict).toBe('OVERPRICED');
      expect(pa.dealBadge).toBe('Overpriced');
      expect(pa.history.length).toBe(6);
      expect(pa.history[0].label).toContain('High');
      expect(pa.history[pa.history.length - 1].label).toContain('Current');
    });
  });

  describe('Price Intelligence Engine', () => {
    it('should accurately parse various currency formats', () => {
      const { parseRawPrice, formatPrice } = require('../src/engine/priceIntelligence');
      
      expect(parseRawPrice('$39.99')).toEqual({ amount: 39.99, currency: '$' });
      expect(parseRawPrice('₹1,499')).toEqual({ amount: 1499, currency: '₹' });
      expect(parseRawPrice('£89.50')).toEqual({ amount: 89.5, currency: '£' });
      expect(parseRawPrice('€29.95')).toEqual({ amount: 29.95, currency: '€' });
      
      expect(formatPrice(39.99, '$')).toBe('$39.99');
      expect(formatPrice(1499, '₹')).toBe('₹1,499');
    });

    it('should calculate great deal when verified quality exceeds asking price', () => {
      const { computePriceIntelligence } = require('../src/engine/priceIntelligence');
      // Low price ($20) with high original & high rivue rating (4.9), 95 trust
      const pi = computePriceIntelligence('$20.00', 4.5, 4.9, 95, 5, 'deal-prod');
      expect(pi.currentPrice).toBe(20.0);
      expect(pi.worthItPrice).toBeGreaterThan(pi.currentPrice);
      expect(pi.dealVerdict).toBe('GREAT_DEAL');
      expect(pi.dealBadge).toBe('Great Deal');
    });
  });
});
