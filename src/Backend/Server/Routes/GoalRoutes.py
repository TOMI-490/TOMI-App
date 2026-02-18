from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.DTO.GoalDTO import GoalCreateDTO, GoalUpdateDTO, GoalResponseDTO, UserGoalDTO, GoalProgressDTO
from ...Core.Services.GoalService import GoalService

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize service
goal_service = GoalService()

# Get all goals
@router.get("/", response_model=List[GoalResponseDTO])
async def getAllGoals():
    try:
        return goal_service.get_all_goals()
    except Exception as e:
        logger.error(f"Error fetching all goals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get a specific goal
@router.get("/{goal_id}", response_model=GoalResponseDTO)
async def getGoalById(goal_id: int):
    try:
        return goal_service.get_goal_by_id(goal_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching goal {goal_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get all goals for a user
@router.get("/user/{user_id}", response_model=List[UserGoalDTO])
async def getUserGoals(user_id: int):
    try:
        return goal_service.get_user_goals(user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching goals for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Create a new goal
@router.post("/", response_model=GoalResponseDTO, status_code=status.HTTP_201_CREATED)
async def createGoal(goal: GoalCreateDTO):
    try:
        return goal_service.create_goal(goal)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating goal: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update a goal
@router.put("/{goal_id}", response_model=GoalResponseDTO)
async def updateGoal(goal_id: int, goal: GoalUpdateDTO):
    try:
        return goal_service.update_goal(goal_id, goal)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating goal {goal_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Delete a goal
@router.delete("/{goal_id}")
async def deleteGoal(goal_id: int):
    try:
        return goal_service.delete_goal(goal_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting goal {goal_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Update goal progress
@router.post("/{goal_id}/progress/{user_id}", response_model=GoalProgressDTO)
async def updateGoalProgress(goal_id: int, user_id: int, new_value: float):
    try:
        return goal_service.update_goal_progress(user_id, goal_id, new_value)
    except ValueError as e:
        status_code = 404 if "not found" in str(e).lower() else 400
        raise HTTPException(status_code=status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating goal progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))
