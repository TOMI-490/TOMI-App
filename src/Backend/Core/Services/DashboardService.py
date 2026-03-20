from typing import List, Optional, Dict, Any
from datetime import datetime, date
import logging

from ..DTO.DashboardDTO import DashboardDTO, TodayProgressDTO
from ..DTO.UserDTO import UserResponseDTO
from ..DTO.ProfileDTO import ProfileResponseDTO
from ..DTO.UserAvatarDTO import UserAvatarWithDetailsResponseDTO
from ..DTO.StreakDTO import StreakResponseDTO
from ..DTO.WorkoutDTO import WorkoutResponseDTO
from ..DTO.GoalDTO import GoalWithDetailsResponseDTO
from ..Utils.xp_utils import calculate_xp_progression, calculate_today_progress, reconcile_stored_level_with_xp
from ...Infrastructure.Repository.UserRepository import UserRepository
from ...Infrastructure.Repository.ProfileRepository import ProfileRepository
from ...Infrastructure.Repository.UserAvatarRepository import UserAvatarRepository
from ...Infrastructure.Repository.AvatarRepository import AvatarRepository
from ...Infrastructure.Repository.StreakRepository import StreakRepository
from ...Infrastructure.Repository.WorkoutRepository import WorkoutRepository
from ...Infrastructure.Repository.GoalRepository import GoalRepository
from ...Infrastructure.Repository.GoalTypeRepository import GoalTypeRepository
from ...Infrastructure.Repository.GoalStatusRepository import GoalStatusRepository

logger = logging.getLogger(__name__)

class DashboardService:
    def __init__(self):
        self.user_repo = UserRepository()
        self.profile_repo = ProfileRepository()
        self.user_avatar_repo = UserAvatarRepository()
        self.avatar_repo = AvatarRepository()
        self.streak_repo = StreakRepository()
        self.workout_repo = WorkoutRepository()
        self.goal_repo = GoalRepository()
        self.goal_type_repo = GoalTypeRepository()
        self.goal_status_repo = GoalStatusRepository()
    
    def get_dashboard_data(self, user_id: int) -> DashboardDTO:
        """Get aggregated dashboard data for a user."""
        try:
            logger.info(f"[DASHBOARD] Starting dashboard fetch for user_id={user_id}")
            
            # Fetch user
            user_entity = self.user_repo.fetchUserById(user_id)
            if not user_entity:
                logger.error(f"[DASHBOARD] User {user_id} not found")
                raise ValueError("User not found")
            
            logger.info(f"[DASHBOARD] User found: {user_entity.email}")
            user_dto = UserResponseDTO.model_validate(user_entity, from_attributes=True)
            
            # Fetch profile
            logger.info(f"[DASHBOARD] Querying profile")
            profile_entity = self.profile_repo.fetchProfileByUserId(user_id)
            profile_dto = None
            if profile_entity:
                logger.info(f"[DASHBOARD] Profile found")
                profile_dto = ProfileResponseDTO.model_validate(profile_entity, from_attributes=True)
            else:
                logger.info(f"[DASHBOARD] No profile found for user {user_id}")
            
            # Fetch user avatar with details
            logger.info(f"[DASHBOARD] Querying user_avatar")
            user_avatar_entity = self.user_avatar_repo.fetchAvatarByUserId(user_id)
            user_avatar_dto = None
            
            if user_avatar_entity:
                logger.info(f"[DASHBOARD] User avatar found: level={user_avatar_entity.level}, xp={user_avatar_entity.xp}")
                
                # Get the avatar details
                avatar_entity = self.avatar_repo.fetchAvatarById(user_avatar_entity.avatar_id)
                if avatar_entity:
                    user_avatar_entity, canonical_level = reconcile_stored_level_with_xp(
                        self.user_avatar_repo, user_avatar_entity
                    )
                    xp_progression = calculate_xp_progression(
                        canonical_level, user_avatar_entity.xp
                    )

                    user_avatar_dto = UserAvatarWithDetailsResponseDTO(
                        userAvatarId=user_avatar_entity.user_avatar_id,
                        userId=user_avatar_entity.user_id,
                        avatarId=user_avatar_entity.avatar_id,
                        nickname=user_avatar_entity.nickname,
                        level=canonical_level,
                        xp=user_avatar_entity.xp,
                        ageDays=user_avatar_entity.age_days,
                        hungerLevel=user_avatar_entity.hunger_level,
                        sleepinessLevel=user_avatar_entity.sleepiness_level,
                        boredomeLevel=user_avatar_entity.boredome_level,
                        happinessLevel=user_avatar_entity.happines_level,
                        isActive=user_avatar_entity.is_active,
                        lastUpdated=user_avatar_entity.last_updated,
                        createdAt=user_avatar_entity.created_at,
                        avatarName=avatar_entity.name,
                        imageUrl=avatar_entity.image_url,
                        animationIdleUrl=avatar_entity.animation_idle_url,
                        animationActiveUrl=avatar_entity.animation_active_url,
                        animationPostWorkoutUrl=avatar_entity.animation_post_workout_url,
                        themeColor=avatar_entity.theme_color,
                        currentLevelXp=xp_progression['current_level_xp'],
                        nextLevelXp=xp_progression['next_level_xp'],
                        xpProgress=xp_progression['xp_progress']
                    )
                else:
                    logger.warning(f"[DASHBOARD] Avatar {user_avatar_entity.avatar_id} not found in avatars table")
            else:
                logger.info(f"[DASHBOARD] No user avatar found for user {user_id}")
            
            # Fetch streaks
            logger.info(f"[DASHBOARD] Querying streaks")
            streak_entities = self.streak_repo.fetchStreaksByUserId(user_id)
            streak_dtos = []
            if streak_entities:
                logger.info(f"[DASHBOARD] Found {len(streak_entities)} streaks")
                streak_dtos = [StreakResponseDTO.model_validate(streak, from_attributes=True) for streak in streak_entities]
            else:
                logger.info(f"[DASHBOARD] No streaks found for user {user_id}")
            
            # Fetch recent workouts (last 5)
            logger.info(f"[DASHBOARD] Querying recent workouts")
            workout_entities = self.workout_repo.fetchWorkoutsByUserId(user_id)
            recent_workouts = []
            if workout_entities:
                # Sort by start date descending and take last 5
                sorted_workouts = sorted(workout_entities, key=lambda w: w.start if w.start else datetime.min, reverse=True)
                recent_workouts_entities = sorted_workouts[:5]
                logger.info(f"[DASHBOARD] Found {len(recent_workouts_entities)} recent workouts")
                
                recent_workouts = [WorkoutResponseDTO(
                    workoutId=w.workout_id,
                    userId=w.user_id,
                    workoutTypeId=w.workout_type_id,
                    start=w.start,
                    end=w.end,
                    deviceId=w.device_id,
                    xpAwarded=w.xp_awarded
                ) for w in recent_workouts_entities]
            else:
                logger.info(f"[DASHBOARD] No workouts found for user {user_id}")
            
            # Fetch active goals
            logger.info(f"[DASHBOARD] Querying goals")
            goal_entities = self.goal_repo.fetchGoalsByUserId(user_id)
            active_goals = []
            if goal_entities:
                logger.info(f"[DASHBOARD] Found {len(goal_entities)} goals")
                
                for goal in goal_entities:
                    # Get goal type and status details
                    goal_type = self.goal_type_repo.fetchGoalTypeById(goal.goal_type_id)
                    goal_status = self.goal_status_repo.fetchGoalStatusById(goal.goal_status_id)
                    
                    if goal_type and goal_status:
                        active_goals.append(GoalWithDetailsResponseDTO(
                            goalId=goal.goal_id,
                            userId=goal.user_id,
                            goalTypeId=goal.goal_type_id,
                            goalStatusId=goal.goal_status_id,
                            targetValue=goal.target_value,
                            progressValue=goal.progress_value,
                            period=goal.period,
                            startDate=goal.start_date,
                            endDate=goal.end_date,
                            lastUpdated=goal.last_updated,
                            goalTypeName=goal_type.name,
                            goalTypeUnit=goal_type.default_unit,
                            goalStatusName=goal_status.name
                        ))
            else:
                logger.info(f"[DASHBOARD] No goals found for user {user_id}")
            
            # Calculate today's progress
            logger.info(f"[DASHBOARD] Calculating today's progress")
            today_progress_dto = None
            if workout_entities:
                logger.info(f"[DASHBOARD] Found {len(workout_entities)} total workouts")
                today_progress = calculate_today_progress(workout_entities)
                logger.info(f"[DASHBOARD] Today's progress: {today_progress}")
                today_progress_dto = TodayProgressDTO(
                    workoutsCount=today_progress["workouts_count"],
                    xpEarned=today_progress["xp_earned"],
                    minutes=today_progress["minutes"]
                )
                logger.info(f"[DASHBOARD] Today progress DTO created: workouts={today_progress['workouts_count']}, minutes={today_progress['minutes']}, xp={today_progress['xp_earned']}")
            else:
                logger.info(f"[DASHBOARD] No workouts found, using default progress")
            
            # Build dashboard response
            logger.info(f"[DASHBOARD] Building dashboard response")
            dashboard = DashboardDTO(
                user=user_dto,
                profile=profile_dto,
                tomi=user_avatar_dto,
                streaks=streak_dtos,
                recentWorkouts=recent_workouts,
                activeGoals=active_goals,
                todayProgress=today_progress_dto
            )
            
            logger.info(f"[DASHBOARD] Dashboard fetch completed for user_id={user_id}")
            return dashboard
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error fetching dashboard data for user {user_id}: {e}")
            raise