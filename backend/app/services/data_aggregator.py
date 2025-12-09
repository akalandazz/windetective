from datetime import datetime
import logging
from models import AggregatedData, ProviderData
from providers.carfax import fetch_carfax_data
from providers.clearwin import fetch_clearwin_data

logger = logging.getLogger(__name__)

def aggregate_car_data(vin: str) -> AggregatedData:
    """
    Aggregate vehicle data from multiple providers (Carfax and ClearWin).
    """
    providers_data = []
    aggregated_at = datetime.utcnow()

    # Fetch from Carfax
    try:
        carfax_data = fetch_carfax_data(vin)
        providers_data.append(ProviderData(
            provider_name="Carfax",
            data=carfax_data,
            retrieved_at=datetime.utcnow(),
            status="success"
        ))
    except Exception as e:
        logger.warning(f"Failed to fetch from Carfax: {e}")
        providers_data.append(ProviderData(
            provider_name="Carfax",
            data={},
            retrieved_at=datetime.utcnow(),
            status="error"
        ))

    # Fetch from ClearWin
    try:
        clearwin_data = fetch_clearwin_data(vin)
        providers_data.append(ProviderData(
            provider_name="ClearWin",
            data=clearwin_data,
            retrieved_at=datetime.utcnow(),
            status="success"
        ))
    except Exception as e:
        logger.warning(f"Failed to fetch from ClearWin: {e}")
        providers_data.append(ProviderData(
            provider_name="ClearWin",
            data={},
            retrieved_at=datetime.utcnow(),
            status="error"
        ))

    return AggregatedData(
        vin=vin,
        providers=providers_data,
        aggregated_at=aggregated_at
    )