package com.example.rivue.ui

import android.content.Intent
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.rivue.data.api.RivueApiClient
import com.example.rivue.data.model.AnalysisResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface RivueUiState {
  object Idle : RivueUiState
  data class Loading(
    val url: String,
    val stage: Int = 1,
    val stageTitle: String = "Phase 1/5: Connecting to ScraperAPI residential proxy network...",
    val progress: Float = 0.20f
  ) : RivueUiState
  data class Success(val result: AnalysisResult) : RivueUiState
  data class Error(val message: String) : RivueUiState
}

class RivueViewModel : ViewModel() {
  private val _uiState = MutableStateFlow<RivueUiState>(RivueUiState.Idle)
  val uiState: StateFlow<RivueUiState> = _uiState.asStateFlow()

  private val _recentScans = MutableStateFlow<List<AnalysisResult>>(emptyList())
  val recentScans: StateFlow<List<AnalysisResult>> = _recentScans.asStateFlow()

  fun handleIncomingIntent(intent: Intent?) {
    if (intent == null) return

    val action = intent.action
    val type = intent.type

    // 1. Android Share Sheet: ACTION_SEND with text/plain
    if (Intent.ACTION_SEND == action && type != null) {
      if ("text/plain" == type) {
        val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
        if (!sharedText.isNullOrBlank()) {
          val extractedUrl = RivueApiClient.extractUrlFromText(sharedText)
          if (extractedUrl != null) {
            analyzeUrl(extractedUrl)
          } else {
            _uiState.value = RivueUiState.Error("Shared text did not contain a valid product URL: $sharedText")
          }
        }
      }
    }
    // 2. Direct URL View: ACTION_VIEW
    else if (Intent.ACTION_VIEW == action) {
      val data = intent.data
      if (data != null) {
        analyzeUrl(data.toString())
      }
    }
  }

  fun analyzeUrl(url: String) {
    val clean = url.trim()
    if (clean.isBlank()) {
      _uiState.value = RivueUiState.Error("Please enter a valid product URL.")
      return
    }

    viewModelScope.launch {
      // 5-Stage Animated Sequence across 5.2 seconds
      val animationJob = launch {
        _uiState.value = RivueUiState.Loading(clean, 1, "Phase 1/5: Connecting to ScraperAPI residential proxy network...", 0.20f)
        kotlinx.coroutines.delay(1100)

        _uiState.value = RivueUiState.Loading(clean, 2, "Phase 2/5: Bypassing anti-bot walls & extracting 1500px photography...", 0.45f)
        kotlinx.coroutines.delay(1200)

        _uiState.value = RivueUiState.Loading(clean, 3, "Phase 3/5: Scraping authentic customer reviews & verified star distribution...", 0.68f)
        kotlinx.coroutines.delay(1200)

        _uiState.value = RivueUiState.Loading(clean, 4, "Phase 4/5: Running Rivue AI Forensics (bot templates & sentiment mismatch)...", 0.88f)
        kotlinx.coroutines.delay(1100)

        _uiState.value = RivueUiState.Loading(clean, 5, "Phase 5/5: Computing 90-day Worth-It fair value price & Trust Score...", 1.0f)
        kotlinx.coroutines.delay(600)
      }

      val apiResult = RivueApiClient.analyzeUrl(clean)
      animationJob.join()

      apiResult.onSuccess { analysis ->
        _uiState.value = RivueUiState.Success(analysis)
        val current = _recentScans.value.toMutableList()
        current.removeAll { it.product.url == analysis.product.url }
        current.add(0, analysis)
        _recentScans.value = current.take(10)
      }.onFailure { err ->
        _uiState.value = RivueUiState.Error(err.message ?: "Failed to inspect product reviews.")
      }
    }
  }

  fun clearResult() {
    _uiState.value = RivueUiState.Idle
  }
}
