# XP Service for awarding experience points to user avatars and calculating progression

import logging
import random
from datetime import datetime, date
from typing import Optional, List

logger = logging.getLogger(__name__)


# Generate random XP for a workout (between 5 and 49)
# Returns:
#   Random XP amount
def generate_random_workout_xp() -> int:
    return random.randint(5, 49)


# Calculate XP based on workout duration in minutes
# Args:
#   duration_minutes: Duration of workout in minutes
# Returns:
#   XP amount (5 XP per minute, minimum 5)
def calculate_xp_from_duration(duration_minutes: int) -> int:
    return max(5, duration_minutes * 5)


# Calculate XP reward for completing a goal
# Args:
#   target_value: The target value of the goal
#   difficulty_multiplier: Optional multiplier for goal difficulty (default: 1.0)
# Returns:
#   XP amount to award (base: 50 XP, scales with target)
def calculate_goal_completion_xp(target_value: int, difficulty_multiplier: float = 1.0) -> int:
    base_xp = 50
    # Scale XP based on target value (add 10 XP per 100 units of target)
    scaled_xp = base_xp + (target_value // 100) * 10
    return int(scaled_xp * difficulty_multiplier)


# Calculate bonus XP for maintaining a streak
# Args:
#   streak_count: Current streak count
#   streak_type: Type of streak (e.g., 'workout', 'daily')
# Returns:
#   Bonus XP amount (increases with longer streaks)
def calculate_streak_bonus_xp(streak_count: int, streak_type: str = 'workout') -> int:
    base_bonus = 10
    # Bonus increases by 5 XP per week of streak (every 7 days)
    milestone_bonus = (streak_count // 7) * 5
    return base_bonus + milestone_bonus


# Calculate today's progress from a list of all workouts
# Args:
#   all_workouts: List of workout entities
# Returns:
#   Dictionary with workouts_count, minutes, and xp_earned
def calculate_today_progress(all_workouts: List) -> dict:
    today = date.today()
    today_workouts = [w for w in all_workouts if w.start.date() == today and w.end is not None]
    
    total_minutes = 0
    total_xp = 0
    
    for workout in today_workouts:
        duration_minutes = int((workout.end - workout.start).total_seconds() / 60)
        total_minutes += duration_minutes
        # Use stored xp_awarded if available, otherwise 0
        total_xp += workout.xp_awarded if workout.xp_awarded is not None else 0
    
    return {
        'workouts_count': len(today_workouts),
        'minutes': total_minutes,
        'xp_earned': total_xp
    }


# Calculate XP progression metrics for a given level and XP amount
# Args:
#   level: Current level of the avatar
#   xp: Current total XP of the avatar
#   xp_per_level: XP required per level (default: 100)
# Returns:
#   dict containing:
#     - current_level_xp: XP threshold for current level
#     - next_level_xp: XP threshold for next level
#     - xp_progress: Progress percentage toward next level (0-100)
def calculate_xp_progression(level: int, xp: int, xp_per_level: int = 100) -> dict:
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


# Service for calculating and awarding XP to user avatars
class XPService:
    
    XP_PER_MINUTE = 5
    MINIMUM_XP = 5
    XP_PER_LEVEL = 100
    
    def __init__(self, user_avatar_repo):
        self.user_avatar_repo = user_avatar_repo
    
    # Calculate XP based on workout duration
    # Args:
    #   start_time: Workout start timestamp
    #   end_time: Workout end timestamp
    # Returns:
    #   XP amount to award
    def calculate_workout_xp(self, start_time: datetime, end_time: datetime) -> int:
        duration_seconds = (end_time - start_time).total_seconds()
        duration_minutes = int(duration_seconds / 60)
        xp_awarded = max(self.MINIMUM_XP, duration_minutes * self.XP_PER_MINUTE)
        
        logger.info(f"[XP_SERVICE] Calculated XP")
        logger.info(f"[XP_SERVICE]   - Duration: {duration_minutes} minutes")
        logger.info(f"[XP_SERVICE]   - XP: {xp_awarded}")
        
        return xp_awarded
    
    # Calculate level based on total XP
    # Args:
    #   total_xp: Total XP amount
    # Returns:
    #   Calculated level
    def calculate_level(self, total_xp: int) -> int:
        return (total_xp // self.XP_PER_LEVEL) + 1
    
    # Award XP to a user's avatar and update level if needed
    # Args:
    #   user_id: User ID to award XP to
    #   xp_amount: Amount of XP to award
    # Returns:
    #   Dictionary with old and new XP/level values, or None if failed
    def award_xp(self, user_id: int, xp_amount: int) -> Optional[dict]:
        try:
            avatar = self.user_avatar_repo.fetchAvatarByUserId(user_id)
            
            if not avatar:
                logger.warning(f"[XP_SERVICE] No avatar found for user {user_id}")
                return None
            
            old_xp = avatar.xp
            old_level = avatar.level
            
            logger.info(f"[XP_SERVICE] Awarding XP to user {user_id}")
            logger.info(f"[XP_SERVICE]   - Current XP: {old_xp}")
            logger.info(f"[XP_SERVICE]   - Current Level: {old_level}")
            logger.info(f"[XP_SERVICE]   - XP to award: {xp_amount}")
            
            # Calculate new values
            new_xp = old_xp + xp_amount
            new_level = self.calculate_level(new_xp)
            
            # Update avatar
            logger.info(f"[XP_SERVICE] Preparing avatar update")
            logger.info(f"[XP_SERVICE]   - user_avatar_id: {avatar.user_avatar_id}")
            logger.info(f"[XP_SERVICE]   - user_id: {avatar.user_id}")
            logger.info(f"[XP_SERVICE]   - old values: xp={old_xp}, level={old_level}")
            logger.info(f"[XP_SERVICE]   - new values: xp={new_xp}, level={new_level}")
            
            # Use partial update to only modify XP and level (preserves is_active and other fields)
            logger.info(f"[XP_SERVICE] Calling repository partial update...")
            result = self.user_avatar_repo.updateUserAvatarFields(
                avatar.user_avatar_id,
                {'xp': new_xp, 'level': new_level}
            )
            logger.info(f"[XP_SERVICE] Repository returned: user_avatar_id={result.user_avatar_id}, xp={result.xp}, level={result.level}")
            
            logger.info(f"[XP_SERVICE] ✓ XP awarded successfully")
            logger.info(f"[XP_SERVICE]   - New XP: {new_xp}")
            logger.info(f"[XP_SERVICE]   - New Level: {new_level}")
            
            return {
                'old_xp': old_xp,
                'old_level': old_level,
                'new_xp': new_xp,
                'new_level': new_level,
                'xp_awarded': xp_amount
            }
            
        except Exception as e:
            logger.error(f"[XP_SERVICE] Error awarding XP: {e}")
            return None
