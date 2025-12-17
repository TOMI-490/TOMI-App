export interface FriendStatusResponseDto {
  friendStatusId: number;
  name: string;
}

export interface FriendStatusCreateDto {
  name: string;
}

export interface FriendStatusUpdateDto {
  name?: string;
}
