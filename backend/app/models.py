from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ReportRequest(BaseModel):
    vin: str

class ProviderData(BaseModel):
    provider_name: str
    data: Dict[str, Any]
    retrieved_at: datetime
    status: str  # "success", "error", "partial"

class AggregatedData(BaseModel):
    vin: str
    providers: List[ProviderData]
    aggregated_at: datetime

class ReportResponse(BaseModel):
    vin: str
    report_html: str
    generated_at: datetime
    providers_used: List[str]
    confidence_score: float  # 0-1, how complete the data is