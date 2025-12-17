export interface NotificationResponseDto {
  notificationId: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationCreateDto {
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead?: boolean;
}

export interface NotificationUpdateDto {
  isRead?: boolean;
}
