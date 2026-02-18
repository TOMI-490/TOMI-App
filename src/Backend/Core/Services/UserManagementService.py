from typing import List, Optional
import logging

from ..Entity.UserEntity import UserEntity
from ..DTO.UserDTO import UserCreateDTO, UserUpdateDTO, UserResponseDTO
from ...Infrastructure.Repository.UserRepository import UserRepository

logger = logging.getLogger(__name__)

class UserManagementService:
    def __init__(self):
        self.user_repo = UserRepository()
    
    def check_email_exists(self, email: str) -> dict:
        """Check if email already exists in the system."""
        try:
            exists = self.user_repo.emailExists(email)
            return {"exists": exists, "email": email}
        except Exception as e:
            logger.error(f"Error checking email existence: {e}")
            raise
    
    def get_all_users(self) -> List[UserResponseDTO]:
        """Get all users from the database."""
        try:
            users = self.user_repo.fetchAllUsers()
            return [UserResponseDTO.model_validate(user, from_attributes=True) for user in users]
        except Exception as e:
            logger.error(f"Error fetching users: {e}")
            raise
    
    def get_user_by_auth_id(self, auth_id: str) -> UserResponseDTO:
        """Get user by auth_id for authenticated sessions."""
        try:
            user = self.user_repo.fetchUserByAuthId(auth_id)
            if not user:
                raise ValueError("User not found")
            return UserResponseDTO.model_validate(user, from_attributes=True)
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error fetching user by auth_id {auth_id}: {e}")
            raise
    
    def get_user_by_email(self, email: str) -> UserResponseDTO:
        """Get user by email for development fallback."""
        try:
            user = self.user_repo.fetchUserByEmail(email)
            if not user:
                raise ValueError("User not found")
            return UserResponseDTO.model_validate(user, from_attributes=True)
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error fetching user by email {email}: {e}")
            raise
    
    def get_user_by_id(self, user_id: int) -> UserResponseDTO:
        """Get user by ID."""
        try:
            user = self.user_repo.fetchUserById(user_id)
            if not user:
                raise ValueError("User not found")
            return UserResponseDTO.model_validate(user, from_attributes=True)
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error fetching user {user_id}: {e}")
            raise
    
    def create_user(self, user_data: UserCreateDTO) -> UserResponseDTO:
        """Create a new user."""
        try:
            user_entity = UserEntity(
                name=user_data.name,
                email=user_data.email,
                auth_id=user_data.authId if hasattr(user_data, 'authId') else None
            )
            created_user = self.user_repo.createUser(user_entity)
            return UserResponseDTO.model_validate(created_user, from_attributes=True)
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
    
    def update_user(self, user_id: int, user_data: UserUpdateDTO) -> UserResponseDTO:
        """Update an existing user."""
        try:
            # First check if user exists
            existing_user = self.user_repo.fetchUserById(user_id)
            if not existing_user:
                raise ValueError("User not found")
            
            # Update user entity
            existing_user.name = user_data.name
            existing_user.email = user_data.email
            if hasattr(user_data, 'authId'):
                existing_user.auth_id = user_data.authId
            
            updated_user = self.user_repo.updateUser(existing_user)
            return UserResponseDTO.model_validate(updated_user, from_attributes=True)
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error updating user {user_id}: {e}")
            raise
    
    def delete_user(self, user_id: int) -> dict:
        """Delete a user."""
        try:
            # Check if user exists
            user = self.user_repo.fetchUserById(user_id)
            if not user:
                raise ValueError("User not found")
            
            self.user_repo.deleteUser(user_id)
            return {"message": "User deleted successfully"}
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error deleting user {user_id}: {e}")
            raise