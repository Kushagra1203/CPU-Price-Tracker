# CPU Price Tracker — Backend

This repository contains the backend for the CPU Price Tracker service — a price-collection, storage, and API layer that powers the frontend available at [CPU-Price Tracker (frontend)](https://v0-cpu-price-tracker.vercel.app/).

The backend is responsible for regularly scraping CPU pricing data from multiple retailers, normalizing and storing historical price information, and exposing endpoints for the frontend and other consumers to query current prices, price history, and aggregated insights.

## Key points
- This README describes the project, its features, and prerequisites only (no install/config steps).
- To run the whole system locally or in your environment, run the repository's orchestration script:
  - Run: `python3 master_script.py` (or with your Python invoker). The `master_script.py` in this repository orchestrates all scraping, processing, and scheduling steps.

## Features

- Centralized scraping engine
  - Multiple retailer scrapers that fetch product details and prices.
  - Normalization layer that standardizes product identifiers, names, and currency formats.

- Scheduler / orchestration
  - A master script coordinates scraping runs, updates, and downstream processing.
  - Supports periodic runs (cron / scheduler invocation) or one-off runs via the master script.

- Data storage and history
  - Persists price snapshots to enable historical price queries and trend analysis.
  - Stores metadata about each product and its source(s).

- API surface
  - RESTful endpoints (and/or Web API) to expose:
    - Current prices for products
    - Product metadata and canonical identifiers
    - Historical price series for graphs and trend calculations
    - Aggregated stats (min/max/avg over a period)

- Extensibility
  - Modular scraper architecture so new retailers can be added with minimal effort.
  - Clear separation between scraping, normalization, persistence, and API layers.

- Frontend integration
  - This backend serves the frontend located at: [https://v0-cpu-price-tracker.vercel.app/](https://v0-cpu-price-tracker.vercel.app/).
  - The frontend consumes the backend API for displaying live prices, history charts, and alerts.

## Prerequisites

- Python 3.10+ (or the version targeted by the repository)
- Network access to reach retailer sites and any external APIs used by scrapers
- Access to the datastore used by the project (e.g., PostgreSQL, MongoDB, SQLite, or another persistence layer) if the project is configured to use an external DB
- Any credentials or API keys required by specific scrapers or third-party services (if applicable)
- The repository's dependency manifest (e.g., `requirements.txt`, `pyproject.toml`) contains the exact Python packages required — ensure they are available in your environment

Note: This list is intentionally general — configuration and installation instructions are omitted per request.

## How the project works (detailed)

1. Scrapers
   - Each retailer or source has a dedicated scraper module responsible for:
     - Fetching product pages or API endpoints
     - Extracting price, availability, title, SKU/identifier, and other metadata
     - Returning normalized data to the ingestion pipeline
   - Scrapers include retry/backoff logic and error handling to minimize disruption from transient site issues.

2. Normalization
   - Incoming raw data is passed through a normalization layer which:
     - Maps different retailer product names to canonical product entries
     - Converts currencies to a canonical currency if needed
     - Ensures consistent schema for database storage

3. Persistence
   - Normalized snapshots are stored as time-stamped entries so price history can be reconstructed.
   - The persistence layer supports queries for recent prices, time-series data, and aggregated statistics.

4. Orchestration (master_script.py)
   - The repository's `master_script.py` is the single-entry orchestration script:
     - Starts or schedules scraper runs
     - Coordinates ingestion, normalization, and storage
     - Optionally triggers downstream jobs such as analytics, alerts, or export tasks
   - Running this script performs the end-to-end workflow managed by the project.

5. API Layer
   - A web/API component reads the stored data and exposes endpoints to:
     - Query current price and availability
     - Fetch historical price data for charting
     - Request aggregates (e.g., rolling averages, min/max over a window)
   - The frontend polls or queries these endpoints to present data and visualizations to users.

6. Frontend Integration
   - The frontend at [https://v0-cpu-price-tracker.vercel.app/](https://v0-cpu-price-tracker.vercel.app/) relies on this backend for data.
   - The API surface is designed for low-latency reads to serve the UI efficiently.

## Operational considerations

- Rate limiting and politeness
  - Scrapers should respect robots.txt and implement rate limiting to avoid being blocked.
- Monitoring and alerts
  - Track scraper success/failure rates and set up alerts for persistent failures.
- Data retention and storage sizing
  - Historical retention policies should be chosen according to storage cost vs. analytical needs.
- Testing
  - Unit tests for scrapers and normalization logic, plus integration tests for end-to-end runs, improve reliability.
- Security
  - Secure any credentials required by scrapers and avoid committing secrets to the repository.

## Contributing
- The project is structured to accept new scrapers and improvements to normalization and storage.
- When adding a new scraper, follow the established pattern: implement fetch, extract, normalize, and tests.

## Contact / Links
- Frontend: [CPU-Price Tracker (frontend)](https://v0-cpu-price-tracker.vercel.app/)
- Repository: this backend repository contains the orchestration and scraper code used by the frontend.

---

If you want, I can:
- Generate a more compact "Quickstart" section later (that would include run commands).
- Convert this README into a file and open a PR or push it to the repository when you confirm.
