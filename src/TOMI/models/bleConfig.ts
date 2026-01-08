export interface bleConfig<T> {
  deviceNameFilter?: (deviceName?: string | null) => boolean;
  serviceUUID: string;
  characteristicUUID: string;
  decode: (value: string) => T;
}