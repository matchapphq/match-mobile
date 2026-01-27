import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const tokenStorage = {
    /**
     * Store both access and refresh tokens.
     * Access token can go to AsyncStorage (faster, less secure but short lived).
     * Refresh token MUST go to SecureStore (slower, more secure, long lived).
     */
    setTokens: async (accessToken: string, refreshToken?: string) => {
        try {
            await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
            if (refreshToken) {
                if (Platform.OS !== 'web') {
                    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
                } else {
                    // Fallback for web (not recommended for production sensitive apps, but necessary for web support)
                    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
                }
            }
        } catch (error) {
            console.error('Error setting tokens', error);
        }
    },

    getAccessToken: async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        } catch (error) {
            return null;
        }
    },

    getRefreshToken: async (): Promise<string | null> => {
        try {
            if (Platform.OS !== 'web') {
                return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
            } else {
                return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
            }
        } catch (error) {
            return null;
        }
    },

    clearTokens: async () => {
        try {
            await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
            if (Platform.OS !== 'web') {
                await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
            } else {
                await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
            }
        } catch (error) {
            console.error('Error clearing tokens', error);
        }
    }
};
