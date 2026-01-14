import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme, images } from '../constants/theme';
import { useStore } from '../store/useStore';
import { mockNotificationSettings } from '../lib/mockData';

const NotificationsScreen = () => {
  const navigation = useNavigation<any>();
  const { notifications, markNotificationAsRead } = useStore();

  const handleToggleNotification = (id: string) => {
    // Toggle notification on/off
  };

  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({
    '1': true,
    '2': true,
    '3': false,
    '4': true,
    '5': false,
  });

  const toggleNotification = (id: string) => {
    setToggleStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ImageBackground source={images.background} style={styles.backgroundContainer} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.globeButton}>
            <Ionicons name="globe-outline" size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={styles.profileIcon}>
              <Text style={styles.profileEmoji}>👤</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Ionicons name="notifications-outline" size={48} color={theme.colors.primary} />
            </View>

            <View style={styles.notificationsList}>
              {mockNotificationSettings.map(notification => (
                <View key={notification.id} style={styles.notificationItem}>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>• {notification.title}</Text>
                    {notification.message && (
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                    )}
                  </View>
                  <View style={styles.toggleContainer}>
                    <Text style={[styles.toggleLabel, toggleStates[notification.id] && styles.toggleLabelActive]}>
                      {toggleStates[notification.id] ? 'ON' : 'OFF'}
                    </Text>
                    <Switch
                      value={toggleStates[notification.id]}
                      onValueChange={() => toggleNotification(notification.id)}
                      trackColor={{ false: '#767577', true: theme.colors.secondary }}
                      thumbColor={toggleStates[notification.id] ? theme.colors.text : '#f4f3f4'}
                    />
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.validateButton} onPress={() => navigation.goBack()}>
              <Text style={styles.validateButtonText}>VALIDER</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  globeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEmoji: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  cardIcon: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  notificationsList: {
    marginBottom: theme.spacing.lg,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  notificationContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  notificationTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  notificationMessage: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleLabel: {
    fontSize: theme.fonts.sizes.xs,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  toggleLabelActive: {
    color: theme.colors.secondary,
  },
  validateButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  validateButtonText: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.background,
  },
  closeButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationsScreen;
