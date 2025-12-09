from fastapi import APIRouter, HTTPException
from services.vin_validator import validate_vin
from services.report_generator import generate_report
from models import ReportRequest, ReportResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/generate", response_model=ReportResponse, tags=["report"])
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