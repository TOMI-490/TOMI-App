export interface WatchDeviceResponseDto {
  deviceId: number;
  userId: number;
  serialNumber: string;
  model: string;
  nickname: string;
  createdAt: string;
}

export interface WatchDeviceCreateDto {
  userId: number;
  serialNumber: string;
  model: string;
  nickname: string;
}

export interface WatchDeviceUpdateDto {
  serialNumber?: string;
  model?: string;
  nickname?: string;
}
