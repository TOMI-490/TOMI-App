import React, { useState, useEffect, useRef } from "react";
import { View, Text, Button, StyleSheet } from "react-native";

import BLEPopup from "../components/ble/BLEPopup";

export default function WorkoutPage() {
  const [showBLE, setShowBLE] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Page</Text>
  
      <Button

        title="Connect Smartwatch"
        onPress={() => setShowBLE(true)}

      />

      <BLEPopup visible={showBLE}
       onClose={() => setShowBLE(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
});
