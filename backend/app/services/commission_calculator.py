"""
Commission Calculator Service

Implements the commission matrix logic based on:
- Referrer's package tier
- Referee's package tier
- Commission level (1 or 2)
"""

# Commission Matrix: [referrer_package][referee_package][level]
COMMISSION_MATRIX = {
    "Silver": {
        "Silver": {1: 1875.0, 2: 150.0},
        "Gold": {1: 2375.0, 2: 350.0},
        "Platinum": {1: 2875.0, 2: 400.0}
    },
    "Gold": {
        "Silver": {1: 1875.0, 2: 200.0},
        "Gold": {1: 3375.0, 2: 400.0},
        "Platinum": {1: 3875.0, 2: 600.0}
    },
    "Platinum": {
        "Silver": {1: 1875.0, 2: 200.0},
        "Gold": {1: 3375.0, 2: 500.0},
        "Platinum": {1: 5625.0, 2: 1000.0}
    }
}


def calculate_commission(
    referrer_package: str,
    referee_package: str,
    level: int
) -> float:
    """
    Calculate commission amount based on the commission matrix
    
    Args:
        referrer_package: Package tier of the referrer (Silver/Gold/Platinum)
        referee_package: Package tier of the referee (Silver/Gold/Platinum)
        level: Commission level (1 for direct, 2 for indirect)
        
    Returns:
        Commission amount in INR
        
    Raises:
        ValueError: If invalid package names or level provided
    """
    if referrer_package not in COMMISSION_MATRIX:
        raise ValueError(f"Invalid referrer package: {referrer_package}")
    
    if referee_package not in COMMISSION_MATRIX[referrer_package]:
        raise ValueError(f"Invalid referee package: {referee_package}")
    
    if level not in [1, 2]:
        raise ValueError(f"Invalid commission level: {level}. Must be 1 or 2")
    
    commission = COMMISSION_MATRIX[referrer_package][referee_package][level]
    return commission


def get_commission_breakdown(referrer_package: str) -> dict:
    """
    Get complete commission breakdown for a referrer's package
    
    Args:
        referrer_package: Package tier of the referrer
        
    Returns:
        Dictionary with commission breakdown
    """
    if referrer_package not in COMMISSION_MATRIX:
        raise ValueError(f"Invalid referrer package: {referrer_package}")
    
    breakdown = {
        "package": referrer_package,
        "level_1": {},
        "level_2": {}
    }
    
    for referee_pkg in ["Silver", "Gold", "Platinum"]:
        breakdown["level_1"][referee_pkg] = COMMISSION_MATRIX[referrer_package][referee_pkg][1]
        breakdown["level_2"][referee_pkg] = COMMISSION_MATRIX[referrer_package][referee_pkg][2]
    
    return breakdown


def validate_commission_matrix():
    """
    Validate that the commission matrix is properly configured
    
    Returns:
        True if valid, raises ValueError if invalid
    """
    required_packages = ["Silver", "Gold", "Platinum"]
    required_levels = [1, 2]
    
    for referrer_pkg in required_packages:
        if referrer_pkg not in COMMISSION_MATRIX:
            raise ValueError(f"Missing referrer package: {referrer_pkg}")
        
        for referee_pkg in required_packages:
            if referee_pkg not in COMMISSION_MATRIX[referrer_pkg]:
                raise ValueError(f"Missing referee package: {referee_pkg} for referrer: {referrer_pkg}")
            
            for level in required_levels:
                if level not in COMMISSION_MATRIX[referrer_pkg][referee_pkg]:
                    raise ValueError(
                        f"Missing level {level} for referrer: {referrer_pkg}, referee: {referee_pkg}"
                    )
                
                commission = COMMISSION_MATRIX[referrer_pkg][referee_pkg][level]
                if not isinstance(commission, (int, float)) or commission < 0:
                    raise ValueError(
                        f"Invalid commission value for referrer: {referrer_pkg}, "
                        f"referee: {referee_pkg}, level: {level}"
                    )
    
    return True


# Validate matrix on import
validate_commission_matrix()

