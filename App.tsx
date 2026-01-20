import React, { useState } from "react";
import { Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WorkoutPage from "./src/TOMI/pages/WorkoutPage";
import BLEPopup from "./src/TOMI/components/ble/BLEPopup";

export default function App() {
  const [bleVisible, setBleVisible] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WorkoutPage />
      <Button title="Connect to Smartwatch" onPress={() => setBleVisible(true)} />
      <BLEPopup visible={bleVisible} onClose={() => setBleVisible(false)} />
    </SafeAreaView>
  );
}
