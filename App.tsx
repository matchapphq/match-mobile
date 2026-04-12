import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeStore, useStore } from './src/store/useStore';
import * as Notifications from 'expo-notifications';
import { analytics } from './src/services/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
    const computedTheme = useStore((state) => state.computedTheme);

    useEffect(() => {
        const init = async () => {
            await initializeStore();
            
            // Track app_open
            const hasOpened = await AsyncStorage.getItem('app_has_opened');
            analytics.track('app_open', {
                first_open: !hasOpened
            });
            if (!hasOpened) {
                await AsyncStorage.setItem('app_has_opened', 'true');
            }
        };
        
        init();
    }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style={computedTheme === "light" ? "dark" : "light"} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
