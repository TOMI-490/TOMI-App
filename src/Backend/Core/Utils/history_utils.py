from datetime import datetime, timedelta
from collections import defaultdict

class HistoryService:
    
    # Service class for history-related business logic.
    
    @staticmethod
    def parse_month_string(month: str) -> tuple:
        # Parse month string (YYYY-MM) and return start and end dates.
        year, month_num = month.split("-")
        year = int(year)
        month_num = int(month_num)
        
        month_start = datetime(year, month_num, 1).date()
        if month_num == 12:
            month_end = datetime(year + 1, 1, 1).date() - timedelta(days=1)
        else:
            month_end = datetime(year, month_num + 1, 1).date() - timedelta(days=1)
        
        return month_start, month_end
    
    @staticmethod
    def get_completed_workouts(workout_repo, user_id: int, start_date, end_date) -> list:
        # Get all completed workouts for a user within a date range.
        all_workouts = workout_repo.fetchWorkoutsByUserIdAndDateRange(
            user_id, start_date, end_date
        )
        return [w for w in all_workouts if w.end]
    
    @staticmethod
    def calculate_workout_stats(workouts: list) -> dict:
        # Calculate total workouts, minutes, and XP from a list of workouts.
        stats = {
            'count': len(workouts),
            'minutes': 0,
            'xp': 0
        }
        
        for workout in workouts:
            duration_seconds = (workout.end - workout.start).total_seconds()
            stats['minutes'] += int(duration_seconds / 60)
            stats['xp'] += workout.xp_awarded or 0
        
        return stats
    
    @staticmethod
    def calculate_percent_change(current: int, previous: int) -> float:
        # Calculate percent change between current and previous values.
        if previous > 0:
            return ((current - previous) / previous) * 100
        return 100.0 if current > 0 else 0.0
    
    @staticmethod
    def get_workout_duration_minutes(workout) -> int:
        # Calculate workout duration in minutes.
        duration_seconds = (workout.end - workout.start).total_seconds()
        return int(duration_seconds / 60)
    
    @staticmethod
    def build_workout_list_item(workout, workout_type_name: str, duration_minutes: int):
        # Build a WorkoutListItemDTO from workout data.
        from ..DTO.HistoryDTO import WorkoutListItemDTO
        
        return WorkoutListItemDTO(
            id=workout.workout_id,
            type=workout_type_name,
            startedAt=workout.start.isoformat(),
            durationMinutes=duration_minutes,
            xpEarned=workout.xp_awarded or 0,
            calories=None,  # TODO: Get from workout data when available
            avgHr=None,  # TODO: Get from workout data when available
            exercisesCount=None  # TODO: Get from workout data when available
        )
    
    @staticmethod
    def get_active_dates_from_workouts(workouts: list) -> list:
        # Extract unique active dates from workouts.
        active_dates = set()
        for workout in workouts:
            workout_date = workout.start.date().strftime("%Y-%m-%d")
            active_dates.add(workout_date)
        return sorted(list(active_dates))
    
    @staticmethod
    def count_workouts_by_type(workouts: list) -> dict:
        # Count workouts grouped by workout type ID.
        type_counts = defaultdict(int)
        for workout in workouts:
            type_counts[workout.workout_type_id] += 1
        return type_counts
    
    @staticmethod
    def aggregate_xp_by_date(workouts: list) -> tuple:
        # Aggregate XP by date and return daily breakdown with total.
        daily_xp = defaultdict(int)
        total_xp = 0
        
        for workout in workouts:
            workout_date = workout.start.date().strftime("%Y-%m-%d")
            xp = workout.xp_awarded or 0
            daily_xp[workout_date] += xp
            total_xp += xp
        
        # Build time series
        data_points = [
            {"date": date, "xp": xp}
            for date, xp in sorted(daily_xp.items())
        ]
        
        return data_points, total_xp
    
    @staticmethod
    def get_current_week_range(week_start: str = None) -> tuple:
        # Get current week start and end dates.
        if week_start:
            week_start_date = datetime.strptime(week_start, "%Y-%m-%d").date()
        else:
            # Default to current week (Monday)
            today = datetime.now().date()
            week_start_date = today - timedelta(days=today.weekday())
        
        week_end_date = week_start_date + timedelta(days=6)
        return week_start_date, week_end_date
    
    @staticmethod
    def get_previous_week_range(week_start_date) -> tuple:
        # Get previous week start and end dates based on current week start.
        prev_week_start = week_start_date - timedelta(days=7)
        prev_week_end = prev_week_start + timedelta(days=6)
        return prev_week_start, prev_week_end
