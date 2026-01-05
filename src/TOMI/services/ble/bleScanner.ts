import { Device, BleError } from "react-native-ble-plx";
import { getBleManager } from "./bleManager";

export const scanForDevices = (
  filter: (device: Device) => boolean,
  onDeviceFound: (device: Device) => void,
  onError?: (error: BleError) => void
) => {
  const bleManager = getBleManager();

  bleManager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      onError?.(error);
      return;
    }

    if (device && filter(device)) {
      onDeviceFound(device);
    }
  });
};

export const stopScan = () => {
  getBleManager().stopDeviceScan();
};
