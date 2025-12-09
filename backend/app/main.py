from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from services.vin_validator import validate_vin
from services.report_generator import generate_report
from models import ReportRequest, ReportResponse
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Car History AI Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/generate-report", response_model=ReportResponse)
def generate_car_report(request: ReportRequest):

    # --- 1. Validate VIN ---
    if not validate_vin(request.vin):
        raise HTTPException(status_code=400, detail="Invalid VIN format")

    try:
        # --- 2. Generate report ---
        report = generate_report(request.vin)

        # Ensure correct return type
        if isinstance(report, dict):
            return ReportResponse(**report)

        return report

    except HTTPException:
        # Allow FastAPI errors to pass through untouched
        raise

    except Exception as e:
        logger.exception("Unexpected error generating report")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
