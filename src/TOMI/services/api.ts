

// Barrel file for API services

// Export all resource services
export { avatarService } from './resources/avatar.service';
export { badgeService } from './resources/badge.service';
export { friendService } from './resources/friend.service';
export { friendStatusService } from './resources/friendStatus.service';
export { goalService } from './resources/goal.service';
export { goalStatusService } from './resources/goalStatus.service';
export { goalTypeService } from './resources/goalType.service';
export { leaderboardService } from './resources/leaderboard.service';
export { notificationService } from './resources/notification.service';
export { profileService } from './resources/profile.service';
export { streakService } from './resources/streak.service';
export { userService } from './resources/user.service';
export { userAvatarService } from './resources/userAvatar.service';
export { userBadgeService } from './resources/userBadge.service';
export { watchDeviceService } from './resources/watchDevice.service';
export { workoutService } from './resources/workout.service';
export { workoutTypeService } from './resources/workoutType.service';

// Export the HTTP client for direct access if needed
export { httpClient } from './httpClient';

