export interface GoalResponseDto {
  goalId: number;
  userId: number;
  goalStatusId: number;
  goalTypeId: number;
  targetValue: number;
  period: string;
  progressValue: number;
  startDate: string;
  endDate: string;
  lastUpdated: string;
}

export interface GoalCreateDto {
  userId: number;
  goalStatusId: number;
  goalTypeId: number;
  targetValue: number;
  period: string;
  progressValue?: number;
  startDate: string;
  endDate: string;
}

export interface GoalUpdateDto {
  goalStatusId?: number;
  goalTypeId?: number;
  targetValue?: number;
  period?: string;
  progressValue?: number;
  startDate?: string;
  endDate?: string;
}
