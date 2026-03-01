import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Modal,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Animated,
  TextInput,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { useStore } from '../store/useStore';
import { apiService } from '../services/api';
import { usePostHog } from 'posthog-react-native';
import CancelReservationModal, { CancelReservationData } from '../components/CancelReservationModal';
import { ReservationCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const { width } = Dimensions.get('window');

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

const STATUS_STYLES: Record<BookingCard['status'], { label: string; color: string }> = {
  confirmed: { label: 'Confirmé', color: '#22c55e' },
  pending: { label: 'En attente', color: '#f59e0b' },
  cancelled: { label: 'Annulé', color: '#ef4444' },
};

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'Confirmées', value: 'confirmed' },
  { label: 'En attente', value: 'pending' },
  { label: 'Annulées', value: 'cancelled' },
];

const UserBookedScreen = () => {
  const {
    colors,
    computedTheme: themeMode,
    reservations,
    fetchReservations,
    refreshReservations,
    cancelReservationApi,
    isLoading,
    error,
  } = useStore();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const posthog = usePostHog();
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  
  // QR Modal State
  const [activeQrBooking, setActiveQrBooking] = useState<BookingCard | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isQrLoading, setIsQrLoading] = useState(false);
  
  // Cancel Modal State
  const [cancelModalBooking, setCancelModalBooking] = useState<BookingCard | null>(null);
  
  // Other State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cancelingIds, setCancelingIds] = useState<Set<string>>(new Set());
  const [cancelError, setCancelError] = useState<string | null>(null);
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  useFocusEffect(
    useCallback(() => {
      refreshReservations();
    }, [refreshReservations]),
  );

  const hideBanner = useCallback(() => {
    Animated.timing(bannerAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setCancelError(null);
      }
    });
  }, [bannerAnim]);

  useEffect(() => {
    if (cancelError) {
      Animated.timing(bannerAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();

      if (bannerTimer.current) {
        clearTimeout(bannerTimer.current);
      }
      bannerTimer.current = setTimeout(() => {
        hideBanner();
      }, 3500);
    }

    return () => {
      if (bannerTimer.current) {
        clearTimeout(bannerTimer.current);
        bannerTimer.current = null;
      }
    };
  }, [bannerAnim, cancelError, hideBanner]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshReservations();
    setIsRefreshing(false);
  }, [refreshReservations]);

  const handleCancelReservation = useCallback(
    (booking: BookingCard) => {
      setCancelModalBooking(booking);
    },
    [],
  );

  const handleCloseCancelModal = useCallback(() => {
    setCancelModalBooking(null);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    if (!cancelModalBooking) return;
    
    const bookingId = cancelModalBooking.id;
    setCancelModalBooking(null);
    setCancelingIds((prev) => new Set(prev).add(bookingId));
    setCancelError(null);
    
    const success = await cancelReservationApi(bookingId);
    
    if (success) {
      posthog?.capture('reservation_cancelled', {
        reservation_id: bookingId,
        venue_name: cancelModalBooking.venue,
        match_title: cancelModalBooking.match,
      });
    }
    
    setCancelingIds((prev) => {
      const next = new Set(prev);
      next.delete(bookingId);
      return next;
    });
    
    if (!success) {
      const storeError = useStore.getState().error;
      setCancelError(`${storeError || "Impossible d'annuler la réservation"}. Merci de réessayer.`);
    }
  }, [cancelModalBooking, cancelReservationApi]);

  const handleOpenQrModal = useCallback(async (booking: BookingCard) => {
    setActiveQrBooking(booking);
    setQrCode(null);
    setQrError(null);

    posthog?.capture('qr_code_viewed', {
      reservation_id: booking.id,
      venue_name: booking.venue,
      match_title: booking.match,
    });

    if (!booking.id) {
      setQrError("Identifiant de réservation introuvable");
      return;
    }

    try {
      setIsQrLoading(true);
      const response = await apiService.getReservationById(booking.id);
      const qrImage = response.qrCode || response.reservation?.qr_code;

      if (qrImage && qrImage.startsWith('data:image')) {
        setQrCode(qrImage);
      } else {
        setQrError("QR code indisponible");
      }
    } catch (err) {
      setQrError("Impossible de récupérer le QR code");
    } finally {
      setIsQrLoading(false);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveQrBooking(null);
    setQrCode(null);
    setQrError(null);
    setIsQrLoading(false);
  }, []);

  const renderUpcomingCard = (booking: BookingCard) => {
    const statusConfig = STATUS_STYLES[booking.status];
    const isCancelled = booking.status === 'cancelled';
    const isConfirmed = booking.status === 'confirmed';
    const isCanceling = cancelingIds.has(booking.id);

    return (
      <View
        key={booking.id}
        style={[styles.upcomingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.upcomingCardContent}>
          <View style={styles.upcomingCardInfo}>
            {/* Status */}
            <View style={styles.upcomingStatusRow}>
              <View style={[styles.upcomingStatusDot, { backgroundColor: statusConfig.color }]} />
              <Text style={[styles.upcomingStatusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
            {/* Venue */}
            <Text style={[styles.upcomingVenueName, { color: colors.text }]}>{booking.venue}</Text>
            {/* Match */}
            <Text style={[styles.upcomingMatchText, { color: colors.primary }]}>{booking.match}</Text>
            {/* Date */}
            <View style={styles.upcomingDateRow}>
              <MaterialIcons name="calendar-today" size={14} color={colors.textMuted} />
              <Text style={[styles.upcomingDateText, { color: colors.textMuted }]}>{booking.dateFormatted}</Text>
            </View>
          </View>
          {/* Thumbnail */}
          <Image
            source={{ uri: booking.image }}
            style={[styles.upcomingThumbnail, isCancelled && { opacity: 0.5 }]}
          />
        </View>
        {/* Actions */}
        <View style={[styles.upcomingActionsRow, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={styles.upcomingCancelButton}
            onPress={() => handleCancelReservation(booking)}
            disabled={isCancelled || isCanceling}
          >
            {isCanceling ? (
              <ActivityIndicator size="small" color={colors.textMuted} />
            ) : (
              <Text style={[styles.upcomingCancelText, { color: colors.textMuted }]}>
                {isCancelled ? 'Annulée' : 'Annuler'}
              </Text>
            )}
          </TouchableOpacity>
          {isConfirmed ? (
            <TouchableOpacity
              style={[styles.upcomingTicketButton, { backgroundColor: 'rgba(244,123,37,0.1)' }]}
              onPress={() => handleOpenQrModal(booking)}
            >
              <MaterialIcons name="qr-code" size={14} color={colors.primary} />
              <Text style={[styles.upcomingTicketText, { color: colors.primary }]}>Ticket</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.upcomingModifyButton, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.upcomingModifyText, { color: colors.text }]}>Modifier</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  
  const bookings = useMemo<BookingCard[]>(
    () =>
      reservations.map((reservation) => {
        const date = reservation.date ? new Date(reservation.date) : new Date();
        const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
        return {
          id: reservation.id,
          status: reservation.status === 'confirmed' ? 'confirmed' : reservation.status === 'cancelled' ? 'cancelled' : 'pending',
          venue: reservation.venueName,
          match: reservation.matchTitle || 'Match',
          date: date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
          dateFormatted: `${weekDays[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} • ${reservation.time || date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
          people: `${reservation.numberOfPeople} pers.`,
          peopleCount: reservation.numberOfPeople,
          location: reservation.venueAddress || '',
          reference: reservation.id?.slice(0, 8).toUpperCase(),
          dateShort: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          time: reservation.time || date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          qrCode: reservation.qrCode,
          image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
          rawDate: date,
        };
      }),
    [reservations],
  );

  // Filter and search bookings
  const filteredBookings = useMemo(() => {
    let filtered = bookings;
    
    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === selectedFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.venue?.toLowerCase().includes(query) ||
          b.match?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [bookings, selectedFilter, searchQuery]);

  // Handle deep link or navigation with reservationId
  useEffect(() => {
    const reservationId = route.params?.reservationId;
    if (reservationId && bookings.length > 0) {
      const target = bookings.find(b => b.id === reservationId);
      if (target) {
        handleOpenQrModal(target);
        // Clear param to avoid re-triggering
        navigation.setParams({ reservationId: undefined });
      }
    }
  }, [route.params?.reservationId, bookings, handleOpenQrModal, navigation]);

  // Get the next upcoming reservation (confirmed or pending, future date)
  const nextReservation = useMemo(() => {
    const now = new Date();
    const upcoming = bookings
      .filter((b) => b.status !== 'cancelled' && b.rawDate >= now)
      .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
    return upcoming[0] || null;
  }, [bookings]);

  // Get other reservations (excluding the featured one if showing all)
  const otherReservations = useMemo(() => {
    if (selectedFilter !== 'all' || searchQuery.trim()) {
      return filteredBookings;
    }
    if (!nextReservation) return filteredBookings;
    return filteredBookings.filter((b) => b.id !== nextReservation.id);
  }, [filteredBookings, nextReservation, selectedFilter, searchQuery]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.headerBackButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>MES RÉSERVATIONS</Text>
        </View>
        
        {/* Search Bar */}
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
        
        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterTab,
                selectedFilter === filter.value
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
              ]}
              onPress={() => setSelectedFilter(filter.value)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: selectedFilter === filter.value ? colors.white : colors.textMuted }
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        {/* Error Banner */}
        {cancelError ? (
          <Animated.View
            style={[
              styles.inlineBanner,
              { backgroundColor: colors.surface, borderColor: colors.border },
              {
                opacity: bannerAnim,
                transform: [{ translateY: bannerAnim.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }],
              },
            ]}
          >
            <MaterialIcons name="error-outline" size={18} color="#f87171" />
            <Text style={[styles.inlineBannerText, { color: colors.text }]}>{cancelError}</Text>
            <TouchableOpacity onPress={hideBanner} style={styles.inlineBannerClose}>
              <MaterialIcons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </Animated.View>
        ) : null}

        {/* Loading State */}
        {isLoading && bookings.length === 0 ? (
          <View style={{ gap: 12 }}>
            <ReservationCardSkeleton />
            <ReservationCardSkeleton />
            <ReservationCardSkeleton />
          </View>
        ) : error && bookings.length === 0 ? (
          <View style={[styles.stateWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.stateText, { color: colors.text }]}>{error}</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={fetchReservations} activeOpacity={0.85}>
              <MaterialIcons name="refresh" size={18} color={colors.white} />
              <Text style={[styles.retryButtonText, { color: colors.white }]}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon="event-busy"
            title="Aucune réservation"
            description="Tu n'as pas encore de réservation. Trouve un bar et réserve ta place pour le prochain match !"
            actionLabel="Explorer les bars"
            onAction={() => navigation.navigate('Map' as never)}
          />
        ) : (
          <>
            {/* Featured Next Event - only show when filter is "all" and no search */}
            {nextReservation && selectedFilter === 'all' && !searchQuery.trim() && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Prochain Événement</Text>
                <View style={[styles.featuredCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {/* Featured Image */}
                  <View style={styles.featuredImageContainer}>
                    <ImageBackground
                      source={{ uri: nextReservation.image }}
                      style={styles.featuredImage}
                      imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                    >
                      <LinearGradient
                        colors={['transparent', 'rgba(28, 28, 33, 0.4)', 'rgba(28, 28, 33, 0.95)']}
                        style={styles.featuredGradient}
                      />
                      {/* Status Badge */}
                      <View style={[styles.featuredStatusBadge, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                        <View style={styles.statusDotWrapper}>
                          <View style={[styles.statusDotPing, { backgroundColor: STATUS_STYLES[nextReservation.status].color }]} />
                          <View style={[styles.statusDot, { backgroundColor: STATUS_STYLES[nextReservation.status].color }]} />
                        </View>
                        <Text style={[styles.featuredStatusText, { color: STATUS_STYLES[nextReservation.status].color }]}>
                          {STATUS_STYLES[nextReservation.status].label}
                        </Text>
                      </View>
                      {/* Venue Name & Match */}
                      <View style={styles.featuredContentOverlay}>
                        <Text style={styles.featuredVenueName}>{nextReservation.venue.toUpperCase()}</Text>
                        <View style={styles.featuredMatchRow}>
                          <MaterialIcons name="live-tv" size={16} color={colors.primary} />
                          <Text style={[styles.featuredMatchText, { color: colors.primary }]}>{nextReservation.match}</Text>
                        </View>
                      </View>
                    </ImageBackground>
                  </View>
                  
                  {/* Featured Details */}
                  <View style={styles.featuredDetails}>
                    <View style={[styles.featuredInfoRow, { borderBottomColor: colors.border }]}>
                      <View style={styles.featuredInfoItem}>
                        <MaterialIcons name="calendar-month" size={18} color={colors.primary} />
                        <Text style={[styles.featuredInfoText, { color: colors.text }]}>{nextReservation.dateFormatted}</Text>
                      </View>
                      <View style={styles.featuredInfoItem}>
                        <MaterialIcons name="group" size={18} color={colors.textMuted} />
                        <Text style={[styles.featuredInfoText, { color: colors.textMuted }]}>{nextReservation.people}</Text>
                      </View>
                    </View>
                    
                    {/* QR Code Button */}
                    <TouchableOpacity
                      style={styles.featuredQrButton}
                      onPress={() => handleOpenQrModal(nextReservation)}
                      activeOpacity={0.9}
                    >
                      <MaterialIcons name="qr-code-2" size={24} color="#000" />
                      <Text style={styles.featuredQrButtonText}>VOIR LE QR CODE</Text>
                    </TouchableOpacity>
                    
                    {/* Action Buttons */}
                    <View style={styles.featuredActionsRow}>
                      <TouchableOpacity
                        style={[styles.featuredCancelButton, { borderColor: colors.border }]}
                        onPress={() => handleCancelReservation(nextReservation)}
                        disabled={cancelingIds.has(nextReservation.id)}
                      >
                        {cancelingIds.has(nextReservation.id) ? (
                          <ActivityIndicator size="small" color={colors.textMuted} />
                        ) : (
                          <Text style={[styles.featuredCancelText, { color: colors.textMuted }]}>Annuler</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.featuredContactButton, { backgroundColor: colors.surfaceAlt }]}>
                        <MaterialIcons name="call" size={18} color={colors.text} />
                        <Text style={[styles.featuredContactText, { color: colors.text }]}>Contacter</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}
            
            {/* Upcoming Section */}
            {otherReservations.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitleSmall, { color: colors.textMuted }]}>À Venir</Text>
                {otherReservations.map((booking) => renderUpcomingCard(booking))}
              </View>
            )}
          </>
        )}

        {/* Find Another Bar Button */}
        <TouchableOpacity
          style={[styles.findButton, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
          onPress={() => navigation.navigate('Map' as never)}
        >
          <MaterialIcons name="add-circle" size={20} color={colors.primary} />
          <Text style={[styles.findButtonText, { color: colors.textMuted }]}>Trouver un autre bar</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={!!activeQrBooking} transparent animationType="fade" onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalLabel, { color: colors.text }]}>Votre Réservation</Text>
            {activeQrBooking && (
              <View style={[styles.ticketCard, { backgroundColor: themeMode === 'light' ? '#f8fafc' : '#27272a' }]}>
                <View style={[styles.ticketCutoutLeft, { backgroundColor: colors.surface }]} />
                <View style={[styles.ticketCutoutRight, { backgroundColor: colors.surface }]} />

                <View style={styles.ticketUpper}>
                  <View style={[styles.modalStatusBadge, { backgroundColor: 'rgba(74, 222, 128, 0.15)' }]}>
                    <MaterialIcons name="check-circle" size={16} color="#16a34a" />
                    <Text style={styles.modalStatusText}>{activeQrBooking.status === 'pending' ? 'En attente' : 'Confirmé'}</Text>
                  </View>
                  <Text style={[styles.modalVenue, { color: colors.text }]}>{activeQrBooking.venue.toUpperCase()}</Text>
                  <View style={styles.modalLocationRow}>
                    <MaterialIcons name="location-on" size={18} color={colors.subtext} />
                    <Text style={[styles.modalLocationText, { color: colors.subtext }]}>{activeQrBooking.location}</Text>
                  </View>
                  <View style={styles.qrPreview}>
                    {isQrLoading ? (
                      <ActivityIndicator color={COLORS.primary} style={{ flex: 1 }} />
                    ) : qrCode ? (
                      <Image source={{ uri: qrCode }} style={styles.qrImage} resizeMode="contain" />
                    ) : (
                      <View style={styles.qrFallback}>
                        <MaterialIcons name="qr-code" size={64} color={COLORS.subtext} />
                        <Text style={styles.qrFallbackText}>{qrError ?? 'QR code indisponible'}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.modalReference}>REF: {activeQrBooking.reference}</Text>
                </View>

                <View style={styles.ticketDivider} />

                <View style={[styles.ticketLower, { backgroundColor: themeMode === 'light' ? '#f1f5f9' : '#18181b' }]}>
                  <View style={styles.ticketStat}>
                    <Text style={[styles.ticketStatLabel, { color: colors.subtext }]}>Date</Text>
                    <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
                    <Text style={[styles.ticketStatValue, { color: colors.text }]}>{activeQrBooking.dateShort}</Text>
                  </View>
                  <View style={styles.ticketStat}>
                    <Text style={[styles.ticketStatLabel, { color: colors.subtext }]}>Heure</Text>
                    <MaterialIcons name="schedule" size={20} color={colors.primary} />
                    <Text style={[styles.ticketStatValue, { color: colors.text }]}>{activeQrBooking.time}</Text>
                  </View>
                  <View style={styles.ticketStat}>
                    <Text style={[styles.ticketStatLabel, { color: colors.subtext }]}>Personnes</Text>
                    <MaterialIcons name="group" size={20} color={colors.primary} />
                    <Text style={[styles.ticketStatValue, { color: colors.text }]}>{activeQrBooking.peopleCount}</Text>
                  </View>
                </View>

                <View style={[styles.ticketTip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <MaterialIcons name="brightness-high" size={18} color={colors.primary} />
                  <Text style={[styles.ticketTipText, { color: colors.subtext }]}>Luminosité max recommandée</Text>
                </View>
              </View>
            )}

            <Pressable style={[styles.modalCloseButton, { backgroundColor: colors.primary }]} onPress={handleCloseModal}>
              <Text style={[styles.modalCloseText, { color: colors.white }]}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <CancelReservationModal
        visible={!!cancelModalBooking}
        reservation={cancelModalBooking ? {
          id: cancelModalBooking.id,
          match: cancelModalBooking.match,
          venue: cancelModalBooking.venue,
          time: cancelModalBooking.time,
          image: cancelModalBooking.image,
        } : null}
        onClose={handleCloseCancelModal}
        onConfirmCancel={handleConfirmCancel}
        primaryColor={colors.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Header
  header: {
    borderBottomColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    paddingRight: 32,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Filters
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
    paddingHorizontal: 4,
    opacity: 0.9,
  },
  sectionTitleSmall: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  
  // Featured Card
  featuredCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  featuredImageContainer: {
    height: 180,
    width: '100%',
  },
  featuredImage: {
    flex: 1,
    justifyContent: 'space-between',
  },
  featuredGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  featuredStatusBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusDotWrapper: {
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDotPing: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  featuredStatusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featuredContentOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  featuredVenueName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    lineHeight: 34,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  featuredMatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  featuredMatchText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featuredDetails: {
    padding: 16,
    gap: 14,
  },
  featuredInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  featuredInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredInfoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  featuredQrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  featuredQrButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
  },
  featuredActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  featuredCancelButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredCancelText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredContactButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  featuredContactText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Upcoming Cards
  upcomingCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  upcomingCardContent: {
    flexDirection: 'row',
    gap: 16,
  },
  upcomingCardInfo: {
    flex: 1,
    gap: 4,
  },
  upcomingStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  upcomingStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  upcomingStatusText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  upcomingVenueName: {
    fontSize: 16,
    fontWeight: '700',
  },
  upcomingMatchText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  upcomingDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  upcomingDateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  upcomingThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    opacity: 0.8,
  },
  upcomingActionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
  upcomingCancelButton: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingCancelText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  upcomingTicketButton: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  upcomingTicketText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  upcomingModifyButton: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingModifyText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 16,
  },
  cardImageWrapper: {
    position: 'relative',
  },
  cardDetails: {
    flex: 1,
    gap: 6,
  },
  cardImage: {
    width: 96,
    height: 96,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardImagePending: {
    opacity: 0.9,
  },
  cancelledBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(248, 113, 113, 0.92)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelledBadgeText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  confirmedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(74, 222, 128, 0.92)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  confirmedBadgeText: {
    color: '#052e16',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDotOuter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  venueName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  matchText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  metaRow: {
    marginTop: 12,
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    color: COLORS.subtext,
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.divider,
    marginVertical: 14,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonDisabled: {
    opacity: 0.6,
  },
  cancelText: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '700',
  },
  contactButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  contactButtonDisabled: {
    opacity: 0.6,
  },
  contactText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  qrButton: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  qrButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  findButton: {
    marginTop: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  findButtonText: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
  },
  inlineBanner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inlineBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  inlineBannerClose: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateWrapper: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
  },
  stateText: {
    color: COLORS.text,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12,10,9,0.85)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
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
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  ticketCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 20,
  },
  ticketCutoutLeft: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    left: -12,
    top: '68%',
  },
  ticketCutoutRight: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
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
    color: '#6b7280',
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
    color: COLORS.subtext,
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
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  ticketTipText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  modalCloseButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default UserBookedScreen;
