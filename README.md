# 🛡️ Rivue — Cross-Marketplace Fake Review Detection & Price Intelligence Platform

**Rivue** is an intelligent, cross-platform product review integrity and fair-value valuation system that helps consumers identify fake, duplicate, paid, and misleading reviews across major e-commerce marketplaces (Amazon, Flipkart, Walmart, Best Buy, etc.). 

Rivue detects bot patterns, astroturfing velocity bursts, generic reviewer activity, and star-to-text sentiment contradictions. It recalibrates reviews into a trustworthy **Rivue Adjusted Rating (1.0 - 5.0★)**, evaluates the product's **"Worth It" Fair-Value Price**, tracks **90-Day Price History**, and generates transparent, plain-English explanations explaining why the authentic consensus differs from the published store rating.

---

## 📦 Direct Downloads & Releases

- 📱 **Android App APK**: [`releases/Rivue-v1.0.apk`](releases/Rivue-v1.0.apk) (Ready to install on Android 8.0+)
- 🧩 **Chrome Extension**: [`releases/Rivue-Chrome-Extension.zip`](releases/Rivue-Chrome-Extension.zip) (Manifest V3)
- 🖥️ **Live Web Dashboard**: Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🌟 Available Across Three Surfaces

1. **🌐 Chrome Extension (Manifest V3)**:
   - Automatically detects product pages on Amazon, Flipkart, Walmart, etc.
   - Injects a sleek on-page **Rivue Trust Badge** right next to the marketplace rating with **Worth-It Price & Deal Pill**.
   - Action popup for 1-click inspection or URL entry.
   - Comprehensive **Side Panel** featuring side-by-side rating comparisons, trust meter (0-100), threat breakdown, Price & Value Intelligence, verified buyer pros & cons, and an inspectable review feed.

2. **📱 Android App (Jetpack Compose & Material 3)**:
   - **System Share Sheet Receiver (`ACTION_SEND`)**: While browsing inside the Amazon app, Flipkart app, or mobile browser, simply tap **Share ➔ Rivue**. The app captures the product link and instantly delivers the authenticity report!
   - Product photography thumbnail, store rating vs. Rivue rating delta, **PriceIntelligenceCard**, and review inspection feed.
   - Offline-resilient caching.

3. **⚡ Core Analysis Engine & Live Web Dashboard (`backend/` & `web/`)**:
   - High-performance Node.js/TypeScript backend service.
   - Live interactive web dashboard served at `http://localhost:3001`.
   - Complete Price Intelligence & Fair-Value engine with 90-day range and trajectory.

---

## 🔬 How Rivue Detects Deceptive Reviews

Rivue evaluates reviews across multiple forensic dimensions:

| Threat Factor | What Rivue Detects | Impact on Score |
| :--- | :--- | :--- |
| **Duplicate / Template Bot Phrasing** | Identical or near-identical review copy-pastes across accounts using N-gram Jaccard similarity and known review-farming scripts. | Heavy penalty (reviews down-weighted to 0.05 confidence). |
| **Review Velocity Spikes** | Unnatural surges of 20–100 consecutive 5-star reviews packed into a 48–72 hour window. | Identified as astroturfing campaign; burst reviews penalized. |
| **Unverified Reviewer Credibility** | Disproportionate ratio of unverified purchases, generic usernames (`Amazon Customer`, `Flipkart Buyer`), and short low-effort praise tokens. | Down-weights unverified 5-star claims in favor of verified buyers. |
| **Sentiment & Rating Contradictions** | 5-star ratings where text contains severe complaints ("broke after 2 days", "waste of money"), or synthetic AI-generated praise templates. | Flagged as fraudulent or seller sabotage. |
| **Authentic Consensus Extraction** | Synthesizes true product pros and cons exclusively from verified genuine buyers with no fraud flags. | Highlights reliable product feedback. |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v20)
- **Android SDK**: API 24+ (build-tools 34/35)

### 2. Start the Backend & Web Dashboard
```bash
cd backend
npm install
npm run build
npm start
```
The server will start on port `3001`:
- 🖥️ **Live Web Dashboard**: Open [http://localhost:3001](http://localhost:3001) in your browser.
- 📡 **API Health**: [http://localhost:3001/api/health](http://localhost:3001/api/health)
- 🔍 **Analysis Endpoint**: `POST /api/analyze` with payload `{"url": "https://www.amazon.com/dp/B09V3K4XYZ"}`

---

## 🧩 Installing the Chrome Extension

1. Open Google Chrome (or any Chromium browser like Brave / Edge).
2. Navigate to `chrome://extensions`.
3. Toggle on **"Developer mode"** in the top-right corner.
4. Click **"Load unpacked"**.
5. Select the `chrome-extension/` directory from this project.
6. Visit any product page on Amazon, Flipkart, or Walmart:
   - Notice the **Rivue Trust Badge** injected right next to the rating!
   - Click the badge or extension icon to open the **Side Panel** inspector.

---

## 📱 Running the Android App

### Android Share Sheet Workflow:
1. Open the Amazon or Flipkart app on Android.
2. View any product.
3. Tap **Share ➔ Rivue**.
4. Rivue intercepts the shared product link (`ACTION_SEND`), connects to the analysis engine, and shows the Trust Report.

### Building the APK:
```bash
cd android
./gradlew assembleDebug
```
The built APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔑 Anakin.io Integration

Anakin.io's scraping API handles the multi-source page extraction. The API key is configured in `backend/.env`:
```env
PORT=3001
ANAKIN_API_KEY=ask_d04b2eaaa4f91c99e4ab0611de92b20d24de758fbba5a5dab4cb005c96e5f8b2
ANAKIN_API_BASE=https://api.anakin.io/v1
```

---

## 🧪 Running Tests

To verify detection heuristics, duplicate algorithms, and recalculation formulas:
```bash
cd backend
npm test
```
All unit test suites validate:
- Duplicate & template bot phrasing detection
- Temporal velocity spike detection
- Unverified reviewer credibility scoring
- Sentiment mismatch flagging
- Rating recalculation & trust score weighting
