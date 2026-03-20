import logging
from typing import Optional, List
from ...Core.Entity.EvolutionEntity import EvolutionNodeEntity, EvolutionEdgeEntity
from ...Core.Entity.AvatarEntity import AvatarEntity
from ...Infrastructure.Supabase.db_connection import supabase

logger = logging.getLogger(__name__)


class EvolutionRepository:

    def __init__(self):
        self._client = supabase

    # ── evolution_node queries ──────────────────────────────────────

    def fetchNodeById(self, node_id: int) -> Optional[EvolutionNodeEntity]:
        try:
            response = (
                self._client.table("evolution_node")
                .select("*")
                .eq("evolution_node_id", node_id)
                .execute()
            )
            if response.data:
                return EvolutionNodeEntity(**response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching evolution node {node_id}: {e}")
            raise

    def fetchNodeWithAvatar(self, node_id: int) -> Optional[dict]:
        """Return an evolution node merged with its avatar template data."""
        try:
            node_resp = (
                self._client.table("evolution_node")
                .select("*")
                .eq("evolution_node_id", node_id)
                .execute()
            )
            if not node_resp.data:
                return None

            node = node_resp.data[0]
            avatar_resp = (
                self._client.table("avatar")
                .select("*")
                .eq("avatar_id", node["avatar_id"])
                .execute()
            )
            avatar = avatar_resp.data[0] if avatar_resp.data else {}
            # Node's name takes priority; avatar assets go under their own keys
            return {
                **node,
                "image_url": avatar.get("image_url"),
                "animation_active_url": avatar.get("animation_active_url"),
                "animation_idle_url": avatar.get("animation_idle_url"),
                "animation_post_workout_url": avatar.get("animation_post_workout_url"),
                "theme_color": avatar.get("theme_color"),
            }
        except Exception as e:
            logger.error(f"Error fetching node with avatar {node_id}: {e}")
            raise

    # ── evolution_edge queries ──────────────────────────────────────

    def fetchChildNodes(self, parent_node_id: int) -> List[dict]:
        """Return child evolution nodes (with avatar data) for a given parent."""
        try:
            edge_resp = (
                self._client.table("evolution_edge")
                .select("child_node_id")
                .eq("parent_node_id", parent_node_id)
                .execute()
            )
            if not edge_resp.data:
                return []

            child_ids = [row["child_node_id"] for row in edge_resp.data]

            node_resp = (
                self._client.table("evolution_node")
                .select("*")
                .in_("evolution_node_id", child_ids)
                .execute()
            )
            if not node_resp.data:
                return []

            avatar_ids = list({n["avatar_id"] for n in node_resp.data})
            avatar_resp = (
                self._client.table("avatar")
                .select("*")
                .in_("avatar_id", avatar_ids)
                .execute()
            )
            avatar_map = {a["avatar_id"]: a for a in (avatar_resp.data or [])}

            results = []
            for n in node_resp.data:
                avatar = avatar_map.get(n["avatar_id"], {})
                results.append({
                    **n,
                    "image_url": avatar.get("image_url"),
                    "animation_active_url": avatar.get("animation_active_url"),
                    "animation_idle_url": avatar.get("animation_idle_url"),
                    "animation_post_workout_url": avatar.get("animation_post_workout_url"),
                    "theme_color": avatar.get("theme_color"),
                })
            return results
        except Exception as e:
            logger.error(f"Error fetching child nodes for parent {parent_node_id}: {e}")
            raise

    def fetchEdge(self, parent_id: int, child_id: int) -> Optional[EvolutionEdgeEntity]:
        """Validate that a specific parent -> child transition exists."""
        try:
            response = (
                self._client.table("evolution_edge")
                .select("*")
                .eq("parent_node_id", parent_id)
                .eq("child_node_id", child_id)
                .execute()
            )
            if response.data:
                return EvolutionEdgeEntity(**response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching edge {parent_id} -> {child_id}: {e}")
            raise
