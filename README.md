# Car History AI Agent

An AI-powered web application that generates detailed car history reports by aggregating data from multiple providers (Carfax, AutoCheck, ClearVin) using a VIN code.

## Features

- **VIN Validation**: Validates 17-character vehicle identification numbers
- **Multi-Provider Data Aggregation**: Collects data from Carfax, AutoCheck, and ClearVin
- **AI-Powered Reports**: Uses OpenAI GPT to generate comprehensive HTML reports
- **Confidence Scoring**: Indicates data completeness based on provider success rates
- **Responsive Web Interface**: Clean React frontend with Bootstrap styling

## Quick Start with Docker Compose

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd windetective
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Manual Development Setup

### Backend
```bash
cd backend/app
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## API Usage

### Generate Report
```bash
POST http://localhost:8000/api/generate-report
Content-Type: application/json

{
  "vin": "1HGBH41JXMN109186"
}
```

Response:
```json
{
  "vin": "1HGBH41JXMN109186",
  "report_html": "<html>...</html>",
  "generated_at": "2025-12-09T22:35:00",
  "providers_used": ["Carfax", "AutoCheck", "ClearVin"],
  "confidence_score": 1.0
}
```

## Architecture

- **Backend**: FastAPI with async operations
- **Frontend**: React with hooks and Bootstrap
- **AI**: OpenAI GPT-3.5 for report generation
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for development

## Security

- API keys stored in environment variables
- Input validation and sanitization
- CORS configured for frontend
- Error handling with logging

## Future Enhancements

- Database caching with PostgreSQL
- Redis for session management
- Real provider API integrations
- User authentication
- Report history and favorites