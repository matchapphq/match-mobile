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
    title: 'Préférences',
    rows: [
      { icon: 'language', color: '#818cf8', label: 'Langue', meta: 'Français' },
      { icon: 'dark-mode', color: '#a78bfa', label: 'Thème', meta: 'Sombre' },
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
  const logout = useStore((state) => state.logout);
  const user = useStore((state) => state.user);
  const userData = user?.user ?? user ?? null;
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack?.()}>
            <MaterialIcons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.avatarSection}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} size="large" style={{ marginVertical: 40 }} />
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
                <TouchableOpacity style={styles.avatarEditBadge} activeOpacity={0.9}>
                  <MaterialIcons name="edit" size={22} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              <Text style={styles.name}>
                {profile.first_name && profile.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile.name}
              </Text>
              <Text style={styles.memberSince}>{profile.email}</Text>
              <TouchableOpacity
                style={styles.badge}
                activeOpacity={0.85}
                onPress={() =>
                  Alert.alert(`Avantages Membre ${profile.tier}`, "Accédez à vos avantages exclusifs prochainement.")
                }
              >
                <MaterialIcons name="emoji-events" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.badgeLabel}>{profile.badgeLabel}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.sectionsWrapper}>
          {SECTION_DATA.map((section) => (
            <View key={section.title} style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>{section.title}</Text>
              <View style={styles.sectionCard}>
                {section.rows.map((row, index) => {
                  const isLast = index === section.rows.length - 1;
                  if (row.toggle) {
                    return (
                      <View key={row.label} style={[styles.row, !isLast && styles.rowDivider]}>
                        <View style={styles.rowLeft}>
                          <View style={[styles.rowIcon, { backgroundColor: `${row.color}1A` }]}>
                            <MaterialIcons name={row.icon as any} size={20} color={row.color} />
                          </View>
                          <Text style={styles.rowLabel}>{row.label}</Text>
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

                  const showMeta = row.meta || row.accent;
                  const handlePress = () => {
                    if (row.label === 'Questions fréquentes') {
                      navigation.navigate('TestFaqSupport');
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
                      style={[styles.row, !isLast && styles.rowDivider]}
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
                            row.accent && { color: row.accent, fontWeight: '600' },
                          ]}
                        >
                          {row.label}
                        </Text>
                      </View>
                      {row.meta ? (
                        <View style={styles.metaContainer}>
                          <Text style={styles.metaText}>{row.meta}</Text>
                          <MaterialIcons name="chevron-right" size={20} color={COLORS.subtext} />
                        </View>
                      ) : showMeta ? null : (
                        <MaterialIcons name="chevron-right" size={20} color={COLORS.subtext} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.versionText}>Version 2.4.0 • Build 192</Text>
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
});

export default TestProfilePage;
