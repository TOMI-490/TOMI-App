from typing import List, Optional
import logging

from ...Infrastructure.Repository.GoalRepository import GoalRepository
from ...Infrastructure.Repository.UserRepository import UserRepository
from ...Infrastructure.Repository.ProfileRepository import ProfileRepository
from ...Infrastructure.Repository.GoalStatusRepository import GoalStatusRepository
from ...Core.DTO.GoalDTO import GoalCreateDTO, GoalUpdateDTO, GoalResponseDTO, UserGoalDTO, GoalProgressDTO
from ...Core.Entity.GoalEntity import GoalEntity
from ...Core.Entity.UserEntity import UserEntity
from ...Core.Entity.ProfileEntity import ProfileEntity
from ...Core.Utils.xp_utils import calculate_goal_completion_xp

logger = logging.getLogger(__name__)

class GoalService:
    def __init__(self):
        self.goal_repository = GoalRepository()
        self.user_repository = UserRepository()
        self.profile_repository = ProfileRepository()
        self.goal_status_repository = GoalStatusRepository()
    
    def get_all_goals(self) -> List[GoalResponseDTO]:
        """Get all goals in the system"""
        try:
            goals = self.goal_repository.getAll()
            return [self._map_goal_to_response_dto(goal) for goal in goals]
        except Exception as e:
            logger.error(f"Error fetching all goals: {e}")
            raise Exception(f"Failed to fetch goals: {str(e)}")
    
    def get_goal_by_id(self, goal_id: int) -> GoalResponseDTO:
        """Get a specific goal by ID"""
        try:
            goal = self.goal_repository.getById(goal_id)
            if not goal:
                raise ValueError(f"Goal with ID {goal_id} not found")
            return self._map_goal_to_response_dto(goal)
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error fetching goal {goal_id}: {e}")
            raise Exception(f"Failed to fetch goal: {str(e)}")
    
    def get_user_goals(self, user_id: int) -> List[UserGoalDTO]:
        """Get all goals for a specific user with progress"""
        try:
            # Verify user exists
            user = self.user_repository.getById(user_id)
            if not user:
                raise ValueError(f"User with ID {user_id} not found")
            
            # Get user's goals
            goals = self.goal_repository.getByUserId(user_id)
            user_goals = []
            
            for goal in goals:
                # Get goal progress/status
                goal_status = self.goal_status_repository.getByUserAndGoal(user_id, goal.goalId)
                progress = self._calculate_goal_progress(goal, goal_status)
                
                user_goal = UserGoalDTO(
                    goalId=goal.goalId,
                    title=goal.title,
                    description=goal.description,
                    targetValue=goal.targetValue,
                    currentValue=goal_status.currentValue if goal_status else 0,
                    unit=goal.unit,
                    isCompleted=goal_status.isCompleted if goal_status else False,
                    progress=progress,
                    deadline=goal.deadline,
                    createdAt=goal.createdAt
                )
                user_goals.append(user_goal)
            
            return user_goals
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error fetching goals for user {user_id}: {e}")
            raise Exception(f"Failed to fetch user goals: {str(e)}")
    
    def create_goal(self, goal_data: GoalCreateDTO) -> GoalResponseDTO:
        """Create a new goal"""
        try:
            # Verify user exists if specified
            if goal_data.userId:
                user = self.user_repository.getById(goal_data.userId)
                if not user:
                    raise ValueError(f"User with ID {goal_data.userId} not found")
            
            # Create the goal entity
            goal_entity = GoalEntity(
                title=goal_data.title,
                description=goal_data.description,
                targetValue=goal_data.targetValue,
                unit=goal_data.unit,
                goalTypeId=goal_data.goalTypeId,
                userId=goal_data.userId,
                deadline=goal_data.deadline
            )
            
            # Save the goal
            created_goal = self.goal_repository.create(goal_entity)
            
            # If user assigned, initialize goal status
            if goal_data.userId:
                from ...Infrastructure.Repository.GoalStatusRepository import GoalStatusRepository
                goal_status_repo = GoalStatusRepository()
                from ...Core.Entity.GoalStatusEntity import GoalStatusEntity
                
                goal_status = GoalStatusEntity(
                    goalId=created_goal.goalId,
                    userId=goal_data.userId,
                    currentValue=0,
                    isCompleted=False
                )
                goal_status_repo.create(goal_status)
            
            return self._map_goal_to_response_dto(created_goal)
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error creating goal: {e}")
            raise Exception(f"Failed to create goal: {str(e)}")
    
    def update_goal(self, goal_id: int, goal_data: GoalUpdateDTO) -> GoalResponseDTO:
        """Update an existing goal"""
        try:
            # Check if goal exists
            existing_goal = self.goal_repository.getById(goal_id)
            if not existing_goal:
                raise ValueError(f"Goal with ID {goal_id} not found")
            
            # Update goal fields
            if goal_data.title is not None:
                existing_goal.title = goal_data.title
            if goal_data.description is not None:
                existing_goal.description = goal_data.description
            if goal_data.targetValue is not None:
                existing_goal.targetValue = goal_data.targetValue
            if goal_data.unit is not None:
                existing_goal.unit = goal_data.unit
            if goal_data.deadline is not None:
                existing_goal.deadline = goal_data.deadline
            
            # Save updated goal
            updated_goal = self.goal_repository.update(existing_goal)
            return self._map_goal_to_response_dto(updated_goal)
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error updating goal {goal_id}: {e}")
            raise Exception(f"Failed to update goal: {str(e)}")
    
    def delete_goal(self, goal_id: int) -> dict:
        """Delete a goal"""
        try:
            goal = self.goal_repository.getById(goal_id)
            if not goal:
                raise ValueError(f"Goal with ID {goal_id} not found")
            
            # Delete associated goal status records first
            goal_statuses = self.goal_status_repository.getByGoalId(goal_id)
            for status in goal_statuses:
                self.goal_status_repository.delete(status.statusId)
            
            # Delete the goal
            self.goal_repository.delete(goal_id)
            return {"message": f"Goal {goal_id} deleted successfully"}
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error deleting goal {goal_id}: {e}")
            raise Exception(f"Failed to delete goal: {str(e)}")
    
    def update_goal_progress(self, user_id: int, goal_id: int, new_value: float) -> GoalProgressDTO:
        """Update progress on a user's goal"""
        try:
            # Verify user and goal exist
            user = self.user_repository.getById(user_id)
            if not user:
                raise ValueError(f"User with ID {user_id} not found")
            
            goal = self.goal_repository.getById(goal_id)
            if not goal:
                raise ValueError(f"Goal with ID {goal_id} not found")
            
            # Get or create goal status
            goal_status = self.goal_status_repository.getByUserAndGoal(user_id, goal_id)
            if not goal_status:
                from ...Core.Entity.GoalStatusEntity import GoalStatusEntity
                goal_status = GoalStatusEntity(
                    goalId=goal_id,
                    userId=user_id,
                    currentValue=0,
                    isCompleted=False
                )
                goal_status = self.goal_status_repository.create(goal_status)
            
            # Update progress
            old_value = goal_status.currentValue
            goal_status.currentValue = new_value
            
            # Check if goal is completed
            was_completed = goal_status.isCompleted
            goal_status.isCompleted = new_value >= goal.targetValue
            
            # Save updated status
            updated_status = self.goal_status_repository.update(goal_status)
            
            # Award XP if goal was just completed
            xp_awarded = 0
            if not was_completed and goal_status.isCompleted:
                xp_awarded = calculate_goal_completion_xp(goal.targetValue)
                # Update user's XP
                profile = self.profile_repository.getByUserId(user_id)
                if profile:
                    profile.xp += xp_awarded
                    self.profile_repository.update(profile)
            
            progress = self._calculate_goal_progress(goal, updated_status)
            
            return GoalProgressDTO(
                goalId=goal_id,
                userId=user_id,
                currentValue=new_value,
                targetValue=goal.targetValue,
                progress=progress,
                isCompleted=goal_status.isCompleted,
                xpAwarded=xp_awarded,
                unit=goal.unit
            )
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error updating goal progress: {e}")
            raise Exception(f"Failed to update goal progress: {str(e)}")
    
    def _map_goal_to_response_dto(self, goal: GoalEntity) -> GoalResponseDTO:
        """Map GoalEntity to GoalResponseDTO"""
        return GoalResponseDTO(
            goalId=goal.goalId,
            title=goal.title,
            description=goal.description,
            targetValue=goal.targetValue,
            unit=goal.unit,
            goalTypeId=goal.goalTypeId,
            userId=goal.userId,
            deadline=goal.deadline,
            createdAt=goal.createdAt
        )
    
    def _calculate_goal_progress(self, goal: GoalEntity, goal_status) -> float:
        """Calculate progress percentage for a goal"""
        if not goal_status or goal.targetValue == 0:
            return 0.0
        
        progress = (goal_status.currentValue / goal.targetValue) * 100
        return min(progress, 100.0)  # Cap at 100%