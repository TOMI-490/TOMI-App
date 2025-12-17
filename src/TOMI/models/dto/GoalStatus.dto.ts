export interface GoalStatusResponseDto {
  goalStatusId: number;
  name: string;
}

export interface GoalStatusCreateDto {
  name: string;
}

export interface GoalStatusUpdateDto {
  name?: string;
}
