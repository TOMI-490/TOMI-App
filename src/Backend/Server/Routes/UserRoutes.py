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
        return [UserResponseDTO(**user.__dict__) for user in users]
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get a specific user by their ID
@router.get("/{user_id}", response_model=UserResponseDTO)
async def getUser(user_id: int):
    try:
        user = userRepo.fetchUserById(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserResponseDTO(**user.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Create a new user in the system
@router.post("/", response_model=UserResponseDTO, status_code=status.HTTP_201_CREATED)
async def createUser(user_data: UserCreateDTO):
    try:
        # Pass the DTO directly to the repository - let the database generate userId and createdAt
        created_user = userRepo.createUserFromDTO(user_data)
        return UserResponseDTO(**created_user.__dict__)
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
        
        update_data = user_data.model_dump(exclude_unset=True)
        user_dict = existing_user.__dict__.copy()
        user_dict.update(update_data)
        
        user = UserEntity(**user_dict)
        updated_user = userRepo.updateUser(user)
        return UserResponseDTO(**updated_user.__dict__)
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
