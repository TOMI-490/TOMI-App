from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.DTO.UserDTO import UserCreateDTO, UserUpdateDTO, UserResponseDTO
from ...Core.Services.UserManagementService import UserManagementService

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize service
user_service = UserManagementService()

# Check if email already exists in the system (called before registration)
@router.get("/check-email/{email}", response_model=dict)
async def checkEmailExists(email: str):
    try:
        return user_service.check_email_exists(email)
    except Exception as e:
        logger.error(f"Error checking email existence: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get all users from the database
@router.get("/", response_model=List[UserResponseDTO])
async def getAllUsers():
    try:
        return user_service.get_all_users()
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get user by auth_id (for authenticated sessions) - BEFORE /{user_id}
@router.get("/by-auth/{auth_id}", response_model=UserResponseDTO)
async def getUserByAuthId(auth_id: str):
    try:
        return user_service.get_user_by_auth_id(auth_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching user by auth_id {auth_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get user by email (for dev fallback) - BEFORE /{user_id}
@router.get("/by-email", response_model=UserResponseDTO)
async def getUserByEmail(email: str):
    try:
        return user_service.get_user_by_email(email)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching user by email {email}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get user by ID
@router.get("/{user_id}", response_model=UserResponseDTO)
async def getUserById(user_id: int):
    try:
        return user_service.get_user_by_id(user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Create a new user
@router.post("/", response_model=UserResponseDTO, status_code=status.HTTP_201_CREATED)
async def createUser(user: UserCreateDTO):
    try:
        return user_service.create_user(user)
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update an existing user
@router.put("/{user_id}", response_model=UserResponseDTO)
async def updateUser(user_id: int, user: UserUpdateDTO):
    try:
        return user_service.update_user(user_id, user)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Delete a user
@router.delete("/{user_id}")
async def deleteUser(user_id: int):
    try:
        return user_service.delete_user(user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
