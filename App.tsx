import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SensorScreen from "./src/TOMI/pages/SensorScreen";
import { initializeLocalDatabase } from './src/TOMI/services/localDatabase/localDb';

export default function App() {

  useEffect(() => {
    initializeLocalDatabase();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SensorScreen />
    </SafeAreaView>
  );
}