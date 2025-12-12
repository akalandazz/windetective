from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

from enums import TaskStatus

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
    report_data: Dict[str, Any]
    generated_at: datetime
    providers_used: List[str]
    confidence_score: float  # 0-1, how complete the data is

class ReportTaskResult(BaseModel):
    message: str
    status: TaskStatus
    result: Optional[ReportResponse] = None


class CeleryTask(BaseModel):
    id: str