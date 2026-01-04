export interface AvatarResponseDto {
  avatarId: number;
  name: string;
  imageURL: string;
  animationURL: string;
  themeColor: string;
  isDefault: boolean;
  createdBy: string;
  created_at: string;
}

export interface AvatarCreateDto {
  name: string;
  imageURL: string;
  animationURL: string;
  themeColor: string;
  isDefault?: boolean;
  createdBy: string;
}

export interface AvatarUpdateDto {
  name?: string;
  imageURL?: string;
  animationURL?: string;
  themeColor?: string;
  isDefault?: boolean;
}
