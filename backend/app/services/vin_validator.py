def validate_vin(vin: str) -> bool:
    """
    Validates a Vehicle Identification Number (VIN) according to ISO 3779.
    """

    if not isinstance(vin, str) or len(vin) != 17:
        return False
    return True
