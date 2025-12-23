export interface UserResponseDto {
  userId: number;
  authUid?: string;  // Supabase Auth UID
  name: string;
  email: string;
  country: string;
  unitSystem: string;
  language: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserCreateDto {
  authUid: string;  // Supabase Auth UID
  name: string;
  email: string;
  country: string;
  unitSystem: string;
  language: string;
}

export interface UserUpdateDto {
  authUid?: string;
  name?: string;
  email?: string;
  country?: string;
  unitSystem?: string;
  language?: string;
}
