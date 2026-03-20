from typing import Optional, List
from datetime import datetime, timedelta
import logging

from ..Entity.FriendEntity import FriendEntity
from ..Entity.UserEntity import UserEntity
from ..DTO.CommunityDTO import (
    FriendListItemDTO, 
    FriendRequestItemDTO, 
    FriendRequestsResponseDTO,
    CreateFriendRequestDTO
)
from ...Infrastructure.Repository.FriendRepository import FriendRepository
from ...Infrastructure.Repository.FriendStatusRepository import FriendStatusRepository
from ...Infrastructure.Repository.UserRepository import UserRepository
from ...Infrastructure.Repository.UserAvatarRepository import UserAvatarRepository
from ...Infrastructure.Repository.AvatarRepository import AvatarRepository
from ...Infrastructure.Repository.UserBadgeRepository import UserBadgeRepository
from ...Core.Utils.xp_utils import calculate_xp_progression, level_from_total_xp

logger = logging.getLogger(__name__)

class FriendshipService:
    def __init__(self):
        self.friend_repo = FriendRepository()
        self.friend_status_repo = FriendStatusRepository()
        self.user_repo = UserRepository()
        self.user_avatar_repo = UserAvatarRepository()
        self.avatar_repo = AvatarRepository()
        self.user_badge_repo = UserBadgeRepository()
    
    def get_status_id_by_name(self, status_name: str) -> Optional[int]:
        """Get status ID by status name."""
        try:
            statuses = self.friend_status_repo.fetchAllStatuses()
            for status in statuses:
                if status.status.lower() == status_name.lower():
                    return status.statusId
            return None
        except Exception as e:
            logger.error(f"Error fetching status ID for {status_name}: {e}")
            return None
    
    def get_user_display_info(self, user_id: int, include_gamification: bool = False) -> dict:
        """Get user display information for friend lists."""
        try:
            user = self.user_repo.fetchUserById(user_id)
            if not user:
                return {"displayName": "Unknown User", "level": None, "avatarUrl": None}
            
            # Get active avatar and level
            active_avatar = self.user_avatar_repo.fetchAvatarByUserId(user_id)
            avatar_url = None
            xp = None
            level = None
            current_xp = None
            next_level_xp = None
            xp_progress = None
            badges_count = None
            
            if active_avatar:
                avatar_entity = self.avatar_repo.fetchAvatarById(active_avatar.avatar_id)
                if avatar_entity and avatar_entity.image_url:
                    avatar_url = avatar_entity.image_url
                xp = active_avatar.xp
                level = level_from_total_xp(xp)
                if include_gamification and xp is not None:
                    prog = calculate_xp_progression(level, xp)
                    current_xp = xp
                    next_level_xp = prog["next_level_xp"]
                    xp_progress = prog["xp_progress"]
            
            if include_gamification:
                try:
                    badges = self.user_badge_repo.fetchBadgesByUserId(user_id)
                    badges_count = len(badges)
                except Exception:
                    badges_count = 0
            
            result = {
                "displayName": user.name,
                "level": level,
                "avatarUrl": avatar_url
            }
            if include_gamification:
                result["xp"] = xp
                result["badgesCount"] = badges_count
                result["currentXp"] = current_xp
                result["nextLevelXp"] = next_level_xp
                result["xpProgress"] = xp_progress
            return result
        except Exception as e:
            logger.error(f"Error getting display info for user {user_id}: {e}")
            return {"displayName": "Unknown User", "level": None, "avatarUrl": None}
    
    def verify_friendship_exists(self, user_id: int, friend_id: int) -> bool:
        """Verify that an accepted friendship exists between two users (bidirectional)."""
        try:
            accepted_status_id = self.get_status_id_by_name("accepted")
            if not accepted_status_id:
                return False
            
            from ...Infrastructure.Supabase.db_connection import supabase
            
            # Check if user initiated the friendship
            friendship_initiated = supabase.table("friend").select("*")\
                .eq("user_id", user_id)\
                .eq("friend_user_id", friend_id)\
                .eq("status_id", accepted_status_id)\
                .execute()
            
            # Check if user received the friendship
            friendship_received = supabase.table("friend").select("*")\
                .eq("user_id", friend_id)\
                .eq("friend_user_id", user_id)\
                .eq("status_id", accepted_status_id)\
                .execute()
            
            return len(friendship_initiated.data) > 0 or len(friendship_received.data) > 0
        except Exception as e:
            logger.error(f"Error verifying friendship between {user_id} and {friend_id}: {e}")
            return False
    
    def get_friends_list(self, user_id: int) -> List[FriendListItemDTO]:
        """Get list of accepted friends for a user."""
        try:
            accepted_status_id = self.get_status_id_by_name("accepted")
            if not accepted_status_id:
                raise ValueError("Friend status 'accepted' not found")
            
            # Fetch friendships where user is the initiator
            friendships = self.friend_repo.fetchFriendsByStatus(user_id, accepted_status_id)
            
            # Fetch friendships where user is the recipient
            from ...Infrastructure.Supabase.db_connection import supabase
            recipient_response = supabase.table("friend").select("*")\
                .eq("friend_user_id", user_id)\
                .eq("status_id", accepted_status_id)\
                .execute()
            recipient_friendships = [FriendEntity(**record) for record in recipient_response.data]
            
            friends_list = []
            seen_user_ids = set()
            
            # Process initiator friendships
            for friendship in friendships:
                if friendship.friend_user_id not in seen_user_ids:
                    display_info = self.get_user_display_info(friendship.friend_user_id, include_gamification=True)
                    friends_list.append(FriendListItemDTO(
                        userId=friendship.friend_user_id,
                        **display_info
                    ))
                    seen_user_ids.add(friendship.friend_user_id)
            
            # Process recipient friendships
            for friendship in recipient_friendships:
                if friendship.user_id not in seen_user_ids:
                    display_info = self.get_user_display_info(friendship.user_id, include_gamification=True)
                    friends_list.append(FriendListItemDTO(
                        userId=friendship.user_id,
                        **display_info
                    ))
                    seen_user_ids.add(friendship.user_id)
            
            return friends_list
        except Exception as e:
            logger.error(f"Error fetching friends for user {user_id}: {e}")
            raise
    
    def get_friend_requests(self, user_id: int) -> FriendRequestsResponseDTO:
        """Get incoming and outgoing friend requests for a user."""
        try:
            pending_status_id = self.get_status_id_by_name("pending")
            if not pending_status_id:
                raise ValueError("Friend status 'pending' not found")
            
            # Fetch outgoing requests (user sent these)
            outgoing_friendships = self.friend_repo.fetchFriendsByUserId(user_id)
            
            # Fetch incoming requests (user received these)
            from ...Infrastructure.Supabase.db_connection import supabase
            incoming_response = supabase.table("friend").select("*").eq("friend_user_id", user_id).execute()
            incoming_friendships = [FriendEntity(**record) for record in incoming_response.data]
            
            incoming_requests = []
            outgoing_requests = []
            
            # Process outgoing requests
            for friendship in outgoing_friendships:
                if friendship.status_id == pending_status_id:
                    display_info = self.get_user_display_info(friendship.friend_user_id)
                    outgoing_requests.append(FriendRequestItemDTO(
                        requestId=friendship.id,
                        userId=friendship.friend_user_id,
                        requestDate=friendship.friendship_date,
                        **display_info
                    ))
            
            # Process incoming requests
            for friendship in incoming_friendships:
                if friendship.status_id == pending_status_id:
                    display_info = self.get_user_display_info(friendship.user_id)
                    incoming_requests.append(FriendRequestItemDTO(
                        requestId=friendship.id,
                        userId=friendship.user_id,
                        requestDate=friendship.friendship_date,
                        **display_info
                    ))
            
            return FriendRequestsResponseDTO(
                incoming=incoming_requests,
                outgoing=outgoing_requests
            )
        except Exception as e:
            logger.error(f"Error fetching friend requests for user {user_id}: {e}")
            raise
    
    def send_friend_request(self, user_id: int, request_data: CreateFriendRequestDTO) -> dict:
        """Send a friend request from user to target user."""
        try:
            # Validate users exist
            from_user = self.user_repo.fetchUserById(user_id)
            to_user = self.user_repo.fetchUserById(request_data.toUserId)
            
            if not from_user or not to_user:
                raise ValueError("User not found")
            
            # Check for self-add
            if user_id == request_data.toUserId:
                raise ValueError("Cannot send friend request to yourself")
            
            # Check for existing friendship or pending request
            all_friendships = self.friend_repo.fetchFriendsByUserId(user_id)
            for friendship in all_friendships:
                if friendship.friend_user_id == request_data.toUserId:
                    raise ValueError("Friend request already exists")
            
            # Get pending status ID
            pending_status_id = self.get_status_id_by_name("pending")
            if not pending_status_id:
                raise ValueError("Friend status 'pending' not found")
            
            # Create friendship
            friendship = FriendEntity(
                user_id=user_id,
                friend_user_id=request_data.toUserId,
                status_id=pending_status_id,
                friendship_date=datetime.now()
            )
            
            created = self.friend_repo.createFriendship(friendship)
            return {"message": "Friend request sent", "requestId": created.id}
        except Exception as e:
            logger.error(f"Error sending friend request: {e}")
            raise
    
    def accept_friend_request(self, request_id: int, user_id: int) -> dict:
        """Accept a friend request."""
        try:
            # Fetch friendship
            friendship = self.friend_repo.fetchFriendshipById(request_id)
            if not friendship:
                raise ValueError("Friend request not found")
            
            # Verify this user is the recipient
            if friendship.friend_user_id != user_id:
                raise ValueError("Not authorized to accept this request")
            
            # Update status to accepted
            accepted_status_id = self.get_status_id_by_name("accepted")
            if not accepted_status_id:
                raise ValueError("Friend status 'accepted' not found")
            
            friendship.status_id = accepted_status_id
            friendship.friendship_date = datetime.now()
            self.friend_repo.updateFriendship(friendship)
            
            return {"message": "Friend request accepted"}
        except Exception as e:
            logger.error(f"Error accepting friend request {request_id}: {e}")
            raise
    
    def decline_friend_request(self, request_id: int, user_id: int) -> dict:
        """Decline a friend request."""
        try:
            # Fetch friendship
            friendship = self.friend_repo.fetchFriendshipById(request_id)
            if not friendship:
                raise ValueError("Friend request not found")
            
            # Verify this user is the recipient
            if friendship.friend_user_id != user_id:
                raise ValueError("Not authorized to decline this request")
            
            # Delete the declined request
            self.friend_repo.deleteFriendship(request_id)
            
            return {"message": "Friend request declined"}
        except Exception as e:
            logger.error(f"Error declining friend request {request_id}: {e}")
            raise
    
    def cancel_friend_request(self, request_id: int, user_id: int) -> dict:
        """Cancel an outgoing friend request."""
        try:
            # Fetch friendship
            friendship = self.friend_repo.fetchFriendshipById(request_id)
            if not friendship:
                raise ValueError("Friend request not found")
            
            # Verify this user is the sender
            if friendship.user_id != user_id:
                raise ValueError("Not authorized to cancel this request")
            
            # Delete the request
            self.friend_repo.deleteFriendship(request_id)
            
            return {"message": "Friend request cancelled"}
        except Exception as e:
            logger.error(f"Error cancelling friend request {request_id}: {e}")
            raise
    
    def remove_friend(self, friend_id: int, user_id: int) -> dict:
        """Remove a friend (delete friendship)."""
        try:
            accepted_status_id = self.get_status_id_by_name("accepted")
            if not accepted_status_id:
                raise ValueError("Friend status 'accepted' not found")
            
            # Find the friendship to delete (check both directions)
            user_friendships = self.friend_repo.fetchFriendsByStatus(user_id, accepted_status_id)
            friendship_to_delete = None
            
            # Check if user initiated the friendship
            for friendship in user_friendships:
                if friendship.friend_user_id == friend_id:
                    friendship_to_delete = friendship
                    break
            
            # If not found, check if user was the recipient
            if not friendship_to_delete:
                from ...Infrastructure.Supabase.db_connection import supabase
                recipient_response = supabase.table("friend").select("*")\
                    .eq("friend_user_id", user_id)\
                    .eq("user_id", friend_id)\
                    .eq("status_id", accepted_status_id)\
                    .execute()
                
                if recipient_response.data:
                    friendship_to_delete = FriendEntity(**recipient_response.data[0])
            
            if not friendship_to_delete:
                raise ValueError("Friendship not found")
            
            # Delete the friendship
            self.friend_repo.deleteFriendship(friendship_to_delete.id)
            
            return {"message": "Friend removed successfully"}
        except Exception as e:
            logger.error(f"Error removing friend {friend_id} for user {user_id}: {e}")
            raise