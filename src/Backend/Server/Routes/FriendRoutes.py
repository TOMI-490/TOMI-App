from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.FriendEntity import FriendEntity
from ...Core.DTO.FriendDTO import FriendCreateDTO, FriendUpdateDTO, FriendResponseDTO
from ...Infrastructure.Repository.FriendRepository import FriendRepository

logger = logging.getLogger(__name__)
router = APIRouter()
friendRepo = FriendRepository()

# Get all friends for a specific user
@router.get("/user/{user_id}", response_model=List[FriendResponseDTO])
async def getUserFriends(user_id: int):
    try:
        friends = friendRepo.fetchFriendsByUserId(user_id)
        return [FriendResponseDTO(**friend.__dict__) for friend in friends]
    except Exception as e:
        logger.error(f"Error fetching friends for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get a specific friendship record by ID
@router.get("/{friendship_id}", response_model=FriendResponseDTO)
async def getFriendship(friendship_id: int):
    try:
        friendship = friendRepo.fetchFriendshipById(friendship_id)
        if not friendship:
            raise HTTPException(status_code=404, detail="Friendship not found")
        return FriendResponseDTO(**friendship.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching friendship {friendship_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Send a friend request to another user
@router.post("/", response_model=FriendResponseDTO, status_code=status.HTTP_201_CREATED)
async def addFriend(friend_data: FriendCreateDTO):
    try:
        friend = FriendEntity(**friend_data.model_dump())
        created_friend = friendRepo.createFriendship(friend)
        return FriendResponseDTO(**created_friend.__dict__)
    except Exception as e:
        logger.error(f"Error adding friend: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update a friend connection
@router.put("/{friendship_id}", response_model=FriendResponseDTO)
async def updateFriendship(friendship_id: int, friend_data: FriendUpdateDTO):
    try:
        existing_friend = friendRepo.fetchFriendshipById(friendship_id)
        if not existing_friend:
            raise HTTPException(status_code=404, detail="Friendship not found")
        
        update_data = friend_data.model_dump(exclude_unset=True)
        friend_dict = existing_friend.__dict__.copy()
        friend_dict.update(update_data)
        
        friend = FriendEntity(**friend_dict)
        updated_friend = friendRepo.updateFriendship(friend)
        return FriendResponseDTO(**updated_friend.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating friendship {friendship_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Remove a friend connection
@router.delete("/{friendship_id}", status_code=status.HTTP_204_NO_CONTENT)
async def removeFriend(friendship_id: int):
    try:
        friendRepo.deleteFriendship(friendship_id)
    except Exception as e:
        logger.error(f"Error removing friend {friendship_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
