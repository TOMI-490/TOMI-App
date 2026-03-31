export interface AvatarResponseDto {
  avatarId: number;
  name: string;
  imageURL: string;
  animationIdleURL?: string;         // Idle / resting state GIF
  animationActiveURL?: string;       // Active / happy state GIF
  animationPostWorkoutURL?: string;  // Post-workout celebration GIF
  themeColor: string;
  isDefault: boolean;
  createdBy: string;
  created_at: string;
}

export interface AvatarCreateDto {
  name: string;
  imageURL: string;
  animationIdleURL?: string;
  animationActiveURL?: string;
  animationPostWorkoutURL?: string;
  themeColor: string;
  isDefault?: boolean;
  createdBy: string;
}

export interface AvatarUpdateDto {
  name?: string;
  imageURL?: string;
  animationIdleURL?: string;
  animationActiveURL?: string;
  animationPostWorkoutURL?: string;
  themeColor?: string;
  isDefault?: boolean;
}
