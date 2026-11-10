import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { scrapeProductWithScraperApi } from './services/scraperApi';
import { analyzeProductReviews } from './engine/ratingRecalculator';
import { SAMPLE_PRODUCTS } from './fixtures/sampleProducts';
import { AnalysisResult } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../web')));
app.use(express.static(path.join(__dirname, '../web')));

// In-memory cache for analyzed products
const analysisCache = new Map<string, AnalysisResult>();
const analysisHistory: AnalysisResult[] = [];

/**
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Rivue API Server',
    version: '1.0.0',
    scraperApiConfigured: Boolean(process.env.SCRAPERAPI_KEY),
    anakinConfigured: Boolean(process.env.ANAKIN_API_KEY),
    cachedProducts: analysisCache.size,
    historyCount: analysisHistory.length
  });
});

/**
 * Returns list of sample products for easy testing
 */
app.get('/api/sample', (req: Request, res: Response) => {
  const samples = Object.values(SAMPLE_PRODUCTS).map(p => ({
    id: p.productId,
    title: p.title,
    marketplace: p.marketplace,
    url: p.url,
    price: p.price,
    rating: p.originalRating
  }));
  res.json({ samples });
});

/**
 * Returns recent scan history
 */
app.get('/api/history', (req: Request, res: Response) => {
  res.json({
    history: analysisHistory.slice(0, 15).map(item => ({
      productId: item.product.productId,
      title: item.product.title,
      marketplace: item.product.marketplace,
      url: item.product.url,
      imageUrl: item.product.imageUrl,
      originalRating: item.originalRating,
      rivueRating: item.rivueRating,
      trustScore: item.trustScore,
      grade: item.grade,
      verdict: item.verdict,
      fakeReviewPercentage: item.fakeReviewPercentage,
      analyzedAt: item.analyzedAt
    }))
  });
});

/**
 * Analyzes product reviews for a given URL
 */
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { url, refresh, pageData } = req.body;

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return res.status(400).json({
        error: 'Invalid URL. Please provide a valid product URL starting with http:// or https://'
      });
    }

    const cleanUrl = url.trim();

    // Check cache unless refresh or explicit pageData is provided
    if (!refresh && !pageData && analysisCache.has(cleanUrl)) {
      console.log(`[Cache Hit] Returning cached analysis for: ${cleanUrl}`);
      const cached = analysisCache.get(cleanUrl)!;
      return res.json({ ...cached, source: 'cached' });
    }

    console.log(`[Rivue] Performing live review forensics for: ${cleanUrl}`);

    // Fetch real product details, images & reviews via ScraperAPI or client DOM
    const { product, source } = await scrapeProductWithScraperApi(cleanUrl, pageData);

    // Run core fake review detection & rating recalculator engine
    const analysis = analyzeProductReviews(product, source);

    // Save in cache and history
    analysisCache.set(cleanUrl, analysis);
    analysisHistory.unshift(analysis);
    if (analysisHistory.length > 50) analysisHistory.pop();

    return res.json(analysis);
  } catch (err: any) {
    console.error('[Rivue Error]', err.message);
    return res.status(400).json({
      error: err.message || 'Failed to inspect product reviews.',
      details: err.message
    });
  }
});

// Root welcome route
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Rivue API Server',
    tagline: 'Transparent Fake & Misleading Product Review Detection',
    endpoints: {
      health: 'GET /api/health',
      sample: 'GET /api/sample',
      history: 'GET /api/history',
      analyze: 'POST /api/analyze { url: string }'
    }
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  🛡️ Rivue API Server running on port ${PORT}`);
    console.log(`  🔗 Health: http://localhost:${PORT}/api/health`);
    console.log(`  📡 Anakin.io connected`);
    console.log(`===============================================`);
  });
}

export default app;
