import logging
from typing import Optional, List
from ...Core.Entity.Notifications import Notifications
from ...Infrastructure.Supabase.db_connection import supabase

logger = logging.getLogger(__name__)

class NotificationRepository:
    
    def __init__(self):
        self._client = supabase
        self._table_name = "Notifications"
    
    def dataToEntity(self, data: dict) -> Notifications:
        try:
            return Notifications(**data)
        except Exception as e:
            logger.error(f"Error converting data to Notifications: {e}")
            raise

    def entityToData(self, entity: Notifications) -> dict:
        if hasattr(entity, "to_dict") and callable(entity.to_dict):
            return entity.to_dict()
        return entity.__dict__

    def fetchNotificationsByUserId(self, user_id: int) -> List[Notifications]:
        try:
            response = self._client.table(self._table_name).select("*").eq("userId", user_id).execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching notifications for user {user_id}: {e}")
            raise

    def fetchUnreadNotifications(self, user_id: int) -> List[Notifications]:
        try:
            response = self._client.table(self._table_name)\
                .select("*")\
                .eq("userId", user_id)\
                .eq("isRead", False)\
                .execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching unread notifications for user {user_id}: {e}")
            raise

    def createNotification(self, notification: Notifications) -> Notifications:
        try:
            data = self.entityToData(notification)
            response = self._client.table(self._table_name).insert(data).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to create notification")
        except Exception as e:
            logger.error(f"Error creating notification: {e}")
            raise

    def markAsRead(self, notif_id: int) -> Notifications:
        try:
            response = self._client.table(self._table_name)\
                .update({"isRead": True})\
                .eq("notifId", notif_id)\
                .execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to mark notification as read")
        except Exception as e:
            logger.error(f"Error marking notification {notif_id} as read: {e}")
            raise

    def deleteNotification(self, notif_id: int) -> bool:
        try:
            self._client.table(self._table_name).delete().eq("notifId", notif_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting notification {notif_id}: {e}")
            raise
