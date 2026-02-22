import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeStore, useStore } from './src/store/useStore';
import * as Notifications from 'expo-notifications';

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
        initializeStore();
    }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style={computedTheme === "light" ? "dark" : "light"} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
