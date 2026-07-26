import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Safe storage adapter to prevent 'ReferenceError: window is not defined' during Expo SSR/Node evaluation
const customStorageAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return Promise.resolve(null);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return Promise.resolve();
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return Promise.resolve();
    }
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function ensureUserExists(userId: string, email: string, name?: string) {
  try {
    const { data: existingUser, error: fetchError } = await supabase
      .from('User')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.warn('Error checking existing user in User table:', fetchError);
    }

    if (!existingUser) {
      const { error: insertError } = await supabase
        .from('User')
        .insert({
          id: userId,
          email: email,
          name: name || email.split('@')[0],
        });

      if (insertError) {
        console.error('Error synchronizing user to User table:', insertError);
        return { success: false, error: insertError };
      }
    }
    return { success: true };
  } catch (error) {
    console.error('Catch block error in ensureUserExists:', error);
    return { success: false, error };
  }
}
