from typing import List, Optional
import logging

from ...Infrastructure.Repository.StreakRepository import StreakRepository
from ...Infrastructure.Repository.UserRepository import UserRepository
from ...Infrastructure.Repository.WorkoutRepository import WorkoutRepository
from ...Infrastructure.Repository.ProfileRepository import ProfileRepository
from ...Core.DTO.StreakDTO import StreakResponseDTO, StreakCreateDTO, StreakUpdateDTO, UserStreakDTO
from ...Core.Entity.StreakEntity import StreakEntity
from ...Core.Entity.UserEntity import UserEntity
from ...Core.Utils.xp_utils import calculate_streak_bonus_xp
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class StreakService:
    def __init__(self):
        self.streak_repository = StreakRepository()
        self.user_repository = UserRepository()
        self.workout_repository = WorkoutRepository()
        self.profile_repository = ProfileRepository()
    
    def get_all_streaks(self) -> List[StreakResponseDTO]:
        """Get all streaks in the system"""
        try:
            streaks = self.streak_repository.getAll()
            return [self._map_streak_to_response_dto(streak) for streak in streaks]
        except Exception as e:
            logger.error(f"Error fetching all streaks: {e}")
            raise Exception(f"Failed to fetch streaks: {str(e)}")
    
    def get_streak_by_id(self, streak_id: int) -> StreakResponseDTO:
        """Get a specific streak by ID"""
        try:
            streak = self.streak_repository.getById(streak_id)
            if not streak:
                raise ValueError(f"Streak with ID {streak_id} not found")
            return self._map_streak_to_response_dto(streak)
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error fetching streak {streak_id}: {e}")
            raise Exception(f"Failed to fetch streak: {str(e)}")
    
    def get_user_streaks(self, user_id: int) -> List[UserStreakDTO]:
        """Get all streaks for a specific user"""
        try:
            # Verify user exists
            user = self.user_repository.getById(user_id)
            if not user:
                raise ValueError(f"User with ID {user_id} not found")
            
            streaks = self.streak_repository.getByUserId(user_id)
            user_streaks = []
            
            for streak in streaks:
                # Check if streak is currently active
                is_active = self._is_streak_active(streak, user_id)
                
                user_streak = UserStreakDTO(
                    streakId=streak.streakId,
                    userId=streak.userId,
                    streakType=streak.streakType,
                    currentCount=streak.currentCount,
                    longestCount=streak.longestCount,
                    isActive=is_active,
                    lastActivityDate=streak.lastActivityDate,
                    startDate=streak.startDate,
                    createdAt=streak.createdAt
                )
                user_streaks.append(user_streak)
            
            return user_streaks
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error fetching streaks for user {user_id}: {e}")
            raise Exception(f"Failed to fetch user streaks: {str(e)}")
    
    def get_current_user_streak(self, user_id: int, streak_type: str = "workout") -> Optional[UserStreakDTO]:
        """Get the current active streak for a user by type"""
        try:
            # Verify user exists
            user = self.user_repository.getById(user_id)
            if not user:
                raise ValueError(f"User with ID {user_id} not found")
            
            streak = self.streak_repository.getByUserIdAndType(user_id, streak_type)
            if not streak:
                return None
            
            is_active = self._is_streak_active(streak, user_id)
            
            return UserStreakDTO(
                streakId=streak.streakId,
                userId=streak.userId,
                streakType=streak.streakType,
                currentCount=streak.currentCount,
                longestCount=streak.longestCount,
                isActive=is_active,
                lastActivityDate=streak.lastActivityDate,
                startDate=streak.startDate,
                createdAt=streak.createdAt
            )
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error fetching current streak for user {user_id}: {e}")
            raise Exception(f"Failed to fetch current streak: {str(e)}")
    
    def create_streak(self, streak_data: StreakCreateDTO) -> StreakResponseDTO:
        """Create a new streak"""
        try:
            # Verify user exists
            user = self.user_repository.getById(streak_data.userId)
            if not user:
                raise ValueError(f"User with ID {streak_data.userId} not found")
            
            # Check if user already has a streak of this type
            existing_streak = self.streak_repository.getByUserIdAndType(streak_data.userId, streak_data.streakType)
            if existing_streak:
                raise ValueError(f"User already has a {streak_data.streakType} streak")
            
            # Create the streak entity
            streak_entity = StreakEntity(
                userId=streak_data.userId,
                streakType=streak_data.streakType,
                currentCount=streak_data.currentCount or 0,
                longestCount=streak_data.longestCount or 0,
                lastActivityDate=streak_data.lastActivityDate or datetime.now(),
                startDate=streak_data.startDate or datetime.now()
            )
            
            # Save the streak
            created_streak = self.streak_repository.create(streak_entity)
            return self._map_streak_to_response_dto(created_streak)
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error creating streak: {e}")
            raise Exception(f"Failed to create streak: {str(e)}")
    
    def update_streak(self, streak_id: int, streak_data: StreakUpdateDTO) -> StreakResponseDTO:
        """Update an existing streak"""
        try:
            # Check if streak exists
            existing_streak = self.streak_repository.getById(streak_id)
            if not existing_streak:
                raise ValueError(f"Streak with ID {streak_id} not found")
            
            # Update streak fields
            if streak_data.currentCount is not None:
                existing_streak.currentCount = streak_data.currentCount
            if streak_data.longestCount is not None:
                existing_streak.longestCount = streak_data.longestCount
            if streak_data.lastActivityDate is not None:
                existing_streak.lastActivityDate = streak_data.lastActivityDate
            
            # Save updated streak
            updated_streak = self.streak_repository.update(existing_streak)
            return self._map_streak_to_response_dto(updated_streak)
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error updating streak {streak_id}: {e}")
            raise Exception(f"Failed to update streak: {str(e)}")
    
    def delete_streak(self, streak_id: int) -> dict:
        """Delete a streak"""
        try:
            streak = self.streak_repository.getById(streak_id)
            if not streak:
                raise ValueError(f"Streak with ID {streak_id} not found")
            
            self.streak_repository.delete(streak_id)
            return {"message": f"Streak {streak_id} deleted successfully"}
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error deleting streak {streak_id}: {e}")
            raise Exception(f"Failed to delete streak: {str(e)}")
    
    def increment_workout_streak(self, user_id: int) -> UserStreakDTO:
        """Increment a user's workout streak when they complete a workout"""
        try:
            # Get or create workout streak
            streak = self.streak_repository.getByUserIdAndType(user_id, "workout")
            
            if not streak:
                # Create new streak
                streak_entity = StreakEntity(
                    userId=user_id,
                    streakType="workout",
                    currentCount=1,
                    longestCount=1,
                    lastActivityDate=datetime.now(),
                    startDate=datetime.now()
                )
                streak = self.streak_repository.create(streak_entity)
            else:
                # Check if the last activity was yesterday or today
                today = datetime.now().date()
                last_activity = streak.lastActivityDate.date() if streak.lastActivityDate else None
                
                if last_activity == today:
                    # Already worked out today, don't increment
                    pass
                elif last_activity == today - timedelta(days=1):
                    # Worked out yesterday, continue streak
                    streak.currentCount += 1
                    streak.lastActivityDate = datetime.now()
                    
                    # Update longest count if current surpasses it
                    if streak.currentCount > streak.longestCount:
                        streak.longestCount = streak.currentCount
                        
                        # Award XP bonus for new longest streak
                        xp_bonus = calculate_streak_bonus_xp(streak.currentCount)
                        profile = self.profile_repository.getByUserId(user_id)
                        if profile:
                            profile.xp += xp_bonus
                            self.profile_repository.update(profile)
                    
                    streak = self.streak_repository.update(streak)
                else:
                    # Streak broken, restart
                    streak.currentCount = 1
                    streak.lastActivityDate = datetime.now()
                    streak.startDate = datetime.now()
                    streak = self.streak_repository.update(streak)
            
            is_active = self._is_streak_active(streak, user_id)
            
            return UserStreakDTO(
                streakId=streak.streakId,
                userId=streak.userId,
                streakType=streak.streakType,
                currentCount=streak.currentCount,
                longestCount=streak.longestCount,
                isActive=is_active,
                lastActivityDate=streak.lastActivityDate,
                startDate=streak.startDate,
                createdAt=streak.createdAt
            )
            
        except Exception as e:
            logger.error(f"Error incrementing workout streak for user {user_id}: {e}")
            raise Exception(f"Failed to increment workout streak: {str(e)}")
    
    def check_and_break_streaks(self, user_id: int) -> List[str]:
        """Check if any streaks should be broken due to inactivity"""
        try:
            user_streaks = self.streak_repository.getByUserId(user_id)
            broken_streaks = []
            
            for streak in user_streaks:
                if not self._is_streak_active(streak, user_id):
                    if streak.currentCount > 0:
                        streak.currentCount = 0
                        self.streak_repository.update(streak)
                        broken_streaks.append(streak.streakType)
            
            return broken_streaks
            
        except Exception as e:
            logger.error(f"Error checking streaks for user {user_id}: {e}")
            raise Exception(f"Failed to check streaks: {str(e)}")
    
    def _is_streak_active(self, streak: StreakEntity, user_id: int) -> bool:
        """Check if a streak is currently active based on recent activity"""
        if not streak.lastActivityDate:
            return False
        
        today = datetime.now().date()
        last_activity = streak.lastActivityDate.date()
        
        # Streak is active if last activity was today or yesterday
        return last_activity >= today - timedelta(days=1)
    
    def _map_streak_to_response_dto(self, streak: StreakEntity) -> StreakResponseDTO:
        """Map StreakEntity to StreakResponseDTO"""
        return StreakResponseDTO(
            streakId=streak.streakId,
            userId=streak.userId,
            streakType=streak.streakType,
            currentCount=streak.currentCount,
            longestCount=streak.longestCount,
            lastActivityDate=streak.lastActivityDate,
            startDate=streak.startDate,
            createdAt=streak.createdAt
        )