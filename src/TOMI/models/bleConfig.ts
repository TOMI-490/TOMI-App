export interface bleConfig<T> {
  deviceNameFilter?: (name: string | null) => boolean;
  serviceUUID: string;
  characteristicUUID: string;
  /** Base64 notification payload → decoded sample, or `null` if more bytes needed (partial frame). */
  decode: (value: string) => T | null;
  encode?: (command: string) => string;
  /** Clear any decode-side buffer when connecting/disconnecting */
  resetDecodeState?: () => void;
}