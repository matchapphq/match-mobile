import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { openLiveChatFallback, openSupportEmail } from '../utils/supportEmail';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'Comment réserver une table ?',
    answer:
      "Pour réserver, accédez à la page du bar, sélectionnez votre date et l'heure, choisissez le nombre de personnes, puis confirmez votre réservation. Vous recevrez un e-mail de confirmation.",
  },
  {
    id: 'faq-2',
    question: "Le QR code ne s'affiche pas",
    answer:
      'Vérifiez votre connexion internet. Si le problème persiste, essayez de rafraîchir la page "Mes Tickets" ou contactez notre support technique.',
  },
  {
    id: 'faq-3',
    question: 'Annuler ma réservation',
    answer:
      "Vous pouvez annuler sans frais jusqu'à 2 heures avant l'événement. Allez dans \"Mes Réservations\", sélectionnez la réservation et cliquez sur \"Annuler\".",
  },
  {
    id: 'faq-4',
    question: 'Puis-je modifier mon profil ?',
    answer:
      'Oui, rendez-vous dans l\'onglet "Profil" en bas à droite, puis cliquez sur l\'icône de crayon pour éditer vos informations personnelles.',
  },
];

const FaqSupport = ({ navigation }: { navigation: any }) => {
  const { colors, computedTheme: themeMode, user } = useStore();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);
  const userData = user?.user ?? user ?? null;
  const supportEmail = userData?.email;

  const filteredFaq = FAQ_ITEMS.filter((item) =>
    item.question.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFaq = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'} />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.surfaceGlass }]} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Aide & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}>
        <View style={styles.searchWrapper}>
          <View style={[styles.searchField, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
            <MaterialIcons name="search" size={22} color={colors.textMuted} style={{ marginHorizontal: 12 }} />
            <TextInput
              placeholder="Rechercher une solution..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              style={[styles.searchInput, { color: colors.text }]}
              selectionColor={colors.primary}
            />
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Questions Fréquentes</Text>
          {filteredFaq.map((item) => {
            const isOpen = openId === item.id;
            return (
              <View key={item.id} style={[styles.accordion, { backgroundColor: colors.surface }, isOpen && styles.accordionActive]}>
                <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleFaq(item.id)}>
                  <Text style={[styles.accordionTitle, { color: colors.text }, isOpen && { color: colors.primary }]}>{item.question}</Text>
                  <MaterialIcons
                    name="expand-more"
                    size={22}
                    color={isOpen ? colors.primary : colors.textMuted}
                    style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                  />
                </TouchableOpacity>
                {isOpen && (
                  <View style={[styles.accordionBody, { borderTopColor: colors.divider }]}>
                    <Text style={[styles.accordionText, { color: colors.textMuted }]}>{item.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Besoin d'aide supplémentaire ?</Text>
          <TouchableOpacity
            style={[styles.helpCard, styles.liveChatCard, { borderColor: colors.primary }]}
            activeOpacity={0.85}
            onPress={() => openLiveChatFallback(supportEmail)}
          >
            <View style={styles.helpCardLeft}>
              <View style={[styles.helpIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <MaterialIcons name="chat" size={22} color={colors.white} />
              </View>
              <View>
                <Text style={[styles.helpCardTitle, { color: colors.white }]}>Chat en direct</Text>
                <Text style={styles.helpCardSubtitle}>Réponse en moins de 2 min</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.helpCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}
            activeOpacity={0.85}
            onPress={() => {
              void openSupportEmail({ userEmail: supportEmail });
            }}
          >
            <View style={styles.helpCardLeft}>
              <View style={[styles.helpIcon, { backgroundColor: colors.surfaceAlt }]}>
                <MaterialIcons name="mail" size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.helpCardTitle, { color: colors.text }]}>Envoyer un mail</Text>
                <Text style={[styles.helpCardSubtitle, { color: colors.textMuted }]}>Réponse sous 24h</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
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
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 52,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingRight: 16,
  },
  sectionBlock: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  accordion: {
    borderRadius: 22,
    marginBottom: 12,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  accordionActive: {
    borderColor: 'rgba(244,123,37,0.4)',
    backgroundColor: 'rgba(244,123,37,0.08)',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  accordionBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    paddingBottom: 10,
  },
  accordionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  helpCard: {
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
  },
  liveChatCard: {
    backgroundColor: '#F47B25',
  },
  helpCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  helpIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpCardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  helpCardSubtitle: {
    color: 'rgba(255,255,255,0.7)', // default for liveChatCard (orange bg)
    fontSize: 12,
    marginTop: 2,
  },
});

export default FaqSupport;
