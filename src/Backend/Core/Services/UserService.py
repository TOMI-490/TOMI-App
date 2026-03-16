from typing import List, Optional
import logging

from ..Entity.UserEntity import UserEntity
from ..DTO.CommunityDTO import UserSearchResultDTO
from ...Infrastructure.Repository.UserRepository import UserRepository
from ...Infrastructure.Repository.UserAvatarRepository import UserAvatarRepository
from ...Infrastructure.Repository.AvatarRepository import AvatarRepository
from ...Infrastructure.Repository.FriendRepository import FriendRepository

logger = logging.getLogger(__name__)

class UserService:
    def __init__(self):
        self.user_repo = UserRepository()
        self.user_avatar_repo = UserAvatarRepository()
        self.avatar_repo = AvatarRepository()
        self.friend_repo = FriendRepository()
    
    def search_users(self, query: str, current_user_id: int, limit: int = 20) -> List[UserSearchResultDTO]:
        """Search users by name or email and return their relationship status with current user."""
        try:
            # Search users by name or email
            all_users = self.user_repo.fetchAllUsers()
            matching_users = [
                u for u in all_users 
                if (query.lower() in u.name.lower() or query.lower() in u.email.lower()) 
                and u.user_id != current_user_id
            ]
            
            # Limit results
            matching_users = matching_users[:limit]
            
            # Get relationship status for each user
            results = []
            from ...Infrastructure.Repository.FriendStatusRepository import FriendStatusRepository
            friend_status_repo = FriendStatusRepository()
            
            pending_status_id = self._get_status_id_by_name("pending", friend_status_repo)
            accepted_status_id = self._get_status_id_by_name("accepted", friend_status_repo)
            blocked_status_id = self._get_status_id_by_name("blocked", friend_status_repo)
            
            for user in matching_users:
                relationship_status = self._get_relationship_status(
                    current_user_id, user.user_id, 
                    pending_status_id, accepted_status_id, blocked_status_id
                )
                
                # Get display info
                display_info = self._get_user_display_info(user.user_id)
                
                results.append(UserSearchResultDTO(
                    userId=user.user_id,
                    relationship=relationship_status,
                    **display_info
                ))
            
            return results
        except Exception as e:
            logger.error(f"Error searching users: {e}")
            raise
    
    def _get_status_id_by_name(self, status_name: str, friend_status_repo) -> int:
        """Get status ID by status name."""
        try:
            statuses = friend_status_repo.fetchAllStatuses()
            for status in statuses:
                if status.status.lower() == status_name.lower():
                    return status.statusId
            return None
        except Exception as e:
            logger.error(f"Error fetching status ID for {status_name}: {e}")
            return None
    
    def _get_user_display_info(self, user_id: int) -> dict:
        """Get user display information for friend lists."""
        try:
            user = self.user_repo.fetchUserById(user_id)
            if not user:
                return {"displayName": "Unknown User", "level": None, "avatarUrl": None}
            
            # Get active avatar and level
            active_avatar = self.user_avatar_repo.fetchAvatarByUserId(user_id)
            avatar_url = None
            if active_avatar:
                avatar_entity = self.avatar_repo.fetchAvatarById(active_avatar.avatar_id)
                if avatar_entity and avatar_entity.image_url:
                    avatar_url = avatar_entity.image_url
            
            return {
                "displayName": user.name,
                "level": active_avatar.level if active_avatar else None,
                "avatarUrl": avatar_url
            }
        except Exception as e:
            logger.error(f"Error getting display info for user {user_id}: {e}")
            return {"displayName": "Unknown User", "level": None, "avatarUrl": None}
    
    def _get_relationship_status(self, user_id: int, target_user_id: int, 
                               pending_status_id: int, accepted_status_id: int, 
                               blocked_status_id: int) -> str:
        """Determine the relationship status between current user and target user."""
        try:
            # Check outgoing friendships (user -> target)
            user_friendships = self.friend_repo.fetchFriendsByUserId(user_id)
            for friendship in user_friendships:
                if friendship.friend_user_id == target_user_id:
                    if friendship.status_id == accepted_status_id:
                        return "friends"
                    elif friendship.status_id == pending_status_id:
                        return "outgoing_request"
                    elif friendship.status_id == blocked_status_id:
                        return "blocked"
            
            # Check incoming friendships (target -> user)
            from ...Infrastructure.Supabase.db_connection import supabase
            incoming_response = supabase.table("friend").select("*")\
                .eq("user_id", target_user_id)\
                .eq("friend_user_id", user_id)\
                .execute()
            
            if incoming_response.data:
                friendship_data = incoming_response.data[0]
                if friendship_data['status_id'] == pending_status_id:
                    return "incoming_request"
                elif friendship_data['status_id'] == blocked_status_id:
                    return "blocked"
            
            return "none"
        except Exception as e:
            logger.error(f"Error getting relationship status: {e}")
            return "none"
    
    def get_user_by_id(self, user_id: int) -> Optional[UserEntity]:
        """Get user by ID."""
        try:
            return self.user_repo.fetchUserById(user_id)
        except Exception as e:
            logger.error(f"Error fetching user {user_id}: {e}")
            return None
    
    def get_user_avatar_info(self, user_id: int) -> dict:
        """Get user avatar information including level, XP, and avatar URL."""
        try:
            user = self.user_repo.fetchUserById(user_id)
            if not user:
                return None
            
            active_avatar = self.user_avatar_repo.fetchAvatarByUserId(user_id)
            avatar_url = None
            if active_avatar:
                avatar_entity = self.avatar_repo.fetchAvatarById(active_avatar.avatar_id)
                if avatar_entity and avatar_entity.image_url:
                    avatar_url = avatar_entity.image_url
            
            return {
                "user": user,
                "avatar": active_avatar,
                "level": active_avatar.level if active_avatar else 1,
                "xp": active_avatar.xp if active_avatar else 0,
                "nickname": active_avatar.nickname if active_avatar else user.name,
                "avatarUrl": avatar_url
            }
        except Exception as e:
            logger.error(f"Error getting avatar info for user {user_id}: {e}")
            return None