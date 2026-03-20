"""
EvolutionService

Manages avatar evolution through the Baby -> Teen -> Adult tree.
All evolution paths come from the database (evolution_node / evolution_edge).
"""

import logging
from typing import Optional
from datetime import datetime

from ...Infrastructure.Repository.EvolutionRepository import EvolutionRepository
from ...Infrastructure.Repository.UserAvatarRepository import UserAvatarRepository
from ...Core.DTO.EvolutionDTO import (
    EvolutionNodeResponseDTO,
    EvolutionStateResponseDTO,
    EvolveResponseDTO,
)

logger = logging.getLogger(__name__)


def _node_dict_to_dto(node_with_avatar: dict) -> EvolutionNodeResponseDTO:
    """Convert a merged node+avatar dict into the response DTO."""
    return EvolutionNodeResponseDTO(
        evolutionNodeId=node_with_avatar["evolution_node_id"],
        avatarId=node_with_avatar["avatar_id"],
        name=node_with_avatar.get("name", ""),
        stage=node_with_avatar.get("stage", ""),
        levelRequired=node_with_avatar.get("level_required", 1),
        imageUrl=node_with_avatar.get("image_url"),
        animationActiveUrl=node_with_avatar.get("animation_active_url"),
        animationIdleUrl=node_with_avatar.get("animation_idle_url"),
        themeColor=node_with_avatar.get("theme_color"),
    )


class EvolutionService:

    def __init__(
        self,
        evolution_repo: Optional[EvolutionRepository] = None,
        user_avatar_repo: Optional[UserAvatarRepository] = None,
    ):
        self.evo_repo = evolution_repo or EvolutionRepository()
        self.ua_repo = user_avatar_repo or UserAvatarRepository()

    # ── public API ─────────────────────────────────────────────────

    def get_evolution_state(self, user_id: int) -> EvolutionStateResponseDTO:
        """
        Return the user's current position in the evolution tree
        and any available evolution options.
        """
        user_avatar = self.ua_repo.fetchAvatarByUserId(user_id)
        if not user_avatar:
            raise ValueError(f"No active avatar found for user {user_id}")

        node_id = user_avatar.evolution_node_id
        level = user_avatar.level

        current_node_data = self.evo_repo.fetchNodeWithAvatar(node_id)
        if not current_node_data:
            raise ValueError(f"Evolution node {node_id} not found")

        current_dto = _node_dict_to_dto(current_node_data)

        child_nodes = self.evo_repo.fetchChildNodes(node_id)
        if not child_nodes:
            return EvolutionStateResponseDTO(
                currentNode=current_dto,
                currentStage=current_node_data["stage"],
                currentLevel=level,
                isEligible=False,
                availableOptions=[],
            )

        required_level = child_nodes[0].get("level_required", 999)
        is_eligible = level >= required_level

        options = [_node_dict_to_dto(c) for c in child_nodes] if is_eligible else []

        return EvolutionStateResponseDTO(
            currentNode=current_dto,
            currentStage=current_node_data["stage"],
            currentLevel=level,
            isEligible=is_eligible,
            availableOptions=options,
        )

    def evolve(self, user_id: int, target_node_id: int) -> EvolveResponseDTO:
        """
        Transition the user's avatar to a new evolution form.
        Validates the edge exists and level requirement is met.
        """
        user_avatar = self.ua_repo.fetchAvatarByUserId(user_id)
        if not user_avatar:
            return EvolveResponseDTO(
                success=False, message="No active avatar found."
            )

        current_node_id = user_avatar.evolution_node_id

        # Validate edge
        edge = self.evo_repo.fetchEdge(current_node_id, target_node_id)
        if not edge:
            return EvolveResponseDTO(
                success=False,
                message=f"Invalid evolution path: no edge from node {current_node_id} to {target_node_id}.",
            )

        # Validate target node exists
        target_node_data = self.evo_repo.fetchNodeWithAvatar(target_node_id)
        if not target_node_data:
            return EvolveResponseDTO(
                success=False, message=f"Target node {target_node_id} not found."
            )

        # Validate level
        required = target_node_data["level_required"]
        if user_avatar.level < required:
            return EvolveResponseDTO(
                success=False,
                message=f"Level {required} required, current level is {user_avatar.level}.",
            )

        # Perform the evolution
        new_avatar_id = target_node_data["avatar_id"]
        new_stage = target_node_data["stage"]

        updated = self.ua_repo.updateUserAvatarFields(
            user_avatar.user_avatar_id,
            {
                "avatar_id": new_avatar_id,
                "evolution_node_id": target_node_id,
                "evolution_stage": new_stage,
                "last_updated": datetime.utcnow().isoformat(),
            },
        )

        target_dto = _node_dict_to_dto(target_node_data)

        logger.info(
            f"[EvolutionService] User {user_id} evolved: "
            f"node {current_node_id} -> {target_node_id} ({new_stage})"
        )

        return EvolveResponseDTO(
            success=True,
            message=f"Evolved to {target_node_data['name']}!",
            newNode=target_dto,
            updatedAvatar=updated.__dict__ if updated else None,
        )
