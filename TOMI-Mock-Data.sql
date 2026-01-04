-- TOMI App Mock Data for Supabase
-- Execute these INSERT statements in order to maintain foreign key constraints

-- Clear existing data first (in reverse dependency order) and reset sequences
TRUNCATE TABLE public.user_badge RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.leaderboard RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.notifications RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.friend RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.workout RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.goal RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.profile RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.streak RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.user_avatar RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.watch_device RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.workout_type RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.goal_type RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.goal_status RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.friend_status RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.badge RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.avatar RESTART IDENTITY CASCADE;

-- 1. Independent reference tables first

-- Avatar data
INSERT INTO public.avatar (name, image_url, animation_url, theme_color, is_default, created_by) VALUES
('Default TOMI', 'https://example.com/avatars/default-tomi.png', 'https://example.com/avatars/default-tomi.gif', '#4A90E2', true, 'system'),
('Fire TOMI', 'https://example.com/avatars/fire-tomi.png', 'https://example.com/avatars/fire-tomi.gif', '#FF6B35', false, 'system'),
('Water TOMI', 'https://example.com/avatars/water-tomi.png', 'https://example.com/avatars/water-tomi.gif', '#00B2FF', false, 'system'),
('Earth TOMI', 'https://example.com/avatars/earth-tomi.png', 'https://example.com/avatars/earth-tomi.gif', '#4CAF50', false, 'system'),
('Air TOMI', 'https://example.com/avatars/air-tomi.png', 'https://example.com/avatars/air-tomi.gif', '#E1BEE7', false, 'system');

-- Badge data
INSERT INTO public.badge (achievement, name, description) VALUES
('first_week', 'First Steps', 'Completed your first week with TOMI'),
('streak_7', 'Week Warrior', 'Maintained a 7-day workout streak'),
('streak_30', 'Month Master', 'Maintained a 30-day workout streak'),
('steps_10k', 'Step Counter', 'Reached 10,000 steps in a day'),
('workout_100', 'Century Club', 'Completed 100 workouts'),
('early_bird', 'Early Bird', 'Completed 10 workouts before 7 AM'),
('goal_crusher', 'Goal Crusher', 'Achieved 50 daily goals'),
('social_butterfly', 'Social Butterfly', 'Added 10 friends'),
('tomi_level_10', 'TOMI Trainer', 'Raised TOMI to level 10'),
('distance_marathon', 'Marathon Runner', 'Covered marathon distance (42.2km) total');

-- FriendStatus data
INSERT INTO public.friend_status (status, description) VALUES
('pending', 'Friend request sent, waiting for acceptance'),
('accepted', 'Friend request accepted, friendship active'),
('blocked', 'User has been blocked'),
('declined', 'Friend request was declined');

-- GoalStatus data
INSERT INTO public.goal_status (name) VALUES
('Active'),
('Completed'),
('Paused'),
('Cancelled'),
('Expired');

-- GoalType data
INSERT INTO public.goal_type (name, description, default_unit) VALUES
('Steps', 'Daily step count target', 'steps'),
('Exercise Minutes', 'Daily exercise duration', 'minutes'),
('Distance', 'Daily distance covered', 'km'),
('Calories', 'Daily calories burned', 'calories'),
('Water Intake', 'Daily water consumption', 'liters'),
('Sleep Hours', 'Daily sleep duration', 'hours'),
('Active Hours', 'Hours of activity per day', 'hours'),
('Workouts', 'Number of workouts per week', 'workouts');

-- WorkoutType data
INSERT INTO public.workout_type (name, description) VALUES
('Running', 'Cardiovascular running exercise'),
('Walking', 'Light cardiovascular walking'),
('Cycling', 'Bicycle riding exercise'),
('Swimming', 'Full body swimming workout'),
('Strength Training', 'Weight lifting and resistance exercises'),
('Yoga', 'Flexibility and mindfulness practice'),
('HIIT', 'High Intensity Interval Training'),
('Dancing', 'Rhythmic movement exercise'),
('Rock Climbing', 'Indoor or outdoor climbing'),
('Tennis', 'Racquet sport exercise');



-- 3. Tables that depend on User

-- WatchDevice data
INSERT INTO public.watch_device (user_id, serial_no, model, nickname) VALUES
(1, 'WATCH-001-THOMAS', 'FitWatch Pro', 'My Watch'),
(1, 'WATCH-002-THOMAS', 'SportTracker Elite', 'Training Watch'),
(3, 'WATCH-003-JOHN', 'FitWatch Pro', 'John Watch'),
(3, 'WATCH-004-JOHN', 'HealthBand X', 'Backup Tracker');

-- UserAvatar data
INSERT INTO public.user_avatar (user_id, avatar_id, nickname, level, xp, age_days, hunger_level, sleepiness_level, boredome_level, happines_level, is_active, last_updated) VALUES
(1, 1, 'Buddy', 5, 450, 30, 75, 30, 20, 85, true, '2026-01-03 10:00:00'),
(1, 2, 'Sparky', 3, 280, 15, 60, 40, 35, 70, false, '2026-01-02 08:00:00'),
(3, 1, 'Champion', 8, 750, 45, 40, 20, 15, 95, true, '2026-01-03 12:00:00'),
(3, 3, 'Splash', 4, 350, 25, 80, 50, 25, 75, false, '2026-01-02 09:30:00');

-- Streak data
INSERT INTO public.streak (user_id, metric, current, longest) VALUES
(1, 'workout', 5, 12),
(1, 'steps', 3, 15),
(1, 'goals', 7, 20),
(3, 'workout', 12, 25),
(3, 'steps', 8, 30),
(3, 'goals', 10, 18);

-- 4. Tables that depend on UserAvatar

-- Profile data
INSERT INTO public.profile (user_id, user_avatar_id, bio, total_exercices, total_distance, total_steps, longest_streak) VALUES
(1, 1, 'Fitness enthusiast getting started with TOMI!', 42, 150.5, 15000, 12),
(3, 3, 'On my fitness journey with TOMI', 89, 450.2, 35000, 25);

-- 5. Tables with multiple dependencies

-- Goal data
INSERT INTO public.goal (user_id, goal_status_id, goal_type_id, target_value, period, progress_value, start_date, end_date, last_updated) VALUES
(1, 1, 1, 10000, 'daily', 7500, '2026-01-03 00:00:00', '2026-01-03 23:59:59', '2026-01-03 15:30:00'),
(1, 1, 2, 30, 'daily', 25, '2026-01-03 00:00:00', '2026-01-03 23:59:59', '2026-01-03 15:30:00'),
(1, 2, 3, 5, 'daily', 5.2, '2026-01-02 00:00:00', '2026-01-02 23:59:59', '2026-01-02 20:00:00'),
(3, 1, 1, 12000, 'daily', 9800, '2026-01-03 00:00:00', '2026-01-03 23:59:59', '2026-01-03 14:00:00'),
(3, 1, 8, 5, 'weekly', 4, '2025-12-30 00:00:00', '2026-01-06 23:59:59', '2026-01-03 16:00:00'),
(3, 1, 2, 45, 'daily', 38, '2026-01-03 00:00:00', '2026-01-03 23:59:59', '2026-01-03 13:45:00');

-- Workout data
INSERT INTO public.workout (user_id, workout_type_id, "start", "end", device_id) VALUES
(1, 1, '2026-01-03 08:00:00', '2026-01-03 08:30:00', 1),
(1, 5, '2026-01-02 18:00:00', '2026-01-02 18:45:00', 1),
(1, 2, '2026-01-01 07:15:00', '2026-01-01 07:45:00', 1),
(1, 3, '2025-12-31 16:00:00', '2025-12-31 17:30:00', 2),
(3, 1, '2026-01-03 06:30:00', '2026-01-03 07:45:00', 3),
(3, 3, '2026-01-02 17:00:00', '2026-01-02 18:30:00', 3),
(3, 6, '2026-01-01 19:00:00', '2026-01-01 20:00:00', 3),
(3, 2, '2025-12-31 12:00:00', '2025-12-31 12:30:00', 4);

-- Friend data
INSERT INTO public.friend (user_id, friend_user_id, status_id, friendship_date) VALUES
(1, 3, 2, '2026-01-03 12:00:00'),
(3, 1, 2, '2026-01-03 12:00:00');

-- UserBadge data
INSERT INTO public.user_badge (user_id, badge_id, awarded_date) VALUES
(1, 1, '2026-01-01 00:00:00'),
(1, 4, '2026-01-02 00:00:00'),
(3, 1, '2026-01-03 00:00:00'),
(3, 2, '2026-01-02 00:00:00'),
(3, 3, '2025-12-28 00:00:00'),
(3, 4, '2026-01-01 00:00:00'),
(3, 5, '2025-12-30 00:00:00');

-- Leaderboard data
INSERT INTO public.leaderboard (name, scope, start_date, end_date, user_id, score, rank) VALUES
('Weekly Steps', 'friends', '2025-12-30 00:00:00', '2026-01-05 23:59:59', 1, 65000, 2),
('Weekly Steps', 'friends', '2025-12-30 00:00:00', '2026-01-05 23:59:59', 3, 85000, 1),
('Monthly Distance', 'global', '2026-01-01 00:00:00', '2026-01-31 23:59:59', 1, 125, 1250),
('Monthly Distance', 'global', '2026-01-01 00:00:00', '2026-01-31 23:59:59', 3, 380, 150),
('Daily Workouts', 'friends', '2026-01-03 00:00:00', '2026-01-03 23:59:59', 1, 2, 2),
('Daily Workouts', 'friends', '2026-01-03 00:00:00', '2026-01-03 23:59:59', 3, 3, 1);

-- Notifications data
INSERT INTO public.notifications (user_id, notif_type, description, is_read) VALUES
(1, 'goal_achievement', 'Congratulations! You''ve reached your daily step goal!', false),
(1, 'tomi_needs', 'Your TOMI is getting hungry. Time for some activity!', false),
(1, 'friend_request', 'JOHN DOE sent you a friend request', true),
(1, 'streak_milestone', 'Amazing! You''ve maintained a 5-day workout streak!', false),
(1, 'goal_reminder', 'Don''t forget your daily exercise goal!', true),
(3, 'badge_earned', 'You''ve earned the "Month Master" badge!', false),
(3, 'tomi_level_up', 'Congratulations! Your TOMI has reached level 8!', false),
(3, 'workout_suggestion', 'Great job on your workout streak! Keep it up!', false),
(3, 'friend_activity', 'thomas mejia just completed a new workout!', true),
(3, 'goal_achievement', 'You''ve completed your weekly workout goal!', false);

-- Success message
SELECT 'Mock data inserted successfully! You now have:' AS message,
       (SELECT COUNT(*) FROM public.user) AS users,
       (SELECT COUNT(*) FROM public.avatar) AS avatars,
       (SELECT COUNT(*) FROM public.user_avatar) AS user_avatars,
       (SELECT COUNT(*) FROM public.goal) AS goals,
       (SELECT COUNT(*) FROM public.workout) AS workouts,
       (SELECT COUNT(*) FROM public.notifications) AS notifications;