# CPU Price Tracker (FastAPI + Scrapy)

Track CPU prices from Indian e‑commerce retailers, store historical data, and expose a clean HTTP API for querying current and past prices.

## Overview

- Scrapers: Scrapy spiders (e.g., `mdcomputers_spider`) collect CPU listings and prices.
- API: FastAPI serves read/write endpoints to fetch price history and trigger scrapes.
- Storage: MySQL stores normalized product and price data with timestamps.
- Jobs: Run spiders on a schedule (cron/systemd/GitHub Actions) to keep prices fresh.

### Supported spiders (9)

These spiders live in `cpu_price_tracker/cpu_price_tracker/spiders/`:

- elitehubs
- ezpzsolutions
- mdcomputers
- pcstudio
- sclgaming
- shwetacomputers
- theitdepot
- vedantcomputers
- vishalperipherals

## Tech stack

- FastAPI, Uvicorn
- Scrapy
- MySQL (mysql-connector-python)
- Python 3.11 (virtualenv)
- macOS/arm64 compatible (Apple Silicon)

## Project structure

```
.
├─ cpu_price_tracker/                # FastAPI app and Scrapy project root
│  ├─ cpu_price_tracker/             # Scrapy project package (settings, spiders, pipelines)
│  │  ├─ spiders/
│  │  │  └─ mdcomputers_spider.py
│  │  ├─ pipelines.py
│  │  └─ settings.py
│  └─ app/                           # FastAPI application (suggested)
│     └─ main.py
├─ virtual_enviornment/              # Python 3.11 virtualenv (note the name)
└─ README.md
```

If your FastAPI app lives elsewhere, adjust paths/commands below accordingly.

## Prerequisites

- Python 3.11 (this project uses a local venv at `virtual_enviornment`)
- MySQL 8.x running locally or remotely
- macOS build tools (Xcode CLT) and Homebrew (for lxml/build deps)

Recommended Homebrew libraries (helpful for XML parsers used by Scrapy):

```bash
brew install libxml2 libxslt
```

## Setup

1. Activate the project virtual environment (already created in repo):

```bash
# from the repository root
source virtual_enviornment/bin/activate
```

2. Install Python dependencies (if needed):

```bash
# If you maintain a requirements file, use it; otherwise install key deps directly
pip install --upgrade pip wheel
pip install fastapi uvicorn[standard] scrapy mysql-connector-python python-dotenv
```

3. Configure environment variables for DB access. Create a `.env` file at the repo root:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=cpu_price_tracker
```

4. Create the database and tables. Example minimal schema:

```sql
CREATE DATABASE IF NOT EXISTS cpu_price_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE cpu_price_tracker;

-- Products master
CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(128) NULL,
  url TEXT NULL,
  store VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_store_sku (store, sku)
);

-- Price snapshots
CREATE TABLE IF NOT EXISTS prices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(8) DEFAULT 'INR',
  scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_time (product_id, scraped_at)
);
```

If your `pipelines.py` writes to a different schema, match the column names accordingly.

## Running the API (FastAPI)

Assuming your FastAPI entrypoint is `cpu_price_tracker/app/main.py` exposing `app`:

```bash
# from repo root with venv active
uvicorn cpu_price_tracker.app.main:app --reload --host 0.0.0.0 --port 8000
```

Open http://127.0.0.1:8000/docs for Swagger UI.

### Suggested endpoints

- GET /health → { status: "ok" }
- GET /cpus → List CPUs (latest price included)
- GET /cpus/{id} → CPU details + price history
- GET /prices?store=mdcomputers&sku=... → Filtered price snapshots
- POST /scrape/trigger → Trigger specific spider(s) on demand

Implementations will vary; wire them to your models and DB queries.

## Running a scrape (Scrapy)

Always run Scrapy with the same Python environment that has your dependencies:

```bash
# 1) Ensure venv is active
source virtual_enviornment/bin/activate

# 2) Run from the Scrapy project directory (where scrapy.cfg or settings are detected)
cd cpu_price_tracker

# 3a) Crawl a specific site (examples)
scrapy crawl mdcomputers
scrapy crawl elitehubs
scrapy crawl theitdepot

# 3b) List all available spiders
scrapy list

# Output JSON files are saved under cpu_price_tracker/cpu_price_tracker/data
# (see Batch scraping below for exact filenames)
```

If you see `ModuleNotFoundError: No module named 'mysql'`, you are likely using Anaconda’s `scrapy` binary. Ensure `which scrapy` points to `.../virtual_enviornment/bin/scrapy` while the venv is active.

### Batch scraping all stores (recommended)

Use the helper script `master_script.py` to run all 9 spiders, merge outputs, normalize names, and upsert into MySQL.

```bash
# from repository root
source virtual_enviornment/bin/activate
cd cpu_price_tracker
python master_script.py
```

This will:

- Run each spider and write JSON to `cpu_price_tracker/cpu_price_tracker/data/`:
  - processors_elite.json
  - processors_itdepot.json
  - processors_md.json
  - processors_pc.json
  - processors_scl.json
  - processors_shweta.json
  - processors_vedant.json
  - processors_vishal.json
  - processors_ezpz.json
- Merge to `processors.json`
- Normalize CPU names via `normalize_cpu_names.py` producing `processors_standardized.json`
- Upsert standardized rows into MySQL table `cpu_prices` (see schema below)

## Development

- Lint/format: `ruff`, `black`
- Tests: `pytest`

```bash
pip install ruff black pytest
ruff check .
black .
pytest -q
```

## Troubleshooting (macOS)

- lxml build errors during install:
  - Install system libs and ensure wheel is available:
    ```bash
    brew install libxml2 libxslt
    export XML2_CONFIG=$(brew --prefix libxml2)/bin/xml2-config
    export XSLT_CONFIG=$(brew --prefix libxslt)/bin/xslt-config
    pip install --upgrade pip wheel
    pip install lxml
    ```
- Using wrong Python/Scrapy (Anaconda vs venv):
  - Activate venv: `source virtual_enviornment/bin/activate`
  - Verify: `which python` should point to `.../virtual_enviornment/bin/python`
  - Verify: `which scrapy` should point to `.../virtual_enviornment/bin/scrapy`
- MySQL connector not found:
  - Install in venv: `pip install mysql-connector-python`
- SSL errors scraping:
  - Update certs: `pip install certifi` and/or ensure OpenSSL updated

## Security and ethics

- Respect robots.txt unless you have explicit permission. Configure `ROBOTSTXT_OBEY` appropriately in Scrapy settings.
- Rate-limit requests and include a contact email in the User-Agent when scraping.

## Roadmap ideas

- More stores (PrimeABGB, Vedant, Amazon, etc.)
- Alerts (email/Slack) on price drops
- Frontend dashboard (Next.js/SvelteKit) consuming the FastAPI
- Dockerization for consistent deploys
