from pydantic import BaseModel

# Entity representing a Badge
class BadgeEntity(BaseModel):
    badge_id: int
    achievement: str
    name: str 
    description: str 