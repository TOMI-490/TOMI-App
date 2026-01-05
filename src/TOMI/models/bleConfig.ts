export interface bleConfig {
  deviceNameFilter?: (deviceName?: string | null) => boolean;
  serviceUUID: string;
  characteristicUUID: string;
  decode: (value: string) => any;
}