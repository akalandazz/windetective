from openai import OpenAI
from models import ReportResponse
from services.data_aggregator import aggregate_car_data
from datetime import datetime
import os
import logging

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
    Generate a detailed HTML report for vehicle VIN: {vin}

    Data from providers:
    {data_summary}

    Create an HTML report that includes:
    - Vehicle identification information
    - Accident and damage history
    - Ownership history
    - Title and registration status
    - Any potential issues or red flags
    - Overall assessment and recommendations

    Format as clean HTML with sections, headings, and bullet points.
    Highlight any concerning findings in red.
    """

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            stream=False
        )
        report_html = response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"AI generation failed: {e}")
        report_html = f"<h1>Report for VIN {vin}</h1><p>Unable to generate AI report due to error.</p>"

    return ReportResponse(
        vin=vin,
        report_html=report_html,
        generated_at=datetime.utcnow(),
        providers_used=[p.provider_name for p in aggregated_data.providers if p.status == "success"],
        confidence_score=confidence_score
    )