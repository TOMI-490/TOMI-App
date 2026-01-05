import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser } from '../services/auth';
import { supabase } from '../services/core/supabase';

interface AuthContextType {
  authUser: User | null;
  authId: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  authUser: null,
  authId: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        console.log('[AuthContext] Initial user:', user?.id || 'none');
        setAuthUser(user);
      } catch (error) {
        console.error('[AuthContext] Error loading user:', error);
        setAuthUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthContext] Auth state changed:', _event, session?.user?.id || 'none');
      setAuthUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      authUser, 
      authId: authUser?.id || null,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
