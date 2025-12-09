def validate_vin(vin: str) -> bool:
    """
    Validates a Vehicle Identification Number (VIN) according to ISO 3779.
    """

    if not isinstance(vin, str) or len(vin) != 17:
        return False

    vin = vin.upper()

    # Disallowed characters
    if any(c in "IOQ" for c in vin):
        return False

    # ISO 3779 transliteration table
    transliteration = {
        "A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7, "H": 8,
        "J": 1, "K": 2, "L": 3, "M": 4, "N": 5, "P": 7, "R": 9,
        "S": 2, "T": 3, "U": 4, "V": 5, "W": 6, "X": 7, "Y": 8, "Z": 9,
    }

    # Standard VIN weights
    weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]

    total = 0
    for i, char in enumerate(vin):
        if char.isdigit():
            value = int(char)
        elif char.isalpha():
            value = transliteration.get(char)
            if value is None:
                return False
        else:
            return False

        total += value * weights[i]

    # Compute check digit
    remainder = total % 11
    check_digit = "X" if remainder == 10 else str(remainder)

    return vin[8] == check_digit
