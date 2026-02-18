import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert, Linking } from 'react-native';
import Constants from 'expo-constants';

export const notificationService = {
  /**
   * Request permissions for push notifications
   * Returns true if granted, false otherwise
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      Alert.alert('Simulateur', 'Les notifications push ne fonctionnent pas sur les simulateurs.');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permissions requises',
        'Pour recevoir des alertes de match et de réservation, activez les notifications dans les réglages.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Ouvrir les réglages', onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#f47b25',
      });
    }

    return true;
  },

  /**
   * Get the Expo Push Token
   */
  async getExpoPushToken(): Promise<string | null> {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      
      if (!projectId) {
        console.warn('Project ID not found in expo config. Push tokens might not work.');
      }

      const token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  },

  /**
   * Check if user has granted notification permissions
   */
  async checkPermissions(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }
};
