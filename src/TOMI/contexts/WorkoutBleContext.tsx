import React, { createContext, useContext } from 'react';
import useBLE from '../hooks/useBLE';
import { smartwatchBleConfig } from '../config/smartwatchBleConfig';
import type { SmartwatchSensorData } from '../models/smartwatchSensorData';
import type { UseBLEReturn } from '../hooks/useBLE';

type WorkoutBleValue = UseBLEReturn<SmartwatchSensorData>;

const WorkoutBleContext = createContext<WorkoutBleValue | null>(null);

/**
 * Single BLE session for the whole app so Workout start, live workout, and sensor test
 * share one connection (required before starting a workout).
 */
export function WorkoutBleProvider({ children }: { children: React.ReactNode }) {
  const ble = useBLE<SmartwatchSensorData>(smartwatchBleConfig);
  return <WorkoutBleContext.Provider value={ble}>{children}</WorkoutBleContext.Provider>;
}

export function useWorkoutBle(): WorkoutBleValue {
  const ctx = useContext(WorkoutBleContext);
  if (!ctx) {
    throw new Error('useWorkoutBle must be used within WorkoutBleProvider');
  }
  return ctx;
}
