export interface EvolutionNodeDto {
  evolutionNodeId: number;
  avatarId: number;
  name: string;
  stage: 'baby' | 'teen' | 'adult';
  levelRequired: number;
  imageUrl?: string | null;
  animationActiveUrl?: string | null;
  animationIdleUrl?: string | null;
  themeColor?: string | null;
}

export interface EvolutionStateDto {
  currentNode: EvolutionNodeDto;
  currentStage: 'baby' | 'teen' | 'adult';
  currentLevel: number;
  isEligible: boolean;
  availableOptions: EvolutionNodeDto[];
}

export interface EvolveRequestDto {
  userId: number;
  targetNodeId: number;
}

export interface EvolveResponseDto {
  success: boolean;
  message: string;
  newNode?: EvolutionNodeDto;
  updatedAvatar?: Record<string, any>;
}
