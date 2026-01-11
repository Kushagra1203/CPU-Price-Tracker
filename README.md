# CPU Price Tracker — Frontend

CPU Price Tracker is a lightweight web application that helps shoppers compare CPU prices across multiple Indian retailers and view historical price trends so they can buy at the right time. This repository contains the website and user-facing UI that consumes the backend API (which collects and stores price data).

The site is focused on clarity and usefulness: quick product lookup, side-by-side price comparisons, and historical charts to spot trends and drops.

Live site
- The public frontend is available at: https://v0-cpu-price-tracker.vercel.app/

What the website does (user-facing overview)
- Product search and discovery
  - Search for CPU models and browse a curated list of popular processors.
  - View brief metadata (model name, core count, base clock, etc.) alongside pricing.
- Price comparison
  - See current prices from multiple retailers in one place so you can compare offers and sellers quickly.
- Price history and charts
  - Inspect historical price data for a product to see how prices have moved over days/weeks/months.
  - Charts help identify drops and seasonal trends.
- Watchlist / alerts (if available)
  - Add CPUs to a personal watchlist to monitor price movements and receive alerts when prices fall below a threshold.
- Product pages
  - Each product page aggregates current listings, availability, and the full price history the backend stores.
- Simple, responsive UI
  - The site is designed to be fast and usable on mobile and desktop.

Where the data comes from
- The frontend does not scrape retailer sites itself — it fetches normalized price and history data from the backend API.
- The backend collects data by scraping or integrating with several Indian retailers; the main sources include:
  - mdcomputers
  - elitehubs
  - ezpzsolutions
  - pcstudio
  - sclgaming
  - shwetacomputers
  - theitdepot
  - vedantcomputers
  - vishalperipherals
- Because the backend normalizes data from multiple stores, the frontend shows canonical product names and consolidated price lists, with each listing linked back to its retailer.

How the website and backend work together (non-technical)
- The frontend queries the backend for:
  - Current prices and availability
  - Historical price series for charts
  - Aggregated statistics (min/max/average across a range)
- The backend is responsible for scraping, normalization, persistence, and scheduling scrapes; the frontend focuses on presentation and user interactions.

User expectations & disclaimers
- Prices shown on the site reflect the data collected by the backend at the last scrape; actual retailer prices may change in real time.
- The site is an informational tool and is not affiliated with the retailers listed.
- Follow retailer terms of service when using links or automations.

Privacy & data
- The frontend by default only requests and displays public price data. If you use watchlists or alerts that store personal contact information, that data is handled by the backend — see the backend repository and deployment for any privacy details.
- No tracking or personal profiling is included in the core product beyond optional alert/watchlist features.

Want to contribute or report issues?
- For backend/data issues (scraping, missing products, incorrect prices), please open an issue on the backend repository: https://github.com/Kushagra1203/cpu-price-tracker-backend
- For frontend UI/UX feedback, file an issue in this repo or open a PR with suggested improvements.

Links
- Live frontend: https://v0-cpu-price-tracker.vercel.app/
- Backend (data + API): https://github.com/Kushagra1203/cpu-price-tracker-backend

Thanks for checking out CPU Price Tracker — the frontend is built to make price comparison fast and simple so you can find the best deals on CPUs.
