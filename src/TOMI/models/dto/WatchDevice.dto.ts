export interface WatchDeviceResponseDto {
  deviceId: number;
  userId: number;
  deviceName: string;
  deviceType: string;
  isActive: boolean;
  lastSyncedAt?: string;
  createdAt: string;
}

export interface WatchDeviceRegisterDto {
  userId: number;
  deviceName: string;
  deviceType: string;
  isActive?: boolean;
}

export interface WatchDeviceUpdateDto {
  deviceName?: string;
  deviceType?: string;
  isActive?: boolean;
  lastSyncedAt?: string;
}
