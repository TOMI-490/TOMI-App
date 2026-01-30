// hooks/useSensorDataProcessor.ts

import { useState, useEffect, useRef } from 'react';
import { FlattenedBLEData } from './useBLE';
import { supabase } from '../lib/supabase';

export interface ProcessorConfig {
  batchSize?: number;        // Number of readings before upload
  uploadInterval?: number;    // Time in ms between uploads
  processFunction: (raw: any) => any;  // Your custom processing
}

export function useSensorDataProcessor<T>(
  rawData: FlattenedBLEData<T> | null,
  config: ProcessorConfig
) {
  const [buffer, setBuffer] = useState<any[]>([]);
  const [lastUpload, setLastUpload] = useState<Date | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'error'>('idle');
  
  const uploadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Process and buffer incoming data
  useEffect(() => {
    if (!rawData) return;

    const processed = config.processFunction(rawData);
    
    setBuffer(prev => {
      const newBuffer = [...prev, processed];
      
      // Auto-upload when batch size reached
      if (newBuffer.length >= (config.batchSize ?? 50)) {
        uploadToDatabase(newBuffer);
        return [];
      }
      
      return newBuffer;
    });
  }, [rawData]);

  // Interval-based upload
  useEffect(() => {
    if (!config.uploadInterval) return;

    uploadTimerRef.current = setInterval(() => {
      if (buffer.length > 0) {
        uploadToDatabase(buffer);
        setBuffer([]);
      }
    }, config.uploadInterval);

    return () => {
      if (uploadTimerRef.current) {
        clearInterval(uploadTimerRef.current);
      }
    };
  }, [buffer, config.uploadInterval]);

  const uploadToDatabase = async (data: any[]) => {
    setUploadStatus('uploading');
    
    try {
      const { error } = await supabase
        .from('sensor_data')
        .insert(data);

      if (error) throw error;
      
      setLastUpload(new Date());
      setUploadStatus('idle');
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      
      // Optionally: implement retry logic or local storage fallback
    }
  };

  const forceUpload = () => {
    if (buffer.length > 0) {
      uploadToDatabase(buffer);
      setBuffer([]);
    }
  };

  return {
    bufferSize: buffer.length,
    lastUpload,
    uploadStatus,
    forceUpload,
  };
}