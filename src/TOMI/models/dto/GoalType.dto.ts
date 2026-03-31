export interface GoalTypeResponseDto {
  goalTypeId: number;
  name: string;
  description: string;
  defaultUnit: string;
}

export interface GoalTypeCreateDto {
  name: string;
  description: string;
  defaultUnit: string;
}

export interface GoalTypeUpdateDto {
  name?: string;
  description?: string;
  defaultUnit?: string;
}
