import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useStore } from '../store/useStore';

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useStore();

  const menuItems = [
    { id: 'level', label: 'Mon niveau', icon: 'trophy-outline', color: theme.colors.primary },
    { id: 'reservations', label: 'Mes réservations', icon: 'calendar-outline', color: '#FFD700', highlight: true },
    { id: 'notifications', label: 'Notifications', icon: 'notifications-outline', color: '#FFD700', highlight: true },
    { id: 'reviews', label: 'Mes avis', icon: 'flag-outline', color: theme.colors.primary },
    { id: 'favorites', label: 'Coups de coeur', icon: 'heart-outline', color: theme.colors.primary },
    { id: 'info', label: 'Mes infos', icon: 'information-circle-outline', color: theme.colors.primary },
    { id: 'preferences', label: 'Préférences sportives', icon: 'settings-outline', color: theme.colors.primary },
  ];

  const handleMenuPress = (id: string) => {
    switch (id) {
      case 'reservations':
        navigation.navigate('Reservations');
        break;
      case 'notifications':
        navigation.navigate('Notifications');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="globe-outline" size={28} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Bonjour _______</Text>
        <TouchableOpacity>
          <View style={styles.profileIcon}>
            <Text>👤</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
        <Text style={styles.levelText}>Niveau Social Sport</Text>
      </View>

      <ScrollView style={styles.menuList}>
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              item.highlight && styles.menuItemHighlight
            ]}
            onPress={() => handleMenuPress(item.id)}
          >
            <View style={styles.menuItemContent}>
              <Ionicons name={item.icon as any} size={24} color={item.color} />
              <Text style={[
                styles.menuItemText,
                item.highlight && styles.menuItemTextHighlight
              ]}>
                {item.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Déconnexion</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity>
          <Text style={styles.footerText}>Proposer un lieu sur Match</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarEmoji: {
    fontSize: 50,
  },
  levelText: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  menuList: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  menuItem: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  menuItemHighlight: {
    borderColor: '#FFD700',
    borderWidth: 2,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  menuItemText: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.primary,
  },
  menuItemTextHighlight: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: theme.colors.secondary,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.background,
  },
  footer: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },
});

export default ProfileScreen;
