// Rivue Web Application Controller
document.addEventListener('DOMContentLoaded', () => {
  const inputUrl = document.getElementById('product-url');
  const btnRun = document.getElementById('btn-run-analysis');
  const sampleBtns = document.querySelectorAll('.sample-btn');
  const loadingOverlay = document.getElementById('loading-overlay');
  const resultsDashboard = document.getElementById('results-dashboard');
  const errorBanner = document.getElementById('error-banner');
  const errorBannerText = document.getElementById('error-banner-text');
  const ftabs = document.querySelectorAll('.ftab');

  let currentAnalysis = null;
  let activeFilter = 'all';

  // --- Backend Server Connection Management ---
  const DEFAULT_REMOTE_IP = '10.178.253.57';
  const serverPill = document.getElementById('btn-server-settings');
  const serverStatusDot = document.getElementById('server-status-dot');
  const serverStatusText = document.getElementById('server-status-text');
  const serverModal = document.getElementById('server-modal');
  const btnCloseServerModal = document.getElementById('btn-close-server-modal');
  const serverUrlInput = document.getElementById('server-url-input');
  const btnTestServer = document.getElementById('btn-test-server');
  const btnSaveServer = document.getElementById('btn-save-server');
  const serverTestResult = document.getElementById('server-test-result');
  const presetChips = document.querySelectorAll('.preset-chip');

  function getSavedServerUrl() {
    return localStorage.getItem('rivue_server_url') || '';
  }

  function getApiBaseUrl() {
    const saved = getSavedServerUrl();
    if (saved) return saved.replace(/\/$/, '');

    const isCapacitor = window.Capacitor || window.location.protocol === 'capacitor:' || window.location.protocol === 'file:';
    const isMobileHost = window.location.hostname === 'localhost' && window.location.port !== '3001';

    if (isCapacitor || isMobileHost) {
      return `http://${DEFAULT_REMOTE_IP}:3001`;
    }

    return '';
  }

  async function checkServerHealth(targetBaseUrl = getApiBaseUrl()) {
    if (serverStatusDot) serverStatusDot.className = 'server-indicator connecting';
    if (serverStatusText) serverStatusText.textContent = 'Connecting...';
    try {
      const url = targetBaseUrl ? `${targetBaseUrl}/api/health` : '/api/health';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        if (serverStatusDot) serverStatusDot.className = 'server-indicator online';
        if (serverStatusText) serverStatusText.textContent = 'Online';
        return true;
      }
    } catch (e) {
      console.warn('Server health check failed for:', targetBaseUrl, e);
    }
    if (serverStatusDot) serverStatusDot.className = 'server-indicator offline';
    if (serverStatusText) serverStatusText.textContent = 'Offline';
    return false;
  }

  // Initialize server modal & initial health ping
  if (serverUrlInput) {
    serverUrlInput.value = getSavedServerUrl() || getApiBaseUrl();
  }

  if (serverPill) {
    serverPill.addEventListener('click', () => {
      serverUrlInput.value = getSavedServerUrl() || getApiBaseUrl();
      if (serverTestResult) serverTestResult.classList.add('hidden');
      serverModal.classList.remove('hidden');
    });
  }

  if (btnCloseServerModal) {
    btnCloseServerModal.addEventListener('click', () => {
      serverModal.classList.add('hidden');
    });
  }

  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const url = chip.getAttribute('data-url');
      if (url && serverUrlInput) {
        serverUrlInput.value = url;
        btnTestServer.click();
      }
    });
  });

  if (btnTestServer) {
    btnTestServer.addEventListener('click', async () => {
      const target = (serverUrlInput.value || '').trim().replace(/\/$/, '');
      if (serverTestResult) {
        serverTestResult.className = 'test-result-box';
        serverTestResult.textContent = 'Pinging server...';
        serverTestResult.classList.remove('hidden');
      }
      const isHealthy = await checkServerHealth(target);
      if (serverTestResult) {
        if (isHealthy) {
          serverTestResult.className = 'test-result-box success';
          serverTestResult.textContent = '✓ Connected! Rivue API Engine is online & responding.';
        } else {
          serverTestResult.className = 'test-result-box error';
          serverTestResult.textContent = `✕ Unreachable at ${target || 'local endpoint'}. Ensure backend server is running.`;
        }
      }
    });
  }

  if (btnSaveServer) {
    btnSaveServer.addEventListener('click', async () => {
      const target = (serverUrlInput.value || '').trim().replace(/\/$/, '');
      if (target) {
        localStorage.setItem('rivue_server_url', target);
      } else {
        localStorage.removeItem('rivue_server_url');
      }
      serverModal.classList.add('hidden');
      await checkServerHealth();
    });
  }

  // Run initial health check on load
  checkServerHealth();

  // --- Clipboard Integration (Capacitor & Web) ---
  async function readClipboardText() {
    try {
      if (window.Capacitor?.Plugins?.Clipboard) {
        const { value } = await window.Capacitor.Plugins.Clipboard.read();
        if (value) return value;
      }
    } catch (e) {
      console.warn('Capacitor clipboard plugin read error:', e);
    }
    if (navigator.clipboard?.readText) {
      try {
        return await navigator.clipboard.readText();
      } catch (e) {}
    }
    return '';
  }

  const btnPaste = document.getElementById('btn-paste-url');
  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await readClipboardText();
        if (text && text.trim().startsWith('http')) {
          inputUrl.value = text.trim();
          if (errorBanner) errorBanner.classList.add('hidden');
          runAnalysis(inputUrl.value.trim());
        } else if (text) {
          inputUrl.value = text.trim();
        }
      } catch (err) {
        console.warn('Clipboard read error:', err);
      }
    });
  }

  // Load default analysis only if an initial value is provided
  if (inputUrl.value.trim()) {
    runAnalysis(inputUrl.value.trim());
  }

  btnRun.addEventListener('click', () => {
    const url = inputUrl.value.trim();
    if (url) runAnalysis(url);
  });

  inputUrl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnRun.click();
  });

  sampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sampleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const url = btn.getAttribute('data-url');
      inputUrl.value = url;
      runAnalysis(url);
    });
  });

  ftabs.forEach(tab => {
    tab.addEventListener('click', () => {
      ftabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter');
      if (currentAnalysis) renderReviewList(currentAnalysis.reviews, activeFilter);
    });
  });

  const statusText = document.getElementById('scanner-status-text');
  const progressBar = document.getElementById('scanner-progress-bar');
  const stageLabel = document.getElementById('scanner-stage-label');
  const percentLabel = document.getElementById('scanner-percent-label');

  function setStepState(stepNum, state, statusLabel) {
    const el = document.getElementById(`step-${stepNum}`);
    const statusEl = document.getElementById(`step-status-${stepNum}`);
    if (!el || !statusEl) return;
    el.className = `audit-step ${state}`;
    statusEl.textContent = statusLabel;
  }

  async function run5SecondScanningAnimation() {
    // Reset all steps
    for (let i = 1; i <= 5; i++) setStepState(i, '', 'Pending...');

    // Phase 1 (0s)
    statusText.textContent = 'Connecting to ScraperAPI residential proxies & IP rotation...';
    stageLabel.textContent = 'Phase 1/5: Proxy Tunnel';
    percentLabel.textContent = '20%';
    progressBar.style.width = '20%';
    setStepState(1, 'active', 'Connecting...');
    await new Promise(r => setTimeout(r, 1100));

    // Phase 2 (1.1s)
    setStepState(1, 'done', 'Connected ✓');
    statusText.textContent = 'Bypassing marketplace anti-bot wall & extracting 1500px photography...';
    stageLabel.textContent = 'Phase 2/5: Product Extraction';
    percentLabel.textContent = '45%';
    progressBar.style.width = '45%';
    setStepState(2, 'active', 'Extracting...');
    await new Promise(r => setTimeout(r, 1200));

    // Phase 3 (2.3s)
    setStepState(2, 'done', 'Fetched ✓');
    statusText.textContent = 'Scraping authentic customer reviews & verified star distribution...';
    stageLabel.textContent = 'Phase 3/5: Review Corpus';
    percentLabel.textContent = '68%';
    progressBar.style.width = '68%';
    setStepState(3, 'active', 'Scanning...');
    await new Promise(r => setTimeout(r, 1200));

    // Phase 4 (3.5s)
    setStepState(3, 'done', 'Collected ✓');
    statusText.textContent = 'Running Rivue AI Forensics (bot templates & sentiment-rating mismatch)...';
    stageLabel.textContent = 'Phase 4/5: AI Forensics';
    percentLabel.textContent = '88%';
    progressBar.style.width = '88%';
    setStepState(4, 'active', 'Analyzing...');
    await new Promise(r => setTimeout(r, 1100));

    // Phase 5 (4.6s)
    setStepState(4, 'done', 'Audited ✓');
    statusText.textContent = 'Computing 90-day Worth-It fair value price & Trust Score...';
    stageLabel.textContent = 'Phase 5/5: Fair Value Recalculation';
    percentLabel.textContent = '100%';
    progressBar.style.width = '100%';
    setStepState(5, 'active', 'Finalizing...');
    await new Promise(r => setTimeout(r, 700));

    setStepState(5, 'done', 'Verified ✓');
  }

  async function runAnalysis(url) {
    if (errorBanner) errorBanner.classList.add('hidden');
    loadingOverlay.classList.remove('hidden');
    resultsDashboard.style.opacity = '0.15';
    resultsDashboard.style.pointerEvents = 'none';

    // Start 5-second realistic scanning animation concurrently with live API scrape
    const animationPromise = run5SecondScanningAnimation();

    const baseUrl = getApiBaseUrl();
    const fetchPromise = fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, refresh: true })
    }).then(async res => {
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.details || `Server responded with HTTP ${res.status}`);
      }
      return res.json();
    }).catch(fetchErr => {
      if (fetchErr.message && fetchErr.message.includes('Failed to fetch')) {
        throw new Error(`Cannot reach backend server at ${baseUrl || 'local endpoint'}. Please tap "⚙️ Server" in the top bar to test or change server IP.`);
      }
      throw fetchErr;
    });

    try {
      // Guaranteed minimum 5.2 seconds so user sees full forensic audit in motion
      const [_, data] = await Promise.all([animationPromise, fetchPromise]);
      currentAnalysis = data;
      renderDashboard(data);
    } catch (err) {
      console.error(err);
      if (errorBanner && errorBannerText) {
        errorBannerText.textContent = err.message;
        errorBanner.classList.remove('hidden');
      } else {
        alert(err.message);
      }
    } finally {
      setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        resultsDashboard.style.opacity = '1';
        resultsDashboard.style.pointerEvents = 'auto';
      }, 300);
    }
  }

  function renderDashboard(data) {
    // 1. Overview & Photo
    const imgEl = document.getElementById('dash-img');
    if (imgEl && data.product.imageUrl) {
      imgEl.src = data.product.imageUrl;
    }
    const isGeneric = (data.product.marketplace || '').toLowerCase() === 'generic';
    document.getElementById('dash-marketplace').textContent = isGeneric ? 'WEB RESOURCE' : (data.product.marketplace || 'STORE').toUpperCase();
    document.getElementById('dash-title').textContent = data.product.title;
    document.getElementById('dash-price').textContent = data.product.price || 'Free / Web Resource';
    document.getElementById('dash-total-reviews').textContent = isGeneric
      ? `${(data.totalReviewsAnalyzed || data.reviews.length)} Security & Trust Audits Verified`
      : `${(data.product.originalReviewCount || 0).toLocaleString()} Total Reviews Analyzed`;

    // 2. Verdict & Grade
    const verdictEl = document.getElementById('dash-verdict');
    verdictEl.textContent = data.verdict;
    verdictEl.className = `verdict-title ${data.verdict.toLowerCase().replace(/\s+/g, '-')}`;

    const gradeEl = document.getElementById('dash-grade');
    gradeEl.textContent = data.grade;
    gradeEl.className = `grade-badge grade-${data.grade}`;

    // 3. Comparison
    document.getElementById('dash-orig-rating').textContent = data.originalRating;
    document.getElementById('dash-rivue-rating').textContent = data.rivueRating;

    const deltaSign = data.ratingDifference > 0 ? '+' : '';
    const deltaEl = document.getElementById('dash-delta-badge');
    deltaEl.textContent = `${deltaSign}${data.ratingDifference}★`;
    deltaEl.className = `delta-badge ${data.ratingDifference < 0 ? 'negative' : 'positive'}`;

    // 4. Trust Meter
    document.getElementById('dash-trust-val').textContent = `${data.trustScore} / 100`;
    document.getElementById('dash-meter-fill').style.width = `${data.trustScore}%`;

    // 4b. Price & Value Intelligence
    if (data.priceAnalysis) {
      const pa = data.priceAnalysis;
      document.getElementById('price-current').textContent = pa.formattedCurrentPrice;
      document.getElementById('price-average').textContent = pa.formattedAveragePrice;
      document.getElementById('price-worth-it').textContent = pa.formattedWorthItPrice;
      document.getElementById('price-lowest').textContent = pa.formattedLowestPrice;
      document.getElementById('price-highest').textContent = pa.formattedHighestPrice;

      // Badge
      const dealBadgeEl = document.getElementById('price-deal-badge');
      dealBadgeEl.textContent = pa.dealBadge;
      dealBadgeEl.className = `deal-pill badge-deal-${pa.dealVerdict.toLowerCase().replace('_', '-')}`;

      // Explanation
      document.getElementById('price-deal-explanation').textContent = pa.dealExplanation;

      // Difference summary
      const diffEl = document.getElementById('price-diff-summary');
      if (pa.priceDifference > 0) {
        diffEl.textContent = `Overpriced +${pa.currency}${Math.abs(pa.priceDifference).toFixed(2)}`;
        diffEl.style.color = '#f87171';
      } else if (pa.priceDifference < 0) {
        diffEl.textContent = `Save ${pa.currency}${Math.abs(pa.priceDifference).toFixed(2)} (Great Buy)`;
        diffEl.style.color = '#34d399';
      } else {
        diffEl.textContent = 'Fair Market Match';
        diffEl.style.color = '#60a5fa';
      }

      // Range Bar Pin positions (relative to lowest and highest)
      const rangeSpan = Math.max(0.1, pa.highestPrice - pa.lowestPrice);
      const currentPct = Math.max(5, Math.min(95, ((pa.currentPrice - pa.lowestPrice) / rangeSpan) * 100));
      const worthPct = Math.max(5, Math.min(95, ((pa.worthItPrice - pa.lowestPrice) / rangeSpan) * 100));

      const curPin = document.getElementById('range-current-pin');
      const worthPin = document.getElementById('range-worth-pin');
      const fillBar = document.getElementById('range-fill-bar');

      if (curPin) curPin.style.left = `${currentPct}%`;
      if (worthPin) worthPin.style.left = `${worthPct}%`;
      if (fillBar) {
        const left = Math.min(currentPct, worthPct);
        const width = Math.abs(currentPct - worthPct);
        fillBar.style.left = `${left}%`;
        fillBar.style.width = `${Math.max(4, width)}%`;
      }

      // 90-Day History Timeline
      const timelineEl = document.getElementById('price-history-timeline');
      if (timelineEl) {
        timelineEl.innerHTML = '';
        (pa.history || []).forEach(pt => {
          const card = document.createElement('div');
          card.className = 'history-point-card';
          card.innerHTML = `
            <span class="hp-date">${pt.date}</span>
            <span class="hp-price">${pt.formattedPrice}</span>
            <span class="hp-label" title="${pt.label || ''}">${pt.label || 'Market Price'}</span>
          `;
          timelineEl.appendChild(card);
        });
      }
    }

    // 5. Rationale
    document.getElementById('dash-explanation').textContent = data.explanation;
    const reasonsList = document.getElementById('dash-reasons');
    reasonsList.innerHTML = '';
    (data.reasons || []).forEach(r => {
      const li = document.createElement('li');
      li.textContent = r;
      reasonsList.appendChild(li);
    });

    // 6. Analytics Breakdown
    document.getElementById('dash-bd-dup').textContent = `${data.breakdown.duplicateBotPercentage}%`;
    document.getElementById('dash-bar-dup').style.width = `${data.breakdown.duplicateBotPercentage}%`;

    document.getElementById('dash-bd-unverified').textContent = `${data.breakdown.unverifiedSpikePercentage}%`;
    document.getElementById('dash-bar-unverified').style.width = `${data.breakdown.unverifiedSpikePercentage}%`;

    const vel = data.breakdown.unnaturalDistributionScore;
    document.getElementById('dash-bd-velocity').textContent = vel > 60 ? 'High Risk' : vel > 30 ? 'Moderate' : 'Normal';
    document.getElementById('dash-bar-velocity').style.width = `${vel}%`;

    document.getElementById('dash-bd-sentiment').textContent = `${data.breakdown.sentimentMismatchCount} Flag(s)`;
    document.getElementById('dash-bar-sentiment').style.width = `${Math.min(100, data.breakdown.sentimentMismatchCount * 25)}%`;

    // 7. Authentic Pros & Cons
    const prosList = document.getElementById('dash-pros');
    const consList = document.getElementById('dash-cons');
    prosList.innerHTML = '';
    consList.innerHTML = '';

    (data.authenticHighlights?.pros || []).forEach(p => {
      const li = document.createElement('li');
      li.textContent = p;
      prosList.appendChild(li);
    });

    (data.authenticHighlights?.cons || []).forEach(c => {
      const li = document.createElement('li');
      li.textContent = c;
      consList.appendChild(li);
    });

    // 8. Review feed counts and rendering
    const reviews = data.reviews || [];
    const flagged = reviews.filter(r => r.isFlagged);
    const authentic = reviews.filter(r => !r.isFlagged);

    const elAll = document.getElementById('dash-cnt-all');
    if (elAll) elAll.textContent = reviews.length;

    const el5 = document.getElementById('dash-cnt-5');
    if (el5) el5.textContent = reviews.filter(r => Math.round(r.rating) === 5).length;

    const el4 = document.getElementById('dash-cnt-4');
    if (el4) el4.textContent = reviews.filter(r => Math.round(r.rating) === 4).length;

    const el3 = document.getElementById('dash-cnt-3');
    if (el3) el3.textContent = reviews.filter(r => Math.round(r.rating) === 3).length;

    const el2 = document.getElementById('dash-cnt-2');
    if (el2) el2.textContent = reviews.filter(r => Math.round(r.rating) === 2).length;

    const el1 = document.getElementById('dash-cnt-1');
    if (el1) el1.textContent = reviews.filter(r => Math.round(r.rating) === 1).length;

    const elFlagged = document.getElementById('dash-cnt-flagged');
    if (elFlagged) elFlagged.textContent = flagged.length;

    const elAuthentic = document.getElementById('dash-cnt-authentic');
    if (elAuthentic) elAuthentic.textContent = authentic.length;

    renderReviewList(reviews, activeFilter);
  }

  function renderReviewList(reviews, filter) {
    const container = document.getElementById('dash-review-list');
    container.innerHTML = '';

    let filtered = reviews;
    if (filter === 'flagged') filtered = reviews.filter(r => r.isFlagged);
    else if (filter === 'authentic') filtered = reviews.filter(r => !r.isFlagged);
    else if (['1', '2', '3', '4', '5'].includes(filter)) {
      const starTarget = parseInt(filter, 10);
      filtered = reviews.filter(r => Math.round(r.rating) === starTarget);
    }

    if (filtered.length === 0) {
      container.innerHTML = '<p style="text-align:center; padding: 24px; color: var(--text-muted);">No reviews in this category.</p>';
      return;
    }

    filtered.forEach(rev => {
      const div = document.createElement('div');
      div.className = `rev-item ${rev.isFlagged ? 'flagged' : 'authentic'}`;
      const stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
      const tagText = rev.isFlagged ? 'Flagged Deceptive' : 'Verified Authentic';
      const tagClass = rev.isFlagged ? 'flag' : 'ok';

      div.innerHTML = `
        <div class="rev-top">
          <div>
            <span class="rev-author">${rev.author} ${rev.isVerifiedPurchase ? '✓ <span style="font-size:10px; color:#34d399;">Verified Purchase</span>' : ''}</span>
            <span class="rev-date" style="font-size:11px; color:var(--text-muted); margin-left:8px;">${rev.date || ''}</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="rev-stars">${stars}</span>
            <span class="rev-tag ${tagClass}">${tagText}</span>
          </div>
        </div>
        ${rev.title ? `<strong style="display:block; margin: 4px 0 2px 0; font-size:13px; color:#e2e8f0;">${rev.title}</strong>` : ''}
        <p class="rev-body">${rev.text}</p>
        ${rev.flaggedReasons && rev.flaggedReasons.length > 0 ? `
          <div class="rev-flags">
            ⚠️ Flags: ${rev.flaggedReasons.join(' • ')}
          </div>
        ` : ''}
      `;
      container.appendChild(div);
    });
  }
});
