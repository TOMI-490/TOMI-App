export interface bleConfig<T> {
  deviceNameFilter?: (name: string | null) => boolean;
  serviceUUID: string;
  characteristicUUID: string;
  decode: (value: string) => T;
  encode?: (command: string) => string; // NEW: Optional encode function
}