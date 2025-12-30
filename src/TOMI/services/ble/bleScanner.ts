import { Device, BleError } from "react-native-ble-plx";
import { getBleManager } from "./bleManager";

const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
  devices.some((device) => device.id === nextDevice.id);

export const scanForArduinoDevices = (
  onDeviceFound: (device: Device) => void,
  onError?: (error: BleError) => void
) => {
  const bleManager = getBleManager();

  bleManager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      onError?.(error);
      return;
    }

    if (
      device &&
      (device.localName === "Arduino" || device.name === "Arduino")
    ) {
      onDeviceFound(device);
    }
  });
};

export const stopScan = () => {
  const bleManager = getBleManager();
  bleManager.stopDeviceScan();
};
