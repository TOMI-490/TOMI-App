from pydantic import BaseModel


class NotificationsEntity(BaseModel):
    notifId: int 
    userId: int 
    notifType: str
    description: str
    isRead: bool