from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.GoalEntity import GoalEntity
from ...Core.DTO.GoalDTO import GoalCreateDTO, GoalUpdateDTO, GoalResponseDTO
from ...Infrastructure.Repository.GoalRepository import GoalRepository

logger = logging.getLogger(__name__)
router = APIRouter()
goalRepo = GoalRepository()

# Get all fitness goals
@router.get("/", response_model=List[GoalResponseDTO])
async def getAllGoals():
    try:
        goals = goalRepo.fetchAllGoals()
        return [GoalResponseDTO(**goal.__dict__) for goal in goals]
    except Exception as e:
        logger.error(f"Error fetching all goals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get all fitness goals for a specific user
@router.get("/user/{user_id}", response_model=List[GoalResponseDTO])
async def getUserGoals(user_id: int):
    try:
        goals = goalRepo.fetchGoalsByUserId(user_id)
        return [GoalResponseDTO(**goal.__dict__) for goal in goals]
    except Exception as e:
        logger.error(f"Error fetching goals for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get a specific goal by ID
@router.get("/{goal_id}", response_model=GoalResponseDTO)
async def getGoal(goal_id: int):
    try:
        goal = goalRepo.fetchGoalById(goal_id)
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        return GoalResponseDTO(**goal.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching goal {goal_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Create a new fitness goal
@router.post("/", response_model=GoalResponseDTO, status_code=status.HTTP_201_CREATED)
async def createGoal(goal_data: GoalCreateDTO):
    try:
        goal = GoalEntity(**goal_data.model_dump())
        created_goal = goalRepo.createGoal(goal)
        return GoalResponseDTO(**created_goal.__dict__)
    except Exception as e:
        logger.error(f"Error creating goal: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update goal progress and details
@router.put("/{goal_id}", response_model=GoalResponseDTO)
async def updateGoal(goal_id: int, goal_data: GoalUpdateDTO):
    try:
        existing_goal = goalRepo.fetchGoalById(goal_id)
        if not existing_goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        
        update_data = goal_data.model_dump(exclude_unset=True)
        goal_dict = existing_goal.__dict__.copy()
        goal_dict.update(update_data)
        
        goal = GoalEntity(**goal_dict)
        updated_goal = goalRepo.updateGoal(goal)
        return GoalResponseDTO(**updated_goal.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating goal {goal_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Delete a goal from the system
@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteGoal(goal_id: int):
    try:
        goalRepo.deleteGoal(goal_id)
    except Exception as e:
        logger.error(f"Error deleting goal {goal_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
