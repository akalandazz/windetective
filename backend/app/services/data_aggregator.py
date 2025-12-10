from datetime import datetime
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from models import AggregatedData, ProviderData
from providers.carfax import fetch_carfax_data
from providers.clearwin import fetch_clearwin_data

logger = logging.getLogger(__name__)

def aggregate_car_data(vin: str) -> AggregatedData:
    """
    Aggregate vehicle data from multiple providers (Carfax and ClearWin) in parallel.
    """
    providers_data = []
    aggregated_at = datetime.utcnow()

    def fetch_provider(provider_name: str, fetch_func):
        try:
            data = fetch_func(vin)
            return ProviderData(
                provider_name=provider_name,
                data=data,
                retrieved_at=datetime.utcnow(),
                status="success"
            )
        except Exception as e:
            logger.warning(f"Failed to fetch from {provider_name}: {e}")
            return ProviderData(
                provider_name=provider_name,
                data={},
                retrieved_at=datetime.utcnow(),
                status="error"
            )

    with ThreadPoolExecutor() as executor:
        futures = [
            executor.submit(fetch_provider, "Carfax", fetch_carfax_data),
            executor.submit(fetch_provider, "ClearWin", fetch_clearwin_data)
        ]
        for future in as_completed(futures):
            providers_data.append(future.result())

    return AggregatedData(
        vin=vin,
        providers=providers_data,
        aggregated_at=aggregated_at
    )