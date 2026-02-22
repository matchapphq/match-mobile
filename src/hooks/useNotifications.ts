import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

export const useNotifications = () => {
  const navigation = useNavigation<any>();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
      // You can add logic here to show a toast or update local state
    });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification Response:', response);
      const data = response.notification.request.content.data;
      
      if (data?.reservationId) {
        // Navigate to the specific reservation or reservations list
        navigation.navigate('Tab', { 
            screen: 'Reservations',
            params: { reservationId: data.reservationId }
        });
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [navigation]);
};
