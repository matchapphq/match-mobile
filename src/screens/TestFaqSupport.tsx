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
import { COLORS } from '../constants/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'Comment réserver une table ?'
,
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

const TestFaqSupport = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  const filteredFaq = FAQ_ITEMS.filter((item) =>
    item.question.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFaq = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aide & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}>
        <View style={styles.searchWrapper}>
          <View style={styles.searchField}>
            <MaterialIcons name="search" size={22} color={COLORS.muted} style={{ marginHorizontal: 12 }} />
            <TextInput
              placeholder="Rechercher une solution..."
              placeholderTextColor={COLORS.muted}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              selectionColor={COLORS.primary}
            />
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Questions Fréquentes</Text>
          {filteredFaq.map((item) => {
            const isOpen = openId === item.id;
            return (
              <View key={item.id} style={[styles.accordion, isOpen && styles.accordionActive]}>
                <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleFaq(item.id)}>
                  <Text style={[styles.accordionTitle, isOpen && styles.accordionTitleActive]}>{item.question}</Text>
                  <MaterialIcons
                    name="expand-more"
                    size={22}
                    color={isOpen ? COLORS.primary : COLORS.muted}
                    style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                  />
                </TouchableOpacity>
                {isOpen && (
                  <View style={styles.accordionBody}>
                    <Text style={styles.accordionText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Besoin d'aide supplémentaire ?</Text>
          <TouchableOpacity style={[styles.helpCard, styles.liveChatCard]} activeOpacity={0.85}>
            <View style={styles.helpCardLeft}>
              <View style={[styles.helpIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}> 
                <MaterialIcons name="chat" size={22} color={COLORS.text} />
              </View>
              <View>
                <Text style={styles.helpCardTitle}>Chat en direct</Text>
                <Text style={styles.helpCardSubtitle}>Réponse en moins de 2 min</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpCard} activeOpacity={0.85}>
            <View style={styles.helpCardLeft}>
              <View style={[styles.helpIcon, { backgroundColor: 'rgba(255,255,255,0.08)' }]}> 
                <MaterialIcons name="mail" size={22} color={COLORS.primary} />
              </View>
              <View>
                <Text style={[styles.helpCardTitle, { color: COLORS.text }]}>Envoyer un email</Text>
                <Text style={[styles.helpCardSubtitle, { color: COLORS.muted }]}>Réponse sous 24h</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.muted} />
          </TouchableOpacity>
        </View>
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
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.text,
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
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.divider,
    height: 52,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    paddingRight: 16,
  },
  sectionBlock: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  accordion: {
    borderRadius: 22,
    backgroundColor: COLORS.surface,
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
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  accordionTitleActive: {
    color: COLORS.primary,
  },
  accordionBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.divider,
    paddingTop: 12,
    paddingBottom: 10,
  },
  accordionText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  helpCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  liveChatCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
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
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  helpCardSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
});

export default TestFaqSupport;
