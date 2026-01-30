import React, { useEffect } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import useBLE from "../../hooks/useBLEmock";
import { smartwatchBleConfig } from "../../config/SmartwatchBleConfig";

interface blePopupProps {
  visible: boolean;
  onClose: () => void;
}

export default function BLEPopup({ visible, onClose }: blePopupProps) {
  const {
    devices,
    connectedDevice,
    data,
    requestPermissions,
    startScan,
    connectToDevice,
    disconnect,
  } = useBLE(smartwatchBleConfig);

  useEffect(() => {
    if (visible) {
      requestPermissions();
    }
  }, [visible]);

  const handleDisconnect = async () => {
    await disconnect();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Smartwatch Connection</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {!connectedDevice ? (
            <View style={styles.content}>
              <Button
                title="Scan for Devices"
                onPress={startScan}
              />

              <View style={styles.deviceList}>
                {devices.length === 0 ? (
                  <Text style={styles.hint}>
                    No devices found yet...
                  </Text>
                ) : (
                  <FlatList
                    data={devices}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.deviceItem}
                        onPress={() => connectToDevice(item)}
                      >
                        <Text style={styles.deviceName}>
                          {item.name ||
                            item.localName ||
                            "Unknown Device"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            </View>
          ) : (
            <ScrollView style={styles.content}>
              <View style={styles.connectedContainer}>
                <Text style={styles.connectedText}>
                  ✓ Connected to:{" "}
                  {connectedDevice.name || "Unnamed Device"}
                </Text>
                <Button
                  title="Disconnect"
                  onPress={handleDisconnect}
                />
              </View>

              {data && data && (
                <View style={styles.dataContainer}>
                  <Text style={styles.sectionTitle}>
                    Live Sensor Data
                  </Text>

                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Heart Rate</Text>
                    <Text style={styles.dataValue}>
                      {data.heartRate} bpm
                    </Text>
                  </View>

                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>SpO₂</Text>
                    <Text style={styles.dataValue}>
                      {data.spo2} %
                    </Text>
                  </View>

                  <Text style={styles.sectionTitle}>IMU</Text>

                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Accelerometer</Text>
                    <Text style={styles.dataValue}>
                      X: {data.imu.ax.toFixed(2)}{" "}
                      Y: {data.imu.ay.toFixed(2)}{" "}
                      Z: {data.imu.az.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Gyroscope</Text>
                    <Text style={styles.dataValue}>
                      X: {data.imu.gx.toFixed(2)}{" "}
                      Y: {data.imu.gy.toFixed(2)}{" "}
                      Z: {data.imu.gz.toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 24,
    color: "#666",
  },
  content: {
    padding: 16,
  },
  deviceList: {
    marginTop: 16,
  },
  hint: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
  deviceItem: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 16,
  },
  connectedContainer: {
    backgroundColor: "#e8f5e9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  connectedText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#2e7d32",
  },
  dataContainer: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  dataLabel: {
    fontSize: 14,
    color: "#666",
  },
  dataValue: {
    fontSize: 14,
    fontWeight: "600",
  },
});
