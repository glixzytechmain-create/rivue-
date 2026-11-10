package com.example.rivue.ui.screens

import android.graphics.BitmapFactory
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.URL
import com.example.rivue.data.model.AnalysisResult
import com.example.rivue.data.model.AnalyzedReview

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalysisResultScreen(
    result: AnalysisResult,
    onBack: () -> Unit
) {
  var selectedTab by remember { mutableStateOf("all") }

  Scaffold(
      topBar = {
        TopAppBar(
            title = { Text("Rivue Trust Report", fontWeight = FontWeight.Bold) },
            navigationIcon = {
              IconButton(onClick = onBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
              }
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
        )
      }
  ) { padding ->
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      item { Spacer(modifier = Modifier.height(2.dp)) }

      // 1. Product Header
      item {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
        ) {
          Row(
              modifier = Modifier.padding(14.dp),
              horizontalArrangement = Arrangement.spacedBy(14.dp),
              verticalAlignment = Alignment.CenterVertically
          ) {
            RemoteProductImage(
                imageUrl = result.product.imageUrl,
                modifier = Modifier.size(76.dp)
            )
            Column(modifier = Modifier.weight(1f)) {
              Text(
                  text = result.product.marketplace.uppercase(),
                  style = MaterialTheme.typography.labelMedium,
                  color = MaterialTheme.colorScheme.primary,
                  fontWeight = FontWeight.Bold
              )
              Text(
                  text = result.product.title,
                  style = MaterialTheme.typography.titleMedium,
                  fontWeight = FontWeight.Bold,
                  modifier = Modifier.padding(vertical = 2.dp)
              )
              Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                result.product.price?.let {
                  Text(text = it, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                  Text("•", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Text(
                    text = "${result.product.originalReviewCount} Reviews",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            }
          }
        }
      }

      // 2. Hero Rating & Trust Score Card
      item {
        HeroRatingCard(result = result)
      }

      // 2b. Price & Worth It Value Intelligence Card
      result.priceAnalysis?.let { pa ->
        item {
          PriceIntelligenceCard(priceAnalysis = pa)
        }
      }

      // 3. Why Ratings Differ Rationale
      item {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.35f)
            )
        ) {
          Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
              Icon(Icons.Default.Info, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
              Text("Why Rivue's Rating Differs", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall)
            }
            Text(
                text = result.explanation,
                style = MaterialTheme.typography.bodyMedium,
                lineHeight = 20.sp
            )
            HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp), color = MaterialTheme.colorScheme.outlineVariant)
            result.reasons.forEach { reason ->
              Text(
                  text = "• $reason",
                  style = MaterialTheme.typography.bodySmall,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
          }
        }
      }

      // 4. Threat & Deception Breakdown
      item {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
          Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Deception & Threat Breakdown", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall)

            ThreatMetricBar(
                title = "Bot Duplicates & Copypastas",
                percentage = result.breakdown.duplicateBotPercentage,
                color = Color(0xFFEF4444)
            )
            ThreatMetricBar(
                title = "Unverified 5-Star Purchases",
                percentage = result.breakdown.unverifiedSpikePercentage,
                color = Color(0xFFF59E0B)
            )
            ThreatMetricBar(
                title = "Rating Velocity Spikes",
                percentage = result.breakdown.unnaturalDistributionScore,
                color = Color(0xFFEF4444)
            )
            ThreatMetricBar(
                title = "Suspicious Profile Patterns",
                percentage = result.breakdown.incentivizedBiasScore,
                color = Color(0xFF6366F1)
            )
          }
        }
      }

      // 5. Authentic Highlights (Pros & Cons)
      item {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
          Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Verified Buyer Consensus", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall)
            Text(
                "Filtered strictly from verified genuine purchasers with no bot flags.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            // Pros
            Text("✓ Genuine Pros", fontWeight = FontWeight.Bold, color = Color(0xFF10B981), fontSize = 13.sp)
            result.authenticHighlights.pros.forEach { pro ->
              Text("• $pro", style = MaterialTheme.typography.bodySmall)
            }

            // Cons
            Spacer(modifier = Modifier.height(4.dp))
            Text("✕ Genuine Cons", fontWeight = FontWeight.Bold, color = Color(0xFFEF4444), fontSize = 13.sp)
            result.authenticHighlights.cons.forEach { con ->
              Text("• $con", style = MaterialTheme.typography.bodySmall)
            }
          }
        }
      }

      // 6. Review Feed & Inspection
      item {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("Review Inspection Feed", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall)

          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterTabButton("All (${result.reviews.size})", selectedTab == "all") { selectedTab = "all" }
            FilterTabButton("Flagged (${result.suspiciousReviewsCount})", selectedTab == "flagged") { selectedTab = "flagged" }
            FilterTabButton("Authentic (${result.reviews.size - result.suspiciousReviewsCount})", selectedTab == "authentic") { selectedTab = "authentic" }
          }
        }
      }

      val filteredReviews = when (selectedTab) {
        "flagged" -> result.reviews.filter { it.isFlagged }
        "authentic" -> result.reviews.filter { !it.isFlagged }
        else -> result.reviews
      }

      if (filteredReviews.isEmpty()) {
        item {
          Box(modifier = Modifier.fillMaxWidth().padding(24.dp), contentAlignment = Alignment.Center) {
            Text("No reviews found in this category.", color = MaterialTheme.colorScheme.onSurfaceVariant)
          }
        }
      } else {
        items(filteredReviews) { review ->
          ReviewCardItem(review = review)
        }
      }

      item { Spacer(modifier = Modifier.height(24.dp)) }
    }
  }
}

@Composable
fun HeroRatingCard(result: AnalysisResult) {
  val trustColor = when {
    result.trustScore >= 75 -> Color(0xFF10B981)
    result.trustScore >= 50 -> Color(0xFFF59E0B)
    else -> Color(0xFFEF4444)
  }

  Card(
      modifier = Modifier.fillMaxWidth(),
      shape = RoundedCornerShape(16.dp),
      colors = CardDefaults.cardColors(
          containerColor = MaterialTheme.colorScheme.surfaceVariant
      )
  ) {
    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
      Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
      ) {
        Column {
          Text("AUTHENTICITY VERDICT", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
          Text(result.verdict, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.ExtraBold, color = trustColor)
        }

        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(trustColor.copy(alpha = 0.2f))
                .border(2.dp, trustColor, RoundedCornerShape(12.dp)),
            contentAlignment = Alignment.Center
        ) {
          Text(result.grade, fontSize = 22.sp, fontWeight = FontWeight.Black, color = trustColor)
        }
      }

      // Comparison Row
      Row(
          modifier = Modifier
              .fillMaxWidth()
              .clip(RoundedCornerShape(12.dp))
              .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.6f))
              .padding(12.dp),
          horizontalArrangement = Arrangement.SpaceAround,
          verticalAlignment = Alignment.CenterVertically
      ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
          Text("Original", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
          Text("${result.originalRating}★", fontSize = 20.sp, fontWeight = FontWeight.Bold)
          Text("Published", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }

        Column(horizontalAlignment = Alignment.CenterHorizontally) {
          Text("➔", fontSize = 16.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
          Box(
              modifier = Modifier
                  .clip(RoundedCornerShape(4.dp))
                  .background(if (result.ratingDifference < 0) Color(0xFFEF4444).copy(alpha = 0.2f) else Color(0xFF10B981).copy(alpha = 0.2f))
                  .padding(horizontal = 6.dp, vertical = 2.dp)
          ) {
            val sign = if (result.ratingDifference > 0) "+" else ""
            Text(
                "$sign${result.ratingDifference}★",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = if (result.ratingDifference < 0) Color(0xFFEF4444) else Color(0xFF10B981)
            )
          }
        }

        Column(horizontalAlignment = Alignment.CenterHorizontally) {
          Text("Rivue Rating", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
          Text("${result.rivueRating}★", fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
          Text("Consensus", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
      }

      // Trust Index Progress Bar
      Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
          Text("Rivue Trust Index", style = MaterialTheme.typography.bodySmall)
          Text("${result.trustScore} / 100", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold)
        }
        LinearProgressIndicator(
            progress = { result.trustScore / 100f },
            modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(99.dp)),
            color = trustColor
        )
      }
    }
  }
}

@Composable
fun ThreatMetricBar(title: String, percentage: Int, color: Color) {
  Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
      Text(title, style = MaterialTheme.typography.bodySmall)
      Text("$percentage%", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold)
    }
    LinearProgressIndicator(
        progress = { (percentage.coerceIn(0, 100)) / 100f },
        modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(99.dp)),
        color = color
    )
  }
}

@Composable
fun FilterTabButton(label: String, selected: Boolean, onClick: () -> Unit) {
  Button(
      onClick = onClick,
      colors = ButtonDefaults.buttonColors(
          containerColor = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
          contentColor = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
      ),
      contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
      shape = RoundedCornerShape(8.dp)
  ) {
    Text(label, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
  }
}

@Composable
fun ReviewCardItem(review: AnalyzedReview) {
  Card(
      modifier = Modifier.fillMaxWidth(),
      shape = RoundedCornerShape(12.dp),
      colors = CardDefaults.cardColors(
          containerColor = if (review.isFlagged) Color(0xFFEF4444).copy(alpha = 0.05f) else MaterialTheme.colorScheme.surface
      )
  ) {
    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
      Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
            text = "${review.author} ${if (review.isVerifiedPurchase) "✓" else ""}",
            fontWeight = FontWeight.Bold,
            style = MaterialTheme.typography.bodyMedium
        )
        Text(
            text = "★".repeat(review.rating) + "☆".repeat(5 - review.rating),
            color = Color(0xFFFBBF24),
            fontSize = 13.sp
        )
      }

      Text(text = review.text, style = MaterialTheme.typography.bodySmall, lineHeight = 18.sp)

      if (review.isFlagged && review.flaggedReasons.isNotEmpty()) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
          Icon(Icons.Default.Warning, contentDescription = null, tint = Color(0xFFEF4444), modifier = Modifier.size(14.dp))
          Text(
              text = review.flaggedReasons.joinToString(" • "),
              fontSize = 10.sp,
              color = Color(0xFFEF4444),
              fontWeight = FontWeight.SemiBold
          )
        }
      }
    }
  }
}

@Composable
fun RemoteProductImage(imageUrl: String?, modifier: Modifier = Modifier) {
  var bitmap by remember(imageUrl) { mutableStateOf<androidx.compose.ui.graphics.ImageBitmap?>(null) }
  var isLoading by remember(imageUrl) { mutableStateOf(!imageUrl.isNullOrBlank()) }

  LaunchedEffect(imageUrl) {
    if (!imageUrl.isNullOrBlank()) {
      isLoading = true
      val bmp = withContext(Dispatchers.IO) {
        try {
          val connection = URL(imageUrl).openConnection()
          connection.connectTimeout = 5000
          connection.readTimeout = 5000
          connection.getInputStream().use { input ->
            BitmapFactory.decodeStream(input)?.asImageBitmap()
          }
        } catch (e: Exception) {
          null
        }
      }
      bitmap = bmp
      isLoading = false
    } else {
      isLoading = false
    }
  }

  Box(
      modifier = modifier
          .clip(RoundedCornerShape(12.dp))
          .background(MaterialTheme.colorScheme.surfaceVariant),
      contentAlignment = Alignment.Center
  ) {
    if (bitmap != null) {
      Image(
          bitmap = bitmap!!,
          contentDescription = "Product Image",
          modifier = Modifier.fillMaxSize(),
          contentScale = ContentScale.Crop
      )
    } else if (isLoading) {
      CircularProgressIndicator(modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
    } else {
      Icon(
          Icons.Default.Info,
          contentDescription = "No Image",
          tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
          modifier = Modifier.size(32.dp)
      )
    }
  }
}

@Composable
fun PriceIntelligenceCard(priceAnalysis: com.example.rivue.data.model.PriceAnalysis) {
  val dealColor = when (priceAnalysis.dealVerdict) {
    "GREAT_DEAL" -> Color(0xFF10B981)
    "OVERPRICED" -> Color(0xFFEF4444)
    else -> Color(0xFF3B82F6)
  }

  Card(
      modifier = Modifier.fillMaxWidth(),
      shape = RoundedCornerShape(16.dp),
      colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
  ) {
    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
      // Header with Deal Badge
      Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
      ) {
        Column {
          Text(
              text = "PRICE & VALUE INTELLIGENCE",
              style = MaterialTheme.typography.labelSmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
          )
          Text(
              text = "Fair Value Assessment",
              style = MaterialTheme.typography.titleMedium,
              fontWeight = FontWeight.Bold
          )
        }

        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(8.dp))
                .background(dealColor.copy(alpha = 0.15f))
                .border(1.dp, dealColor.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                .padding(horizontal = 10.dp, vertical = 4.dp)
        ) {
          Text(
              text = priceAnalysis.dealBadge,
              color = dealColor,
              fontWeight = FontWeight.Bold,
              fontSize = 11.sp
          )
        }
      }

      // 3 Price Metric Cards
      Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        // Current Price
        Card(
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
        ) {
          Column(
              modifier = Modifier.padding(10.dp),
              horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Text("Current", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = FontWeight.Bold)
            Text(priceAnalysis.formattedCurrentPrice, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
            Text("Store Price", fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
          }
        }

        // 90D Average
        Card(
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
        ) {
          Column(
              modifier = Modifier.padding(10.dp),
              horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Text("90D Avg", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = FontWeight.Bold)
            Text(priceAnalysis.formattedAveragePrice, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text("Market Baseline", fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
          }
        }

        // Worth It Price
        Card(
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)),
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.4f))
        ) {
          Column(
              modifier = Modifier.padding(10.dp),
              horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Text("Worth It", fontSize = 10.sp, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.ExtraBold)
            Text(priceAnalysis.formattedWorthItPrice, fontSize = 16.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
            Text("Rivue Value", fontSize = 9.sp, color = MaterialTheme.colorScheme.primary)
          }
        }
      }

      // Range Indicators (Low / High)
      Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
      ) {
        Text("90D Low: ${priceAnalysis.formattedLowestPrice}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        val diffText = if (priceAnalysis.priceDifference > 0) "+${priceAnalysis.currency}${String.format("%.2f", priceAnalysis.priceDifference)} markup"
                       else if (priceAnalysis.priceDifference < 0) "Save ${priceAnalysis.currency}${String.format("%.2f", Math.abs(priceAnalysis.priceDifference))}"
                       else "Fair match"
        Text(diffText, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = dealColor)
        Text("90D High: ${priceAnalysis.formattedHighestPrice}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
      }

      // Deal Explanation
      if (priceAnalysis.dealExplanation.isNotBlank()) {
        Text(
            text = priceAnalysis.dealExplanation,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.85f),
            lineHeight = 18.sp
        )
      }

      // 90-Day History Points
      if (priceAnalysis.history.isNotEmpty()) {
        HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp), color = MaterialTheme.colorScheme.outlineVariant)
        Text("90-Day Price Trajectory", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
          priceAnalysis.history.forEach { pt ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
              Text(pt.date, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
              Text(pt.label ?: "Market Trend", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
              Text(pt.formattedPrice, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
          }
        }
      }
    }
  }
}

