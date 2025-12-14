# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WinDetective is an AI-powered vehicle history report generator that aggregates data from multiple automotive data providers (Carfax, ClearWin, NHTSA) and uses AI (DeepSeek) to generate comprehensive vehicle reports based on VIN codes.

**Tech Stack:**
- **Backend**: FastAPI (Python) with async operations
- **Frontend**: Next.js 16 (React 19) with TypeScript and Tailwind CSS v4
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Task Queue**: Celery with Redis as broker/backend
- **AI**: DeepSeek API (OpenAI-compatible) for report generation
- **Containerization**: Docker with Docker Compose orchestration

## Development Commands

### Docker Compose (Recommended for Full Stack)

```bash
# Start all services (database, redis, backend, frontend, celery-worker)
docker-compose up --build

# Stop all services
docker-compose down

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f celery-worker
```

Access points when running via Docker Compose:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: localhost:5432
- Redis: localhost:6379

### Backend Development

```bash
cd backend/app

# Install dependencies
pip install -r requirements.txt

# Run development server (requires Redis and PostgreSQL to be running)
python main.py

# Backend runs on http://localhost:8000
# Interactive API docs at http://localhost:8000/docs
```

### Frontend Development

```bash
cd frontend/webapp

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

Frontend runs on http://localhost:3000

### Environment Setup

The backend requires a `.env` file with the following critical variables:
- `DEEPSEEK_API_KEY`: Required for AI report generation
- `DATABASE_URL`: PostgreSQL connection string (default: sqlite for local dev)
- `CELERY_BROKER_URL`: Redis URL for Celery broker (default: redis://localhost:6379/0)
- `CELERY_RESULT_BACKEND`: Redis URL for Celery results (default: redis://localhost:6379/0)
- `AI_MOCK_RESPONSE`: Set to `true` for development without DeepSeek API calls

See `backend/app/settings.py` for all configuration options.

## Architecture

### Backend Architecture

**Entry Point**: `backend/app/main.py`
- Creates FastAPI app with CORS middleware
- Auto-creates database tables on startup using SQLAlchemy
- Registers routers: `/api/v1/reports` and `/api/v1/users`
- Health check endpoint: `/health`

**Key Layers:**
1. **Routers** (`routers/`): API endpoint definitions
   - `report_router.py`: Report generation and task status endpoints
   - `user_router.py`: User authentication and management

2. **Services** (`services/`):
   - `data_aggregator.py`: Parallel data fetching from multiple providers using ThreadPoolExecutor
   - `report_generator.py`: AI-powered report generation using DeepSeek
   - `vin_validator.py`: VIN format validation
   - `user_service.py`: User management logic

3. **Providers** (`providers/`): External API integrations
   - `carfax.py`, `clearwin.py`, `nhtsa.py`: Provider-specific data fetching
   - All providers are called in parallel via ThreadPoolExecutor

4. **Workers** (`workers/`):
   - `celeryapp.py`: Celery app configuration
   - `tasks.py`: Celery tasks for async report generation

5. **Database** (`database.py`):
   - SQLAlchemy engine and session management
   - `get_db()` dependency for request-scoped database sessions

6. **Models** (`models.py`):
   - Pydantic models for request/response validation
   - SQLAlchemy models for database tables (User table)

7. **Auth** (`auth/`):
   - JWT-based authentication
   - Argon2 password hashing via passlib
   - OAuth2 password bearer scheme

### Frontend Architecture

**Framework**: Next.js 16 with App Router

**Entry Point**: `frontend/webapp/app/page.tsx`
- Main landing page with VIN input form
- Report display with executive summary
- State management via custom `useReport` hook

**Key Patterns:**
1. **Component Structure**:
   - `app/`: Next.js app router pages and layouts
   - `components/`: Reusable UI components
     - `layout/`: Layout components (Container, MainLayout)
     - `ui/`: Radix UI-based primitives (NavigationMenu)
     - Feature components: VinInput, ExecutiveSummary, LoadingOverlay

2. **Styling**:
   - Tailwind CSS v4 with custom design tokens
   - Design system in `lib/design-system/tokens.ts`
   - CSS-in-JS via `class-variance-authority` for component variants

3. **API Communication**:
   - Custom hooks for report generation (`lib/hooks/use-report.ts`)
   - Polling pattern for Celery task status checking

## Key Workflows

### Report Generation Flow

1. **User submits VIN** → Frontend validates format (17 characters)
2. **POST /api/v1/reports/generate** → Backend validates VIN and creates Celery task
3. **Celery worker executes task**:
   - Calls `data_aggregator.aggregate_car_data(vin)` to fetch from all providers in parallel
   - Passes aggregated data to `report_generator.generate_report(vin)`
   - AI generates structured JSON report via DeepSeek API
   - Returns `ReportResponse` with report data and metadata
4. **Frontend polls GET /api/v1/reports/result/{task_id}** until status is "completed"
5. **Display report** → ExecutiveSummary component renders the results

### Data Aggregation Pattern

The `data_aggregator.py` uses **parallel execution** via `ThreadPoolExecutor`:
- Submits all provider fetch tasks concurrently
- Each provider wrapped in try/except to handle failures gracefully
- Returns `AggregatedData` with success/error status per provider
- Confidence score calculated based on successful providers

### Async Task Pattern

All report generation happens asynchronously via Celery:
- Prevents long-running API requests
- Returns task ID immediately to client
- Client polls for task completion
- Task states: PENDING → IN_PROGRESS → SUCCESS/FAILURE

## Important Technical Details

### Settings Management

All configuration in `backend/app/settings.py` using Pydantic Settings:
- Environment variables automatically loaded from `.env` file
- Type validation and defaults defined in Settings class
- Access via global `settings` instance

### Database Migrations

Currently uses `Base.metadata.create_all()` on startup (auto-migration):
- **Not recommended for production** - consider adding Alembic for proper migrations
- Tables are created based on SQLAlchemy models in `models.py`

### Authentication

JWT-based auth with Argon2 password hashing:
- Secret key configured via `JWT_SECRET_KEY` env var
- Token expiration: `ACCESS_TOKEN_EXPIRE_MINUTES` (default: 30 minutes)
- OAuth2 password bearer scheme for protected endpoints

### AI Report Generation

DeepSeek API (OpenAI-compatible) generates structured JSON reports:
- Prompt in `report_generator.py` defines comprehensive JSON schema
- AI fills in vehicle data based on aggregated provider information
- Falls back to mock data when `AI_MOCK_RESPONSE=true`
- Handles JSON parsing errors gracefully with error objects

### Multi-Language Support Branch

Current branch `multi-language-support` indicates internationalization work in progress.

## Development Notes

- **No test suite currently exists** - tests should be added for critical paths (VIN validation, report generation, data aggregation)
- **Provider APIs are currently mocked** - see `resources/mocks.py` for mock data patterns
- **Frontend detailed report sections are placeholders** - see `page.tsx:114-136` for "Coming Soon" view
- **Database uses SQLite by default** - switch to PostgreSQL for production via `DATABASE_URL`
- **Celery worker must be running** for report generation to work (starts automatically with docker-compose)
