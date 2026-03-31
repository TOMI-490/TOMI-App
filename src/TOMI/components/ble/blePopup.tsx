import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import type { Device } from "react-native-ble-plx";

import type { UseBLEReturn } from "../../hooks/useBLE";

interface blePopupProps {
  visible: boolean;
  onClose: () => void;
  bleHook: UseBLEReturn<any>;
}

export default function BLEPopup({ visible, onClose, bleHook }: blePopupProps) {
  const {
    devices,
    connectedDevice,
    data,
    requestPermissions,
    startScan,
    connectToDevice,
    disconnect,
    isScanning,
  } = bleHook;

  /** Connected device first, then scanned; dedupe by id so OS-connected watches always appear. */
  const displayDevices = useMemo(() => {
    const map = new Map<string, Device>();
    if (connectedDevice) map.set(connectedDevice.id, connectedDevice);
    devices.forEach((d) => {
      if (!map.has(d.id)) map.set(d.id, d);
    });
    return Array.from(map.values());
  }, [devices, connectedDevice]);

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

          <ScrollView style={styles.content}>
            {connectedDevice && (
              <View style={styles.connectedContainer}>
                <Text style={styles.connectedText}>
                  ✓ Connected: {connectedDevice.name || connectedDevice.localName || "Unnamed"}
                </Text>
                <Button title="Disconnect" onPress={handleDisconnect} />
              </View>
            )}

            <View style={styles.scanRow}>
              <Button title="Scan for devices" onPress={startScan} />
              {isScanning && (
                <ActivityIndicator style={styles.scanSpinner} color="#4A90E2" />
              )}
            </View>

            <Text style={styles.listSectionTitle}>Nearby & connected</Text>
            <View style={styles.deviceList}>
              {displayDevices.length === 0 && !isScanning ? (
                <Text style={styles.hint}>
                  Tap “Scan for devices”. Already-linked watches appear here even if they are not
                  advertising.
                </Text>
              ) : displayDevices.length === 0 && isScanning ? (
                <Text style={styles.hint}>Looking for devices…</Text>
              ) : (
                <FlatList
                  scrollEnabled={false}
                  data={displayDevices}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const isActive = connectedDevice?.id === item.id;
                    return (
                      <TouchableOpacity
                        style={[styles.deviceItem, isActive && styles.deviceItemConnected]}
                        onPress={() => {
                          if (!isActive) void connectToDevice(item);
                        }}
                        disabled={isActive}
                      >
                        <View style={styles.deviceItemRow}>
                          <Text style={styles.deviceName}>
                            {item.name || item.localName || "Unknown device"}
                          </Text>
                          {isActive && (
                            <View style={styles.connectedPill}>
                              <Text style={styles.connectedPillText}>Active</Text>
                            </View>
                          )}
                        </View>
                        {!isActive && (
                          <Text style={styles.tapToConnect}>Tap to connect</Text>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </View>

            {connectedDevice && data && (
              <View style={styles.dataContainer}>
                <Text style={styles.sectionTitle}>Live sensor data</Text>

                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Heart rate</Text>
                  <Text style={styles.dataValue}>{data.heartRate} bpm</Text>
                </View>

                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>SpO₂</Text>
                  <Text style={styles.dataValue}>{data.spo2} %</Text>
                </View>

                <Text style={styles.sectionTitle}>IMU</Text>

                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Accelerometer</Text>
                  <Text style={styles.dataValue}>
                    X: {data.imu.ax.toFixed(2)} Y: {data.imu.ay.toFixed(2)} Z:{" "}
                    {data.imu.az.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Gyroscope</Text>
                  <Text style={styles.dataValue}>
                    X: {data.imu.gx.toFixed(2)} Y: {data.imu.gy.toFixed(2)} Z:{" "}
                    {data.imu.gz.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
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
  scanRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  scanSpinner: {
    marginLeft: 4,
  },
  listSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
    marginTop: 8,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  deviceList: {
    marginTop: 4,
    marginBottom: 12,
  },
  hint: {
    textAlign: "center",
    color: "#999",
    marginTop: 12,
    marginBottom: 8,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  deviceItem: {
    padding: 14,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  deviceItemConnected: {
    backgroundColor: "#e8f5e9",
    borderColor: "#a5d6a7",
  },
  deviceItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    flex: 1,
  },
  connectedPill: {
    backgroundColor: "#2e7d32",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  connectedPillText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  tapToConnect: {
    fontSize: 12,
    color: "#888",
    marginTop: 6,
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
