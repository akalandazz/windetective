# VIN Intelligence — Full Production App (Option B)

> Production-ready specification, architecture, and starter code for the full web application that performs multi-source VIN lookups, AI analysis, PDF report exports, billing/credits, and admin.

---

## 1 — Executive summary

**Goal:** Build a SaaS web application where users submit a VIN and receive a consolidated, AI-analyzed car history report (inc. maintenance, flood/salvage, auction history, photos). Includes user authentication, credits/billing (Stripe), admin panel, caching, PDF export and high-availability deployment.

**Primary users:** Individual buyers, dealerships, auction brokers.

**Non-functional requirements:**
- Scalable: handle bursts (e.g. auctions) via horizontal backend scaling and async workers.
- Secure: encrypted secrets, rate-limits, logging/monitoring, GDPR-considerate.
- Cost-aware: cache reports, enforce quotas/credits.

---

## 2 — Tech stack

- Frontend: **Next.js 14 (App Router)** + **Tailwind CSS** + TypeScript
- Backend: **FastAPI** (Python) with **Uvicorn + Gunicorn** setup for production
- Worker & Task queue: **Celery** + **Redis** (or prefer RQ or RabbitMQ)
- Database: **Postgres (Supabase or Neon)**
- Object storage: **AWS S3** (images, PDFs)
- Authentication: **JWT** for API; NextAuth (optional) or custom auth for web UI
- Payments: **Stripe** (Checkout + webhooks)
- AI: **OpenAI API** (for summaries and scoring) or hosted model
- External data: CarFax API, AutoCheck API, NMVTIS provider, BidFax/Stat.vin, NICB, NHTSA
- Logging/Monitoring: **Sentry**, **Prometheus/Grafana** (optional)
- CI/CD: **GitHub Actions**
- Hosting: Frontend on **Vercel**, Backend on **Render / Railway / AWS ECS / GCP Cloud Run**

---

## 3 — High-level architecture

```
[Frontend Vercel] <--> [API Gateway / FastAPI Controller] <--> {Microservices}
                                     |-> VIN Fetcher (parallel fetches to external APIs)
                                     |-> AI Analysis Service
                                     |-> Billing Service (Stripe)
                                     |-> Cache/Storage (Postgres + S3 + Redis)
                                     |-> Worker Queue (Celery)

Admin UI <--> Backend
Cron Jobs (cache refresh) -> Worker
```

Notes:
- VIN Controller orchestrates parallel calls to external APIs and returns a merged JSON.
- Heavy/slow jobs (image downloads, PDF generation, scraping) are offloaded to background workers with status polling via websocket or polling endpoints.

---

## 4 — Database schema (concise)

### `users`
- id UUID (PK)
- email TEXT UNIQUE
- hashed_password TEXT
- role ENUM('user','admin')
- credits INT DEFAULT 0
- created_at TIMESTAMP
- updated_at TIMESTAMP

### `vin_requests`
- id UUID
- user_id UUID FK -> users
- vin VARCHAR(17)
- status ENUM('pending','processing','done','failed')
- source_summary JSONB
- ai_summary TEXT
- credits_used INT
- created_at TIMESTAMP
- updated_at TIMESTAMP

### `reports_cache`
- vin VARCHAR(17) PRIMARY KEY
- report_json JSONB
- last_checked TIMESTAMP
- ttl_seconds INT

### `payments`
- id UUID
- user_id
- amount_cents INT
- stripe_payment_id TEXT
- status
- created_at

### `audit_logs`
- id, user_id, action, details JSONB, timestamp

---

## 5 — API spec (important endpoints)

All endpoints use JWT bearer tokens for user/private endpoints. Public landing pages served by Next.js.

### Auth
- `POST /api/auth/signup` — register (email/password) -> returns access token
- `POST /api/auth/login` — login -> token
- `GET /api/auth/me` — current user

### VIN requests
- `POST /api/v1/lookup` — body `{ vin: string }` -> deduct credits, create vin_request, enqueue worker, return request_id + status
- `GET  /api/v1/lookup/{request_id}` — fetch request status + partial data
- `GET  /api/v1/report/{vin}` — returns cached report if available and valid

### Admin
- `GET /api/admin/stats` — revenue, top searches, failed fetches
- `POST /api/admin/refresh/{vin}` — force refresh cache

### Billing (webhooks)
- `POST /api/webhooks/stripe` — handle checkout.session.completed, invoice, disputes

### Misc
- `GET /api/v1/decoders/vin/{vin}` — decode VIN (NHTSA) for friendly model/year data

---

## 6 — Workflow / Sequence (runtime)

1. User submits VIN on frontend.
2. Frontend calls `POST /api/v1/lookup`.
3. Backend validates VIN (syntax + checksum). If invalid -> return error.
4. If user has credits, deduct immediate provisional credits and create `vin_request` with `pending`.
5. Enqueue job to Celery worker: worker runs `fetch_and_merge(vin)` which:
   - Parallel requests to CarFax, AutoCheck, NMVTIS, NICB, NHTSA, Stat.vin
   - Scrapes auction images if necessary (respect robots.txt)
   - Stores images in S3
   - Merges normalized response into canonical JSON schema
6. Worker calls AI service with merged JSON to produce `ai_summary`.
7. Worker writes `reports_cache` + full `vin_request` update status `done`.
8. Frontend polls `GET /api/v1/lookup/{request_id}` or uses websocket to receive completion.
9. User views report; can export PDF (enqueue PDF job) or download.

---

## 7 — Canonical merged JSON schema (example keys)

```json
{
  "vin":"KMHSW81UDDU148091",
  "decoded":{ "make":"Hyundai","model":"Veloster","year":2013 },
  "title_status":[{"source":"NMVTIS","status":"clean","notes":null}],
  "accidents":[{"date":"2024-03-01","severity":"minor","source":"CarFax","notes":"Rear bumper"}],
  "maintenance":[{"date":"2023-12-10","service":"oil change","mileage":45000,"source":"Dealer A"}],
  "auctions":[{"provider":"Copart","lot":"12345","date":"2024-01-05","photos":["s3://.../1.jpg"]}],
  "flood_indicator": { "score": 0.12, "sources":["CarFax","NICB"] },
  "odometer_history":[{"date":"2022-01-01","mileage":42000}],
  "ai_summary":"Short human-friendly summary & red flags...",
  "raw_sources":{ "carfax": {...}, "autocheck": {...} }
}
```

---

## 8 — Starter code snippets

> NOTE: these are *starter* templates. Replace `...` with your API keys and business logic.

### FastAPI: `main.py` (skeleton)

```python
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from services.vin_service import enqueue_vin_lookup
from auth import get_current_user

app = FastAPI()

class LookupRequest(BaseModel):
    vin: str

@app.post('/api/v1/lookup')
async def lookup(req: LookupRequest, user=Depends(get_current_user)):
    # validate vin length & checksum
    # check credits
    request_id = await enqueue_vin_lookup(user.id, req.vin)
    return { 'request_id': request_id, 'status':'pending' }
```

### Celery worker task (simplified)

```python
from celery import Celery
from services.fetchers import fetch_all_sources
from services.ai import analyze_report
from db import save_report

celery = Celery(...)

@celery.task
def process_vin(request_id, vin, user_id):
    merged = fetch_all_sources(vin)
    ai = analyze_report(merged)
    merged['ai_summary'] = ai
    save_report(request_id, vin, merged)
    return True
```

### Stripe checkout session creation (backend)

```python
import stripe
stripe.api_key = os.getenv('STRIPE_KEY')

@app.post('/api/stripe/create-checkout')
def create_checkout(session: dict, user=Depends(get_current_user)):
    checkout = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{ 'price': os.getenv('STRIPE_PRICE_ID'), 'quantity':1 }],
        mode='payment',
        success_url=os.getenv('FRONTEND_URL') + '/payments/success',
        cancel_url=os.getenv('FRONTEND_URL') + '/payments/cancel',
        metadata={'user_id': str(user.id)}
    )
    return {'url': checkout.url}
```

### Next.js: simple VIN submission component (app/page)

```tsx
'use client'
import { useState } from 'react'

export default function Lookup() {
  const [vin, setVin] = useState('')
  async function submit() {
    const res = await fetch('/api/v1/lookup', { method:'POST', body: JSON.stringify({ vin }), headers:{ 'Content-Type':'application/json' } })
    const data = await res.json()
    // navigate to report page with request_id
  }
  return (
    <div className="p-4">
      <input value={vin} onChange={e=>setVin(e.target.value)} placeholder="Enter VIN" />
      <button onClick={submit}>Check VIN</button>
    </div>
  )
}
```

---

## 9 — Caching & Cost control

- Cache reports for `X` days (configurable). Charge less credits for cached reports.
- Rate-limit users with per-minute and per-day caps.
- Use `reports_cache.ttl_seconds` for eviction policy.
- For expensive providers (CarFax), only call them when user requests a "deep" lookup and show pricing accordingly.

---

## 10 — Security & Privacy

- Store secrets in environment variables and secret manager (Vercel/Render/AWS Secrets Manager).
- Use HTTPS everywhere.
- Encrypt sensitive PII at rest if required.
- Implement logging and monitoring; store audit logs for admin.
- Make a public privacy policy and maintain retention rules (e.g., purge raw reports older than 2 years unless user requests retention).

---

## 11 — Testing

- Unit tests for VIN validator, fetchers and merge logic.
- Integration tests faking external APIs with VCR-like fixtures or local mock servers.
- End-to-end tests: Playwright for the Next.js UI.

---

## 12 — CI/CD + Deployment

- GitHub Actions pipeline:
  - Lint, unit tests, build.
  - Build Docker image for backend and push to registry.
  - Vercel auto-deploy for frontend on push to `main`.
  - Trigger rolling deploy for backend (Render/Cloud Run).

---

## 13 — Observability

- Sentry for errors.
- Prometheus + Grafana or Render metrics for request/timeouts and Celery queue depth.
- Daily cron to alert on cache hit ratio and failed external API calls.

---

## 14 — Throttling & Backoff

- Use exponential backoff when external APIs return 429.
- Circuit breaker around unreliable providers to avoid queue pileup.

---

## 15 — Legal & Licensing

- Ensure you have terms & conditions for using CarFax / AutoCheck APIs and follow their TOS.
- Consider rate limits and forbidden scraping per provider TOS. Use licensed providers where necessary.

---

## 16 — Deliverables I can generate next (pick one or I'll start with backend skeleton)

- Full backend repo (FastAPI) with: auth, billing webhooks, vin lookup orchestration, celery tasks, db models and tests.
- Full frontend repo (Next.js) with UI, report pages, PDF export.
- Docker-compose for local dev and production manifests (Render/Cloud Run examples).
- CI pipeline (GitHub Actions) + infra as code sample (Terraform for RDS/S3 + IAM roles).

---

## 17 — Environment variables (starter list)

```
DATABASE_URL=postgres://...
REDIS_URL=redis://...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=...
STRIPE_KEY=...
STRIPE_WEBHOOK_SECRET=...
OPENAI_API_KEY=...
CARFAX_API_KEY=...
AUTOCHECK_API_KEY=...
NMVTIS_API_KEY=...
JWT_SECRET=...
FRONTEND_URL=https://app.example.com
```

---

## 18 — Estimated MVP feature list for Phase 1

- VIN lookup (CarFax/NMVTIS/NICB/NHTSA)
- AI summary
- User signup/login
- Credits system + Stripe checkout
- PDF export
- Report cache
- Admin basic stats

---

### Appendix: Useful implementation tips

- Normalize dates in UTC ISO format.
- Use `asyncio.gather` + HTTPX for parallel external requests.
- Keep raw provider response in `raw_sources` for debugging.
- Use content hashing for images to avoid duplicate S3 uploads.

---

If you'd like, I can **generate the full backend codebase now** (FastAPI + Celery + DB models + tests) or the **frontend codebase** next. Tell me which to start with and I will scaffold it in the repo format.

