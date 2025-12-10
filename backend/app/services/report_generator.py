from openai import OpenAI
from models import ReportResponse
from services.data_aggregator import aggregate_car_data
from datetime import datetime
import os
import logging
import json

logger = logging.getLogger(__name__)

client = OpenAI(api_key=os.getenv("DEEPSEEK_API_KEY"), base_url="https://api.deepseek.com")

def generate_report(vin: str) -> ReportResponse:
    # Aggregate data from providers
    aggregated_data = aggregate_car_data(vin)

    # Calculate confidence score
    successful_providers = sum(1 for p in aggregated_data.providers if p.status == "success")
    confidence_score = successful_providers / len(aggregated_data.providers)

    # Prepare data for AI
    provider_summaries = []
    for provider in aggregated_data.providers:
        if provider.status == "success":
            provider_summaries.append(f"{provider.provider_name}: {provider.data}")
        else:
            provider_summaries.append(f"{provider.provider_name}: Data unavailable")

    data_summary = "\n".join(provider_summaries)

    # AI prompt
    prompt = f"""
    Generate a detailed JSON report for vehicle VIN: {vin}

    Data from providers:
    {data_summary}

    Create a JSON object with the following structure:
    {{
        "vehicle_identification": {{
            "vin": "{vin}",
            "make": "string",
            "model": "string",
            "year": number,
            "engine": "string",
            "transmission": "string"
        }},
        "accident_history": {{
            "total_accidents": number,
            "severity": "none|minor|moderate|severe",
            "structural_damage": boolean,
            "flood_damage": boolean,
            "accidents": [array of accident objects with date, severity, description]
        }},
        "ownership_history": {{
            "total_owners": number,
            "average_ownership_duration_months": number,
            "commercial_use": boolean,
            "rental_history": boolean,
            "owners": [array of owner objects with duration, location]
        }},
        "title_status": {{
            "status": "clean|salvage|rebuilt|flood|lemon",
            "issues": [array of strings],
            "state_issued": "string"
        }},
        "recalls": {{
            "total_recalls": number,
            "open_recalls": number,
            "safety_recalls": number,
            "recall_list": [array of recall objects with number, date, component, description, status]
        }},
        "maintenance": {{
            "regular_maintenance": boolean,
            "total_services": number,
            "overdue_services": [array of strings],
            "last_service": {{
                "date": "string",
                "mileage": number,
                "type": "string"
            }}
        }},
        "insurance_claims": {{
            "total_claims": number,
            "claims_severity": "low|medium|high",
            "claims": [array of claim objects with date, type, amount, description]
        }},
        "overall_assessment": {{
            "condition": "excellent|good|fair|poor",
            "risk_level": "low|medium|high",
            "recommended_action": "buy|negotiate|inspect|avoid",
            "key_findings": [array of strings],
            "estimated_value": {{
                "min": number,
                "max": number,
                "currency": "USD"
            }},
            "confidence": number
        }}
    }}

    Fill in the actual data based on the provider information. Use reasonable defaults where data is unavailable.
    Return only valid JSON, no additional text.
    """

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            stream=False
        )
        report_json_str = response.choices[0].message.content.strip()
        logger.info(f"AI response: {report_json_str[:500]}...")  # Log first 500 chars
        report_data = json.loads(report_json_str)
        logger.info("JSON parsing successful")
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing failed: {e}")
        logger.error(f"Raw response: {report_json_str}")
        report_data = {
            "error": "Failed to parse AI response as JSON",
            "raw_response": report_json_str
        }
    except Exception as e:
        logger.error(f"AI generation failed: {e}")
        report_data = {
            "error": f"Unable to generate AI report due to error: {str(e)}"
        }

    return ReportResponse(
        vin=vin,
        report_data=report_data,
        generated_at=datetime.utcnow(),
        providers_used=[p.provider_name for p in aggregated_data.providers if p.status == "success"],
        confidence_score=confidence_score
    )