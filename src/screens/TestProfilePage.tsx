import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useStore } from '../store/useStore';
import type { UserProfile } from '../services/testApi';

type SectionRow = {
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  label: string;
  meta?: string;
  toggle?: boolean;
  accent?: string;
  badge?: string | number;
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Utilisateur',
  email: '',
  badgeLabel: 'Fan',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
  memberSince: '2024',
  tier: 'Gold',
};

const SECTION_DATA: { title: string; rows: SectionRow[] }[] = [
  {
    title: 'Profil',
    rows: [
      { icon: 'person', color: '#60a5fa', label: 'Modifier le profil' },
      { icon: 'favorite', color: '#f472b6', label: 'Mes favoris' },
    ],
  },
  {
    title: 'Paiement & Avantages',
    rows: [
      {
        icon: 'account-balance-wallet',
        color: '#f59e0b', // Amber-ish
        label: 'Mon Portefeuille',
        meta: '12.50 €'
      },
      {
        icon: 'local-activity',
        color: '#f43f5e', // Rose-ish
        label: 'Mes Coupons',
        badge: 2
      },
    ],
  },
  {
    title: 'Préférences',
    rows: [
      { icon: 'language', color: '#818cf8', label: 'Langue', meta: 'Français' },
      { icon: 'dark-mode', color: '#a78bfa', label: 'Thème' },
      { icon: 'notifications', color: '#fb923c', label: 'Notifications', toggle: true },
    ],
  },
  {
    title: 'Sécurité & Confidentialité',
    rows: [
      { icon: 'lock', color: '#34d399', label: 'Mot de passe' },
      { icon: 'shield', color: '#2dd4bf', label: 'Données personnelles' },
    ],
  },
  {
    title: 'Q&A Support',
    rows: [
      { icon: 'help', color: '#fbbf24', label: 'Questions fréquentes' },
      { icon: 'chat', color: '#34d399', label: 'Parler à un conseiller' },
    ],
  },
  {
    title: 'Actions',
    rows: [
      { icon: 'logout', color: COLORS.primary, label: 'Déconnexion', accent: COLORS.primary },
      { icon: 'delete', color: '#f87171', label: 'Supprimer le compte', accent: '#f87171' },
    ],
  },
];
const TestProfilePage = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { logout, user, themeMode, colors } = useStore();
  const userData = user?.user ?? user ?? null;
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const getThemeLabel = (mode: 'light' | 'dark' | 'system') => {
    switch (mode) {
      case 'light': return 'Clair';
      case 'dark': return 'Sombre';
      case 'system': return 'Système';
      default: return 'Sombre';
    }
  };

  // Build profile from store user data
  const profile: UserProfile = {
    name: userData
      ? [userData.first_name, userData.last_name].filter(Boolean).join(' ') || 'Utilisateur'
      : DEFAULT_PROFILE.name,
    email: userData?.email || DEFAULT_PROFILE.email,
    badgeLabel: 'Fan',
    avatar: userData?.avatar || DEFAULT_PROFILE.avatar,
    memberSince: userData?.created_at ? new Date(userData.created_at).getFullYear().toString() : '2024',
    tier: 'Gold',
    first_name: userData?.first_name,
    last_name: userData?.last_name,
  };

  const isLoading = false;

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Veux-tu te déconnecter de Match ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Confirmer',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'TestWelcome' }],
          });
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.surface }]} onPress={() => navigation.goBack?.()}>
            <MaterialIcons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Paramètres</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.avatarSection}>
          {isLoading ? (
            <ActivityIndicator color={colors.primary} size="large" style={{ marginVertical: 40 }} />
          ) : (
            <>
              <View style={styles.avatarWrapper}>
                <ImageBackground
                  source={{
                    uri: profile.avatar,
                  }}
                  style={styles.avatar}
                  imageStyle={{ borderRadius: 64 }}
                />
                <TouchableOpacity style={[styles.avatarEditBadge, { backgroundColor: colors.primary, borderColor: colors.background }]} activeOpacity={0.9}>
                  <MaterialIcons name="edit" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.name, { color: colors.text }]}>
                {profile.first_name && profile.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile.name}
              </Text>
              <Text style={[styles.memberSince, { color: colors.subtext }]}>{profile.email}</Text>
              <TouchableOpacity
                style={styles.badge}
                activeOpacity={0.85}
                onPress={() =>
                  Alert.alert(`Avantages Membre ${profile.tier}`, "Accédez à vos avantages exclusifs prochainement.")
                }
              >
                <MaterialIcons name="emoji-events" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.badgeLabel, { color: colors.primary }]}>{profile.badgeLabel}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.sectionsWrapper}>
          {SECTION_DATA.map((section) => (
            <View key={section.title} style={styles.sectionBlock}>
              <Text style={[styles.sectionHeader, { color: colors.subtext }]}>{section.title}</Text>
              <View style={[styles.sectionCard, {
                borderColor: colors.border,
                backgroundColor: themeMode === 'light' ? 'white' : 'rgba(255,255,255,0.04)'
              }]}>
                {section.rows.map((row, index) => {
                  const isLast = index === section.rows.length - 1;
                  if (row.toggle) {
                    return (
                      <View key={row.label} style={[styles.row, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider }]}>
                        <View style={styles.rowLeft}>
                          <View style={[styles.rowIcon, { backgroundColor: `${row.color}1A` }]}>
                            <MaterialIcons name={row.icon as any} size={20} color={row.color} />
                          </View>
                          <Text style={[styles.rowLabel, { color: colors.text }]}>{row.label}</Text>
                        </View>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => setNotificationsEnabled((prev) => !prev)}
                        >
                          <View style={[styles.toggleTrack, notificationsEnabled && styles.toggleTrackActive]}>
                            <View
                              style={[
                                styles.toggleThumb,
                                notificationsEnabled && styles.toggleThumbActive,
                              ]}
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  }

                  const showMeta = row.meta || row.accent || row.badge || (row.label === 'Thème');
                  const displayMeta = row.label === 'Thème' ? getThemeLabel(themeMode) : row.meta;

                  const handlePress = () => {
                    if (row.label === 'Questions fréquentes') {
                      navigation.navigate('TestFaqSupport');
                      return;
                    }
                    if (row.label === 'Langue') {
                      navigation.navigate('LanguageSelection');
                      return;
                    }
                    if (row.label === 'Thème') {
                      navigation.navigate('ThemeSelection');
                      return;
                    }
                    if (row.label === 'Parler à un conseiller') {
                      Alert.alert('Support', 'Nous connectons cette option prochainement.');
                      return;
                    }
                    if (row.label === 'Déconnexion') {
                      handleLogout();
                      return;
                    }
                  };

                  return (
                    <TouchableOpacity
                      key={row.label}
                      style={[styles.row, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider }]}
                      activeOpacity={0.85}
                      onPress={handlePress}
                    >
                      <View style={styles.rowLeft}>
                        <View style={[styles.rowIcon, { backgroundColor: `${row.color}1A` }]}>
                          <MaterialIcons name={row.icon as any} size={20} color={row.color} />
                        </View>
                        <Text
                          style={[
                            styles.rowLabel,
                            { color: colors.text },
                            row.accent && { color: row.accent, fontWeight: '600' },
                          ]}
                        >
                          {row.label}
                        </Text>
                      </View>
                      {displayMeta ? (
                        <View style={styles.metaContainer}>
                          <Text style={[styles.metaText, { color: colors.subtext }]}>{displayMeta}</Text>
                          <MaterialIcons name="chevron-right" size={20} color={colors.subtext} />
                        </View>
                      ) : row.badge ? (
                        <View style={styles.metaContainer}>
                          <View style={[styles.badgeContainer, { backgroundColor: colors.primary }]}>
                            <Text style={styles.badgeText}>{row.badge}</Text>
                          </View>
                          <MaterialIcons name="chevron-right" size={20} color={colors.subtext} />
                        </View>
                      ) : showMeta ? null : (
                        <MaterialIcons name="chevron-right" size={20} color={colors.subtext} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.versionText, { color: colors.subtext }]}>Version 2.4.0 • Build 192</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  avatarSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  avatarWrapper: {
    marginBottom: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    borderWidth: 4,
    borderColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  name: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  memberSince: {
    color: COLORS.subtext,
    fontSize: 14,
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(244,123,37,0.15)',
  },
  badgeLabel: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  sectionsWrapper: {
    paddingHorizontal: 16,
    gap: 24,
  },
  sectionBlock: {
    marginBottom: 18,
  },
  sectionHeader: {
    color: COLORS.subtext,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: COLORS.subtext,
    fontSize: 13,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    transform: [{ translateX: 0 }],
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
    backgroundColor: '#fff',
  },
  versionText: {
    textAlign: 'center',
    color: COLORS.subtext,
    fontSize: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  badgeContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default TestProfilePage;
