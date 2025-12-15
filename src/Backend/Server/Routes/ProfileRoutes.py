from fastapi import APIRouter, HTTPException, status
import logging

from ...Core.Entity.ProfileEntity import ProfileEntity
from ...Core.DTO.ProfileDTO import ProfileCreateDTO, ProfileUpdateDTO, ProfileResponseDTO
from ...Infrastructure.Repository.ProfileRepository import ProfileRepository

logger = logging.getLogger(__name__)
router = APIRouter()
profileRepo = ProfileRepository()

# Get profile statistics for a specific user
@router.get("/user/{user_id}", response_model=ProfileResponseDTO)
async def getProfileByUser(user_id: int):
    try:
        profile = profileRepo.fetchProfileByUserId(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return ProfileResponseDTO(**profile.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching profile for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Create a new profile for a user
@router.post("/", response_model=ProfileResponseDTO, status_code=status.HTTP_201_CREATED)
async def createProfile(profile_data: ProfileCreateDTO):
    try:
        profile = ProfileEntity(**profile_data.model_dump())
        created_profile = profileRepo.createProfile(profile)
        return ProfileResponseDTO(**created_profile.__dict__)
    except Exception as e:
        logger.error(f"Error creating profile: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update profile statistics (workouts completed, calories burned, etc.)
@router.put("/{profile_id}", response_model=ProfileResponseDTO)
async def updateProfile(profile_id: int, profile_data: ProfileUpdateDTO):
    try:
        # Fetch existing profile
        existing_profile = profileRepo.fetchProfileById(profile_id)
        if not existing_profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        update_data = profile_data.model_dump(exclude_unset=True)
        profile_dict = existing_profile.__dict__.copy()
        profile_dict.update(update_data)
        
        profile = ProfileEntity(**profile_dict)
        updated_profile = profileRepo.updateProfile(profile)
        return ProfileResponseDTO(**updated_profile.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile {profile_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
