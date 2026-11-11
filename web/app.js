// ==========================================================================
// RIVUE WEB CONTROLLER — CYBER-FORENSIC INTELLIGENCE ENGINE
// Kinetic Tap Ripple Engine, Liquid SVG Gauge, Telemetry Stream & Real Scrapes
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const inputUrl = document.getElementById('product-url');
  const btnRun = document.getElementById('btn-run-analysis');
  const btnPaste = document.getElementById('btn-paste-url');
  const loadingOverlay = document.getElementById('loading-overlay');
  const resultsDashboard = document.getElementById('results-dashboard');
  const errorBanner = document.getElementById('error-banner');
  const errorBannerText = document.getElementById('error-banner-text');
  const ftabs = document.querySelectorAll('.ftab');

  let currentAnalysis = null;
  let activeFilter = 'all';

  // ==========================================================================
  // 1. UNIVERSAL TAP RIPPLE & SPRING INTERACTION ENGINE
  // ==========================================================================
  function createRipple(e) {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple-wave';

    const size = Math.max(rect.width, rect.height) * 1.5;
    const x = (e.clientX || (e.touches && e.touches[0]?.clientX) || (rect.left + rect.width / 2)) - rect.left - size / 2;
    const y = (e.clientY || (e.touches && e.touches[0]?.clientY) || (rect.top + rect.height / 2)) - rect.top - size / 2;

    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }

  // Bind ripple to all interactive controls
  const rippleTargets = document.querySelectorAll('button, .nav-pill, .btn-capsule-submit, .btn-capsule-paste, .ftab, .preset-chip, .btn-download-cyber, .server-pill');
  rippleTargets.forEach(el => {
    el.addEventListener('pointerdown', createRipple);
  });

  // Specular Cursor Spotlight tracking across cards
  const cards = document.querySelectorAll('.card, .platform-glass-card');
  cards.forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // ==========================================================================
  // ==========================================================================
  // 2. UNIVERSAL BACKEND SERVER CONNECTION MANAGEMENT & AUTO-DISCOVERY
  // ==========================================================================
  const PUBLIC_CLOUD_URL = 'https://myth-subaru-following-understood.trycloudflare.com';
  const LOCAL_LAN_URL = 'http://192.168.97.227:3001';

  // Purge any obsolete stale IP from localStorage immediately
  const savedServer = localStorage.getItem('rivue_server_url') || '';
  if (savedServer.includes('10.178.253.57')) {
    localStorage.removeItem('rivue_server_url');
  }

  const serverPill = document.getElementById('btn-server-settings');
  const serverStatusDot = document.getElementById('server-status-dot');
  const serverStatusText = document.getElementById('server-status-text');
  const serverModal = document.getElementById('server-modal');
  const btnCloseServerModal = document.getElementById('btn-close-server-modal');
  const serverUrlInput = document.getElementById('server-url-input');
  const btnTestServer = document.getElementById('btn-test-server');
  const btnSaveServer = document.getElementById('btn-save-server');
  const btnAutoDetect = document.getElementById('btn-auto-detect');
  const serverTestResult = document.getElementById('server-test-result');
  const presetChips = document.querySelectorAll('.preset-chip');

  let activeApiBaseUrl = '';

  function getSavedServerUrl() {
    return localStorage.getItem('rivue_server_url') || '';
  }

  async function pingHealth(baseUrl, timeoutMs = 2500) {
    try {
      const endpoint = baseUrl ? `${baseUrl.replace(/\/$/, '')}/api/health` : '/api/health';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        return true;
      }
    } catch (e) {}
    return false;
  }

  function updateServerPillUI(state, text) {
    if (serverStatusDot) serverStatusDot.className = `server-indicator ${state}`;
    if (serverStatusText) serverStatusText.textContent = text;
  }

  async function resolveActiveServer(forceAuto = false) {
    updateServerPillUI('connecting', 'Connecting...');

    // 1. If running in a web browser and no custom server explicitly forced:
    const isBrowser = window.location.protocol === 'http:' || window.location.protocol === 'https:';
    const saved = getSavedServerUrl();

    if (isBrowser && (!saved || forceAuto)) {
      const originOk = await pingHealth('');
      if (originOk) {
        activeApiBaseUrl = '';
        const isCloud = window.location.hostname.includes('trycloudflare');
        updateServerPillUI('online', isCloud ? 'Cloud Online' : 'Online');
        if (serverUrlInput) serverUrlInput.value = window.location.origin;
        return '';
      }
    }

    // 2. If saved URL exists, test if it actually works
    if (saved && !forceAuto) {
      const savedOk = await pingHealth(saved, 2500);
      if (savedOk) {
        activeApiBaseUrl = saved;
        updateServerPillUI('online', saved.includes('trycloudflare') ? 'Cloud Online' : 'Custom Online');
        if (serverUrlInput) serverUrlInput.value = saved;
        return saved;
      } else {
        console.warn('Saved server is unreachable, falling back to auto-discovery:', saved);
        localStorage.removeItem('rivue_server_url'); // purge dead saved url
      }
    }

    // 3. Test candidate endpoints in order: Public Cloud -> Local Wi-Fi -> Emulator -> Localhost
    const candidates = [
      PUBLIC_CLOUD_URL,
      LOCAL_LAN_URL,
      'http://10.0.2.2:3001',
      'http://localhost:3001'
    ];

    for (const candidate of candidates) {
      const ok = await pingHealth(candidate, 2500);
      if (ok) {
        activeApiBaseUrl = candidate;
        const isCloud = candidate.includes('trycloudflare');
        updateServerPillUI('online', isCloud ? 'Cloud Online' : 'LAN Online');
        if (serverUrlInput) serverUrlInput.value = candidate;
        return candidate;
      }
    }

    // 4. Default fallback if ping blocked by network policy
    activeApiBaseUrl = isBrowser ? '' : PUBLIC_CLOUD_URL;
    updateServerPillUI('offline', 'Offline');
    if (serverUrlInput) serverUrlInput.value = activeApiBaseUrl;
    return activeApiBaseUrl;
  }

  function getApiBaseUrl() {
    return activeApiBaseUrl;
  }

  if (serverPill) {
    serverPill.addEventListener('click', () => {
      serverUrlInput.value = getSavedServerUrl() || activeApiBaseUrl || PUBLIC_CLOUD_URL;
      if (serverTestResult) serverTestResult.classList.add('hidden');
      serverModal.classList.remove('hidden');
    });
  }

  if (btnCloseServerModal) {
    btnCloseServerModal.addEventListener('click', () => {
      serverModal.classList.add('hidden');
    });
  }

  const modalBackdrop = document.querySelector('.modal-backdrop-blur');
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', () => {
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
      const isHealthy = await pingHealth(target);
      if (serverTestResult) {
        if (isHealthy) {
          serverTestResult.className = 'test-result-box success';
          serverTestResult.textContent = `✓ Connected! Server responded healthy at ${target || 'current host'}.`;
        } else {
          serverTestResult.className = 'test-result-box error';
          serverTestResult.textContent = `✕ Unreachable at ${target || 'local endpoint'}. Ensure backend server or Cloudflare tunnel is active.`;
        }
      }
    });
  }

  if (btnAutoDetect) {
    btnAutoDetect.addEventListener('click', async () => {
      if (serverTestResult) {
        serverTestResult.className = 'test-result-box';
        serverTestResult.textContent = 'Scanning available endpoints (Cloud, Wi-Fi, Local)...';
        serverTestResult.classList.remove('hidden');
      }
      const best = await resolveActiveServer(true);
      if (serverTestResult) {
        if (best !== undefined) {
          serverTestResult.className = 'test-result-box success';
          serverTestResult.textContent = `✓ Auto-connected to: ${best || 'Active Host (Direct)'}`;
        } else {
          serverTestResult.className = 'test-result-box error';
          serverTestResult.textContent = '✕ No endpoints responded. Check that backend server is running.';
        }
      }
    });
  }

  if (btnSaveServer) {
    btnSaveServer.addEventListener('click', async () => {
      const target = (serverUrlInput.value || '').trim().replace(/\/$/, '');
      if (target) {
        localStorage.setItem('rivue_server_url', target);
        activeApiBaseUrl = target;
      } else {
        localStorage.removeItem('rivue_server_url');
        await resolveActiveServer(true);
      }
      serverModal.classList.add('hidden');
      await resolveActiveServer();
    });
  }

  // Initial auto-discovery on launch
  resolveActiveServer();

  // ==========================================================================
  // 3. CLIPBOARD INTEGRATION (CAPACITOR + WEB)
  // ==========================================================================
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

  // Auto-run if input already populated
  if (inputUrl && inputUrl.value.trim()) {
    runAnalysis(inputUrl.value.trim());
  }

  btnRun.addEventListener('click', () => {
    const url = inputUrl.value.trim();
    if (url) runAnalysis(url);
  });

  inputUrl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnRun.click();
  });

  // Filter Tabs
  ftabs.forEach(tab => {
    tab.addEventListener('click', () => {
      ftabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter');
      if (currentAnalysis) renderReviewList(currentAnalysis.reviews, activeFilter);
    });
  });

  // ==========================================================================
  // 4. ANIMATED NUMBER TICKER & RADIAL GAUGE DRIVER
  // ==========================================================================
  function animateValue(element, start, end, duration, formatFn = (v) => Math.round(v)) {
    if (!element) return;
    const startTime = performance.now();
    const diff = end - start;

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease out
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * easeProgress;
      element.textContent = formatFn(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = formatFn(end);
      }
    }
    requestAnimationFrame(step);
  }

  function updateRadialGauge(score) {
    const strokeCircle = document.getElementById('gauge-stroke-fill');
    if (!strokeCircle) return;
    const circumference = 2 * Math.PI * 68; // radius 68 -> ~427.26
    const offset = circumference * (1 - Math.max(0, Math.min(100, score)) / 100);
    strokeCircle.style.strokeDashoffset = offset;

    // Shift color based on threat level
    if (score >= 70) {
      strokeCircle.style.stroke = '#34d399';
      strokeCircle.style.filter = 'drop-shadow(0 0 10px rgba(52, 211, 153, 0.7))';
    } else if (score >= 45) {
      strokeCircle.style.stroke = '#fbbf24';
      strokeCircle.style.filter = 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.7))';
    } else {
      strokeCircle.style.stroke = '#f43f5e';
      strokeCircle.style.filter = 'drop-shadow(0 0 10px rgba(244, 63, 94, 0.7))';
    }
  }

  // ==========================================================================
  // 5. 5-SECOND FORENSIC RADAR SCANNER SIMULATOR
  // ==========================================================================
  const statusText = document.getElementById('scanner-status-text');
  const progressBar = document.getElementById('scanner-progress-bar');
  const stageLabel = document.getElementById('scanner-stage-label');
  const percentLabel = document.getElementById('scanner-percent-label');
  const telemetryTicker = document.getElementById('telemetry-ticker');

  function setStepState(stepNum, state, statusLabel) {
    const el = document.getElementById(`step-${stepNum}`);
    const statusEl = document.getElementById(`step-status-${stepNum}`);
    if (!el || !statusEl) return;
    el.className = `audit-step ${state}`;
    statusEl.textContent = statusLabel;
  }

  async function run5SecondScanningAnimation() {
    for (let i = 1; i <= 5; i++) setStepState(i, '', 'Pending...');

    // Phase 1
    statusText.textContent = 'Establishing TLS tunnel to ScraperAPI residential IP pool...';
    stageLabel.textContent = 'Phase 1/5: Proxy Tunnel';
    percentLabel.textContent = '20%';
    progressBar.style.width = '20%';
    if (telemetryTicker) telemetryTicker.textContent = 'TUNNELING PACKETS VIA RESIDENTIAL PROXY ROTATION...';
    setStepState(1, 'active', 'Connecting...');
    await new Promise(r => setTimeout(r, 1100));

    // Phase 2
    setStepState(1, 'done', 'Connected ✓');
    statusText.textContent = 'Bypassing Cloudflare/DataDome & extracting 1500px photography...';
    stageLabel.textContent = 'Phase 2/5: DOM Extraction';
    percentLabel.textContent = '45%';
    progressBar.style.width = '45%';
    if (telemetryTicker) telemetryTicker.textContent = 'PARSING DOM TREE & ASIN METADATA ATTRIBUTES...';
    setStepState(2, 'active', 'Extracting...');
    await new Promise(r => setTimeout(r, 1200));

    // Phase 3
    setStepState(2, 'done', 'Fetched ✓');
    statusText.textContent = 'Scraping authentic customer reviews & verified star distribution...';
    stageLabel.textContent = 'Phase 3/5: Review Corpus';
    percentLabel.textContent = '68%';
    progressBar.style.width = '68%';
    if (telemetryTicker) telemetryTicker.textContent = 'HARVESTING FULL REVIEW CORPUS & STAR DISTRIBUTIONS...';
    setStepState(3, 'active', 'Scanning...');
    await new Promise(r => setTimeout(r, 1200));

    // Phase 4
    setStepState(3, 'done', 'Collected ✓');
    statusText.textContent = 'Executing Rivue AI Forensics (syndicated bot clusters & sentiment divergence)...';
    stageLabel.textContent = 'Phase 4/5: AI Forensics';
    percentLabel.textContent = '88%';
    progressBar.style.width = '88%';
    if (telemetryTicker) telemetryTicker.textContent = 'CROSS-REFERENCING BOT PHRASES & TEXT-STAR SENTIMENT...';
    setStepState(4, 'active', 'Auditing...');
    await new Promise(r => setTimeout(r, 1100));

    // Phase 5
    setStepState(4, 'done', 'Audited ✓');
    statusText.textContent = 'Computing 90-day Worth-It fair value price & Trust Score consensus...';
    stageLabel.textContent = 'Phase 5/5: Consensus Engine';
    percentLabel.textContent = '100%';
    progressBar.style.width = '100%';
    if (telemetryTicker) telemetryTicker.textContent = 'FINALIZING TRUST MATRIX & WORTH-IT MARGINS...';
    setStepState(5, 'active', 'Finalizing...');
    await new Promise(r => setTimeout(r, 700));

    setStepState(5, 'done', 'Verified ✓');
  }

  // ==========================================================================
  // 6. ANALYSIS PIPELINE
  // ==========================================================================
  async function runAnalysis(url) {
    if (errorBanner) errorBanner.classList.add('hidden');
    loadingOverlay.classList.remove('hidden');
    resultsDashboard.style.opacity = '0.12';
    resultsDashboard.style.pointerEvents = 'none';

    const animationPromise = run5SecondScanningAnimation();

    async function executeApiCall(targetBaseUrl) {
      const endpoint = targetBaseUrl ? `${targetBaseUrl.replace(/\/$/, '')}/api/analyze` : '/api/analyze';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, refresh: true })
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.details || `Server responded with HTTP ${res.status}`);
      }
      return res.json();
    }

    const fetchPromise = (async () => {
      let currentBase = getApiBaseUrl();
      try {
        return await executeApiCall(currentBase);
      } catch (primaryErr) {
        console.warn(`Primary endpoint [${currentBase || 'origin'}] failed:`, primaryErr);

        // Auto-Failover to Universal Cloud URL if primary failed
        if (currentBase !== PUBLIC_CLOUD_URL) {
          console.log(`Auto-Failover: Retrying analysis via Universal Cloud Server: ${PUBLIC_CLOUD_URL}`);
          try {
            const cloudData = await executeApiCall(PUBLIC_CLOUD_URL);
            activeApiBaseUrl = PUBLIC_CLOUD_URL;
            updateServerPillUI('online', 'Cloud Online');
            return cloudData;
          } catch (cloudErr) {
            console.error('Universal Cloud retry also failed:', cloudErr);
          }
        }

        // If even relative endpoint was bypassed and failed, try relative
        if (currentBase && window.location.protocol.startsWith('http')) {
          try {
            const relData = await executeApiCall('');
            activeApiBaseUrl = '';
            updateServerPillUI('online', 'Online');
            return relData;
          } catch (relErr) {}
        }

        throw new Error(
          `Cannot reach Rivue backend server. Please tap "⚙️ Server" in the top bar and select "Universal Cloud (Works Anywhere)" to connect instantly.`
        );
      }
    })();

    try {
      const [_, data] = await Promise.all([animationPromise, fetchPromise]);
      currentAnalysis = data;
      renderDashboard(data);
    } catch (err) {
      console.error('Rivue Analysis Error:', err);
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

        // Trigger smooth card entrance refresh
        const cardsToStagger = resultsDashboard.querySelectorAll('.card');
        cardsToStagger.forEach((c, idx) => {
          c.style.animation = 'none';
          c.offsetHeight; // Trigger reflow
          c.style.animation = `cardEntrance 0.7s var(--spring-smooth) ${idx * 0.08}s both`;
        });
      }, 300);
    }
  }

  // ==========================================================================
  // 7. DASHBOARD RENDERER
  // ==========================================================================
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
    verdictEl.className = `verdict-display ${data.verdict.toLowerCase().replace(/\s+/g, '-')}`;

    const gradeEl = document.getElementById('dash-grade');
    gradeEl.textContent = data.grade;
    gradeEl.className = `grade-capsule grade-${data.grade}`;

    // 3. Animated Number Roll-ups for Trust & Comparison
    const trustValEl = document.getElementById('dash-trust-val');
    animateValue(trustValEl, 0, data.trustScore, 1200, v => Math.round(v));
    updateRadialGauge(data.trustScore);

    const origRatingEl = document.getElementById('dash-orig-rating');
    animateValue(origRatingEl, 0, data.originalRating, 1000, v => v.toFixed(1));

    const rivueRatingEl = document.getElementById('dash-rivue-rating');
    animateValue(rivueRatingEl, 0, data.rivueRating, 1200, v => v.toFixed(1));

    const deltaSign = data.ratingDifference > 0 ? '+' : '';
    const deltaEl = document.getElementById('dash-delta-badge');
    deltaEl.textContent = `${deltaSign}${data.ratingDifference}★`;
    deltaEl.className = `delta-badge ${data.ratingDifference < 0 ? 'negative' : 'positive'}`;

    // Fallback meter fill
    const meterFill = document.getElementById('dash-meter-fill');
    if (meterFill) meterFill.style.width = `${data.trustScore}%`;

    // 4. Price & Value Intelligence
    if (data.priceAnalysis) {
      const pa = data.priceAnalysis;
      document.getElementById('price-current').textContent = pa.formattedCurrentPrice;
      document.getElementById('price-average').textContent = pa.formattedAveragePrice;
      document.getElementById('price-worth-it').textContent = pa.formattedWorthItPrice;
      document.getElementById('price-lowest').textContent = pa.formattedLowestPrice;
      document.getElementById('price-highest').textContent = pa.formattedHighestPrice;

      // Deal Badge
      const dealBadgeEl = document.getElementById('price-deal-badge');
      dealBadgeEl.textContent = pa.dealBadge;
      dealBadgeEl.className = `deal-pill badge-deal-${pa.dealVerdict.toLowerCase().replace('_', '-')}`;

      // Deal Explanation
      document.getElementById('price-deal-explanation').textContent = pa.dealExplanation;

      // Diff summary tag
      const diffEl = document.getElementById('price-diff-summary');
      if (pa.priceDifference > 0) {
        diffEl.textContent = `Overpriced +${pa.currency}${Math.abs(pa.priceDifference).toFixed(2)}`;
        diffEl.style.color = '#f87171';
      } else if (pa.priceDifference < 0) {
        diffEl.textContent = `Save ${pa.currency}${Math.abs(pa.priceDifference).toFixed(2)} (Great Buy)`;
        diffEl.style.color = '#34d399';
      } else {
        diffEl.textContent = 'Fair Market Match';
        diffEl.style.color = '#38bdf8';
      }

      // Range Bar Pins
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

    // 5. Threat Breakdown Animated Numbers & Fills
    const bdDup = document.getElementById('dash-bd-dup');
    animateValue(bdDup, 0, data.breakdown.duplicateBotPercentage, 900, v => `${Math.round(v)}%`);
    document.getElementById('dash-bar-dup').style.width = `${data.breakdown.duplicateBotPercentage}%`;

    const bdUnv = document.getElementById('dash-bd-unverified');
    animateValue(bdUnv, 0, data.breakdown.unverifiedSpikePercentage, 900, v => `${Math.round(v)}%`);
    document.getElementById('dash-bar-unverified').style.width = `${data.breakdown.unverifiedSpikePercentage}%`;

    const vel = data.breakdown.unnaturalDistributionScore;
    document.getElementById('dash-bd-velocity').textContent = vel > 60 ? 'High Risk' : vel > 30 ? 'Moderate' : 'Normal';
    document.getElementById('dash-bar-velocity').style.width = `${vel}%`;

    document.getElementById('dash-bd-sentiment').textContent = `${data.breakdown.sentimentMismatchCount} Flag(s)`;
    document.getElementById('dash-bar-sentiment').style.width = `${Math.min(100, data.breakdown.sentimentMismatchCount * 25)}%`;

    // 6. Forensic Rationale
    document.getElementById('dash-explanation').textContent = data.explanation;
    const reasonsList = document.getElementById('dash-reasons');
    reasonsList.innerHTML = '';
    (data.reasons || []).forEach(r => {
      const li = document.createElement('li');
      li.textContent = r;
      reasonsList.appendChild(li);
    });

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

  // ==========================================================================
  // 8. REVIEW LIST RENDERER
  // ==========================================================================
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
      container.innerHTML = '<p style="text-align:center; padding: 32px; color: var(--text-dim); font-size: 13.5px;">No reviews in this category.</p>';
      return;
    }

    filtered.forEach(rev => {
      const div = document.createElement('div');
      div.className = `rev-item ${rev.isFlagged ? 'flagged' : 'authentic'}`;
      const stars = '★'.repeat(Math.round(rev.rating)) + '☆'.repeat(5 - Math.round(rev.rating));
      const tagText = rev.isFlagged ? 'Flagged Deceptive' : 'Verified Authentic';
      const tagClass = rev.isFlagged ? 'flag' : 'ok';

      div.innerHTML = `
        <div class="rev-top">
          <div>
            <span class="rev-author">${rev.author} ${rev.isVerifiedPurchase ? '✓ <span style="font-size:10.5px; color:#34d399; font-weight:600;">Verified Purchase</span>' : ''}</span>
            <span class="rev-date" style="font-family:var(--font-mono); font-size:11px; color:var(--text-dim); margin-left:8px;">${rev.date || ''}</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="rev-stars">${stars}</span>
            <span class="rev-tag ${tagClass}">${tagText}</span>
          </div>
        </div>
        ${rev.title ? `<strong style="display:block; margin: 3px 0; font-size:13.5px; color:#f1f5f9;">${rev.title}</strong>` : ''}
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
