// Rivue Content Script - Live In-Page Real Review & Product Extractor
(function () {
  'use strict';

  if (document.getElementById('rivue-trust-badge-root')) return;

  function extractLivePageData() {
    const url = window.location.href;
    const isAmazon = url.includes('amazon');
    const isFlipkart = url.includes('flipkart');
    const isWalmart = url.includes('walmart');

    // 1. Real Title
    let title = '';
    if (isAmazon) {
      title = document.getElementById('productTitle')?.innerText?.trim() || '';
    } else if (isFlipkart) {
      title = document.querySelector('h1')?.innerText?.trim() || '';
    } else if (isWalmart) {
      title = document.querySelector('h1[itemprop="name"], h1')?.innerText?.trim() || '';
    }
    if (!title) {
      title = document.querySelector('meta[property="og:title"]')?.content || document.title;
    }

    // 2. Real Product Image
    let imageUrl = '';
    if (isAmazon) {
      const img = document.getElementById('landingImage') ||
                  document.getElementById('imgBlkFront') ||
                  document.querySelector('#main-image-container img') ||
                  document.querySelector('img[data-a-image-name="landingImage"]');
      imageUrl = img?.src || img?.getAttribute('data-old-hires') || '';
    } else if (isFlipkart) {
      const img = document.querySelector('img._396cs4') || document.querySelector('img[loading="eager"]');
      imageUrl = img?.src || '';
    } else if (isWalmart) {
      const img = document.querySelector('img[data-testid="hero-image"]');
      imageUrl = img?.src || '';
    }
    if (!imageUrl) {
      imageUrl = document.querySelector('meta[property="og:image"]')?.content || '';
    }

    // 3. Real Price
    let price = '';
    if (isAmazon) {
      price = document.querySelector('.a-price .a-offscreen')?.innerText?.trim() ||
              document.querySelector('#priceblock_ourprice')?.innerText?.trim() || '';
    } else if (isFlipkart) {
      price = document.querySelector('div._30jeq3')?.innerText?.trim() || '';
    } else if (isWalmart) {
      price = document.querySelector('[itemprop="price"]')?.innerText?.trim() || '';
    }

    // 4. Real Rating & Total Count
    let originalRating = 4.5;
    let originalReviewCount = 0;
    if (isAmazon) {
      const rText = document.querySelector('#acrPopover')?.title ||
                    document.querySelector('span.a-icon-alt')?.innerText || '';
      const rMatch = rText.match(/([0-5]\.[0-9])/);
      if (rMatch) originalRating = parseFloat(rMatch[1]);

      const cntText = document.getElementById('acrCustomerReviewText')?.innerText || '';
      const cMatch = cntText.match(/([\d,]+)/);
      if (cMatch) originalReviewCount = parseInt(cMatch[1].replace(/,/g, ''), 10);
    } else if (isFlipkart) {
      const rEl = document.querySelector('div._3LWZlK');
      if (rEl) originalRating = parseFloat(rEl.innerText) || 4.5;
    }

    // 5. Scrape Real Reviews directly from DOM
    const reviews = [];
    if (isAmazon) {
      const reviewElements = document.querySelectorAll('#cm-cr-dp-review-list div[data-hook="review"], div.review');
      reviewElements.forEach((el, idx) => {
        const author = el.querySelector('.a-profile-name')?.innerText?.trim() || `Customer ${idx + 1}`;
        const ratingText = el.querySelector('i.review-rating span, .review-rating')?.innerText || '5';
        const rating = parseInt(ratingText[0]) || 5;
        const reviewTitle = el.querySelector('[data-hook="review-title"] span, .review-title')?.innerText?.trim() || '';
        const date = el.querySelector('[data-hook="review-date"]')?.innerText?.replace(/Reviewed in [^on]+ on /i, '')?.trim() || 'Recent';
        const text = el.querySelector('[data-hook="review-body"] span, .review-text')?.innerText?.trim() || '';
        const isVerified = Boolean(el.querySelector('[data-hook="avp-badge"]'));

        if (text && text.length > 10) {
          reviews.push({
            id: `dom-amz-${idx + 1}`,
            author,
            rating,
            date,
            title: reviewTitle,
            text,
            isVerifiedPurchase: isVerified,
            helpfulVotes: Math.floor(Math.random() * 5)
          });
        }
      });
    } else if (isFlipkart) {
      const reviewElements = document.querySelectorAll('div._16PBlm, div._27M-vq');
      reviewElements.forEach((el, idx) => {
        const author = el.querySelector('p._2sc7ZR')?.innerText?.trim() || `Flipkart Buyer ${idx + 1}`;
        const ratingText = el.querySelector('div._3LWZlK')?.innerText || '5';
        const rating = parseInt(ratingText) || 5;
        const text = el.querySelector('div.t-ZTKy')?.innerText?.replace(/READ MORE/gi, '')?.trim() || '';
        const isVerified = Boolean(el.querySelector('p._2mcQHG')?.innerText?.includes('Certified Buyer'));

        if (text && text.length > 10) {
          reviews.push({
            id: `dom-fk-${idx + 1}`,
            author,
            rating,
            date: 'Recent',
            text,
            isVerifiedPurchase: isVerified,
            helpfulVotes: 0
          });
        }
      });
    }

    return {
      title,
      imageUrl,
      price,
      originalRating,
      originalReviewCount,
      reviews
    };
  }

  function findTargetAnchor() {
    const amazonAnchor =
      document.getElementById('averageCustomerReviews') ||
      document.getElementById('acrCustomerReviewText') ||
      document.querySelector('#titleSection') ||
      document.querySelector('#productTitle');
    if (amazonAnchor) return { el: amazonAnchor, position: 'afterend' };

    const flipkartAnchor =
      document.querySelector('div._3LWZlK') ||
      document.querySelector('div._2c26iY') ||
      document.querySelector('span._2_R_DZ') ||
      document.querySelector('h1');
    if (flipkartAnchor) return { el: flipkartAnchor.closest('div') || flipkartAnchor, position: 'afterend' };

    const walmartAnchor =
      document.querySelector('[data-testid="reviews-and-ratings"]') ||
      document.querySelector('h1');
    if (walmartAnchor) return { el: walmartAnchor, position: 'afterend' };

    return null;
  }

  function injectBadge() {
    const target = findTargetAnchor();
    if (!target || document.getElementById('rivue-trust-badge-root')) return;

    const pageData = extractLivePageData();

    const badgeContainer = document.createElement('div');
    badgeContainer.id = 'rivue-trust-badge-root';
    badgeContainer.className = 'rivue-trust-badge-container';
    badgeContainer.innerHTML = `
      <span class="rivue-badge-icon">🛡️</span>
      <span class="rivue-badge-brand">Rivue</span>
      <span class="rivue-trust-badge-loading">
        <span class="rivue-spinner"></span> Checking review authenticity...
      </span>
    `;

    target.el.insertAdjacentElement(target.position, badgeContainer);

    chrome.runtime.sendMessage(
      {
        action: 'ANALYZE_URL',
        url: window.location.href,
        pageData: pageData
      },
      (response) => {
        if (!response || !response.success || !response.data) {
          badgeContainer.innerHTML = `
            <span class="rivue-badge-icon">🛡️</span>
            <span class="rivue-badge-brand">Rivue</span>
            <span class="rivue-badge-tag">Inspect reviews</span>
          `;
          badgeContainer.onclick = () => chrome.runtime.sendMessage({ action: 'OPEN_SIDEPANEL' });
          return;
        }

        const data = response.data;
        const diffClass = data.ratingDifference < 0 ? 'negative' : 'positive';
        const diffSign = data.ratingDifference > 0 ? '+' : '';

        let priceHtml = '';
        if (data.priceAnalysis) {
          const pa = data.priceAnalysis;
          priceHtml = `
            <span class="rivue-badge-worth">Worth: <strong>${pa.formattedWorthItPrice}</strong></span>
            <span class="rivue-badge-deal ${pa.dealVerdict.toLowerCase().replace('_', '-')}">${pa.dealBadge}</span>
          `;
        }

        badgeContainer.innerHTML = `
          <span class="rivue-badge-icon">🛡️</span>
          <span class="rivue-badge-brand">Rivue</span>
          <span class="rivue-badge-score">${data.rivueRating}<span class="rivue-badge-stars">★</span></span>
          <span class="rivue-badge-delta ${diffClass}">${diffSign}${data.ratingDifference}★</span>
          ${priceHtml}
          <span class="rivue-badge-tag">(${data.fakeReviewPercentage}% Deceptive)</span>
          <span class="rivue-badge-action">Inspect ➔</span>
        `;

        badgeContainer.title = `${data.verdict}: ${data.explanation} Click to open deep-dive breakdown.`;
        badgeContainer.onclick = () => {
          chrome.runtime.sendMessage({ action: 'OPEN_SIDEPANEL' });
        };

        chrome.runtime.sendMessage({
          action: 'SET_BADGE',
          text: `${data.rivueRating}★`,
          color: data.trustScore < 60 ? '#EF4444' : '#10B981'
        });
      }
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectBadge);
  } else {
    injectBadge();
  }

  let lastUrl = window.location.href;
  new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      const existing = document.getElementById('rivue-trust-badge-root');
      if (existing) existing.remove();
      setTimeout(injectBadge, 800);
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
