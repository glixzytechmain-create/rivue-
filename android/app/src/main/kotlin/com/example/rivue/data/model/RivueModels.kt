package com.example.rivue.data.model

data class ProductInfo(
    val url: String,
    val productId: String,
    val title: String,
    val marketplace: String,
    val imageUrl: String? = null,
    val price: String? = null,
    val originalRating: Double,
    val originalReviewCount: Int
)

data class AnalysisBreakdown(
    val duplicateBotPercentage: Int,
    val unverifiedSpikePercentage: Int,
    val unnaturalDistributionScore: Int,
    val sentimentMismatchCount: Int,
    val incentivizedBiasScore: Int
)

data class AuthenticHighlights(
    val pros: List<String>,
    val cons: List<String>
)

data class AnalyzedReview(
    val id: String,
    val author: String,
    val rating: Int,
    val date: String,
    val title: String? = null,
    val text: String,
    val isVerifiedPurchase: Boolean,
    val helpfulVotes: Int = 0,
    val isFlagged: Boolean,
    val flaggedReasons: List<String>,
    val authenticityConfidence: Double,
    val sentimentScore: Double = 0.0
)

data class PricePoint(
    val date: String,
    val price: Double,
    val formattedPrice: String,
    val label: String? = null
)

data class PriceAnalysis(
    val currency: String,
    val currentPrice: Double,
    val formattedCurrentPrice: String,
    val averagePrice: Double,
    val formattedAveragePrice: String,
    val lowestPrice: Double,
    val formattedLowestPrice: String,
    val highestPrice: Double,
    val formattedHighestPrice: String,
    val worthItPrice: Double,
    val formattedWorthItPrice: String,
    val priceDifference: Double,
    val dealVerdict: String,
    val dealBadge: String,
    val dealExplanation: String,
    val history: List<PricePoint> = emptyList()
)

data class AnalysisResult(
    val product: ProductInfo,
    val rivueRating: Double,
    val originalRating: Double,
    val ratingDifference: Double,
    val trustScore: Int,
    val grade: String,
    val verdict: String,
    val fakeReviewPercentage: Int,
    val totalReviewsAnalyzed: Int,
    val suspiciousReviewsCount: Int,
    val breakdown: AnalysisBreakdown,
    val explanation: String,
    val reasons: List<String>,
    val authenticHighlights: AuthenticHighlights,
    val priceAnalysis: PriceAnalysis? = null,
    val reviews: List<AnalyzedReview>,
    val analyzedAt: String,
    val source: String
)
