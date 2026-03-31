import logging
from typing import Optional, List
from ...Core.Entity.Notifications import NotificationsEntity
from ...Infrastructure.Supabase.db_connection import supabase

logger = logging.getLogger(__name__)

class NotificationRepository:
    
    def __init__(self):
        self._client = supabase
        self._table_name = "notifications"
    
    def dataToEntity(self, data: dict) -> NotificationsEntity:
        try:
            return NotificationsEntity(**data)
        except Exception as e:
            logger.error(f"Error converting data to Notifications: {e}")
            raise

    def entityToData(self, entity: NotificationsEntity) -> dict:
        if hasattr(entity, "to_dict") and callable(entity.to_dict):
            return entity.to_dict()
        return entity.__dict__

    def fetchNotificationsByUserId(self, user_id: int) -> List[NotificationsEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("user_id", user_id).execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching notifications for user {user_id}: {e}")
            raise

    def fetchUnreadNotifications(self, user_id: int) -> List[NotificationsEntity]:
        try:
            response = self._client.table(self._table_name)\
                .select("*")\
                .eq("user_id", user_id)\
                .eq("isRead", False)\
                .execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching unread notifications for user {user_id}: {e}")
            raise

    def fetchNotificationById(self, notif_id: int) -> Optional[NotificationsEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("notif_id", notif_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching notification {notif_id}: {e}")
            raise

    def createNotification(self, notification: NotificationsEntity) -> NotificationsEntity:
        try:
            data = self.entityToData(notification)
            response = self._client.table(self._table_name).insert(data).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to create notification")
        except Exception as e:
            logger.error(f"Error creating notification: {e}")
            raise

    def updateNotification(self, notification: NotificationsEntity) -> NotificationsEntity:
        try:
            data = self.entityToData(notification)
            notif_id_val = getattr(notification, "notif_id", None)
            
            if not notif_id_val:
                raise ValueError("Notification ID is required for update")
            
            response = self._client.table(self._table_name).update(data).eq("notif_id", notif_id_val).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update notification")
        except Exception as e:
            logger.error(f"Error updating notification: {e}")
            raise

    def markAsRead(self, notif_id: int) -> NotificationsEntity:
        try:
            response = self._client.table(self._table_name)\
                .update({"isRead": True})\
                .eq("notif_id", notif_id)\
                .execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to mark notification as read")
        except Exception as e:
            logger.error(f"Error marking notification {notif_id} as read: {e}")
            raise

    def deleteNotification(self, notif_id: int) -> bool:
        try:
            self._client.table(self._table_name).delete().eq("notif_id", notif_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting notification {notif_id}: {e}")
            raise
