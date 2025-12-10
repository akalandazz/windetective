import requests
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

def fetch_nhtsa_data(vin: str) -> Dict[str, Any]:
    """
    Fetch vehicle data from NHTSA VPIC API.
    """
    try:
        url = f"https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvaluesextended/{vin}?format=json"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        if 'Results' in data and data['Results']:
            vehicle_data = data['Results'][0]
            logger.info(f"Successfully fetched data from NHTSA for VIN {vin}")
            return vehicle_data
        else:
            raise ValueError("No vehicle data found in NHTSA response")

    except Exception as e:
        logger.error(f"Failed to fetch data from NHTSA for VIN {vin}: {e}")
        raise e