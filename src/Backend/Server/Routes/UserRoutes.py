from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.UserEntity import UserEntity
from ...Core.DTO.UserDTO import UserCreateDTO, UserUpdateDTO, UserResponseDTO
from ...Infrastructure.Repository.UserRepository import UserRepository

logger = logging.getLogger(__name__)
router = APIRouter()
userRepo = UserRepository()

# Check if email already exists in the system (called before registration)
@router.get("/check-email/{email}", response_model=dict)
async def checkEmailExists(email: str):
    try:
        exists = userRepo.emailExists(email)
        return {"exists": exists, "email": email}
    except Exception as e:
        logger.error(f"Error checking email existence: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get all users from the database
@router.get("/", response_model=List[UserResponseDTO])
async def getAllUsers():
    try:
        users = userRepo.fetchAllUsers()
        return [UserResponseDTO.model_validate(user, from_attributes=True) for user in users]
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get user by auth_id (for authenticated sessions) - BEFORE /{user_id}
@router.get("/by-auth/{auth_id}", response_model=UserResponseDTO)
async def getUserByAuthId(auth_id: str):
    try:
        user = userRepo.fetchUserByAuthId(auth_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserResponseDTO.model_validate(user, from_attributes=True)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user by auth_id {auth_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get user by email (for dev fallback) - BEFORE /{user_id}
@router.get("/by-email", response_model=UserResponseDTO)
async def getUserByEmail(email: str):
    try:
        user = userRepo.fetchUserByEmail(email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserResponseDTO.model_validate(user, from_attributes=True)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user by email {email}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get a specific user by their ID
@router.get("/{user_id}", response_model=UserResponseDTO)
async def getUser(user_id: int):
    try:
        user = userRepo.fetchUserById(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserResponseDTO.model_validate(user, from_attributes=True)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Create a new user in the system
@router.post("/", response_model=UserResponseDTO, status_code=status.HTTP_201_CREATED)
async def createUser(user_data: UserCreateDTO):
    try:
        # Pass the DTO directly to the repository - let the database generate user_id and created_at
        created_user = userRepo.createUserFromDTO(user_data)
        # Convert Entity to dict then to DTO - this will apply aliases for response
        return UserResponseDTO.model_validate(created_user, from_attributes=True)
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update an existing user's information
@router.put("/{user_id}", response_model=UserResponseDTO)
async def updateUser(user_id: int, user_data: UserUpdateDTO):
    try:
        existing_user = userRepo.fetchUserById(user_id)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        update_data = user_data.model_dump(exclude_unset=True, by_alias=False)
        user_dict = existing_user.model_dump()
        user_dict.update(update_data)
        
        user = UserEntity(**user_dict)
        updated_user = userRepo.updateUser(user)
        return UserResponseDTO.model_validate(updated_user, from_attributes=True)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Delete a user from the system
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteUser(user_id: int):
    try:
        userRepo.deleteUser(user_id)
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Update user's language
@router.patch("/{user_id}/language", response_model=UserResponseDTO)
async def updateUserLanguage(user_id: int, language_data: dict):
    try:
        language = language_data.get("language")
        if not language or language not in ["en", "fr"]:
            raise HTTPException(status_code=400, detail="Invalid language. Must be 'en' or 'fr'")
        
        updated_user = userRepo.updateUserLanguage(user_id, language)
        return UserResponseDTO.model_validate(updated_user, from_attributes=True)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating language for user {user_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
