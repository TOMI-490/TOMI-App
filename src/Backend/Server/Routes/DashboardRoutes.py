from fastapi import APIRouter, HTTPException
import logging

from ...Core.DTO.DashboardDTO import DashboardDTO
from ...Core.DTO.UserDTO import UserResponseDTO
from ...Core.DTO.ProfileDTO import ProfileResponseDTO
from ...Core.DTO.UserAvatarDTO import UserAvatarWithDetailsResponseDTO
from ...Core.DTO.StreakDTO import StreakResponseDTO
from ...Core.DTO.WorkoutDTO import WorkoutResponseDTO
from ...Core.DTO.GoalDTO import GoalWithDetailsResponseDTO
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
router = APIRouter()

userRepo = UserRepository()
profileRepo = ProfileRepository()
userAvatarRepo = UserAvatarRepository()
avatarRepo = AvatarRepository()
streakRepo = StreakRepository()
workoutRepo = WorkoutRepository()
goalRepo = GoalRepository()
goalTypeRepo = GoalTypeRepository()
goalStatusRepo = GoalStatusRepository()

# Get aggregated dashboard data for a user
@router.get("/{user_id}", response_model=DashboardDTO)
async def getDashboardData(user_id: int):
    try:
        logger.info(f"[DASHBOARD] {'='*10} Starting dashboard fetch for user_id={user_id} {'='*10}")
        # Fetch user
        logger.info(f"[DASHBOARD] Querying Supabase user table")
        user_entity = userRepo.fetchUserById(user_id)
        if not user_entity:
            logger.error(f"[DASHBOARD] User {user_id} not found in Supabase")
            raise HTTPException(status_code=404, detail="User not found")
        
        logger.info(f"[DASHBOARD] User found: {user_entity.email}")
        user_dto = UserResponseDTO.model_validate(user_entity, from_attributes=True)
        
        # Fetch profile (optional)
        logger.info(f"[DASHBOARD] Querying Supabase profile table")
        profile_dto = None
        try:
            profile_entity = profileRepo.fetchProfileById(user_id)
            if profile_entity:
                profile_dto = ProfileResponseDTO.model_validate(profile_entity, from_attributes=True)
                logger.info(f"[DASHBOARD] Profile found: level={profile_entity.level}, xp={profile_entity.experience_points}")
            else:
                logger.info(f"[DASHBOARD] No profile found for user {user_id}")
        except Exception as e:
            logger.warning(f"[DASHBOARD] Could not fetch profile for user {user_id}: {e}")
        
        # Fetch active user avatar (TOMI) with avatar details (optional)
        logger.info(f"[DASHBOARD] Step 3: Querying Supabase 'user_avatar' and 'avatar' tables")
        tomi_dto = None
        try:
            user_avatar = userAvatarRepo.fetchAvatarByUserId(user_id)
            if user_avatar and user_avatar.is_active:
                # Fetch avatar details
                avatar_entity = avatarRepo.fetchAvatarById(user_avatar.avatar_id)
                
                # Create enhanced DTO with avatar details
                tomi_dto = UserAvatarWithDetailsResponseDTO(
                    user_avatar_id=user_avatar.user_avatar_id,
                    user_id=user_avatar.user_id,
                    avatar_id=user_avatar.avatar_id,
                    nickname=user_avatar.nickname,
                    level=user_avatar.level,
                    xp=user_avatar.xp,
                    age_days=user_avatar.age_days,
                    hunger_level=user_avatar.hunger_level,
                    sleepiness_level=user_avatar.sleepiness_level,
                    boredome_level=user_avatar.boredome_level,
                    happines_level=user_avatar.happines_level,
                    is_active=user_avatar.is_active,
                    last_updated=user_avatar.last_updated,
                    created_at=user_avatar.created_at,
                    avatar_name=avatar_entity.name if avatar_entity else None,
                    image_url=avatar_entity.image_url if avatar_entity else None,
                    animation_url=avatar_entity.animation_url if avatar_entity else None,
                    theme_color=avatar_entity.theme_color if avatar_entity else None
                )
                logger.info(f"[DASHBOARD] TOMI avatar found in Supabase: {user_avatar.nickname}, level={user_avatar.level}")
        except Exception as e:
            logger.warning(f"[DASHBOARD] Could not fetch active avatar for user {user_id}: {e}")
        
        # Fetch streaks (optional)
        logger.info(f"[DASHBOARD] Step 4: Querying Supabase 'streak' table")
        streaks_dtos = []
        try:
            streaks_entities = streakRepo.fetchStreaksByUserId(user_id)
            logger.info(f"[DASHBOARD] Found {len(streaks_entities) if streaks_entities else 0} streaks from Supabase")
            streaks_dtos = [
                StreakResponseDTO(
                    streakId=s.streak_id,
                    userId=s.user_id,
                    metric=s.metric,
                    current=s.current,
                    longest=s.longest
                ) for s in streaks_entities
            ]
        except Exception as e:
            logger.warning(f"Could not fetch streaks for user {user_id}: {e}")
        
        # Fetch recent workouts (last 10) (optional)
        logger.info(f"[DASHBOARD] Step 5: Querying Supabase 'workout' table")
        workouts_dtos = []
        try:
            all_workouts = workoutRepo.fetchWorkoutsByUserId(user_id)
            logger.info(f"[DASHBOARD] Found {len(all_workouts) if all_workouts else 0} workouts from Supabase")
            if all_workouts:
                # Sort by start time descending and take last 10
                sorted_workouts = sorted(all_workouts, key=lambda w: w.start, reverse=True)[:10]
                workouts_dtos = [WorkoutResponseDTO.model_validate(w, from_attributes=True) for w in sorted_workouts]
        except Exception as e:
            logger.warning(f"Could not fetch workouts for user {user_id}: {e}")
        
        # Fetch goals with details (optional)
        logger.info(f"[DASHBOARD] Step 6: Querying Supabase 'goal' table")
        goals_dtos = []
        try:
            goals = goalRepo.fetchGoalsByUserId(user_id)
            logger.info(f"[DASHBOARD] Found {len(goals) if goals else 0} goals from Supabase")
            for goal in goals:
                goal_type = goalTypeRepo.fetchGoalTypeById(goal.goal_type_id)
                goal_status = goalStatusRepo.fetchStatusById(goal.goal_status_id)
                
                if goal_type and goal_status:
                    # TODO: Calculate progress_value from actual data (steps, workouts, etc.)
                    progress_value = 0
                    
                    goals_dtos.append(GoalWithDetailsResponseDTO(
                        goalId=goal.goal_id,
                        userId=goal.user_id,
                        goalStatusId=goal.goal_status_id,
                        goalStatusName=goal_status.name,
                        goalTypeId=goal.goal_type_id,
                        goalTypeName=goal_type.name,
                        goalTypeUnit=goal_type.default_unit,
                        targetValue=goal.target_value,
                        progressValue=progress_value,
                        period=goal.period,
                        startDate=goal.start_date,
                        endDate=goal.end_date,
                        lastUpdated=goal.last_updated
                    ))
        except Exception as e:
            logger.warning(f"[DASHBOARD] Could not fetch goals for user {user_id}: {e}")
        
        logger.info(f"[DASHBOARD] {'='*10} Dashboard data complete for user_id={user_id} {'='*10}")
        logger.info(f"[DASHBOARD] Summary: profile={profile_dto is not None}, tomi={tomi_dto is not None}, streaks={len(streaks_dtos)}, workouts={len(workouts_dtos)}, goals={len(goals_dtos)}")
        
        return DashboardDTO(
            user=user_dto,
            profile=profile_dto,
            tomi=tomi_dto,
            streaks=streaks_dtos,
            recent_workouts=workouts_dtos,
            goals=goals_dtos
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching dashboard data for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
