package com.example.rivue

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.rivue.ui.RivueUiState
import com.example.rivue.ui.RivueViewModel
import com.example.rivue.ui.screens.AnalysisResultScreen
import com.example.rivue.ui.screens.DashboardScreen
import com.example.rivue.ui.theme.RivueTheme

class MainActivity : ComponentActivity() {
  private val viewModel: RivueViewModel by viewModels()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    // Handle initial intent (e.g. from Android Share Sheet or Deep Link)
    viewModel.handleIncomingIntent(intent)

    setContent {
      RivueTheme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
          RivueApp(viewModel = viewModel)
        }
      }
    }
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    // Handle intent when activity is already running
    viewModel.handleIncomingIntent(intent)
  }
}

@Composable
fun RivueApp(viewModel: RivueViewModel) {
  val uiState by viewModel.uiState.collectAsState()
  val recentScans by viewModel.recentScans.collectAsState()

  when (val state = uiState) {
    is RivueUiState.Idle -> {
      DashboardScreen(
          recentScans = recentScans,
          onAnalyze = { url -> viewModel.analyzeUrl(url) },
          onSelectRecent = { scan -> viewModel.analyzeUrl(scan.product.url) }
      )
    }

    is RivueUiState.Loading -> {
      Box(
          modifier = Modifier
              .fillMaxSize()
              .background(MaterialTheme.colorScheme.background)
              .padding(24.dp),
          contentAlignment = Alignment.Center
      ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)
            ),
            shape = androidx.compose.foundation.shape.RoundedCornerShape(20.dp)
        ) {
          Column(
              horizontalAlignment = Alignment.CenterHorizontally,
              verticalArrangement = Arrangement.spacedBy(16.dp),
              modifier = Modifier.padding(24.dp)
          ) {
            Text(
                text = "🛡️",
                fontSize = 44.sp
            )

            Text(
                text = "Live E-Commerce Forensics",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = state.stageTitle,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.SemiBold,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )

            LinearProgressIndicator(
                progress = { state.progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp),
                color = MaterialTheme.colorScheme.primary,
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )

            Spacer(modifier = Modifier.height(8.dp))

            // 5 Forensic Checkpoints
            val steps = listOf(
                "Connecting to ScraperAPI residential proxies",
                "Extracting 1500px photography & live price",
                "Scraping authentic customer reviews & stars",
                "Running Rivue AI Forensics & bot detector",
                "Computing Worth-It fair value & Trust Score"
            )

            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              steps.forEachIndexed { index, title ->
                val stepNum = index + 1
                val isDone = state.stage > stepNum
                val isActive = state.stage == stepNum
                val statusIcon = if (isDone) "✓" else if (isActive) "⚡" else "○"
                val textColor = if (isDone) {
                  Color(0xFF10B981)
                } else if (isActive) {
                  MaterialTheme.colorScheme.primary
                } else {
                  MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                  Text(
                      text = statusIcon,
                      fontWeight = FontWeight.Bold,
                      color = textColor,
                      modifier = Modifier.width(24.dp)
                  )
                  Text(
                      text = title,
                      style = MaterialTheme.typography.bodySmall,
                      fontWeight = if (isActive || isDone) FontWeight.SemiBold else FontWeight.Normal,
                      color = textColor
                  )
                }
              }
            }
          }
        }
      }
    }

    is RivueUiState.Success -> {
      AnalysisResultScreen(
          result = state.result,
          onBack = { viewModel.clearResult() }
      )
    }

    is RivueUiState.Error -> {
      AlertDialog(
          onDismissRequest = { viewModel.clearResult() },
          title = { Text("Analysis Notice") },
          text = { Text(state.message) },
          confirmButton = {
            TextButton(onClick = { viewModel.clearResult() }) {
              Text("Dismiss")
            }
          }
      )
      DashboardScreen(
          recentScans = recentScans,
          onAnalyze = { url -> viewModel.analyzeUrl(url) },
          onSelectRecent = { scan -> viewModel.analyzeUrl(scan.product.url) }
      )
    }
  }
}
