from typing import Optional, List
from datetime import datetime, timedelta
import logging

from ..DTO.CommunityDTO import (
    FriendDashboardSummaryDTO,
    FriendVisitProfileDTO,
    FriendStatsDTO,
    FriendRecentWorkoutsDTO,
    FriendRecentWorkoutDTO
)
from ...Infrastructure.Repository.UserRepository import UserRepository
from ...Infrastructure.Repository.UserAvatarRepository import UserAvatarRepository
from ...Infrastructure.Repository.ProfileRepository import ProfileRepository
from ...Infrastructure.Repository.StreakRepository import StreakRepository
from ...Infrastructure.Repository.WorkoutRepository import WorkoutRepository
from ...Infrastructure.Repository.WorkoutTypeRepository import WorkoutTypeRepository
from .FriendshipService import FriendshipService
from .UserService import UserService

logger = logging.getLogger(__name__)

class FriendProfileService:
    def __init__(self):
        self.user_repo = UserRepository()
        self.user_avatar_repo = UserAvatarRepository()
        self.profile_repo = ProfileRepository()
        self.streak_repo = StreakRepository()
        self.workout_repo = WorkoutRepository()
        self.workout_type_repo = WorkoutTypeRepository()
        self.friendship_service = FriendshipService()
        self.user_service = UserService()
    
    def get_friend_dashboard_summary(self, friend_id: int, user_id: int) -> FriendDashboardSummaryDTO:
        """Get friend dashboard summary for friend visit page."""
        try:
            # Verify friendship exists
            if not self.friendship_service.verify_friendship_exists(user_id, friend_id):
                raise ValueError("Not friends with this user")
            
            # Get friend user details
            friend_user = self.user_service.get_user_by_id(friend_id)
            if not friend_user:
                raise ValueError("Friend not found")
            
            # Get friend's avatar info with fallbacks
            avatar_info = self._get_friend_avatar_info(friend_id, friend_user.name)
            
            # Calculate XP progression
            xp_metrics = self._calculate_xp_progression(avatar_info["level"], avatar_info["xp"])
            
            # Calculate streak
            streak_info = self._calculate_streak(friend_id)
            
            # Calculate "This Week" stats
            week_stats = self._calculate_week_stats(friend_id)
            
            # Build response
            return FriendDashboardSummaryDTO(
                userId=friend_user.user_id,
                displayName=friend_user.name,
                level=avatar_info["level"],
                avatarNickname=avatar_info["nickname"],
                avatarImageUrl=None,  # Low-fidelity: No avatar images
                themeColor=None,  # Low-fidelity: No theme colors
                xp={
                    "currentXp": avatar_info["xp"],
                    "nextLevelXp": xp_metrics["next_level_xp"],
                    "progress": xp_metrics["xp_progress"]
                },
                streak={
                    "days": streak_info["days"],
                    "label": streak_info["label"]
                },
                thisWeek={
                    "workoutsCount": week_stats["workouts_count"],
                    "minutesTotal": week_stats["minutes_total"],
                    "xpTotal": week_stats["xp_total"]
                }
            )
        except Exception as e:
            logger.error(f"Error getting friend dashboard summary: {e}")
            raise
    
    def get_friend_profile(self, friend_id: int, user_id: int) -> FriendVisitProfileDTO:
        """Get friend profile for visit page."""
        try:
            # Verify friendship exists
            if not self.friendship_service.verify_friendship_exists(user_id, friend_id):
                raise ValueError("Not friends with this user")
            
            # Get user info
            user = self.user_service.get_user_by_id(friend_id)
            if not user:
                raise ValueError("Friend not found")
            
            # Get avatar and profile info
            active_avatar = self.user_avatar_repo.fetchAvatarByUserId(friend_id)
            
            profile = None
            try:
                profile = self.profile_repo.fetchProfileByUserId(friend_id)
            except:
                logger.info(f"No profile found for user {friend_id}")
            
            return FriendVisitProfileDTO(
                userId=user.user_id,
                displayName=user.name,
                email=user.email,
                bio=profile.bio if profile else "",
                level=active_avatar.level if active_avatar else 1,
                xp=active_avatar.xp if active_avatar else 0,
                nickname=active_avatar.nickname if active_avatar else user.name,
                avatarImageUrl=None,  # Low-fidelity
                joinDate=user.created_at,
                isPrivate=profile.is_private if profile else False
            )
        except Exception as e:
            logger.error(f"Error getting friend profile: {e}")
            raise
    
    def get_friend_stats(self, friend_id: int, user_id: int, time_range: str = "week") -> FriendStatsDTO:
        """Get friend stats summary."""
        try:
            # Verify friendship and get basic info
            if not self.friendship_service.verify_friendship_exists(user_id, friend_id):
                raise ValueError("Not friends with this user")
            
            # Calculate time range
            end_date = datetime.now()
            if time_range == "week":
                start_date = end_date - timedelta(days=7)
            else:  # month
                start_date = end_date - timedelta(days=30)
            
            # Get workouts in range
            workouts = self._get_workouts_in_range(friend_id, start_date, end_date)
            
            # Calculate stats
            total_workouts = len(workouts)
            total_minutes = sum(
                int((w.end - w.start).total_seconds() / 60) if w.end and w.start else 0
                for w in workouts
            )
            total_xp = sum(w.xp_awarded for w in workouts if w.xp_awarded)
            avg_duration = total_minutes / total_workouts if total_workouts > 0 else 0
            
            return FriendStatsDTO(
                timeRange=time_range,
                totalWorkouts=total_workouts,
                totalMinutes=total_minutes,
                totalXp=total_xp,
                averageDuration=round(avg_duration, 1)
            )
        except Exception as e:
            logger.error(f"Error getting friend stats: {e}")
            raise
    
    def get_friend_recent_workouts(self, friend_id: int, user_id: int, limit: int = 5) -> FriendRecentWorkoutsDTO:
        """Get friend's recent workouts."""
        try:
            # Verify friendship
            if not self.friendship_service.verify_friendship_exists(user_id, friend_id):
                raise ValueError("Not friends with this user")
            
            # Get recent workouts
            all_workouts = self.workout_repo.fetchWorkoutsByUserId(friend_id)
            
            # Sort by date (most recent first) and limit
            recent_workouts = sorted(
                all_workouts, 
                key=lambda w: w.start if w.start else datetime.min, 
                reverse=True
            )[:limit]
            
            # Convert to DTOs
            workout_dtos = []
            for workout in recent_workouts:
                workout_type = self.workout_type_repo.fetchWorkoutTypeById(workout.workout_type_id)
                
                duration_minutes = 0
                if workout.start and workout.end:
                    duration_minutes = int((workout.end - workout.start).total_seconds() / 60)
                
                workout_dtos.append(FriendRecentWorkoutDTO(
                    id=workout.workout_id,
                    type=workout_type.name if workout_type else "Unknown",
                    startedAt=workout.start,
                    durationMinutes=duration_minutes,
                    xpEarned=workout.xp_awarded or 0
                ))
            
            return FriendRecentWorkoutsDTO(items=workout_dtos)
        except Exception as e:
            logger.error(f"Error getting friend recent workouts: {e}")
            raise
    
    def _get_friend_avatar_info(self, friend_id: int, fallback_name: str) -> dict:
        """Get friend avatar info with fallbacks for users without TOMI avatars."""
        try:
            friend_avatar = self.user_avatar_repo.fetchAvatarByUserId(friend_id)
            
            if not friend_avatar or not friend_avatar.is_active:
                logger.info(f"Friend {friend_id} has no active avatar, using default values")
                return {
                    "level": 1,
                    "xp": 0,
                    "nickname": fallback_name
                }
            else:
                return {
                    "level": friend_avatar.level,
                    "xp": friend_avatar.xp,
                    "nickname": friend_avatar.nickname
                }
        except Exception as e:
            logger.error(f"Error getting avatar info for friend {friend_id}: {e}")
            return {"level": 1, "xp": 0, "nickname": fallback_name}
    
    def _calculate_xp_progression(self, level: int, xp: int) -> dict:
        """Calculate XP progression metrics."""
        try:
            from ...Core.Utils.xp_utils import calculate_xp_progression
            return calculate_xp_progression(level, xp)
        except Exception as e:
            logger.error(f"Error calculating XP progression: {e}")
            return {"next_level_xp": 100, "xp_progress": 0}
    
    def _calculate_streak(self, friend_id: int) -> dict:
        """Calculate friend's current streak."""
        try:
            streak_days = 0
            streak_label = "No streak"
            
            streaks = self.streak_repo.fetchStreaksByUserId(friend_id)
            workout_streak = next((s for s in streaks if s.metric == "workout"), None)
            if workout_streak and workout_streak.current > 0:
                streak_days = workout_streak.current
                streak_label = f"{streak_days} day{'s' if streak_days != 1 else ''} streak"
            
            return {"days": streak_days, "label": streak_label}
        except Exception as e:
            logger.warning(f"Could not fetch streak for friend {friend_id}: {e}")
            return {"days": 0, "label": "No streak"}
    
    def _calculate_week_stats(self, friend_id: int) -> dict:
        """Calculate this week's stats for friend."""
        try:
            today = datetime.now()
            week_start = today - timedelta(days=today.weekday())  # Monday of current week
            week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
            
            workouts_this_week = self._get_workouts_in_range(friend_id, week_start, today)
            
            workouts_count = len(workouts_this_week)
            minutes_total = sum(
                int((w.end - w.start).total_seconds() / 60) if w.end and w.start else 0
                for w in workouts_this_week
            )
            xp_total = sum(w.xp_awarded for w in workouts_this_week if w.xp_awarded)
            
            return {
                "workouts_count": workouts_count,
                "minutes_total": minutes_total,
                "xp_total": xp_total
            }
        except Exception as e:
            logger.warning(f"Could not fetch workouts for friend {friend_id}: {e}")
            return {"workouts_count": 0, "minutes_total": 0, "xp_total": 0}
    
    def _get_workouts_in_range(self, friend_id: int, start_date: datetime, end_date: datetime) -> List:
        """Get workouts for friend within date range."""
        try:
            all_workouts = self.workout_repo.fetchWorkoutsByUserId(friend_id)
            return [
                w for w in all_workouts 
                if w.start and start_date <= w.start <= end_date
            ]
        except Exception as e:
            logger.error(f"Error getting workouts in range for friend {friend_id}: {e}")
            return []