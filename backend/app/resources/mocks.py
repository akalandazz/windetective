from models import AggregatedData, ProviderData, ReportResponse
from datetime import datetime


AI_RESPONSE_MOCK = """
{
  "vehicle_identification": {
    "vin": "1HGBH41JXMN109186",
    "make": "Honda",
    "model": "Accord",
    "year": 2021,
    "engine": "1.5L Turbo I4",
    "transmission": "CVT Automatic"
  },
  "accident_history": {
    "total_accidents": 0,
    "severity": "none",
    "structural_damage": false,
    "flood_damage": false,
    "accidents": []
  },
  "ownership_history": {
    "total_owners": 1,
    "average_ownership_duration_months": 36,
    "commercial_use": false,
    "rental_history": false,
    "owners": [
      {
        "duration": 36,
        "location": "California"
      }
    ]
  },
  "title_status": {
    "status": "clean",
    "issues": [],
    "state_issued": "California"
  },
  "recalls": {
    "total_recalls": 0,
    "open_recalls": 0,
    "safety_recalls": 0,
    "recall_list": []
  },
  "maintenance": {
    "regular_maintenance": true,
    "total_services": 6,
    "overdue_services": [],
    "last_service": {
      "date": "2024-11-15",
      "mileage": 42000,
      "type": "Oil Change & Tire Rotation"
    }
  },
  "insurance_claims": {
    "total_claims": 0,
    "claims_severity": "low",
    "claims": []
  },
  "overall_assessment": {
    "condition": "excellent",
    "risk_level": "low",
    "recommended_action": "buy",
    "key_findings": [
      "Clean title with no accident history",
      "Single owner with regular maintenance",
      "No open recalls or safety concerns",
      "Well-maintained with documented service history"
    ],
    "estimated_value": {
      "min": 22000,
      "max": 25000,
      "currency": "USD"
    },
    "confidence": 0.92
  }
}
"""



def generate_mock_report(vin: str) -> ReportResponse:

    aggregated_at = datetime.utcnow()
    aggregated_data = AggregatedData(
            vin=vin,
            providers=[
                ProviderData(
                    provider_name="Carfax",
                    data={},
                    retrieved_at=aggregated_at,
                    status="success"
                )
            ],
            aggregated_at=aggregated_at
        )
    return ReportResponse(
        vin=vin,
        report_data=AI_RESPONSE_MOCK,
        generated_at=aggregated_at,
        providers_used=[p.provider_name for p in aggregated_data.providers if p.status == "success"],
        confidence_score=10
    )