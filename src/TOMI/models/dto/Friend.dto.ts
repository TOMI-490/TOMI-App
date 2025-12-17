export interface FriendResponseDto {
  id: number;
  userId: number;
  friendUserId: number;
  friendStatusId: number;
  createdAt: string;
}

export interface FriendCreateDto {
  userId: number;
  friendUserId: number;
  friendStatusId: number;
}

export interface FriendUpdateDto {
  friendStatusId?: number;
}
