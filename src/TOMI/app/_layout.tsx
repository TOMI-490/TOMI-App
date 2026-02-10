import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../services/core/supabase';
import { AuthProvider } from '../contexts/AuthContext';
import { initializeLocalDatabase } from '../services/localDatabase/localDb';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Handle deep link URLs
    const handleDeepLink = async (url: string) => {
      console.log('[RootLayout] Deep link received:', url);
      
      // Check if it's a password reset link
      if (url.includes('reset-password') || url.includes('type=recovery')) {
        console.log('[RootLayout] Password reset link detected');
        
        // Parse the URL to get the tokens
        const parsedUrl = Linking.parse(url);
        const params = parsedUrl.queryParams;
        
        if (params?.access_token || params?.token) {
          console.log('[RootLayout] Token found, navigating to reset-password');
          // Navigate to reset password page
          router.push('/(auth)/reset-password');
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

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[RootLayout] Auth event:', event);
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('[RootLayout] Password recovery event detected');
        router.push('/(auth)/reset-password');
      }
    });

    return () => {
      subscription.remove();
      authListener?.subscription.unsubscribe();
    };
  }, []);

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
