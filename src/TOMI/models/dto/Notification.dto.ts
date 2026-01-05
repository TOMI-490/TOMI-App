export interface NotificationResponseDto {
  notifId: number;
  userId: number;
  notifType: string;
  description: string;
  isRead: boolean;
}

export interface NotificationCreateDto {
  userId: number;
  notifType: string;
  description: string;
  isRead?: boolean;
}

export interface NotificationUpdateDto {
  notifType?: string;
  description?: string;
  isRead?: boolean;
}
