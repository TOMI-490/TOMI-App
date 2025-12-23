
import {supabase} from './core/supabase';

export const getAccessToken = async (): Promise <string | null> => {
     const {data} = await supabase.auth.getSession();
     return data.session?.access_token || null;
};

export const signOut = async () => {
    await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
    const {data} = await supabase.auth.getUser();
    return data.user;
};

export const signInWithEmail = async (email: string, password: string) => {
    const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password
    });
    if (error) {
        throw error;
    }
    return data;
};

export const signUpWithEmail = async (
    email: string, 
    password: string,
    metadata?: { name?: string; [key: string]: any }
) => {
    const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: {
            // Add user metadata (like name)
            data: metadata,
            // Optional: customize email redirect URL for deep linking
            // emailRedirectTo: 'your-app-scheme://auth/callback'
        }
    });
    if (error) {
        throw error;
    }
    return data;
};

