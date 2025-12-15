from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.Notifications import NotificationsEntity
from ...Core.DTO.NotificationDTO import NotificationCreateDTO, NotificationResponseDTO
from ...Infrastructure.Repository.NotificationRepository import NotificationRepository

logger = logging.getLogger(__name__)
router = APIRouter()
notifRepo = NotificationRepository()

# Get all notifications for a user (optionally filter to unread only)
@router.get("/user/{user_id}", response_model=List[NotificationResponseDTO])
async def getUserNotifications(user_id: int, unread_only: bool = False):
    try:
        if unread_only:
            notifications = notifRepo.fetchUnreadNotifications(user_id)
        else:
            notifications = notifRepo.fetchNotificationsByUserId(user_id)
        return [NotificationResponseDTO(**notif.__dict__) for notif in notifications]
    except Exception as e:
        logger.error(f"Error fetching notifications for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get a specific notification by ID
@router.get("/{notif_id}", response_model=NotificationResponseDTO)
async def getNotification(notif_id: int):
    try:
        notification = notifRepo.fetchNotificationById(notif_id)
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        return NotificationResponseDTO(**notification.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching notification {notif_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Create a new notification for a user
@router.post("/", response_model=NotificationResponseDTO, status_code=status.HTTP_201_CREATED)
async def createNotification(notif_data: NotificationCreateDTO):
    try:
        notification = NotificationsEntity(**notif_data.model_dump())
        created_notif = notifRepo.createNotification(notification)
        return NotificationResponseDTO(**created_notif.__dict__)
    except Exception as e:
        logger.error(f"Error creating notification: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Mark a notification as read
@router.put("/{notif_id}/read", response_model=NotificationResponseDTO)
async def markAsRead(notif_id: int):
    try:
        updated_notif = notifRepo.markAsRead(notif_id)
        return NotificationResponseDTO(**updated_notif.__dict__)
    except Exception as e:
        logger.error(f"Error marking notification {notif_id} as read: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Delete a notification
@router.delete("/{notif_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteNotification(notif_id: int):
    try:
        notifRepo.deleteNotification(notif_id)
    except Exception as e:
        logger.error(f"Error deleting notification {notif_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
