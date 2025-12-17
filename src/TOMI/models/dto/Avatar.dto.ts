export interface AvatarResponseDto {
  avatarId: number;
  name: string;
  imageUrl: string;
  description?: string;
}

export interface AvatarCreateDto {
  name: string;
  imageUrl: string;
  description?: string;
}

export interface AvatarUpdateDto {
  name?: string;
  imageUrl?: string;
  description?: string;
}
