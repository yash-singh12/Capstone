"""Geospatial helpers for PlaceLocal.AI."""

import math


EARTH_RADIUS_KM = 6371.0
SSTC_LOCATION = (21.208, 81.355)


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate the great-circle distance between two coordinates."""
    lat1_rad, lng1_rad = math.radians(lat1), math.radians(lng1)
    lat2_rad, lng2_rad = math.radians(lat2), math.radians(lng2)

    delta_lat = lat2_rad - lat1_rad
    delta_lng = lng2_rad - lng1_rad
    haversine = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2
    )
    return EARTH_RADIUS_KM * 2 * math.atan2(
        math.sqrt(haversine),
        math.sqrt(max(0.0, 1.0 - haversine)),
    )


def estimate_commute_minutes(
    distance_km: float,
    speed_kmh: float = 25.0,
    transfer_delay: float = 5.0,
) -> int:
    """Estimate commute duration with a travel multiplier and transfer delay."""
    if distance_km < 0:
        raise ValueError("distance_km cannot be negative")
    if speed_kmh <= 0:
        raise ValueError("speed_kmh must be greater than zero")
    if transfer_delay < 0:
        raise ValueError("transfer_delay cannot be negative")

    distance_adjusted = distance_km * 1.25
    return round((distance_adjusted / speed_kmh) * 60 + transfer_delay)
