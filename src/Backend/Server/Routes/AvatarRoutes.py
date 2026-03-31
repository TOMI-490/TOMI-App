from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.AvatarEntity import AvatarEntity
from ...Core.DTO.AvatarDTO import AvatarCreateDTO, AvatarUpdateDTO, AvatarResponseDTO
from ...Infrastructure.Repository.AvatarRepository import AvatarRepository

logger = logging.getLogger(__name__)
router = APIRouter()
avatarRepo = AvatarRepository()


def _entity_to_dto(entity: AvatarEntity) -> AvatarResponseDTO:
    return AvatarResponseDTO.model_validate(entity.__dict__)


@router.get("/", response_model=List[AvatarResponseDTO], response_model_by_alias=False)
async def getAllAvatars():
    try:
        avatars = avatarRepo.fetchAllAvatars()
        return [_entity_to_dto(a) for a in avatars]
    except Exception as e:
        logger.error(f"Error fetching avatars: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{avatar_id}", response_model=AvatarResponseDTO, response_model_by_alias=False)
async def getAvatar(avatar_id: int):
    try:
        avatar = avatarRepo.fetchAvatarById(avatar_id)
        if not avatar:
            raise HTTPException(status_code=404, detail="Avatar not found")
        return _entity_to_dto(avatar)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching avatar {avatar_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=AvatarResponseDTO, response_model_by_alias=False, status_code=status.HTTP_201_CREATED)
async def createAvatar(avatar_data: AvatarCreateDTO):
    try:
        avatar = AvatarEntity(**avatar_data.model_dump())
        created_avatar = avatarRepo.createAvatar(avatar)
        return _entity_to_dto(created_avatar)
    except Exception as e:
        logger.error(f"Error creating avatar: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{avatar_id}", response_model=AvatarResponseDTO, response_model_by_alias=False)
async def updateAvatar(avatar_id: int, avatar_data: AvatarUpdateDTO):
    try:
        existing_avatar = avatarRepo.fetchAvatarById(avatar_id)
        if not existing_avatar:
            raise HTTPException(status_code=404, detail="Avatar not found")

        update_data = avatar_data.model_dump(exclude_unset=True)
        avatar_dict = existing_avatar.__dict__.copy()
        avatar_dict.update(update_data)

        avatar = AvatarEntity(**avatar_dict)
        updated_avatar = avatarRepo.updateAvatar(avatar)
        return _entity_to_dto(updated_avatar)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating avatar {avatar_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{avatar_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteAvatar(avatar_id: int):
    try:
        avatarRepo.deleteAvatar(avatar_id)
    except Exception as e:
        logger.error(f"Error deleting avatar {avatar_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
