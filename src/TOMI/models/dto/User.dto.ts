export interface UserResponseDto {
  userId: number;
  name: string;
  email: string;
  country: string;
  unitSystem: string;
  language: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserCreateDto {
  name: string;
  email: string;
  country: string;
  unitSystem: string;
  language: string;
}

export interface UserUpdateDto {
  name?: string;
  email?: string;
  country?: string;
  unitSystem?: string;
  language?: string;
}
