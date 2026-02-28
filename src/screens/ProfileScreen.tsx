import React, { useState, useCallback } from 'react';
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
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../store/useStore';
import { usePostHog } from 'posthog-react-native';
import type { UserProfile } from '../services/mobileApi';
import { openLiveChatFallback, openSupportEmail } from '../utils/supportEmail';

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
  avatar: 'https://avatars.matchapp.fr/defaults/default.jpg',
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
        meta: '0€'
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
      { icon: 'bug-report', color: '#f87171', label: 'Signaler un bug' },
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
const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const posthog = usePostHog();
  const { logout, user, computedTheme: themeMode, themeMode: themePreference, colors, updateUser, fetchUserProfile, refreshUserProfile, isLoading, pushNotificationsEnabled, togglePushNotifications, setPushNotificationsEnabled } = useStore();
  const userData = user?.user ?? user ?? null;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bugModalVisible, setBugModalVisible] = useState(false);
  const [bugName, setBugName] = useState('');
  const [bugContent, setBugContent] = useState('');
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const syncPermissions = async () => {
        const { notificationService } = await import("../services/notificationService");
        const hasPermission = await notificationService.checkPermissions();
        if (hasPermission !== pushNotificationsEnabled) {
          setPushNotificationsEnabled(hasPermission);
        }
      };
      syncPermissions();
    }, [pushNotificationsEnabled, setPushNotificationsEnabled])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUserProfile();
    setIsRefreshing(false);
  };

  const handlePickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newAvatar = result.assets[0].uri;
      try {
        await updateUser({ avatar: newAvatar });
      } catch (error) {
        Alert.alert("Erreur", "Impossible de mettre à jour l'avatar.");
      }
    }
  };

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
      ? [userData.first_name, userData.last_name].filter(Boolean).join(' ') || userData.username || userData.email || 'Utilisateur'
      : DEFAULT_PROFILE.name,
    email: userData?.email || DEFAULT_PROFILE.email,
    badgeLabel: 'Fan',
    avatar: userData?.avatar || DEFAULT_PROFILE.avatar,
    memberSince: userData?.created_at ? new Date(userData.created_at).getFullYear().toString() : '2024',
    tier: 'Gold',
    first_name: userData?.first_name,
    last_name: userData?.last_name,
    bio: userData?.bio,
    phone: userData?.phone,
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Veux-tu te déconnecter de Match ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Confirmer',
        style: 'destructive',
        onPress: () => {
          posthog?.capture('logout_performed');
          logout();
          // Navigation is handled automatically by AppNavigator's conditional rendering
        },
      },
    ]);
  };

  const handleSendBugReport = async () => {
    if (!bugContent.trim()) {
      Alert.alert('Erreur', 'Veuillez décrire le bug rencontré.');
      return;
    }

    setIsSubmittingBug(true);
    try {
      const { mobileApi } = await import("../services/mobileApi");
      
      const metadata = {
        platform: Platform.OS,
        os_version: Platform.Version,
        device_model: Platform.select({ ios: 'iPhone', android: 'Android' }),
        app_version: '2.4.0',
        user_id: userData?.id,
        timestamp: new Date().toISOString(),
      };

      const success = await mobileApi.reportBug({
        userName: bugName,
        userEmail: profile.email || 'unknown@matchapp.fr',
        description: bugContent,
        metadata
      });

      if (success) {
        posthog?.capture('bug_report_sent', {
          description_length: bugContent.length,
          platform: metadata.platform,
        });
        Alert.alert('Merci !', 'Votre rapport de bug a été envoyé avec succès.');
        setBugModalVisible(false);
        setBugContent('');
      } else {
        throw new Error("API_ERROR");
      }
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'envoyer le rapport. Veuillez réessayer plus tard.");
    } finally {
      setIsSubmittingBug(false);
    }
  };

  const supportEmail = profile.email || userData?.email;

  const openAdvisorMenu = () => {
    Alert.alert('Parler à un conseiller', 'Merci de choisir un canal de contact.', [
      {
        text: 'Chat en direct',
        onPress: () => {
          openLiveChatFallback(supportEmail);
        },
      },
      {
        text: 'Envoyer un mail',
        onPress: () => {
          void openSupportEmail({ userEmail: supportEmail });
        },
      },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'} />
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.surface }]} onPress={() => navigation.goBack?.()}>
            <MaterialIcons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Paramètres</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <ImageBackground
              source={{
                uri: profile.avatar,
              }}
              style={styles.avatar}
              imageStyle={{ borderRadius: 64 }}
            />
            <TouchableOpacity 
              style={[styles.avatarEditBadge, { backgroundColor: colors.primary, borderColor: colors.background }]} 
              activeOpacity={0.9}
              onPress={handlePickImage}
            >
              <MaterialIcons name="edit" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {profile.name}
          </Text>
          <Text style={[styles.memberSince, { color: colors.subtext }]}>{profile.email}</Text>
          {profile.bio && (
            <Text style={[styles.bioText, { color: colors.textSecondary }]}>{profile.bio}</Text>
          )}
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
                          onPress={() => {
                            const newState = !pushNotificationsEnabled;
                            posthog?.capture('notification_toggle', { enabled: newState });
                            togglePushNotifications();
                          }}
                        >
                          <View style={[styles.toggleTrack, pushNotificationsEnabled && styles.toggleTrackActive]}>
                            <View
                              style={[
                                styles.toggleThumb,
                                pushNotificationsEnabled && styles.toggleThumbActive,
                              ]}
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  }

                  const showMeta = row.meta || row.accent || row.badge || (row.label === 'Thème');
                  const displayMeta = row.label === 'Thème' ? getThemeLabel(themePreference) : row.meta;
                  const isLanguageRow = row.label === 'Langue';

                  const handlePress = () => {
                      switch (row.label) {
                          case 'Modifier le profil':
                              navigation.navigate('EditProfile');
                              return;
                          case 'Mes favoris':
                              navigation.navigate('Favourites');
                              return;
                          case 'Mon Portefeuille':
                              Alert.alert('Mon Portefeuille', 'Cette fonctionnalité sera disponible prochainement.');
                              return;
                          case 'Mes Coupons':
                              Alert.alert('Mes Coupons', 'Cette fonctionnalité sera disponible prochainement.');
                              return;
                          case 'Mot de passe':
                              navigation.navigate('ChangePassword');
                              return;
                          case 'Données personnelles':
                              navigation.navigate('DataPrivacy');
                              return;
                          case 'Questions fréquentes':
                              navigation.navigate('FaqSupport');
                              return;
                          case 'Parler à un conseiller':
                              openAdvisorMenu();
                              return;
                          case 'Signaler un bug':
                              setBugName(profile.name);
                              setBugContent('');
                              setBugModalVisible(true);
                              return;
                          case 'Déconnexion':
                              handleLogout();
                              return;
                          case 'Supprimer le compte':
                              navigation.navigate('DeleteAccountWarning');
                              return;
                          case 'Langue':
                              // French-only for now: language picker is temporarily disabled.
                              return;
                          case 'Thème':
                              navigation.navigate('ThemeSelection');
                              return;
                          default:
                              Alert.alert(row.label, 'Cette fonctionnalité sera disponible prochainement.');
                              return;
                      }
                  };

                  return (
                    <TouchableOpacity
                      key={row.label}
                      style={[styles.row, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider }]}
                      activeOpacity={isLanguageRow ? 1 : 0.85}
                      disabled={isLanguageRow}
                      onPress={isLanguageRow ? undefined : handlePress}
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
                          {!isLanguageRow && (
                            <MaterialIcons name="chevron-right" size={20} color={colors.subtext} />
                          )}
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

      {/* Bug Report Modal */}
      <Modal
        visible={bugModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBugModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Signaler un bug</Text>
                <TouchableOpacity onPress={() => setBugModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalForm}>
                <Text style={[styles.inputLabel, { color: colors.subtext }]}>VOTRE NOM</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  value={bugName}
                  onChangeText={setBugName}
                  placeholder="Nom"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={[styles.inputLabel, { color: colors.subtext, marginTop: 14 }]}>DESCRIPTION DU BUG</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, height: 140 }]}
                  value={bugContent}
                  onChangeText={setBugContent}
                  placeholder="Décrivez le problème ici..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[styles.sendButton, { backgroundColor: colors.primary }, isSubmittingBug && { opacity: 0.7 }]}
                  onPress={handleSendBugReport}
                  disabled={isSubmittingBug}
                >
                  {isSubmittingBug ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.sendButtonText}>Envoyer le rapport</Text>
                      <MaterialIcons name="send" size={18} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  bioText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
    lineHeight: 20,
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
    backgroundColor: 'rgba(120,120,128,0.2)',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalForm: {
    marginBottom: 0,
  },
  modalInput: {
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  modalTextArea: {
    height: 150,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  sendButton: {
    marginTop: 20,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileScreen;
