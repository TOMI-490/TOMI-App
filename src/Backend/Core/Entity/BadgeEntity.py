from pydantic import BaseModel

# Entity representing a Badge
class BadgeEntity(BaseModel):
    badgeId: int
    achievement: str
    name: str 
    description: str 