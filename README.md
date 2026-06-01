# Spring Street Market Insights & Portfolio Analytics Dashboard

> Institutional-grade market intelligence and portfolio analytics, designed for modern fintech experiences.

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Go](https://img.shields.io/badge/Go-%2300ADD8.svg?style=for-the-badge&logo=go&logoColor=white)
![Gin](https://img.shields.io/badge/Gin-%23008CBA.svg?style=for-the-badge&logo=gin&logoColor=white)
![Yahoo Finance](https://img.shields.io/badge/Yahoo_Finance-%23410093.svg?style=for-the-badge&logo=yahoo&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

## OVERVIEW & GETTING STARTED
==================================================

### 🚀 How to Run

**1. Start the Go Backend (Port 8080)**
```bash
cd backend
go mod tidy
go run main.go
```

**2. Start the Next.js Frontend (Port 3000)**
```bash
cd frontend
npm install
npm run dev
```
*Once both are running, open `http://localhost:3000` in your browser.*

### 📊 Data Sources: Real vs. Derived
To ensure high performance while maintaining a realistic SaaS experience, the dashboard uses a hybrid data approach:
* **Real Data (Yahoo Finance via Go Backend):** All core portfolio metrics, equal-weighted asset allocations, 5-year historical returns, realized CAGR, Volatility, Max Drawdown, and Sharpe Ratios are 100% real data fetched dynamically from Yahoo Finance.
* **Derived/Mock Data (Frontend Models):** Because fetching 5 years of exact daily OHLC (Open, High, Low, Close) for multiple tickers is extremely API-heavy, the individual candlestick wicks (Intraday High/Low/Open) are deterministically derived on the frontend using the *real* daily closing prices and standard deviation models. The "AI Insights" text is also generated via frontend heuristics based on the live portfolio weights.

### 📝 Project Context
Spring Street is a premium market insights and portfolio analytics dashboard designed to emulate a top-tier SaaS financial product. It bridges the gap between raw financial data and actionable investor intelligence. 

The core of the application analyzes an **equal-weighted portfolio methodology** containing five of the most globally impactful technology stalwarts:
* **AAPL** (Apple Inc.)
* **MSFT** (Microsoft Corp.)
* **GOOGL** (Alphabet Inc.)
* **NVDA** (NVIDIA Corp.)
* **AMZN** (Amazon.com Inc.)

These assets were selected due to their high liquidity, significant market capitalization, and outsized impact on broader market indices. This concentration provides an excellent testbed for evaluating risk distribution, capital flow, and return on investment in a high-beta environment.

Spring Street emphasizes **Data Storytelling** — moving beyond static charts to generate investor-focused insights. By combining interactive analytics, real-time risk analysis, and comprehensive performance tracking, the platform delivers institutional-grade context to everyday market movements.

## KEY FEATURES
==================================================

### 📈 Analytics
* **Portfolio Growth Tracking**: Visualize cumulative returns against initial capital baselines.
* **Asset Contribution Analysis**: Treemap and Sankey capital flows detailing allocation weights and relative position sizes.
* **Risk Analytics**: Aggregate portfolio health scoring and interactive Fear & Greed indicators.
* **Volatility Monitoring**: Realized volatility tracking to identify periods of elevated market uncertainty.
* **Drawdown Analysis**: Peak-to-trough decline visualization to measure downside risk.
* **Benchmark Comparison**: Assess portfolio performance against historical baselines.

### ⚡ Interactive Experience
* **Premium Mobile UX**: A dedicated mobile experience featuring a locked backdrop navigation drawer, sticky bottom navigation bars, and 44px optimized touch targets, breaking away from the typical squished desktop-responsive layouts.
* **Dark / Light Mode**: Sleek, tailored themes with terminal-inspired dark modes and sharp, high-contrast typography.
* **Responsive Design**: Fully fluid grid systems, scalable SVGs, and horizontal scroll wrappers for dense charts on ultra-narrow displays.
* **Interactive Charts**: Custom tooltips, precise crosshairs, and dynamic timeline slicing via Recharts.
* **Advanced Filtering**: Toggle between dynamic asset charts (Candlestick vs. Area Line).
* **Global Search & Command Palette**: Instant keyboard-driven navigation (`Cmd + K`) to seamlessly jump between assets and views.

### 🎨 User Experience
* **Smooth Animations**: Hardware-accelerated micro-interactions powered by Framer Motion.
* **Loading States**: Staggered skeleton screens preventing layout shifts.
* **Empty States**: Beautifully handled edge cases for API failures or missing ticker data.
* **Data Storytelling**: AI-driven analysis boxes that summarize "Key Findings" and "Investor Takeaways" dynamically.

## LIVE PRODUCT EXPERIENCE
==================================================

### Dashboard Overview
Upon entry, users are greeted by the **Hero** section—a high-level executive summary displaying the total portfolio value, realized CAGR, aggregate Sharpe ratio, and a live ticker tape. The information hierarchy ensures the most critical performance metrics are digested instantly.

### Portfolio Mode
This mode visualizes the "Growth versus initial capital base". It charts the holistic journey of the portfolio over time, enabling users to adjust timeframes (1W, 1M, 1Y, MAX) and observe the exact historical compounding path compared to the principal investment.

### Market Mode
Users dive into asset-level granularity. Features include a dynamic **Contribution Treemap**, an **Asset Allocation Pie Chart**, and **Capital Flow** distributions. This mode answers: *"Which assets are driving the returns, and where is the concentration risk?"*

### Insights Mode
Rather than leaving users to interpret charts blindly, Insights Mode generates human-like, actionable takeaways. For instance, the system programmatically detects the highest contributing asset and outputs context like: *"NVDA drives 34.5% of the portfolio. Monitor for concentration risk."*

## ARCHITECTURE
==================================================

**Frontend:**
* **Next.js 14** (App Router)
* **React** 
* **TypeScript**
* **TailwindCSS** (Customized Design System)
* **Framer Motion** (Animations)
* **Recharts** (Data Visualization)
* **Lucide React** (Iconography)

**Backend:**
* **Go**
* **Gin** (HTTP Web Framework)
* **finance-go** (Yahoo Finance API Wrapper)

```text
+---------------------+
|                     |
|   Client Browser    |
|                     |
+---------+-----------+
          |
          | HTTP / REST
          v
+---------+-----------+
|                     |
|   Next.js Frontend  |  (Port: 3000)
|                     |
+---------+-----------+
          |
          | Fetch
          v
+---------+-----------+
|                     |
|    Gin API Server   |  (Port: 8080)
|                     |
+---------+-----------+
          |
          | Finance-Go
          v
+---------+-----------+
|                     |
|    Yahoo Finance    |
|                     |
+---------------------+
```

## DATA FLOW
==================================================

1. **User Request**: User accesses the dashboard via the browser.
2. **Frontend Invocation**: The Next.js client invokes `useMarketData` hook, triggering a fetch to the Go API.
3. **Backend Processing**: The Gin server fetches live and historical ticker data concurrently via `finance-go`.
4. **Calculations**: The Go backend aggregates the individual asset data into a unified, equal-weight `portfolio_history` and calculates core metrics (CAGR, Sharpe, Drawdown).
5. **Frontend Derivations**: Next.js receives the JSON payload, mathematically derives historic Candlestick OHLC bars, heatmaps, and timeframe slices.
6. **Visualization**: Data is piped into Recharts and Framer Motion for rendering the final UI.

## PROJECT STRUCTURE
==================================================

```text
spring-street/
├── backend/
│   ├── main.go             # Gin server entrypoint
│   ├── handlers/           # Route handlers
│   ├── models/             # Go structs and types
│   ├── services/           # Finance-go integration
│   └── go.mod              # Dependencies
├── frontend/
│   ├── app/                # Next.js App Router & Globals
│   ├── components/
│   │   ├── format/         # Number and currency formatters
│   │   ├── layout/         # Navbar, Sidebar, Shell
│   │   └── sections/       # Hero, Performance, Portfolio, Company Pages
│   ├── lib/
│   │   ├── use-market-data # Core data fetching & metric derivation
│   │   └── colors.ts       # Centralized design system colors
│   ├── types/              # TypeScript interfaces
│   └── public/             # Static assets
└── README.md
```



## API ENDPOINTS
==================================================

| Method | Endpoint | Description | Response Shape |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check | `{ "status": "ok", "time": "..." }` |
| `GET` | `/api/metrics` | Core dashboard payload | `{ "tickers": [...], "portfolio": {...}, "portfolio_history": [...] }` |

*Note: The Go backend currently serves a consolidated `/api/metrics` endpoint that bundles the portfolio overview, historical snapshots, and individual ticker profiles to optimize frontend render times.*

## ANALYTICS & INSIGHTS
==================================================

The dashboard computes institutional-grade metrics to evaluate risk and return.

### Portfolio Return
**Formula:** `(Current Value - Initial Value) / Initial Value`
Calculated iteratively across the rolling history array to plot the `Portfolio Growth` chart against the baseline.

### Asset Contribution
**Formula:** `(Asset Current Price * Shares) / Total Portfolio Value`
Determines the percentage weight of each asset, driving the pie charts and Sankey flow diagrams.

### Volatility (Realized)
**Formula:** `Standard Deviation of Daily Returns * sqrt(252)`
Annualized measure of dispersion. Higher values indicate wider price swings and increased risk.

### Sharpe Ratio
**Formula:** `(CAGR - Risk Free Rate) / Volatility`
Measures risk-adjusted return. A Sharpe > 1.0 indicates solid returns relative to the risk taken. (Assuming a 4.5% risk-free rate).

### Maximum Drawdown
**Formula:** `(Trough Value - Peak Value) / Peak Value`
Calculates the largest single drop from peak to bottom in the portfolio's history, visualized as an inverted red area chart.

## DESIGN DECISIONS
==================================================

* **Equal-weight portfolio:** Provides a clean baseline for evaluating contribution drift without the complexity of a live order book.
* **Go Backend:** Chosen for its concurrency model (goroutines), allowing extremely fast simultaneous fetching of multiple Yahoo Finance tickers.
* **Next.js 14:** Utilized for seamless routing and server-side capabilities, providing a robust architecture for potential future SSR optimizations.
* **Recharts:** Offers a powerful, declarative API for SVG charts that integrates perfectly with React's component lifecycle.
* **TailwindCSS:** Bypassed generic component libraries to build a hyper-custom, bespoke design system with CSS variables for seamless theme switching.
* **Framer Motion:** Used to orchestrate complex layout animations and chart entrance delays, elevating the application from a "page" to a "product".

## UI/UX PHILOSOPHY
==================================================

Spring Street rejects generic dashboard templates. The UI/UX philosophy is strictly **Product-First**:
* **Information Hierarchy:** Key metrics (Portfolio Value, Return) sit above the fold. Granular risk analytics sit below. 
* **Custom Aesthetics:** No default blue buttons or rounded bootstrap cards. The design uses sharp corners, terminal-inspired monospaced fonts (`DM Mono`), and a deep, immersive color palette (`#080B14`).
* **Data Storytelling:** Charts don't just show lines; adjacent "Insight Panels" dynamically explain *why* the line matters.
* **Distinct Asset Identity:** AAPL isn't just "blue"—it has a dedicated silver-white brand profile that persists across tooltips, glowing borders, and pie slices.

## PERFORMANCE & RELIABILITY OPTIMIZATIONS
==================================================
* **Thread-Safe In-Memory Caching (Go):** A custom caching layer using `sync.RWMutex` with a 4-hour TTL protects the backend from Yahoo Finance rate limits and drops latency to 0ms for repeated requests.
* **Concurrency (Go):** Utilizes Go's `sync.WaitGroup` to fetch 5 years of historical data for all 5 portfolio tickers simultaneously, drastically reducing initial load time.
* **Deterministic Derivation:** Bypassed heavy API requests by mathematically deriving historic Candlestick OHLC paths locally using standard deviation models and real API baselines.
* **Memoization:** Extensive use of `useMemo` for derived analytics to prevent expensive array slicing and mapping on every React render.
* **SVG Optimization:** Custom, lightweight SVG implementations for the Candlestick charts limit DOM node bloat compared to heavy canvas alternatives.

## ENGINEERING & TESTING
==================================================
* **Table-Driven Unit Tests:** Complex financial mathematics (Sharpe Ratio, Maximum Drawdown, Compound Returns) are strictly validated using Go's `testing` package (`analytics_test.go`) to guarantee institutional-grade accuracy.

## SCREENSHOTS
==================================================

**Dashboard Overview**
*[Insert Screenshot of Hero and KPI Strip]*

**Portfolio Analytics**
*[Insert Screenshot of Portfolio Growth and Insight Panels]*

**Market Insights**
*[Insert Screenshot of Capital Flow and Treemap]*

**Asset Detail View**
*[Insert Screenshot of Company Page Candlestick Chart]*

## FUTURE IMPROVES
==================================================
* **Real-time Streaming Data:** Implementing WebSockets for live intraday tick data.
* **Portfolio Rebalancing:** Adding tools to simulate drag-and-drop weight adjustments.
* **Authentication:** Secure user sessions via NextAuth/Auth.js.
* **Personalized Watchlists:** Allowing users to dynamically add/remove tickers.
* **News Sentiment Analysis:** Integrating NLP APIs to overlay market news on price charts.

## CHALLENGES & LEARNINGS
==================================================

* **Data Processing:** Bridging the gap between a Go backend and a React frontend required careful mapping of JSON structs. Handling missing days (weekends/holidays) in the financial data required implementing robust fallback logic.
* **Visualization Decisions:** Default Recharts tooltips felt unpolished. Building a bespoke, custom tooltip that accurately synced with mouse movements across multi-series area charts was a significant design challenge.
* **Avoiding the "AI-Look":** Stripping out generic gradients and implementing a cohesive, strict token-based color system required immense discipline, proving that great design is often about what you *remove* rather than what you add.

## CONCLUSION
==================================================

Spring Street is more than a visualization tool; it is a meticulously crafted financial product. By fusing high-performance backend data processing with an obsessive focus on frontend aesthetics and interactive UX, the dashboard delivers an institutional-grade experience designed for the modern investor.
