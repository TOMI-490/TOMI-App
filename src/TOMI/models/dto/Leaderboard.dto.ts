export interface LeaderboardResponseDto {
  leaderboardId: number;
  userId: number;
  rank: number;
  score: number;
  period: string;
  createdAt: string;
}

export interface LeaderboardCreateDto {
  userId: number;
  rank: number;
  score: number;
  period: string;
}

export interface LeaderboardUpdateDto {
  rank?: number;
  score?: number;
  period?: string;
}

export interface LeaderboardEntryDto {
  rank: number;
  userId: number;
  userName: string;
  score: number;
  avatarUrl?: string;
}
