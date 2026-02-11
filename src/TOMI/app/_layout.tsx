import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { Linking } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import { supabase } from '../services/core/supabase';
import { initializeLocalDatabase } from '../services/localDatabase/localDb'; // Import the database initialization

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // ==========================================
    // DATABASE INITIALIZATION
    // ==========================================
    // Initialize local SQLite database for high-frequency sensor data
    // This creates the sensor_readings table if it doesn't exist
    // Must run before any workout screens that collect sensor data
    console.log('[RootLayout] Initializing local sensor database...');
    try {
      initializeLocalDatabase();
      console.log('[RootLayout] ✓ Local sensor database initialized successfully');
    } catch (error) {
      console.error('[RootLayout] ✗ Failed to initialize local database:', error);
    }

    // ==========================================
    // DEEP LINK HANDLING
    // ==========================================
    // Handle deep link URLs (for password reset, magic links, etc.)
    const handleDeepLink = async (url: string) => {
      console.log('[RootLayout] Deep link received:', url);
      
      // Check if it's a password reset link
      if (url.includes('reset-password') || url.includes('type=recovery')) {
        console.log('[RootLayout] Password reset link detected');
        
        // Parse the URL using the URL constructor
        try {
          const parsedUrl = new URL(url);
          const token = parsedUrl.searchParams.get('token');
          const type = parsedUrl.searchParams.get('type');
          
          console.log('[RootLayout] Extracted token:', token, 'type:', type);
          // ...rest of your logic
        } catch (error) {
          console.error('[RootLayout] Failed to parse URL:', error);
        }
      }
    };

    // Check initial URL (app opened via link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for deep links while app is open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // ==========================================
    // AUTH STATE LISTENER
    // ==========================================
    // Listen for Supabase auth state changes (login, logout, password recovery, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[RootLayout] Auth event:', event);
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('[RootLayout] Password recovery event detected');
        router.push('/(auth)/reset-password');
      }
    });

    // ==========================================
    // CLEANUP
    // ==========================================
    // Remove listeners when component unmounts
    return () => {
      subscription.remove();
      authListener?.subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only runs once on app start

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="workout-live" 
          options={{
            presentation: 'fullScreenModal',
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="workout-summary" 
          options={{
            presentation: 'fullScreenModal',
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}