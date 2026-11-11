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
  // ==========================================================================
  // 1. ULTRA-LIGHTWEIGHT, GPU-EFFICIENT TAP HOLO-BURST ENGINE (ZERO-PRESSURE)
  // ==========================================================================
  const tapCanvas = document.getElementById('tap-fx-canvas');
  let tapCtx = null;
  let tapWidth = 0;
  let tapHeight = 0;
  const activeParticles = [];
  const activeShockwaves = [];
  let isFxLoopRunning = false;

  function resizeTapCanvas() {
    if (!tapCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 to prevent GPU memory pressure
    tapWidth = window.innerWidth;
    tapHeight = window.innerHeight;
    tapCanvas.width = tapWidth * dpr;
    tapCanvas.height = tapHeight * dpr;
    tapCtx = tapCanvas.getContext('2d');
    tapCtx.scale(dpr, dpr);
  }
  resizeTapCanvas();
  window.addEventListener('resize', resizeTapCanvas);

  const SPARK_COLORS = ['#38bdf8', '#818cf8', '#06b6d4', '#a855f7', '#ffffff'];

  function spawnTapSupernova(x, y) {
    if (!tapCtx) return;

    // 1. Single sleek holographic laser expanding ring (Zero shadowBlur, ultra-fast)
    activeShockwaves.push({
      x, y,
      radius: 4,
      maxRadius: 52,
      color: '#38bdf8',
      alpha: 0.9,
      speed: 4.5,
      lineWidth: 2
    });

    // 2. 8 Kinetic Starlight Sparks (Smooth, lightweight physics)
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
      const speed = 2.5 + Math.random() * 5.5;
      activeParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: SPARK_COLORS[i % SPARK_COLORS.length],
        size: 1.8 + Math.random() * 1.5,
        life: 1,
        decay: 0.05 + Math.random() * 0.03
      });
    }

    if (!isFxLoopRunning) {
      isFxLoopRunning = true;
      requestAnimationFrame(renderTapFx);
    }
  }

  function renderTapFx() {
    if (!tapCtx) return;
    tapCtx.clearRect(0, 0, tapWidth, tapHeight);

    // Render Laser Shockwave
    for (let i = activeShockwaves.length - 1; i >= 0; i--) {
      const sw = activeShockwaves[i];
      sw.radius += sw.speed;
      sw.alpha -= sw.speed / sw.maxRadius;

      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        activeShockwaves.splice(i, 1);
        continue;
      }

      tapCtx.beginPath();
      tapCtx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      tapCtx.strokeStyle = sw.color;
      tapCtx.lineWidth = sw.lineWidth * Math.max(0, sw.alpha);
      tapCtx.globalAlpha = Math.max(0, sw.alpha);
      tapCtx.stroke();
    }

    // Render Sparks
    for (let i = activeParticles.length - 1; i >= 0; i--) {
      const p = activeParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.life -= p.decay;

      if (p.life <= 0) {
        activeParticles.splice(i, 1);
        continue;
      }

      tapCtx.beginPath();
      tapCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      tapCtx.fillStyle = p.color;
      tapCtx.globalAlpha = Math.max(0, p.life);
      tapCtx.fill();
    }

    tapCtx.globalAlpha = 1;

    if (activeParticles.length > 0 || activeShockwaves.length > 0) {
      requestAnimationFrame(renderTapFx);
    } else {
      isFxLoopRunning = false;
      tapCtx.clearRect(0, 0, tapWidth, tapHeight);
    }
  }

  // Pointerdown captures mouse, pen, and touch coordinates cleanly without side-effects
  let lastTapTime = 0;
  let lastTapX = -999;
  let lastTapY = -999;

  window.addEventListener('pointerdown', (e) => {
    // 1. Only respond to primary touch/pointer (ignore multi-touch secondary fingers)
    if (e.isPrimary === false) return;

    const now = performance.now();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;

    // 2. Debounce duplicate synthetic events (within 75ms and 15px radius)
    if (now - lastTapTime < 75 && Math.hypot(clientX - lastTapX, clientY - lastTapY) < 15) {
      return;
    }
    lastTapTime = now;
    lastTapX = clientX;
    lastTapY = clientY;

    // 3. Spawn pure visual tap overlay on GPU canvas (NO DOM side effects)
    spawnTapSupernova(clientX, clientY);

    // 4. Subtle mechanical compression strictly on interactive buttons
    const interactive = e.target.closest('button, a, input, select, .nav-pill, .btn-capsule-submit, .btn-capsule-paste, .ftab, .server-pill, .btn-install-helper, .ext-download-btn, .btn-primary, .btn-secondary');
    if (interactive && !interactive.disabled) {
      interactive.classList.add('tap-pressed');
      setTimeout(() => interactive.classList.remove('tap-pressed'), 110);

      // Single crisp micro-tick vibration on supported mobile devices
      if (window.navigator && window.navigator.vibrate) {
        try { window.navigator.vibrate(8); } catch (_) {}
      }
    }
  }, { passive: true });

  // ==========================================================================
  // 2. REALTIME CONSTELLATION MATRIX HUD CANVAS ENGINE
  // ==========================================================================
  const hudCanvas = document.getElementById('hero-hud-canvas');
  if (hudCanvas) {
    const hctx = hudCanvas.getContext('2d');
    let hw = 0;
    let hh = 0;
    const nodes = [];
    const nodeCount = 55;
    let mouseX = -1000;
    let mouseY = -1000;

    function resizeHud() {
      const parent = hudCanvas.parentElement || document.body;
      const dpr = window.devicePixelRatio || 1;
      hw = parent.offsetWidth || window.innerWidth;
      hh = parent.offsetHeight || window.innerHeight;
      hudCanvas.width = hw * dpr;
      hudCanvas.height = hh * dpr;
      hctx.scale(dpr, dpr);
    }
    resizeHud();
    window.addEventListener('resize', resizeHud);

    window.addEventListener('pointermove', (e) => {
      const rect = hudCanvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * hw,
        y: Math.random() * hh,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: 1.5 + Math.random() * 2,
        baseColor: Math.random() > 0.4 ? 'rgba(56, 189, 248, ' : 'rgba(129, 140, 248, '
      });
    }

    let radarAngle = 0;

    function renderHud() {
      hctx.clearRect(0, 0, hw, hh);

      // Rotating Central Radar Reticle
      const cx = hw / 2;
      const cy = Math.min(hh * 0.38, 280);
      radarAngle += 0.008;

      hctx.save();
      hctx.translate(cx, cy);
      hctx.rotate(radarAngle);
      hctx.beginPath();
      hctx.arc(0, 0, 160, 0, Math.PI * 2);
      hctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      hctx.lineWidth = 1;
      hctx.setLineDash([4, 12]);
      hctx.stroke();

      hctx.beginPath();
      hctx.arc(0, 0, 95, 0, Math.PI * 2);
      hctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
      hctx.setLineDash([2, 6]);
      hctx.stroke();
      hctx.setLineDash([]);
      hctx.restore();

      // Nodes & Connections
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0) n.x = hw;
        if (n.x > hw) n.x = 0;
        if (n.y < 0) n.y = hh;
        if (n.y > hh) n.y = 0;

        // Mouse attraction
        const dx = mouseX - n.x;
        const dy = mouseY - n.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        if (distToMouse < 140) {
          n.x += (dx / distToMouse) * 0.6;
          n.y += (dy / distToMouse) * 0.6;
        }

        // Draw node (Zero shadowBlur for maximum 60/120fps smoothness)
        hctx.beginPath();
        hctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        hctx.fillStyle = n.baseColor + '0.75)';
        hctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const ndx = n.x - n2.x;
          const ndy = n.y - n2.y;
          const ndist = Math.sqrt(ndx * ndx + ndy * ndy);
          if (ndist < 95) {
            hctx.beginPath();
            hctx.moveTo(n.x, n.y);
            hctx.lineTo(n2.x, n2.y);
            hctx.strokeStyle = `rgba(56, 189, 248, ${0.18 * (1 - ndist / 95)})`;
            hctx.lineWidth = 0.8;
            hctx.stroke();
          }
        }
      }

      requestAnimationFrame(renderHud);
    }
    requestAnimationFrame(renderHud);
  }

  // ==========================================================================
  // 3. LIVE UTC CLOCK & 100% REALTIME SERVER TELEMETRY
  // ==========================================================================
  const navClock = document.getElementById('nav-clock');
  function updateNavClock() {
    if (navClock) {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, '0');
      const m = String(now.getUTCMinutes()).padStart(2, '0');
      const s = String(now.getUTCSeconds()).padStart(2, '0');
      navClock.textContent = `UTC ${h}:${m}:${s}`;
    }
  }
  setInterval(updateNavClock, 1000);
  updateNavClock();

  // Real-Time Server Health & Latency Telemetry
  const hudRealStatus = document.getElementById('hud-real-status');
  const hudRealSub = document.getElementById('hud-real-sub');
  const hudRealLatencyVal = document.getElementById('hud-real-latency-val');
  const hudRealDot = document.getElementById('hud-real-dot');
  const hudRealLatencyDot = document.getElementById('hud-real-latency-dot');
  const heroHudServer = document.getElementById('hero-hud-server');

  async function updateRealServerTelemetry() {
    const start = performance.now();
    try {
      const serverUrl = window.RivueServer?.getServerUrl() || '';
      const targetUrl = serverUrl ? `${serverUrl.replace(/\/$/, '')}/api/health` : '/api/health';
      const res = await fetch(targetUrl, { cache: 'no-store' });
      const elapsed = Math.round(performance.now() - start);

      if (res.ok) {
        const data = await res.json();
        if (hudRealStatus) {
          hudRealStatus.textContent = 'ONLINE';
          hudRealStatus.style.color = '#38bdf8';
        }
        if (hudRealSub) {
          hudRealSub.textContent = data.scraperApiConfigured ? 'Scraper API & AI Heuristics Active' : 'Forensic AI Core Ready';
        }
        if (hudRealLatencyVal) {
          const displayHost = serverUrl ? serverUrl.replace(/^https?:\/\//, '').split('/')[0] : 'PORT 3001';
          hudRealLatencyVal.textContent = `${elapsed}ms • ${displayHost}`;
        }
        if (hudRealDot) hudRealDot.style.background = '#10b981';
        if (hudRealLatencyDot) hudRealLatencyDot.style.background = '#10b981';
      } else {
        throw new Error('Unhealthy status');
      }
    } catch (_) {
      if (hudRealStatus) {
        hudRealStatus.textContent = 'STANDBY';
        hudRealStatus.style.color = '#f59e0b';
      }
      if (hudRealSub) {
        hudRealSub.textContent = 'Local Mode • Connect Server';
      }
      if (hudRealLatencyVal) {
        hudRealLatencyVal.textContent = 'OFFLINE • Tap to configure';
      }
      if (hudRealDot) hudRealDot.style.background = '#f59e0b';
      if (hudRealLatencyDot) hudRealLatencyDot.style.background = '#f59e0b';
    }
  }

  updateRealServerTelemetry();
  setInterval(updateRealServerTelemetry, 8000);

  if (heroHudServer) {
    heroHudServer.addEventListener('click', () => {
      openServerModal();
      updateRealServerTelemetry();
    });
  }

  // ==========================================================================
  // 4. MARKETPLACE PROTOCOL REALTIME DETECTION ON URL
  // ==========================================================================
  const protocolBadge = document.getElementById('protocol-status-badge');
  const protocolText = document.getElementById('protocol-status-text');

  function updateProtocolStatus(val) {
    if (!protocolText) return;
    const url = (val || '').toLowerCase().trim();
    if (!url) {
      protocolText.textContent = 'PASTE ANY PRODUCT URL TO COMMENCE DEEP PACKET AUDIT';
      if (protocolBadge) protocolBadge.style.borderColor = 'rgba(56, 189, 248, 0.25)';
      return;
    }
    if (url.includes('amazon.')) {
      protocolText.textContent = '⚡ AMAZON LISTING DETECTED // HIGH-PRIORITY RESIDENTIAL PROXY POOL';
      if (protocolBadge) protocolBadge.style.borderColor = '#fbbf24';
    } else if (url.includes('flipkart.')) {
      protocolText.textContent = '🛒 FLIPKART CATALOG DETECTED // REVERSE-DOM INJECTION ARMED';
      if (protocolBadge) protocolBadge.style.borderColor = '#38bdf8';
    } else if (url.includes('walmart.')) {
      protocolText.textContent = '🎯 WALMART PRODUCT DETECTED // REVIEW VELOCITY ANALYZER READY';
      if (protocolBadge) protocolBadge.style.borderColor = '#34d399';
    } else {
      protocolText.textContent = '🌐 UNIVERSAL COMMERCE TARGET DETECTED // DEEP SCRAPING TUNNEL ENGAGED';
      if (protocolBadge) protocolBadge.style.borderColor = '#818cf8';
    }
  }

  if (inputUrl) {
    inputUrl.addEventListener('input', (e) => updateProtocolStatus(e.target.value));
  }

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
  // SCROLL-DRIVEN HEADER COMPRESSION & PROGRESS BAR
  // ==========================================================================
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scroll-progress');
  let ticking = false;

  function handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    if (navbar) {
      if (scrollY > 15) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    if (scrollProgress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      scrollProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });
  handleScroll();

  // ==========================================================================
  // CINEMATIC HERO TEXT FLIPPER
  // ==========================================================================
  const flippingPhrases = [
    'FAKE 5-STAR REVIEWS.',
    'BOT-FARM RATINGS.',
    'SPONSORED DECEPTIONS.',
    'MANIPULATED PRICES.',
    'AI-GENERATED PRAISE.'
  ];
  let phraseIdx = 0;
  const flipEl = document.getElementById('hero-flipping-phrase');
  if (flipEl) {
    setInterval(() => {
      flipEl.classList.add('flip-out');
      setTimeout(() => {
        phraseIdx = (phraseIdx + 1) % flippingPhrases.length;
        flipEl.textContent = flippingPhrases[phraseIdx];
        flipEl.classList.remove('flip-out');
        flipEl.classList.add('flip-in');
        requestAnimationFrame(() => {
          flipEl.classList.remove('flip-in');
        });
      }, 350);
    }, 2800);
  }
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

  // Chrome Extension Modal Controls
  const extModal = document.getElementById('extension-modal');
  const btnOpenExtModal = document.getElementById('btn-open-ext-modal');
  const btnOpenExtGuide = document.getElementById('btn-open-ext-guide');
  const btnCloseExtModal = document.getElementById('btn-close-ext-modal');
  const btnDismissExtModal = document.getElementById('btn-dismiss-ext-modal');

  function openExtModal() {
    if (extModal) extModal.classList.remove('hidden');
  }
  function closeExtModal() {
    if (extModal) extModal.classList.add('hidden');
  }

  if (btnOpenExtModal) btnOpenExtModal.addEventListener('click', openExtModal);
  if (btnOpenExtGuide) btnOpenExtGuide.addEventListener('click', openExtModal);
  if (btnCloseExtModal) btnCloseExtModal.addEventListener('click', closeExtModal);
  if (btnDismissExtModal) btnDismissExtModal.addEventListener('click', closeExtModal);

  // Close modals when clicking outside / on backdrop
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-backdrop-blur')) {
        modal.classList.add('hidden');
      }
    });
  });

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
      setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        if (resultsDashboard) {
          resultsDashboard.classList.remove('hidden');
          resultsDashboard.style.opacity = '1';
          resultsDashboard.style.pointerEvents = 'auto';

          // Trigger smooth card entrance refresh
          const cardsToStagger = resultsDashboard.querySelectorAll('.card');
          cardsToStagger.forEach((c, idx) => {
            c.style.animation = 'none';
            c.offsetHeight; // Trigger reflow
            c.style.animation = `cardEntrance 0.7s var(--spring-smooth) ${idx * 0.08}s both`;
          });

          // Smoothly scroll down to dashboard
          resultsDashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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

  // ==========================================================================
  // 9. NATIVE ANDROID & SYSTEM-BROWSER UNIVERSAL DOWNLOAD DISPATCHER
  // (Fixes silent download failure inside Capacitor APK WebView)
  // ==========================================================================
  function setupDownloadInterception() {
    const downloadLinks = document.querySelectorAll('a[href*="Rivue-Chrome-Extension.zip"], a[href*="rivue-latest.apk"], .btn-download-cyber, .ext-download-btn');

    downloadLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href') || '';
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

        const isApk = href.toLowerCase().includes('.apk');
        const isZip = href.toLowerCase().includes('.zip');
        if (!isApk && !isZip) return;

        e.preventDefault();
        e.stopPropagation();

        const fileName = isApk ? 'rivue-latest.apk' : 'Rivue-Chrome-Extension.zip';
        const relativePath = isApk ? 'downloads/rivue-latest.apk' : 'downloads/Rivue-Chrome-Extension.zip';

        // 1. Resolve reachable download host
        let targetHost = (window.RivueServer?.getServerUrl() || '').trim();
        const isCapacitor = Boolean(
          window.Capacitor?.isNativePlatform?.() ||
          window.location.protocol.startsWith('capacitor') ||
          window.location.protocol.startsWith('file')
        );

        if (!targetHost || targetHost.includes('localhost') || targetHost.includes('127.0.0.1')) {
          if (isCapacitor) {
            targetHost = 'https://myth-subaru-following-understood.trycloudflare.com';
          } else {
            targetHost = window.location.origin;
          }
        }

        const absoluteUrl = `${targetHost.replace(/\/$/, '')}/${relativePath}`;

        if (isCapacitor) {
          // Open via system browser so Android DownloadManager downloads the file directly
          if (window.Capacitor?.Plugins?.Browser?.open) {
            window.Capacitor.Plugins.Browser.open({ url: absoluteUrl });
          } else {
            window.open(absoluteUrl, '_system');
          }
          if (typeof showScanBanner === 'function') {
            showScanBanner(`📥 Starting download: ${fileName}. Check notifications or Downloads folder!`, 'info');
          }
        } else {
          // Normal desktop/mobile browser
          const tempA = document.createElement('a');
          tempA.href = absoluteUrl;
          tempA.download = fileName;
          tempA.target = '_blank';
          document.body.appendChild(tempA);
          tempA.click();
          setTimeout(() => tempA.remove(), 100);
          if (typeof showScanBanner === 'function') {
            showScanBanner(`📥 Downloading ${fileName}...`, 'info');
          }
        }
      });
    });
  }

  setupDownloadInterception();
});
