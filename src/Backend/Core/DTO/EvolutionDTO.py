from typing import Optional, List
from pydantic import BaseModel, Field


class EvolutionNodeResponseDTO(BaseModel):
    """An evolution node with joined avatar asset URLs."""
    evolution_node_id: int = Field(..., alias="evolutionNodeId")
    avatar_id: int = Field(..., alias="avatarId")
    name: str
    stage: str
    level_required: int = Field(..., alias="levelRequired")
    image_url: Optional[str] = Field(None, alias="imageUrl")
    animation_active_url: Optional[str] = Field(None, alias="animationActiveUrl")
    animation_idle_url: Optional[str] = Field(None, alias="animationIdleUrl")
    theme_color: Optional[str] = Field(None, alias="themeColor")

    class Config:
        populate_by_name = True
        by_alias = True


class EvolutionStateResponseDTO(BaseModel):
    """Full evolution state for a user: current position + available options."""
    current_node: EvolutionNodeResponseDTO = Field(..., alias="currentNode")
    current_stage: str = Field(..., alias="currentStage")
    current_level: int = Field(..., alias="currentLevel")
    is_eligible: bool = Field(..., alias="isEligible")
    available_options: List[EvolutionNodeResponseDTO] = Field(
        default_factory=list, alias="availableOptions"
    )

    class Config:
        populate_by_name = True
        by_alias = True


class EvolveRequestDTO(BaseModel):
    user_id: int = Field(..., gt=0, alias="userId")
    target_node_id: int = Field(..., gt=0, alias="targetNodeId")

    class Config:
        populate_by_name = True


class EvolveResponseDTO(BaseModel):
    success: bool
    message: str
    new_node: Optional[EvolutionNodeResponseDTO] = Field(None, alias="newNode")
    updated_avatar: Optional[dict] = Field(None, alias="updatedAvatar")

    class Config:
        populate_by_name = True
        by_alias = True
