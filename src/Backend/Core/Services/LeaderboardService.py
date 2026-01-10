from typing import List, Optional
import logging

from ..DTO.CommunityDTO import (
    LeaderboardResponseDTO,
    LeaderboardEntryDTO,
    CurrentUserLeaderboardDTO
)
from ...Infrastructure.Repository.UserRepository import UserRepository
from ...Infrastructure.Repository.UserAvatarRepository import UserAvatarRepository
from ...Infrastructure.Repository.FriendRepository import FriendRepository
from .FriendshipService import FriendshipService
from .UserService import UserService

logger = logging.getLogger(__name__)

class LeaderboardService:
    def __init__(self):
        self.user_repo = UserRepository()
        self.user_avatar_repo = UserAvatarRepository()
        self.friend_repo = FriendRepository()
        self.friendship_service = FriendshipService()
        self.user_service = UserService()
    
    def get_leaderboard(self, user_id: int, scope: str = "friends", period: str = "week") -> LeaderboardResponseDTO:
        """Get leaderboard data based on scope (friends/global) and period (week/month)."""
        try:
            # Calculate XP from user avatars (low-fidelity implementation)
            if scope == "friends":
                user_ids_to_rank = self._get_friend_user_ids(user_id)
                user_ids_to_rank.append(user_id)  # Include current user
            else:
                # Global scope - get all users
                all_users = self.user_repo.fetchAllUsers()
                user_ids_to_rank = [u.user_id for u in all_users]
            
            # Calculate XP for each user (from active avatar)
            user_scores = []
            for uid in user_ids_to_rank:
                user_info = self.user_service.get_user_avatar_info(uid)
                if user_info:
                    user_scores.append({
                        "user_id": uid,
                        "name": user_info["user"].name,
                        "level": user_info["level"],
                        "xp": user_info["xp"]
                    })
            
            # Sort by XP descending
            user_scores.sort(key=lambda x: x["xp"], reverse=True)
            
            # Assign ranks and create entries
            entries = []
            current_user_entry = None
            
            for rank, user_score in enumerate(user_scores, start=1):
                entry = LeaderboardEntryDTO(
                    rank=rank,
                    userId=user_score["user_id"],
                    displayName=user_score["name"],
                    level=user_score["level"],
                    xp=user_score["xp"],
                    avatarUrl=None  # Low-fidelity: no avatars
                )
                entries.append(entry)
                
                # Check if this is the current user
                if user_score["user_id"] == user_id:
                    current_user_entry = CurrentUserLeaderboardDTO(
                        rank=rank,
                        userId=user_score["user_id"],
                        displayName=user_score["name"],
                        level=user_score["level"],
                        xp=user_score["xp"],
                        avatarUrl=None
                    )
            
            return LeaderboardResponseDTO(
                scope=scope,
                period=period,
                entries=entries,
                currentUser=current_user_entry
            )
        except Exception as e:
            logger.error(f"Error fetching leaderboard: {e}")
            raise
    
    def _get_friend_user_ids(self, user_id: int) -> List[int]:
        """Get list of friend user IDs for leaderboard scope."""
        try:
            accepted_status_id = self.friendship_service.get_status_id_by_name("accepted")
            if not accepted_status_id:
                return []
            
            friend_user_ids = []
            
            # Get friends where user is initiator
            friendships = self.friend_repo.fetchFriendsByStatus(user_id, accepted_status_id)
            for friendship in friendships:
                friend_user_ids.append(friendship.friend_user_id)
            
            # Get friends where user is recipient
            from ...Infrastructure.Supabase.db_connection import supabase
            recipient_response = supabase.table("friend").select("*")\
                .eq("friend_user_id", user_id)\
                .eq("status_id", accepted_status_id)\
                .execute()
            
            for record in recipient_response.data:
                friend_user_ids.append(record['user_id'])
            
            return list(set(friend_user_ids))  # Remove duplicates
        except Exception as e:
            logger.error(f"Error getting friend user IDs for user {user_id}: {e}")
            return []