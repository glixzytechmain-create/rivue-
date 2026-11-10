package com.example.rivue

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
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
          modifier = Modifier.fillMaxSize(),
          contentAlignment = Alignment.Center
      ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.padding(24.dp)
        ) {
          CircularProgressIndicator(modifier = Modifier.size(48.dp))
          Text(
              text = "Analyzing Review Authenticity",
              style = MaterialTheme.typography.titleMedium
          )
          Text(
              text = "Connecting to Anakin.io, scanning duplicate patterns, and recalculating trustworthy rating...",
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
          )
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
