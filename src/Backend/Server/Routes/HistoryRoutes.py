from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import logging
from datetime import datetime, timedelta

from ...Core.DTO.HistoryDTO import (
    WeeklySummaryResponseDTO,
    CalendarResponseDTO,
    PaginatedWorkoutsResponseDTO,
    WorkoutListItemDTO
)
from ...Infrastructure.Repository.WorkoutRepository import WorkoutRepository
from ...Infrastructure.Repository.WorkoutTypeRepository import WorkoutTypeRepository
from ...Core.Utils.history_utils import HistoryService

logger = logging.getLogger(__name__)
router = APIRouter()
workoutRepo = WorkoutRepository()
workoutTypeRepo = WorkoutTypeRepository()

# Helper function
def get_workout_type_name(workout_type_id: int) -> str:
    # Get workout type name by ID. Returns name or 'Unknown' if not found.
    workout_type = workoutTypeRepo.fetchWorkoutTypeById(workout_type_id)
    return workout_type.name if workout_type else "Unknown"


@router.get("/weekly-summary", response_model=WeeklySummaryResponseDTO)
async def getWeeklySummary(
    user_id: int = Query(..., description="User ID to get summary for"),
    week_start: Optional[str] = Query(None, description="Week start date (YYYY-MM-DD), defaults to current week")
):
    # Get weekly workout summary with comparison to previous week.
    # Returns workouts count, total minutes, total XP, and percent change from last week.
    try:
        # Get current week range (service handles parsing/calculation)
        week_start_range, week_end_range = HistoryService.get_current_week_range(week_start)
        
        # Get completed workouts for current week
        current_week_workouts = HistoryService.get_completed_workouts(
            workoutRepo, user_id, week_start_range, week_end_range
        )
        
        # Calculate current week stats
        current_stats = HistoryService.calculate_workout_stats(current_week_workouts)
        
        # Get previous week range and workouts
        prev_week_start, prev_week_end = HistoryService.get_previous_week_range(week_start_range)
        prev_week_workouts = HistoryService.get_completed_workouts(
            workoutRepo, user_id, prev_week_start, prev_week_end
        )
        
        # Calculate previous week stats
        prev_stats = HistoryService.calculate_workout_stats(prev_week_workouts)
        
        # Calculate percent change
        delta_percent = HistoryService.calculate_percent_change(
            current_stats["count"], prev_stats["count"]
        )
        
        return WeeklySummaryResponseDTO(
            weekStart=week_start_range.strftime("%Y-%m-%d"),
            weekEnd=week_end_range.strftime("%Y-%m-%d"),
            workoutsCount=current_stats["count"],
            minutesTotal=round(current_stats["minutes"]),
            xpTotal=round(current_stats["xp"]),
            deltaPercentFromLastWeek=round(delta_percent, 1)
        )
        
    except ValueError as e:
        logger.error(f"Invalid date format: {e}")
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        logger.error(f"Error fetching weekly summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/calendar", response_model=CalendarResponseDTO)
async def getCalendarActivity(
    user_id: int = Query(..., description="User ID to get calendar for"),
    month: str = Query(..., description="Month in YYYY-MM format")
):
    # Get calendar data showing which dates have workouts in a given month.
    # Returns list of dates with at least one completed workout.
    try:
        # Parse month and get date boundaries
        month_start, month_end = HistoryService.parse_month_string(month)
        
        # Get completed workouts for the month
        completed_workouts = HistoryService.get_completed_workouts(
            workoutRepo, user_id, month_start, month_end
        )
        
        # Get unique active dates
        active_dates = HistoryService.get_active_dates_from_workouts(completed_workouts)
        
        return CalendarResponseDTO(
            month=month,
            activeDates=active_dates
        )
        
    except ValueError as e:
        logger.error(f"Invalid month format: {e}")
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM")
    except Exception as e:
        logger.error(f"Error fetching calendar activity: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/workouts", response_model=PaginatedWorkoutsResponseDTO)
async def getWorkoutsList(
    user_id: int = Query(..., description="User ID to get workouts for"),
    date: Optional[str] = Query(None, description="Filter by specific date (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=50, description="Items per page")
):
    # Get paginated list of workouts for a user, optionally filtered by date.
    # Returns workout details with computed stats (duration, calories, etc.).
    # Sorted by most recent first.
    try:
        # Determine date range
        if date:
            filter_date = datetime.strptime(date, "%Y-%m-%d").date()
            start_date = filter_date
            end_date = filter_date
        else:
            # Default: last 30 days
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=30)
        
        # Get completed workouts in range, sorted by most recent
        completed_workouts = HistoryService.get_completed_workouts(
            workoutRepo, user_id, start_date, end_date
        )
        completed_workouts.sort(key=lambda w: w.start, reverse=True)
        
        # Calculate total and pagination
        total = len(completed_workouts)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        page_workouts = completed_workouts[start_idx:end_idx]
        
        # Build response items with computed stats
        items = []
        for workout in page_workouts:
            type_name = get_workout_type_name(workout.workout_type_id)
            duration_minutes = HistoryService.get_workout_duration_minutes(workout)
            
            items.append(HistoryService.build_workout_list_item(
                workout, type_name, duration_minutes
            ))
        
        return PaginatedWorkoutsResponseDTO(
            items=items,
            page=page,
            pageSize=page_size,
            hasNext=end_idx < total,
            total=total
        )
        
    except ValueError as e:
        logger.error(f"Invalid date format: {e}")
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        logger.error(f"Error fetching workouts list: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/most-frequent")
async def getMostFrequentWorkouts(
    user_id: int = Query(..., description="User ID to get data for"),
    month: str = Query(..., description="Month in YYYY-MM format")
):
    # Get most frequent workout types for a given month.
    # Returns top 3 workout types by count.
    try:
        # Parse month and get date boundaries
        month_start, month_end = HistoryService.parse_month_string(month)
        
        # Get completed workouts for the month
        completed_workouts = HistoryService.get_completed_workouts(
            workoutRepo, user_id, month_start, month_end
        )
        
        # Count by workout type
        type_counts = HistoryService.count_workouts_by_type(completed_workouts)
        
        # Get top 3
        sorted_types = sorted(type_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        
        # Build response with type names
        items = []
        for type_id, count in sorted_types:
            items.append({
                "name": get_workout_type_name(type_id),
                "count": count
            })
        
        return {
            "month": month,
            "items": items
        }
        
    except ValueError as e:
        logger.error(f"Invalid month format: {e}")
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM")
    except Exception as e:
        logger.error(f"Error fetching most frequent workouts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/xp-over-time")
async def getXpOverTime(
    user_id: int = Query(..., description="User ID to get data for"),
    month: str = Query(..., description="Month in YYYY-MM format")
):
    # Get XP earned over time for a given month.
    # Returns daily XP totals.
    try:
        # Parse month and get date boundaries
        month_start, month_end = HistoryService.parse_month_string(month)
        
        # Get completed workouts for the month
        completed_workouts = HistoryService.get_completed_workouts(
            workoutRepo, user_id, month_start, month_end
        )
        
        # Aggregate XP by date
        data_points, total_xp = HistoryService.aggregate_xp_by_date(completed_workouts)
        
        # Calculate max XP from data points
        max_xp = max([point["xp"] for point in data_points]) if data_points else 0
        
        # Calculate average XP per workout
        workouts_count = len(completed_workouts)
        avg_xp_per_workout = round(total_xp / workouts_count, 1) if workouts_count > 0 else 0
        
        return {
            "month": month,
            "range": "month",
            "startDate": data_points[0]["date"] if data_points else None,
            "endDate": data_points[-1]["date"] if data_points else None,
            "totalXp": total_xp,
            "workoutsCount": workouts_count,
            "maxXp": max_xp,
            "avgXpPerWorkout": avg_xp_per_workout,
            "dataPoints": len(data_points),
            "firstDate": data_points[0]["date"] if data_points else None,
            "lastDate": data_points[-1]["date"] if data_points else None,
            "series": data_points
        }
        
    except ValueError as e:
        logger.error(f"Invalid month format: {e}")
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM")
    except Exception as e:
        logger.error(f"Error fetching XP over time: {e}")
        raise HTTPException(status_code=500, detail=str(e))
