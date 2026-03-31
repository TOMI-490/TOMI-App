from pydantic import BaseModel


class NotificationsEntity(BaseModel):
    notif_id: int 
    user_id: int 
    notif_type: str
    description: str
    is_read: bool