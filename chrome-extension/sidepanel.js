// Rivue Side Panel Controller
document.addEventListener('DOMContentLoaded', async () => {
  const inputUrl = document.getElementById('sp-input-url');
  const btnSearch = document.getElementById('sp-btn-search');
  const btnRefresh = document.getElementById('sp-btn-refresh');
  const loadingEl = document.getElementById('sp-loading');
  const errorEl = document.getElementById('sp-error');
  const contentEl = document.getElementById('sp-content');
  const errorText = document.getElementById('sp-error-text');
  const chips = document.querySelectorAll('.chip');
  const tabBtns = document.querySelectorAll('.tab-btn');

  let currentAnalysis = null;
  let activeTab = 'all';

  // Check stored active URL or active tab
  try {
    const { activeTargetUrl, latestAnalysis } = await chrome.storage.local.get(['activeTargetUrl', 'latestAnalysis']);
    if (latestAnalysis) {
      currentAnalysis = latestAnalysis;
      renderReport(latestAnalysis);
      if (activeTargetUrl) inputUrl.value = activeTargetUrl;
    } else {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
        inputUrl.value = tab.url;
        await runAnalysis(tab.url);
      }
    }
  } catch (e) {
    console.error(e);
  }

  // Search button
  btnSearch.addEventListener('click', async () => {
    const url = inputUrl.value.trim();
    if (url) await runAnalysis(url);
  });

  // Enter key
  inputUrl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnSearch.click();
  });

  // Refresh button
  btnRefresh.addEventListener('click', async () => {
    const url = inputUrl.value.trim() || currentAnalysis?.product?.url;
    if (url) await runAnalysis(url, true);
  });

  // Quick chips
  chips.forEach(chip => {
    chip.addEventListener('click', async () => {
      const url = chip.getAttribute('data-url');
      inputUrl.value = url;
      await runAnalysis(url);
    });
  });

  // Filter tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.getAttribute('data-tab');
      if (currentAnalysis) renderReviewFeed(currentAnalysis.reviews, activeTab);
    });
  });

  async function runAnalysis(url, refresh = false) {
    showLoading();
    try {
      chrome.runtime.sendMessage(
        { action: 'ANALYZE_URL', url, refresh },
        (response) => {
          if (!response || !response.success || !response.data) {
            showError(response?.error || 'Failed to analyze reviews.');
            return;
          }
          currentAnalysis = response.data;
          renderReport(response.data);
        }
      );
    } catch (err) {
      showError(err.message);
    }
  }

  function showLoading() {
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    contentEl.classList.add('hidden');
  }

  function showError(msg) {
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
    contentEl.classList.add('hidden');
    errorText.textContent = msg;
  }

  function renderReport(data) {
    loadingEl.classList.add('hidden');
    errorEl.classList.add('hidden');
    contentEl.classList.remove('hidden');

    // 1. Product Overview
    const imgEl = document.getElementById('sp-product-img');
    if (imgEl && data.product.imageUrl) {
      imgEl.src = data.product.imageUrl;
    }
    document.getElementById('sp-marketplace-tag').textContent = (data.product.marketplace || 'STORE').toUpperCase();
    document.getElementById('sp-product-title').textContent = data.product.title;
    document.getElementById('sp-product-price').textContent = data.product.price || 'Marketplace Item';
    document.getElementById('sp-original-review-count').textContent = `${(data.product.originalReviewCount || 0).toLocaleString()} Reviews Sampled`;

    // 2. Verdict & Grade
    const verdictEl = document.getElementById('sp-verdict-title');
    verdictEl.textContent = data.verdict;
    verdictEl.className = `verdict-banner ${data.verdict.toLowerCase().replace(/\s+/g, '-')}`;

    const gradeEl = document.getElementById('sp-grade-badge');
    gradeEl.textContent = data.grade;
    gradeEl.className = `grade-badge grade-${data.grade}`;

    // 3. Score Comparison
    document.getElementById('sp-orig-stars').textContent = data.originalRating;
    document.getElementById('sp-rivue-stars').textContent = data.rivueRating;

    const deltaSign = data.ratingDifference > 0 ? '+' : '';
    const deltaEl = document.getElementById('sp-rating-delta');
    deltaEl.textContent = `${deltaSign}${data.ratingDifference}★`;
    deltaEl.className = `delta-tag ${data.ratingDifference < 0 ? 'negative' : 'positive'}`;

    // 4. Trust Meter
    document.getElementById('sp-trust-score-val').textContent = `${data.trustScore} / 100`;
    document.getElementById('sp-trust-meter-fill').style.width = `${data.trustScore}%`;

    // 4b. Price & Value Intelligence
    if (data.priceAnalysis) {
      const pa = data.priceAnalysis;
      document.getElementById('sp-price-current').textContent = pa.formattedCurrentPrice;
      document.getElementById('sp-price-avg').textContent = pa.formattedAveragePrice;
      document.getElementById('sp-price-worth').textContent = pa.formattedWorthItPrice;
      document.getElementById('sp-price-low').textContent = pa.formattedLowestPrice;
      document.getElementById('sp-price-high').textContent = pa.formattedHighestPrice;

      const badgeEl = document.getElementById('sp-deal-badge');
      if (badgeEl) {
        badgeEl.textContent = pa.dealBadge;
        badgeEl.className = `deal-pill badge-deal-${pa.dealVerdict.toLowerCase().replace('_', '-')}`;
      }

      const diffTag = document.getElementById('sp-price-diff-tag');
      if (diffTag) {
        if (pa.priceDifference > 0) {
          diffTag.textContent = `Overpriced +${pa.currency}${Math.abs(pa.priceDifference).toFixed(2)}`;
          diffTag.style.color = '#f87171';
        } else if (pa.priceDifference < 0) {
          diffTag.textContent = `Save ${pa.currency}${Math.abs(pa.priceDifference).toFixed(2)} (Value)`;
          diffTag.style.color = '#34d399';
        } else {
          diffTag.textContent = 'Fair Market Match';
          diffTag.style.color = '#60a5fa';
        }
      }

      document.getElementById('sp-deal-explanation').textContent = pa.dealExplanation;

      // Range Bar Pin positions
      const rangeSpan = Math.max(0.1, pa.highestPrice - pa.lowestPrice);
      const currentPct = Math.max(5, Math.min(95, ((pa.currentPrice - pa.lowestPrice) / rangeSpan) * 100));
      const worthPct = Math.max(5, Math.min(95, ((pa.worthItPrice - pa.lowestPrice) / rangeSpan) * 100));

      const curPin = document.getElementById('sp-current-pin');
      const worthPin = document.getElementById('sp-worth-pin');
      const fillBar = document.getElementById('sp-range-fill');

      if (curPin) curPin.style.left = `${currentPct}%`;
      if (worthPin) worthPin.style.left = `${worthPct}%`;
      if (fillBar) {
        const left = Math.min(currentPct, worthPct);
        const width = Math.abs(currentPct - worthPct);
        fillBar.style.left = `${left}%`;
        fillBar.style.width = `${Math.max(4, width)}%`;
      }

      // History List
      const histList = document.getElementById('sp-history-list');
      if (histList) {
        histList.innerHTML = '';
        (pa.history || []).forEach(pt => {
          const item = document.createElement('div');
          item.className = 'sp-hist-item';
          item.innerHTML = `
            <span class="sp-hist-date">${pt.date}</span>
            <span class="sp-hist-price">${pt.formattedPrice}</span>
            <span class="sp-hist-label">${pt.label || ''}</span>
          `;
          histList.appendChild(item);
        });
      }
    }

    // 5. Rationale & Reasons
    document.getElementById('sp-explanation').textContent = data.explanation;
    const reasonsList = document.getElementById('sp-reasons-list');
    reasonsList.innerHTML = '';
    (data.reasons || []).forEach(reason => {
      const li = document.createElement('li');
      li.textContent = reason;
      reasonsList.appendChild(li);
    });

    // 6. Threat Breakdown
    document.getElementById('sp-breakdown-dup').textContent = `${data.breakdown.duplicateBotPercentage}%`;
    document.getElementById('sp-bar-dup').style.width = `${data.breakdown.duplicateBotPercentage}%`;

    document.getElementById('sp-breakdown-unverified').textContent = `${data.breakdown.unverifiedSpikePercentage}%`;
    document.getElementById('sp-bar-unverified').style.width = `${data.breakdown.unverifiedSpikePercentage}%`;

    const velScore = data.breakdown.unnaturalDistributionScore;
    document.getElementById('sp-breakdown-velocity').textContent = velScore > 60 ? 'High Spike' : velScore > 30 ? 'Moderate' : 'Normal';
    document.getElementById('sp-bar-velocity').style.width = `${velScore}%`;

    document.getElementById('sp-breakdown-sentiment').textContent = `${data.breakdown.sentimentMismatchCount} Flag(s)`;
    document.getElementById('sp-bar-sentiment').style.width = `${Math.min(100, data.breakdown.sentimentMismatchCount * 25)}%`;

    // 7. Authentic Pros & Cons
    const prosList = document.getElementById('sp-pros-list');
    const consList = document.getElementById('sp-cons-list');
    prosList.innerHTML = '';
    consList.innerHTML = '';

    (data.authenticHighlights?.pros || []).forEach(pro => {
      const li = document.createElement('li');
      li.textContent = pro;
      prosList.appendChild(li);
    });

    (data.authenticHighlights?.cons || []).forEach(con => {
      const li = document.createElement('li');
      li.textContent = con;
      consList.appendChild(li);
    });

    // 8. Review feed counts and rendering
    const reviews = data.reviews || [];
    const flagged = reviews.filter(r => r.isFlagged);
    const authentic = reviews.filter(r => !r.isFlagged);

    document.getElementById('sp-count-all').textContent = reviews.length;
    document.getElementById('sp-count-flagged').textContent = flagged.length;
    document.getElementById('sp-count-authentic').textContent = authentic.length;

    renderReviewFeed(reviews, activeTab);
  }

  function renderReviewFeed(reviews, filter) {
    const listEl = document.getElementById('sp-reviews-list');
    listEl.innerHTML = '';

    let filtered = reviews;
    if (filter === 'flagged') filtered = reviews.filter(r => r.isFlagged);
    if (filter === 'authentic') filtered = reviews.filter(r => !r.isFlagged);

    if (filtered.length === 0) {
      listEl.innerHTML = '<p style="font-size:12px; color:var(--text-muted); text-align:center; padding: 14px;">No reviews in this category.</p>';
      return;
    }

    filtered.forEach(rev => {
      const card = document.createElement('div');
      card.className = `review-card ${rev.isFlagged ? 'flagged' : 'authentic'}`;

      const stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
      const badgeText = rev.isFlagged ? 'Flagged Deceptive' : 'Verified Authentic';
      const badgeClass = rev.isFlagged ? 'flag' : 'ok';

      card.innerHTML = `
        <div class="review-header">
          <div>
            <span class="author-name">${rev.author} ${rev.isVerifiedPurchase ? '✓ <span style="font-size:9px; color:#34d399;">Verified</span>' : ''}</span>
            <span style="font-size:10px; color:var(--text-muted); margin-left:6px;">${rev.date || ''}</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="review-stars">${stars}</span>
            <span class="review-badge ${badgeClass}">${badgeText}</span>
          </div>
        </div>
        ${rev.title ? `<strong style="display:block; margin: 3px 0 2px 0; font-size:12px; color:#e2e8f0;">${rev.title}</strong>` : ''}
        <p class="review-text">${rev.text}</p>
        ${rev.flaggedReasons && rev.flaggedReasons.length > 0 ? `
          <div class="flag-reasons-tag">
            ⚠️ Flags: ${rev.flaggedReasons.join(' • ')}
          </div>
        ` : ''}
      `;
      listEl.appendChild(card);
    });
  }
});
