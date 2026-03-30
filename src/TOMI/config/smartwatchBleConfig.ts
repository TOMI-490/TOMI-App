import { bleConfig } from '../models/bleConfig';
import base64 from 'react-native-base64';
import { SmartwatchSensorData } from '../models/smartwatchSensorData';

let dataBuffer = '';

function parseCsvSensorLine(line: string): SmartwatchSensorData | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(',').map((p) => Number(String(p).trim()));
  if (parts.length !== 8 || parts.some((n) => Number.isNaN(n))) return null;
  const [ax, ay, az, gx, gy, gz, heartRate, spo2] = parts;
  return {
    imu: { ax, ay, az, gx, gy, gz },
    heartRate,
    spo2,
  };
}

/**
 * Consume and return the latest complete sensor row from the stream.
 * BLE notifications are often smaller than a full line — buffering avoids
 * throwing away data when a '\n' hasn't arrived yet.
 * Also supports single CSV rows without a trailing newline (common on UART).
 */
export function resetSmartwatchBleDecodeBuffer(): void {
  dataBuffer = '';
}

export const smartwatchBleConfig: bleConfig<SmartwatchSensorData> = {
  /** Match common dev-board / smartwatch BLE names (extend as you add hardware). */
  deviceNameFilter: (name) => {
    if (!name) return false;
    const u = name.toUpperCase();
    const match =
      u.includes('XIAO') ||
      u.includes('OPHELIA') ||
      u.includes('NRF') ||
      u.includes('UART');
    if (__DEV__ && match) {
      console.log(`[BLE Filter] Accepted device: "${name}"`);
    }
    return match;
  },

  /** Nordic UART Service */
  serviceUUID: '6E400001-B5A3-F393-E0A9-E50E24DCCA9E',
  /** Nordic UART TX (notifications from device → app) */
  characteristicUUID: '6E400003-B5A3-F393-E0A9-E50E24DCCA9E',

  resetDecodeState: resetSmartwatchBleDecodeBuffer,

  decode: (value: string): SmartwatchSensorData | null => {
    let decoded: string;
    try {
      decoded = base64.decode(value);
    } catch (e) {
      if (__DEV__) console.warn('[BLE] base64 decode failed:', e);
      return null;
    }

    if (!decoded.length) return null;

    dataBuffer += decoded;

    let latest: SmartwatchSensorData | null = null;

    // Process complete lines (newline-delimited)
    let newlineIdx = dataBuffer.indexOf('\n');
    while (newlineIdx !== -1) {
      const line = dataBuffer.slice(0, newlineIdx);
      dataBuffer = dataBuffer.slice(newlineIdx + 1);
      const parsed = parseCsvSensorLine(line);
      if (parsed) latest = parsed;
      newlineIdx = dataBuffer.indexOf('\n');
    }

    // No newline yet: try whole buffer as one "ax,ay,az,..." row (one notification = one row)
    if (!latest && dataBuffer.trim().length > 0) {
      const parsed = parseCsvSensorLine(dataBuffer);
      if (parsed) {
        latest = parsed;
        dataBuffer = '';
      }
    }

    return latest;
  },

  encode: (command: string): string => {
    return base64.encode(command);
  },
};
