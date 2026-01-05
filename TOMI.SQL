-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.avatar (
  avatar_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL,
  image_url text NOT NULL,
  animation_url text NOT NULL,
  theme_color character varying NOT NULL,
  is_default boolean NOT NULL,
  created_by character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT avatar_pkey PRIMARY KEY (avatar_id)
);
CREATE TABLE public.badge (
  badge_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  achievement character varying NOT NULL,
  name character varying NOT NULL,
  description text NOT NULL,
  CONSTRAINT badge_pkey PRIMARY KEY (badge_id)
);
CREATE TABLE public.friend (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL,
  friend_user_id bigint NOT NULL,
  status_id bigint NOT NULL,
  friendship_date timestamp without time zone NOT NULL,
  CONSTRAINT friend_pkey PRIMARY KEY (id),
  CONSTRAINT friend_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.friend_status(statusId),
  CONSTRAINT friend_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(user_id),
  CONSTRAINT friend_friend_user_id_fkey FOREIGN KEY (friend_user_id) REFERENCES public.user(user_id)
);
CREATE TABLE public.friend_status (
  statusId bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  status character varying NOT NULL,
  description text NOT NULL,
  CONSTRAINT friend_status_pkey PRIMARY KEY (statusId)
);
CREATE TABLE public.goal (
  goal_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL,
  goal_status_id bigint NOT NULL,
  goal_type_id bigint NOT NULL,
  target_value bigint NOT NULL,
  period character varying NOT NULL,
  progress_value bigint NOT NULL,
  start_date timestamp without time zone NOT NULL,
  end_date timestamp without time zone NOT NULL,
  last_updated timestamp without time zone NOT NULL,
  CONSTRAINT goal_pkey PRIMARY KEY (goal_id),
  CONSTRAINT goal_goal_status_id_fkey FOREIGN KEY (goal_status_id) REFERENCES public.goal_status(goal_status_id),
  CONSTRAINT goal_goal_type_id_fkey FOREIGN KEY (goal_type_id) REFERENCES public.goal_type(goal_type_id)
);
CREATE TABLE public.goal_status (
  goal_status_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL,
  CONSTRAINT goal_status_pkey PRIMARY KEY (goal_status_id)
);
CREATE TABLE public.goal_type (
  goal_type_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL,
  description text NOT NULL,
  default_unit character varying NOT NULL,
  CONSTRAINT goal_type_pkey PRIMARY KEY (goal_type_id)
);
CREATE TABLE public.leaderboard (
  leaderboard_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL,
  scope character varying NOT NULL,
  start_date timestamp without time zone NOT NULL,
  end_date timestamp without time zone NOT NULL,
  user_id bigint NOT NULL,
  score bigint NOT NULL,
  rank bigint NOT NULL,
  CONSTRAINT leaderboard_pkey PRIMARY KEY (leaderboard_id)
);
CREATE TABLE public.notifications (
  notif_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL,
  notif_type character varying NOT NULL,
  description text NOT NULL,
  is_read boolean NOT NULL,
  CONSTRAINT notifications_pkey PRIMARY KEY (notif_id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(user_id)
);
CREATE TABLE public.profile (
  profile_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL,
  user_avatar_id bigint NOT NULL,
  bio text NOT NULL,
  total_exercices double precision NOT NULL,
  total_distance double precision NOT NULL,
  total_steps bigint NOT NULL,
  longest_streak bigint NOT NULL,
  CONSTRAINT profile_pkey PRIMARY KEY (profile_id),
  CONSTRAINT profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(user_id),
  CONSTRAINT profile_user_avatar_id_fkey FOREIGN KEY (user_avatar_id) REFERENCES public.user_avatar(user_avatar_id)
);
CREATE TABLE public.streak (
  streak_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL,
  metric character varying NOT NULL,
  current bigint,
  longest bigint,
  CONSTRAINT streak_pkey PRIMARY KEY (streak_id),
  CONSTRAINT streak_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(user_id)
);
CREATE TABLE public.user (
  user_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  email character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  country character varying NOT NULL,
  unit_system character varying NOT NULL,
  language character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  auth_id uuid DEFAULT gen_random_uuid() UNIQUE,
  on_boarding_complete boolean NOT NULL,
  CONSTRAINT user_pkey PRIMARY KEY (user_id)
);
CREATE TABLE public.user_avatar (
  user_avatar_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL,
  avatar_id bigint NOT NULL,
  nickname character varying NOT NULL,
  level bigint NOT NULL,
  xp bigint NOT NULL,
  age_days bigint NOT NULL,
  hunger_level bigint NOT NULL,
  sleepiness_level bigint NOT NULL,
  boredome_level bigint NOT NULL,
  is_active boolean NOT NULL,
  last_updated timestamp without time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  happines_level bigint NOT NULL,
  CONSTRAINT user_avatar_pkey PRIMARY KEY (user_avatar_id),
  CONSTRAINT user_avatar_avatar_id_fkey FOREIGN KEY (avatar_id) REFERENCES public.avatar(avatar_id),
  CONSTRAINT user_avatar_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(user_id)
);
CREATE TABLE public.user_badge (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL,
  badge_id bigint NOT NULL,
  awarded_date timestamp without time zone NOT NULL,
  CONSTRAINT user_badge_pkey PRIMARY KEY (id),
  CONSTRAINT user_badge_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(user_id),
  CONSTRAINT user_badge_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badge(badge_id)
);
CREATE TABLE public.watch_device (
  device_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL,
  serial_no text NOT NULL,
  model text NOT NULL,
  nickname character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT watch_device_pkey PRIMARY KEY (device_id),
  CONSTRAINT watch_device_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(user_id)
);
CREATE TABLE public.workout (
  workout_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL,
  workout_type_id bigint NOT NULL,
  start timestamp without time zone NOT NULL,
  end timestamp without time zone NOT NULL,
  device_id bigint NOT NULL,
  CONSTRAINT workout_pkey PRIMARY KEY (workout_id),
  CONSTRAINT workout_workout_type_id_fkey FOREIGN KEY (workout_type_id) REFERENCES public.workout_type(workout_type_id),
  CONSTRAINT workout_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(user_id),
  CONSTRAINT workout_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.watch_device(device_id)
);
CREATE TABLE public.workout_type (
  workout_type_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL,
  description text NOT NULL,
  CONSTRAINT workout_type_pkey PRIMARY KEY (workout_type_id)
);