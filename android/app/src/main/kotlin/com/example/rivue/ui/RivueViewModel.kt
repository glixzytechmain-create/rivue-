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
  data class Loading(val url: String) : RivueUiState
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

    _uiState.value = RivueUiState.Loading(clean)

    viewModelScope.launch {
      val res = RivueApiClient.analyzeUrl(clean)
      res.onSuccess { analysis ->
        _uiState.value = RivueUiState.Success(analysis)
        // Prepend to recent scans list
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
