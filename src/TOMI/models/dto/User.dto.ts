export interface UserResponseDto {
  userId: number;
  authID?: string;  // Supabase Auth UID - matches database column name
  name: string;
  email: string;
  country: string;
  unitSystem: string;
  language: string;
  onBoardingComplete: boolean;  // Indicates whether the user has completed onboarding
  created_at: string;  // Matches database column name
  updatedAt?: string;
}

export interface UserCreateDto {
  authID: string;  // Supabase Auth UID - matches database column name
  name: string;
  email: string;
  country: string;
  unitSystem: string;
  language: string;
  onBoardingComplete?: boolean;  // Defaults to false for new users
}

export interface UserUpdateDto {
  authID?: string;
  name?: string;
  email?: string;
  country?: string;
  unitSystem?: string;
  language?: string;
  onBoardingComplete?: boolean;
}
