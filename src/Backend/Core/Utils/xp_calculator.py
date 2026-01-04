"""
XP Calculation Utilities for TOMI Avatar System
"""

def calculate_xp_progression(level: int, xp: int, xp_per_level: int = 100) -> dict:
    """
    Calculate XP progression metrics for a given level and XP amount.
    
    Args:
        level: Current level of the avatar
        xp: Current total XP of the avatar
        xp_per_level: XP required per level (default: 100)
    
    Returns:
        dict containing:
            - current_level_xp: XP threshold for current level
            - next_level_xp: XP threshold for next level
            - xp_progress: Progress percentage toward next level (0-100)
    """
    current_level_xp = (level - 1) * xp_per_level
    next_level_xp = level * xp_per_level
    xp_in_level = xp - current_level_xp
    xp_needed = next_level_xp - current_level_xp
    xp_progress = (xp_in_level / xp_needed) * 100 if xp_needed > 0 else 0
    
    return {
        'current_level_xp': current_level_xp,
        'next_level_xp': next_level_xp,
        'xp_progress': xp_progress
    }
