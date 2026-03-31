from fastapi import APIRouter, HTTPException
import logging
from datetime import datetime
from typing import List, Dict

from ...Core.DTO.GamificationDTO import (
    GamificationResponseDTO,
    EarnedBadgeDTO,
    UpcomingBadgeDTO,
    ProgressRingDTO,
    LeaderboardPreviewDTO,
    LeaderboardEntryDTO
)
from ...Infrastructure.Repository.UserBadgeRepository import UserBadgeRepository
from ...Infrastructure.Repository.BadgeRepository import BadgeRepository
from ...Infrastructure.Repository.WorkoutRepository import WorkoutRepository
from ...Infrastructure.Repository.StreakRepository import StreakRepository
from ...Infrastructure.Repository.ProfileRepository import ProfileRepository
from ...Infrastructure.Repository.UserAvatarRepository import UserAvatarRepository
from ...Infrastructure.Repository.GoalRepository import GoalRepository
from ...Infrastructure.Repository.GoalTypeRepository import GoalTypeRepository
from ...Infrastructure.Repository.GoalStatusRepository import GoalStatusRepository
from ...Infrastructure.Repository.LeaderboardRepository import LeaderboardRepository
from ...Infrastructure.Repository.UserRepository import UserRepository

logger = logging.getLogger(__name__)
router = APIRouter()

userBadgeRepo = UserBadgeRepository()
badgeRepo = BadgeRepository()
workoutRepo = WorkoutRepository()
streakRepo = StreakRepository()
profileRepo = ProfileRepository()
userAvatarRepo = UserAvatarRepository()
goalRepo = GoalRepository()
goalTypeRepo = GoalTypeRepository()
goalStatusRepo = GoalStatusRepository()
leaderboardRepo = LeaderboardRepository()
userRepo = UserRepository()


# Badge achievement definitions matching seed data
BADGE_MILESTONES = {
    "workout_10": {"name": "10 Workouts", "description": "Complete 10 workouts", "target": 10, "unit": "workouts"},
    "workout_50": {"name": "50 Workouts", "description": "Complete 50 workouts", "target": 50, "unit": "workouts"},
    "workout_100": {"name": "100 Workouts", "description": "Complete 100 workouts", "target": 100, "unit": "workouts"},
    "streak_7": {"name": "7-Day Streak", "description": "Maintain a 7-day workout streak", "target": 7, "unit": "days"},
    "streak_30": {"name": "30-Day Streak", "description": "Maintain a 30-day workout streak", "target": 30, "unit": "days"},
    "streak_100": {"name": "100-Day Streak", "description": "Maintain a 100-day workout streak", "target": 100, "unit": "days"},
    "distance_marathon": {"name": "Marathon Distance", "description": "Reach 42.2 km total distance", "target": 42.2, "unit": "km"},
    "tomi_level_10": {"name": "Level 10 TOMI", "description": "Reach level 10 with your TOMI", "target": 10, "unit": "level"},
}


@router.get("/{user_id}", response_model=GamificationResponseDTO)
async def getGamificationData(user_id: int):
    # Get comprehensive gamification data for a user including:
    # - Earned badges (from user_badge + badge)
    # - Upcoming badge progress (computed from DB stats)
    # - Progress rings (from active goals)
    # - Leaderboard preview (active leaderboards + user rank + top 3)
    try:
        logger.info(f"[GAMIFICATION] {'='*10} Starting gamification fetch for user_id={user_id} {'='*10}")
        # Verify user exists
        logger.info(f"[GAMIFICATION] Step 1: Querying Supabase 'user' table")
        user = userRepo.fetchUserById(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # ===== 1. EARNED BADGES =====
        logger.info(f"[GAMIFICATION] Step 2: Fetching earned badges from Supabase 'user_badge' table")
        earned_badges = []
        try:
            user_badges = userBadgeRepo.fetchBadgesByUserId(user_id)
            logger.info(f"[GAMIFICATION] Found {len(user_badges) if user_badges else 0} user_badge records from Supabase")
            for ub in user_badges:
                badge = badgeRepo.fetchBadgeById(ub.badge_id)
                if badge:
                    earned_badges.append(EarnedBadgeDTO(
                        id=ub.id,
                        badgeId=badge.badge_id,
                        achievement=badge.achievement,
                        name=badge.name,
                        description=badge.description,
                        awardedDate=ub.awarded_date
                    ))
            # Sort by most recent first
            earned_badges.sort(key=lambda x: x.awardedDate, reverse=True)
        except Exception as e:
            logger.warning(f"Could not fetch earned badges for user {user_id}: {e}")
        
        # ===== 2. UPCOMING BADGES =====
        logger.info(f"[GAMIFICATION] Step 3: Computing upcoming badges from Supabase stats")
        upcoming_badges = []
        
        # Get current stats
        workout_count = 0
        max_streak = 0
        total_distance = 0.0
        tomi_level = 0
        
        try:
            # Workout count
            logger.info(f"[GAMIFICATION] Querying Supabase 'workout' table")
            workouts = workoutRepo.fetchWorkoutsByUserId(user_id)
            workout_count = len(workouts) if workouts else 0
            logger.info(f"[GAMIFICATION] Found {workout_count} workouts from Supabase")
            
            # Max streak
            logger.info(f"[GAMIFICATION] Querying Supabase 'streak' table")
            streaks = streakRepo.fetchStreaksByUserId(user_id)
            workout_streak = next((s for s in streaks if s.metric == "workout"), None)
            if workout_streak:
                max_streak = workout_streak.longest
            logger.info(f"[GAMIFICATION] Found max streak: {max_streak} days from Supabase")
            
            # Total distance from profile
            logger.info(f"[GAMIFICATION] Querying Supabase 'profile' table")
            profile = profileRepo.fetchProfileById(user_id)
            if profile and hasattr(profile, 'total_distance'):
                total_distance = profile.total_distance or 0.0
            logger.info(f"[GAMIFICATION] Total distance from Supabase: {total_distance} km")
            
            # TOMI level
            logger.info(f"[GAMIFICATION] Querying Supabase 'user_avatar' table")
            tomi = userAvatarRepo.fetchAvatarByUserId(user_id)
            if tomi and tomi.is_active:
                tomi_level = tomi.level
            logger.info(f"[GAMIFICATION] TOMI level from Supabase: {tomi_level}")
        except Exception as e:
            logger.warning(f"Could not fetch stats for upcoming badges: {e}")
        
        # Get earned badge achievements to filter out
        earned_achievements = {b.achievement for b in earned_badges}
        
        # Compute upcoming badges
        for achievement, info in BADGE_MILESTONES.items():
            if achievement in earned_achievements:
                continue  # Already earned
            
            current = 0
            if achievement.startswith("workout_"):
                current = workout_count
            elif achievement.startswith("streak_"):
                current = max_streak
            elif achievement == "distance_marathon":
                current = total_distance
            elif achievement == "tomi_level_10":
                current = tomi_level
            
            target = info["target"]
            if current < target:  # Only show if not yet achieved
                progress = (current / target * 100) if target > 0 else 0
                upcoming_badges.append(UpcomingBadgeDTO(
                    id=achievement,
                    achievement=achievement,
                    name=info["name"],
                    description=info["description"],
                    current=int(current) if isinstance(current, (int, float)) else current,
                    target=int(target) if isinstance(target, (int, float)) else target,
                    unit=info["unit"],
                    progress=round(progress, 1)
                ))
        
        # Sort by progress descending (closest to completion first)
        upcoming_badges.sort(key=lambda x: x.progress, reverse=True)
        logger.info(f"[GAMIFICATION] Computed {len(upcoming_badges)} upcoming badges")
        
        # ===== 3. PROGRESS RINGS (from active goals) =====
        logger.info(f"[GAMIFICATION] Step 4: Fetching progress rings from Supabase 'goal' table")
        progress_rings = []
        try:
            goals = goalRepo.fetchGoalsByUserId(user_id)
            logger.info(f"[GAMIFICATION] Found {len(goals) if goals else 0} goals from Supabase")
            now = datetime.now()
            
            for goal in goals:
                # Check if goal is active (within date range)
                if goal.start_date <= now <= goal.end_date:
                    goal_type = goalTypeRepo.fetchGoalTypeById(goal.goal_type_id)
                    goal_status = goalStatusRepo.fetchStatusById(goal.goal_status_id)
                    
                    if goal_type and goal_status and goal_status.name.lower() == "active":
                        # Compute current progress based on goal type
                        current_value = 0
                        
                        if goal_type.name == "Steps":
                            # For steps, would need step tracking - using 0 for now
                            # In real implementation, query step data for today
                            current_value = 0
                        elif goal_type.name == "Exercise Minutes":
                            # Sum today's workout minutes
                            today_workouts = [w for w in workouts if w.start.date() == now.date()]
                            current_value = sum(
                                int((w.end - w.start).total_seconds() / 60)
                                for w in today_workouts
                            )
                        elif goal_type.name == "Workouts":
                            # Count this week's workouts
                            week_start = now - datetime.timedelta(days=now.weekday())
                            week_workouts = [w for w in workouts if w.start >= week_start]
                            current_value = len(week_workouts)
                        
                        progress_pct = (current_value / goal.target_value * 100) if goal.target_value > 0 else 0
                        
                        # Create ring key
                        ring_key = f"{goal_type.name.replace(' ', '')}{goal.period.capitalize()}"
                        
                        progress_rings.append(ProgressRingDTO(
                            key=ring_key,
                            label=f"{goal.period.capitalize()} {goal_type.name}",
                            current=current_value,
                            target=goal.target_value,
                            unit=goal_type.default_unit,
                            progress=round(progress_pct, 1),
                            goalId=goal.goal_id
                        ))
        except Exception as e:
            logger.warning(f"Could not fetch progress rings for user {user_id}: {e}")
        
        logger.info(f"[GAMIFICATION] Computed {len(progress_rings)} active progress rings")
        
        # ===== 4. LEADERBOARD PREVIEW =====
        logger.info(f"[GAMIFICATION] Step 5: Fetching leaderboards from Supabase 'leaderboard' table")
        leaderboards = []
        try:
            now_str = now.strftime("%Y-%m-%d")
            
            # Get all leaderboard entries
            logger.info(f"[GAMIFICATION] Querying user's leaderboard entries from Supabase")
            all_entries = leaderboardRepo.fetchUserLeaderboardEntries(user_id)
            logger.info(f"[GAMIFICATION] Found {len(all_entries) if all_entries else 0} leaderboard entries from Supabase")
            
            # Group by name + scope
            leaderboard_groups: Dict[tuple, List] = {}
            for entry in all_entries:
                # Check if leaderboard is active
                if entry.start_date <= now_str <= entry.end_date:
                    key = (entry.name, entry.scope)
                    if key not in leaderboard_groups:
                        leaderboard_groups[key] = []
                    leaderboard_groups[key].append(entry)
            
            # For each active leaderboard, get top 3 and user entry
            for (name, scope), entries in leaderboard_groups.items():
                if not entries:
                    continue
                
                # Get all entries for this leaderboard (name + scope combination)
                all_lb_entries = leaderboardRepo.fetchLeaderboardByScope(scope)
                active_lb_entries = [
                    e for e in all_lb_entries
                    if e.name == name and e.start_date <= now_str <= e.end_date
                ]
                
                # Sort by rank
                active_lb_entries.sort(key=lambda x: x.rank)
                
                # Get user entry
                user_entry_data = next((e for e in active_lb_entries if e.user_id == user_id), None)
                user_entry_dto = None
                if user_entry_data:
                    user_obj = userRepo.fetchUserById(user_entry_data.user_id)
                    user_entry_dto = LeaderboardEntryDTO(
                        userId=user_entry_data.user_id,
                        userName=user_obj.name if user_obj else f"User {user_entry_data.user_id}",
                        score=user_entry_data.score,
                        rank=user_entry_data.rank
                    )
                
                # Get top 3
                top3_data = active_lb_entries[:3]
                top3_dtos = []
                for entry in top3_data:
                    user_obj = userRepo.fetchUserById(entry.user_id)
                    top3_dtos.append(LeaderboardEntryDTO(
                        userId=entry.user_id,
                        userName=user_obj.name if user_obj else f"User {entry.user_id}",
                        score=entry.score,
                        rank=entry.rank
                    ))
                
                # Use first entry's leaderboard_id
                lb_id = entries[0].leaderboard_id if entries else 0
                
                leaderboards.append(LeaderboardPreviewDTO(
                    leaderboardId=lb_id,
                    name=name,
                    scope=scope,
                    userEntry=user_entry_dto,
                    top3=top3_dtos
                ))
        except Exception as e:
            logger.warning(f"Could not fetch leaderboards for user {user_id}: {e}")
        
        logger.info(f"[GAMIFICATION] Computed {len(leaderboards)} active leaderboards")
        logger.info(f"[GAMIFICATION] {'='*10} Gamification data complete for user_id={user_id} {'='*10}")
        logger.info(f"[GAMIFICATION] Summary: {len(earned_badges)} earned badges, {len(upcoming_badges)} upcoming, {len(progress_rings)} rings, {len(leaderboards)} leaderboards")
        
        return GamificationResponseDTO(
            badgesEarned=earned_badges[:6],  # Most recent 6
            badgesUpcoming=upcoming_badges[:6],  # Top 6 closest to completion
            progressRings=progress_rings,
            leaderboards=leaderboards
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching gamification data for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
