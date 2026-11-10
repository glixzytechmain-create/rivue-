// Rivue Popup Controller
document.addEventListener('DOMContentLoaded', async () => {
  const btnScanCurrent = document.getElementById('btn-scan-current');
  const btnAnalyze = document.getElementById('btn-analyze');
  const inputUrl = document.getElementById('input-url');
  const loadingState = document.getElementById('loading-state');
  const errorState = document.getElementById('error-state');
  const resultState = document.getElementById('result-state');
  const errorMessage = document.getElementById('error-message');
  const btnOpenSidepanel = document.getElementById('btn-open-sidepanel');
  const pills = document.querySelectorAll('.pill');

  // Pre-load latest cached result if available
  try {
    const { latestAnalysis } = await chrome.storage.local.get(['latestAnalysis']);
    if (latestAnalysis) {
      displayResult(latestAnalysis);
    }
  } catch (e) {}

  // 1. Scan Current Page
  btnScanCurrent.addEventListener('click', async () => {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab || !activeTab.url) {
        showError('No active product webpage detected in the current tab.');
        return;
      }
      inputUrl.value = activeTab.url;
      await triggerAnalysis(activeTab.url);
    } catch (err) {
      showError(err.message);
    }
  });

  // 2. Submit URL manually
  btnAnalyze.addEventListener('click', async () => {
    const url = inputUrl.value.trim();
    if (!url) {
      showError('Please enter a product URL to check.');
      return;
    }
    await triggerAnalysis(url);
  });

  inputUrl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnAnalyze.click();
  });

  // 3. Quick sample pills
  pills.forEach(pill => {
    pill.addEventListener('click', async () => {
      const type = pill.getAttribute('data-type');
      let sampleUrl = 'https://www.amazon.com/dp/B09V3K4XYZ';
      if (type === 'flipkart-smartwatch') {
        sampleUrl = 'https://www.flipkart.com/chronopro-amoled-smartwatch/p/itm123456789';
      } else if (type === 'walmart-chair') {
        sampleUrl = 'https://www.walmart.com/ip/ErgoMax-Mesh-Office-Chair/55481923';
      }
      inputUrl.value = sampleUrl;
      await triggerAnalysis(sampleUrl);
    });
  });

  // 4. Open Side Panel
  btnOpenSidepanel.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'OPEN_SIDEPANEL' });
    window.close();
  });

  /**
   * Dispatches analysis request to background service worker
   */
  async function triggerAnalysis(url) {
    showLoading();
    try {
      chrome.runtime.sendMessage(
        { action: 'ANALYZE_URL', url },
        (response) => {
          if (!response || !response.success) {
            showError(response?.error || 'Failed to analyze reviews for this product.');
            return;
          }
          displayResult(response.data);
        }
      );
    } catch (err) {
      showError(err.message);
    }
  }

  function showLoading() {
    loadingState.classList.remove('hidden');
    errorState.classList.add('hidden');
    resultState.classList.add('hidden');
  }

  function showError(msg) {
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
    resultState.classList.add('hidden');
    errorMessage.textContent = msg;
  }

  function displayResult(data) {
    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
    resultState.classList.remove('hidden');

    const imgEl = document.getElementById('res-img');
    if (imgEl && data.product.imageUrl) {
      imgEl.src = data.product.imageUrl;
    }
    document.getElementById('res-marketplace').textContent = (data.product.marketplace || 'STORE').toUpperCase();
    document.getElementById('res-title').textContent = data.product.title;
    document.getElementById('res-original-rating').textContent = data.originalRating;
    document.getElementById('res-total-reviews').textContent = (data.product.originalReviewCount || 0).toLocaleString();
    document.getElementById('res-rivue-rating').textContent = data.rivueRating;

    const deltaSign = data.ratingDifference > 0 ? '+' : '';
    const deltaBadge = document.getElementById('res-delta-badge');
    deltaBadge.textContent = `${deltaSign}${data.ratingDifference}★`;
    deltaBadge.className = `delta-badge ${data.ratingDifference < 0 ? 'negative' : 'positive'}`;

    const verdictEl = document.getElementById('res-verdict');
    verdictEl.textContent = data.verdict;
    const verdictSlug = data.verdict.toLowerCase().replace(/\s+/g, '-');
    verdictEl.className = `verdict-tag ${verdictSlug}`;

    document.getElementById('res-trust-score').textContent = `${data.trustScore}%`;
    document.getElementById('res-trust-bar').style.width = `${data.trustScore}%`;
    document.getElementById('res-fake-pct').textContent = `${data.fakeReviewPercentage}%`;
    document.getElementById('res-explanation').textContent = data.explanation;

    // Price & Value Intelligence
    if (data.priceAnalysis) {
      const pa = data.priceAnalysis;
      const curEl = document.getElementById('res-price-current');
      const avgEl = document.getElementById('res-price-avg');
      const worthEl = document.getElementById('res-price-worth');
      const badgeEl = document.getElementById('res-deal-badge');
      const diffTag = document.getElementById('res-price-diff-tag');

      if (curEl) curEl.textContent = pa.formattedCurrentPrice;
      if (avgEl) avgEl.textContent = pa.formattedAveragePrice;
      if (worthEl) worthEl.textContent = pa.formattedWorthItPrice;
      if (badgeEl) {
        badgeEl.textContent = pa.dealBadge;
        badgeEl.className = `deal-pill badge-deal-${pa.dealVerdict.toLowerCase().replace('_', '-')}`;
      }
      if (diffTag) {
        if (pa.priceDifference > 0) {
          diffTag.textContent = `+${pa.currency}${Math.abs(pa.priceDifference).toFixed(2)} markup`;
          diffTag.style.color = '#f87171';
        } else if (pa.priceDifference < 0) {
          diffTag.textContent = `Save ${pa.currency}${Math.abs(pa.priceDifference).toFixed(2)} (Value)`;
          diffTag.style.color = '#34d399';
        } else {
          diffTag.textContent = 'Fair market match';
          diffTag.style.color = '#60a5fa';
        }
      }
    }
  }
});
