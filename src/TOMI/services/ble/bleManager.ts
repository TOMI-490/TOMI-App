import { BleManager } from "react-native-ble-plx";

let bleManager: BleManager | null = null;

export const getBleManager = () => {
  if (!bleManager) {
    bleManager = new BleManager();
  }
  return bleManager;
};

export const destroyBleManager = () => {
  if (bleManager) {
    bleManager.destroy();
    bleManager = null;
  }
};
