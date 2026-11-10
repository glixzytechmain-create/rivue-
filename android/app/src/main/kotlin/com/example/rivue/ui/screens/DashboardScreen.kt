package com.example.rivue.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.rivue.data.model.AnalysisResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    recentScans: List<AnalysisResult>,
    onAnalyze: (String) -> Unit,
    onSelectRecent: (AnalysisResult) -> Unit
) {
  var urlInput by remember { mutableStateOf("") }

  Scaffold(
      topBar = {
        TopAppBar(
            title = {
              Row(verticalAlignment = Alignment.CenterVertically) {
                Text("🛡️ ", fontSize = 22.sp)
                Text("Rivue", fontWeight = FontWeight.ExtraBold, fontSize = 22.sp)
              }
            },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
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
      item {
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Identify Fake & Misleading Reviews",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Get transparent authentic ratings powered by Anakin.io multi-source analysis.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }

      // URL Input & Scan Action
      item {
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
            ),
            shape = RoundedCornerShape(16.dp)
        ) {
          Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedTextField(
                value = urlInput,
                onValueChange = { urlInput = it },
                label = { Text("Product URL") },
                placeholder = { Text("Paste Amazon, Flipkart or Walmart link...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            Button(
                onClick = {
                  if (urlInput.isNotBlank()) onAnalyze(urlInput)
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            ) {
              Text("Analyze Product Reviews", fontWeight = FontWeight.Bold)
            }
          }
        }
      }

      // Quick Demo Shortcuts
      item {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text(
              text = "Try Sample Products",
              style = MaterialTheme.typography.titleSmall,
              fontWeight = FontWeight.Bold
          )
          Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            SampleChip(
                label = "Amazon Earbuds\n(Astroturfed)",
                modifier = Modifier.weight(1f),
                onClick = {
                  urlInput = "https://www.amazon.com/dp/B09V3K4XYZ"
                  onAnalyze(urlInput)
                }
            )
            SampleChip(
                label = "Flipkart Watch\n(Calling)",
                modifier = Modifier.weight(1f),
                onClick = {
                  urlInput = "https://www.flipkart.com/chronopro-amoled-smartwatch/p/itm123456789"
                  onAnalyze(urlInput)
                }
            )
            SampleChip(
                label = "Walmart Chair\n(Genuine)",
                modifier = Modifier.weight(1f),
                onClick = {
                  urlInput = "https://www.walmart.com/ip/ErgoMax-Mesh-Office-Chair/55481923"
                  onAnalyze(urlInput)
                }
            )
          }
        }
      }

      // Share Sheet Tip Card
      item {
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)
            ),
            shape = RoundedCornerShape(14.dp)
        ) {
          Row(
              modifier = Modifier.padding(14.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            Icon(
                Icons.Default.Share,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(28.dp)
            )
            Column {
              Text(
                  text = "Mobile Share Sheet Integration",
                  fontWeight = FontWeight.Bold,
                  style = MaterialTheme.typography.titleSmall
              )
              Text(
                  text = "Browsing Amazon or Flipkart on your phone? Simply tap 'Share' -> 'Rivue' to instantly inspect the product without copying links!",
                  style = MaterialTheme.typography.bodySmall,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
          }
        }
      }

      // Recent Scans Section
      if (recentScans.isNotEmpty()) {
        item {
          Text(
              text = "Recent Inspections",
              style = MaterialTheme.typography.titleMedium,
              fontWeight = FontWeight.Bold
          )
        }
        items(recentScans) { scan ->
          RecentScanItem(scan = scan, onClick = { onSelectRecent(scan) })
        }
      }

      item { Spacer(modifier = Modifier.height(24.dp)) }
    }
  }
}

@Composable
fun SampleChip(label: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
  Surface(
      modifier = modifier
          .clip(RoundedCornerShape(10.dp))
          .clickable { onClick() },
      color = MaterialTheme.colorScheme.surfaceVariant,
      tonalElevation = 2.dp
  ) {
    Box(modifier = Modifier.padding(horizontal = 8.dp, vertical = 10.dp), contentAlignment = Alignment.Center) {
      Text(
          text = label,
          fontSize = 11.sp,
          fontWeight = FontWeight.SemiBold,
          lineHeight = 14.sp
      )
    }
  }
}

@Composable
fun RecentScanItem(scan: AnalysisResult, onClick: () -> Unit) {
  Card(
      modifier = Modifier
          .fillMaxWidth()
          .clickable { onClick() },
      shape = RoundedCornerShape(12.dp),
      colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
  ) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
      Column(modifier = Modifier.weight(1f)) {
        Text(
            text = scan.product.marketplace.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = scan.product.title,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.SemiBold,
            maxLines = 1
        )
        Text(
            text = "Orig: ${scan.originalRating}★  •  Rivue: ${scan.rivueRating}★",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }

      Box(
          modifier = Modifier
              .clip(RoundedCornerShape(8.dp))
              .background(
                  if (scan.trustScore >= 75) Color(0xFF10B981).copy(alpha = 0.2f)
                  else if (scan.trustScore >= 50) Color(0xFFF59E0B).copy(alpha = 0.2f)
                  else Color(0xFFEF4444).copy(alpha = 0.2f)
              )
              .padding(horizontal = 10.dp, vertical = 6.dp)
      ) {
        Text(
            text = "${scan.trustScore}% Trust",
            fontWeight = FontWeight.Bold,
            fontSize = 12.sp,
            color = if (scan.trustScore >= 75) Color(0xFF10B981)
            else if (scan.trustScore >= 50) Color(0xFFF59E0B)
            else Color(0xFFEF4444)
        )
      }
    }
  }
}
