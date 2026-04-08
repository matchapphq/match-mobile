import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Dimensions,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Animated, { 
  FadeInUp, 
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { useStore } from '../store/useStore';
import { apiService } from '../services/api';
import { usePostHog } from 'posthog-react-native';
import CancelReservationModal from '../components/CancelReservationModal';

const { width } = Dimensions.get('window');

// Design Tokens
const BG_DARK = '#0D0D0D';
const ACCENT_GREEN = '#00FF00';
const TEXT_MUTED = '#808080';

type FilterType = 'all' | 'confirmed' | 'pending' | 'cancelled';

type BookingCard = {
  id: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  venue: string;
  match: string;
  date: string;
  dateFormatted: string;
  people: string;
  peopleCount: number;
  location: string;
  reference: string;
  dateShort: string;
  time: string;
  qrCode?: string;
  image: string;
  rawDate: Date;
};

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'Confirmées', value: 'confirmed' },
  { label: 'En attente', value: 'pending' },
  { label: 'Annulées', value: 'cancelled' },
];

/**
 * Filter Pill Component with Spring Animation
 */
const FilterPill = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
    >
      <Animated.View style={[
        styles.filterPill,
        active ? styles.filterPillActive : styles.filterPillInactive,
        animatedStyle
      ]}>
        <Text style={[
          styles.filterPillText,
          active ? styles.filterPillTextActive : styles.filterPillTextInactive
        ]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

/**
 * HERO CARD: Next upcoming booking
 * RESTORED TO ORIGINAL DESIGN LANGUAGE
 */
const HeroTicketCard = ({ 
  booking, 
  onCancel, 
  onTicket,
  isCanceling,
  colors 
}: { 
  booking: BookingCard; 
  onCancel: (b: BookingCard) => void; 
  onTicket: (b: BookingCard) => void;
  isCanceling: boolean;
  colors: any;
}) => {
  const isConfirmed = booking.status === 'confirmed';
  const statusColor = booking.status === 'confirmed' ? '#22c55e' : booking.status === 'pending' ? '#f59e0b' : '#ef4444';
  const statusLabel = booking.status === 'confirmed' ? 'Confirmé' : booking.status === 'pending' ? 'En attente' : 'Annulé';

  return (
    <Animated.View entering={FadeInUp.springify()} style={[styles.upcomingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.upcomingCardContent}>
        <View style={styles.upcomingCardInfo}>
          <View style={styles.upcomingStatusRow}>
            <View style={[styles.upcomingStatusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.upcomingStatusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
          <Text style={[styles.upcomingVenueName, { color: colors.text }]}>{booking.venue}</Text>
          <Text style={[styles.upcomingMatchText, { color: colors.accent }]}>{booking.match}</Text>
          <View style={styles.upcomingDateRow}>
            <MaterialIcons name="calendar-today" size={14} color={colors.textMuted} />
            <Text style={[styles.upcomingDateText, { color: colors.textMuted }]}>{booking.dateFormatted}</Text>
          </View>
        </View>
        <Image source={{ uri: booking.image }} style={styles.upcomingThumbnail} />
      </View>
      <View style={[styles.upcomingActionsRow, { borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.upcomingCancelButton} onPress={() => onCancel(booking)} disabled={isCanceling}>
          {isCanceling ? <ActivityIndicator size="small" color={colors.textMuted} /> : <Text style={[styles.upcomingCancelText, { color: colors.textMuted }]}>Annuler</Text>}
        </TouchableOpacity>
        {isConfirmed ? (
          <TouchableOpacity style={[styles.upcomingTicketButton, { backgroundColor: colors.accent10 }]} onPress={() => onTicket(booking)}>
            <MaterialIcons name="qr-code" size={14} color={colors.accent} />
            <Text style={[styles.upcomingTicketText, { color: colors.accent }]}>Ticket</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.upcomingModifyButton, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.upcomingModifyText, { color: colors.text }]}>Modifier</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

/**
 * SECONDARY CARD: For other upcoming bookings
 * Slimmer, more compact format
 */
const SecondaryUpcomingCard = ({ booking, onTicket, colors }: { booking: BookingCard; onTicket: (b: BookingCard) => void; colors: any }) => (
  <TouchableOpacity 
    style={[styles.secondaryCard, { backgroundColor: colors.card }]} 
    onPress={() => onTicket(booking)}
    activeOpacity={0.7}
  >
    <View style={styles.secondaryLeft}>
      <Text style={[styles.secondaryVenue, { color: colors.text }]} numberOfLines={1}>{booking.venue}</Text>
      <Text style={styles.secondaryMatch} numberOfLines={1}>{booking.match}</Text>
      <Text style={[styles.secondaryDate, { color: colors.textMuted }]}>{booking.dateShort} • {booking.time}</Text>
    </View>
    <View style={styles.secondaryRight}>
      <View style={[styles.miniStatusBadge, { backgroundColor: booking.status === 'confirmed' ? ACCENT_GREEN + '15' : '#f59e0b15' }]}>
        <Text style={[styles.miniStatusText, { color: booking.status === 'confirmed' ? ACCENT_GREEN : '#f59e0b' }]}>
          {booking.status === 'confirmed' ? 'Confirmé' : 'Attente'}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
    </View>
  </TouchableOpacity>
);

/**
 * ARCHIVED CARD: For past reservations
 */
const ArchivedCard = ({ booking, colors }: { booking: BookingCard; colors: any }) => (
  <View style={[styles.archivedCard, { backgroundColor: colors.surfaceAlt }]}>
    <View style={styles.archivedInner}>
      <Image source={{ uri: booking.image }} style={styles.archivedThumbnail} contentFit="cover" />
      <View style={styles.archivedContent}>
        <Text style={[styles.archivedVenue, { color: colors.textSecondary }]}>{booking.venue}</Text>
        <Text style={[styles.archivedMatch, { color: colors.textMuted }]}>{booking.match}</Text>
        <Text style={[styles.archivedDate, { color: colors.textMuted }]}>{booking.dateShort} • {booking.time}</Text>
      </View>
      <View style={[styles.archivedBadge, { backgroundColor: colors.border }]}>
        <Text style={[styles.archivedBadgeText, { color: colors.textMuted }]}>PASSÉE</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.archivedAction}>
      <Text style={[styles.archivedActionText, { color: colors.textMuted }]}>Voir le récap →</Text>
    </TouchableOpacity>
  </View>
);

const UserBookedScreen = () => {
  const {
    colors,
    reservations,
    fetchReservations,
    refreshReservations,
    cancelReservationApi,
    isLoading,
    computedTheme: themeMode,
  } = useStore();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const posthog = usePostHog();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cancelingIds, setCancelingIds] = useState<Set<string>>(new Set());

  const [activeQrBooking, setActiveQrBooking] = useState<BookingCard | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [cancelModalBooking, setCancelModalBooking] = useState<BookingCard | null>(null);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshReservations();
    setIsRefreshing(false);
  }, [refreshReservations]);

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    const bookingId = cancelModalBooking.id;
    setCancelModalBooking(null);
    setCancelingIds((prev) => new Set(prev).add(bookingId));
    const success = await cancelReservationApi(bookingId);
    if (success) posthog?.capture('booking_cancelled', { reservation_id: bookingId });
    setCancelingIds((prev) => {
      const next = new Set(prev);
      next.delete(bookingId);
      return next;
    });
  };

  const handleOpenTicket = async (booking: BookingCard) => {
    setActiveQrBooking(booking);
    setQrCode(null);
    setQrError(null);
    setIsQrLoading(true);
    try {
      const response = await apiService.getReservationById(booking.id);
      const qrImage = response.qrCode || response.reservation?.qr_code;
      if (qrImage) setQrCode(qrImage);
      else setQrError("QR code indisponible");
    } catch (err) { 
      console.warn("QR fetch failed", err); 
      setQrError("Impossible de récupérer le QR code");
    }
    finally { setIsQrLoading(false); }
  };

  const bookings = useMemo<BookingCard[]>(
    () =>
      reservations.map((res) => {
        const date = res.date ? new Date(res.date) : new Date();
        const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
        return {
          id: res.id,
          status: res.status as any,
          venue: res.venueName,
          match: res.matchTitle || 'Match',
          date: date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
          dateFormatted: `${weekDays[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} • ${res.time || '20:00'}`,
          people: `${res.numberOfPeople} pers.`,
          peopleCount: res.numberOfPeople,
          location: res.venueAddress || '',
          reference: res.reference || res.id?.slice(0, 8).toUpperCase(),
          dateShort: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          time: res.time || '20:00',
          image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
          rawDate: date,
        };
      }),
    [reservations],
  );

  const { hero, upcoming, past } = useMemo(() => {
    const now = new Date();
    let filtered = bookings;
    if (selectedFilter !== 'all') filtered = filtered.filter(b => b.status === selectedFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(b => b.venue.toLowerCase().includes(q) || b.match.toLowerCase().includes(q));
    }
    const future = filtered.filter(b => b.rawDate >= now && b.status !== 'cancelled').sort((a,b) => a.rawDate.getTime() - b.rawDate.getTime());
    const archived = filtered.filter(b => b.rawDate < now || b.status === 'cancelled').sort((a,b) => b.rawDate.getTime() - a.rawDate.getTime());
    return { hero: future[0] || null, upcoming: future.slice(1), past: archived };
  }, [bookings, selectedFilter, searchQuery]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
            <MaterialIcons name="arrow-back-ios-new" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>MES RÉSERVATIONS</Text>
          <TouchableOpacity hitSlop={10}>
            <MaterialIcons name="settings" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
            <MaterialIcons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Rechercher un bar ou un match..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
        
        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {FILTERS.map((f) => (
            <FilterPill key={f.value} label={f.label} active={selectedFilter === f.value} onPress={() => setSelectedFilter(f.value)} />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={ACCENT_GREEN} />}
      >
        {/* HERO SECTION */}
        {hero ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Prochaine réservation</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>Ton prochain match à ne pas manquer</Text>
            </View>
            <HeroTicketCard 
              booking={hero} 
              onCancel={setCancelModalBooking} 
              onTicket={handleOpenTicket} 
              isCanceling={cancelingIds.has(hero.id)} 
              colors={colors}
            />
          </View>
        ) : !isLoading && selectedFilter === 'all' && (
          <View style={styles.emptyHero}>
            <MaterialIcons name="calendar-today" size={48} color={colors.border} />
            <Text style={[styles.emptyHeroTitle, { color: colors.textMuted }]}>Aucune réservation à venir</Text>
            <TouchableOpacity style={styles.emptyHeroCTA} onPress={() => navigation.navigate('Tab', { screen: 'Discover' })}>
              <Text style={styles.emptyHeroCTAText}>Trouver un bar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SECONDARY UPCOMING */}
        {upcoming.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.listTitle, { color: colors.textMuted }]}>À venir ensuite</Text>
            {upcoming.map(b => (
              <SecondaryUpcomingCard key={b.id} booking={b} onTicket={handleOpenTicket} colors={colors} />
            ))}
          </View>
        )}

        {/* FIND MORE CTA */}
        {hero && (
           <TouchableOpacity
           style={[styles.findMoreBtn, { borderColor: colors.border }]}
           onPress={() => navigation.navigate('Tab', { screen: 'Discover' })}
         >
           <MaterialIcons name="add" size={20} color={ACCENT_GREEN} />
           <Text style={[styles.findMoreText, { color: colors.textSecondary }]}>Trouver un autre bar</Text>
         </TouchableOpacity>
        )}

        {/* PAST SECTION */}
        <View style={styles.section}>
          <Text style={[styles.listTitle, { color: colors.textMuted }]}>Passées</Text>
          {past.length > 0 ? (
            past.map(b => <ArchivedCard key={b.id} booking={b} colors={colors} />)
          ) : (
            <Text style={[styles.emptyPastText, { color: colors.border }]}>Ton historique apparaîtra ici</Text>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Ticket Modal - RESTORED ORIGINAL DESIGN */}
      <Modal visible={!!activeQrBooking} transparent animationType="fade" onRequestClose={() => setActiveQrBooking(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalLabel, { color: colors.text }]}>Votre Réservation</Text>
            {activeQrBooking && (
              <View style={[styles.ticketCard, { backgroundColor: '#fff' }]}>
                <View style={[styles.ticketCutoutLeft, { backgroundColor: colors.surface }]} />
                <View style={[styles.ticketCutoutRight, { backgroundColor: colors.surface }]} />

                <View style={styles.ticketUpper}>
                  <View style={[styles.modalStatusBadge, { backgroundColor: 'rgba(74, 222, 128, 0.15)' }]}>
                    <MaterialIcons name="check-circle" size={16} color="#16a34a" />
                    <Text style={styles.modalStatusText}>{activeQrBooking.status === 'pending' ? 'En attente' : 'Confirmé'}</Text>
                  </View>
                  <Text style={[styles.modalVenue, { color: '#0f172a' }]}>{activeQrBooking.venue.toUpperCase()}</Text>
                  <View style={styles.modalLocationRow}>
                    <MaterialIcons name="location-on" size={18} color="#6b7280" />
                    <Text style={[styles.modalLocationText, { color: '#6b7280' }]}>{activeQrBooking.location}</Text>
                  </View>
                  <View style={styles.qrPreview}>
                    {isQrLoading ? (
                      <ActivityIndicator color={colors.accent} style={{ flex: 1 }} />
                    ) : qrCode ? (
                      <Image source={{ uri: qrCode }} style={styles.qrImage} contentFit="contain" />
                    ) : (
                      <View style={styles.qrFallback}>
                        <MaterialIcons name="qr-code" size={64} color="#9ca3af" />
                        <Text style={styles.qrFallbackText}>{qrError ?? 'QR code indisponible'}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.modalReference}>REF: {activeQrBooking.reference}</Text>
                </View>

                <View style={styles.ticketDivider} />

                <View style={[styles.ticketLower, { backgroundColor: '#f8fafc' }]}>
                  <View style={styles.ticketStat}>
                    <Text style={styles.ticketStatLabel}>Date</Text>
                    <MaterialIcons name="calendar-today" size={20} color={colors.accent} />
                    <Text style={styles.ticketStatValue}>{activeQrBooking.dateShort}</Text>
                  </View>
                  <View style={styles.ticketStat}>
                    <Text style={styles.ticketStatLabel}>Heure</Text>
                    <MaterialIcons name="schedule" size={20} color={colors.accent} />
                    <Text style={styles.ticketStatValue}>{activeQrBooking.time}</Text>
                  </View>
                  <View style={styles.ticketStat}>
                    <Text style={styles.ticketStatLabel}>Personnes</Text>
                    <MaterialIcons name="group" size={20} color={colors.accent} />
                    <Text style={styles.ticketStatValue}>{activeQrBooking.peopleCount}</Text>
                  </View>
                </View>

                <View style={[styles.ticketTip, { backgroundColor: '#fff', borderColor: '#e5e7eb' }]}>
                  <MaterialIcons name="brightness-high" size={18} color={colors.accent} />
                  <Text style={styles.ticketTipText}>Luminosité max recommandée</Text>
                </View>
              </View>
            )}

            <Pressable style={[styles.modalCloseButton, { backgroundColor: colors.primary }]} onPress={() => setActiveQrBooking(null)}>
              <Text style={styles.modalCloseText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <CancelReservationModal
        visible={!!cancelModalBooking}
        reservation={cancelModalBooking as any}
        onClose={() => setCancelModalBooking(null)}
        onConfirmCancel={handleConfirmCancel}
        primaryColor={ACCENT_GREEN}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_DARK },
  header: { paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 24 },
  headerTitle: { fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  
  searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 48, borderRadius: 12, gap: 10 },
  searchInput: { flex: 1, fontSize: 14 },
  
  filterContainer: { paddingHorizontal: 20, gap: 10, paddingBottom: 4 },
  filterPill: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, minWidth: 80, alignItems: 'center' },
  filterPillActive: { backgroundColor: ACCENT_GREEN },
  filterPillInactive: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#222' },
  filterPillText: { fontSize: 13, fontWeight: '700' },
  filterPillTextActive: { color: '#000' },
  filterPillTextInactive: { color: '#888' },

  container: { flex: 1 },
  scrollContent: { padding: 20, gap: 24 },
  section: { gap: 14 },
  sectionHeader: { marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  sectionSubtitle: { fontSize: 13, marginTop: 2 },
  
  // ORIGINAL TICKET CARD STYLES
  upcomingCard: { borderRadius: 12, borderWidth: 1, padding: 16 },
  upcomingCardContent: { flexDirection: 'row', gap: 16 },
  upcomingCardInfo: { flex: 1, gap: 4 },
  upcomingStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  upcomingStatusDot: { width: 6, height: 6, borderRadius: 3 },
  upcomingStatusText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  upcomingVenueName: { fontSize: 16, fontWeight: '700' },
  upcomingMatchText: { fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2 },
  upcomingDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  upcomingDateText: { fontSize: 12, fontWeight: '500' },
  upcomingThumbnail: { width: 80, height: 80, borderRadius: 8, opacity: 0.8 },
  upcomingActionsRow: { flexDirection: 'row', gap: 8, paddingTop: 12, marginTop: 12, borderTopWidth: 1 },
  upcomingCancelButton: { flex: 1, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  upcomingCancelText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  upcomingTicketButton: { flex: 1, height: 32, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  upcomingTicketText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  upcomingModifyButton: { flex: 1, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  upcomingModifyText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  // SECONDARY CARD STYLES
  secondaryCard: { borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secondaryLeft: { flex: 1, gap: 2 },
  secondaryVenue: { fontSize: 15, fontWeight: '700' },
  secondaryMatch: { fontSize: 13, fontWeight: '600', color: ACCENT_GREEN },
  secondaryDate: { fontSize: 12, marginTop: 2 },
  secondaryRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniStatusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  miniStatusText: { fontSize: 10, fontWeight: '800' },

  // ARCHIVED CARD STYLES
  archivedCard: { borderRadius: 16, padding: 16, gap: 12, opacity: 0.7 },
  archivedInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  archivedThumbnail: { width: 48, height: 48, borderRadius: 8, opacity: 0.5 },
  archivedContent: { flex: 1, gap: 2 },
  archivedVenue: { fontSize: 14, fontWeight: '700' },
  archivedMatch: { fontSize: 12, fontWeight: '500' },
  archivedDate: { fontSize: 11 },
  archivedBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  archivedBadgeText: { fontSize: 9, fontWeight: '800' },
  archivedAction: { alignSelf: 'flex-end' },
  archivedActionText: { fontSize: 12, fontWeight: '600' },

  listTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 2 },
  findMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderStyle: 'dashed', borderWidth: 1, borderRadius: 16 },
  findMoreText: { fontSize: 14, fontWeight: '600' },
  emptyHero: { alignItems: 'center', paddingVertical: 60, gap: 16 },
  emptyHeroTitle: { fontSize: 16, fontWeight: '700' },
  emptyHeroCTA: { backgroundColor: ACCENT_GREEN, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 30 },
  emptyHeroCTAText: { color: '#000', fontSize: 14, fontWeight: '800' },
  emptyPastText: { fontSize: 12, textAlign: 'center', marginTop: 10 },

  // MODAL STYLES (RESTORED)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12,10,9,0.85)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  modalSheet: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  modalHandle: {
    width: 60,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  ticketCard: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 20,
  },
  ticketCutoutLeft: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    left: -12,
    top: '68%',
  },
  ticketCutoutRight: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    right: -12,
    top: '68%',
  },
  ticketUpper: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#15803d',
  },
  modalVenue: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#0f172a',
    textAlign: 'center',
  },
  modalLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    marginBottom: 20,
  },
  modalLocationText: {
    fontWeight: '600',
  },
  qrPreview: {
    width: 240,
    height: 240,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#f3f4f6',
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  qrFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  qrFallbackText: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  modalReference: {
    color: '#9ca3af',
    fontFamily: 'System',
    letterSpacing: 4,
    fontSize: 13,
  },
  ticketDivider: {
    width: '100%',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb',
  },
  ticketLower: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  ticketStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  ticketStatLabel: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  ticketStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  ticketTip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  ticketTipText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  modalCloseButton: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default UserBookedScreen;
