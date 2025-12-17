export interface GoalResponseDto {
  goalId: number;
  userId: number;
  goalTypeId: number;
  goalStatusId: number;
  targetValue: number;
  currentValue: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GoalCreateDto {
  userId: number;
  goalTypeId: number;
  goalStatusId: number;
  targetValue: number;
  currentValue?: number;
  startDate: string;
  endDate?: string;
}

export interface GoalUpdateDto {
  goalTypeId?: number;
  goalStatusId?: number;
  targetValue?: number;
  currentValue?: number;
  startDate?: string;
  endDate?: string;
}
