import { BleManager } from "react-native-ble-plx";

let bleManager: BleManager | null = null;

export const getBleManager = (): BleManager | null => {
  if (!bleManager) {
    try {
      bleManager = new BleManager();
    } catch (e) {
      console.warn('[BLE] Failed to create BleManager — Bluetooth may not be available on this device:', e);
      return null;
    }
  }
  return bleManager;
};

export const destroyBleManager = () => {
  if (bleManager) {
    bleManager.destroy();
    bleManager = null;
  }
};
