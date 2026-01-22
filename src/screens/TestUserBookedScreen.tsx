import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useStore } from '../store/useStore';
import { testApi, Booking } from '../services/testApi';
import { apiService } from '../services/api';

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Confirmé', color: '#4ade80' },
  pending: { label: 'En attente', color: '#fbbf24' },
};

const TestUserBookedScreen = () => {
  const { colors, themeMode } = useStore();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeQrBooking, setActiveQrBooking] = useState<Booking | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isQrLoading, setIsQrLoading] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await testApi.fetchBookings();
      setBookings(data);
    } catch (err) {
      console.warn('Failed to load bookings', err);
      setError("Impossible de charger vos réservations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleOpenQrModal = useCallback(async (booking: Booking) => {
    setActiveQrBooking(booking);
    setQrCode(null);
    setQrError(null);

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

  const renderStatus = (status: string) => {
    const statusConfig = STATUS_STYLES[status] ?? STATUS_STYLES.confirmed;
    return (
      <View style={styles.statusRow}>
        <View style={[styles.statusDotOuter, { backgroundColor: `${statusConfig.color}33` }]}>
          <View style={[styles.statusDotInner, { backgroundColor: statusConfig.color }]} />
        </View>
        <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label.toUpperCase()}</Text>
      </View>
    );
  };

  const renderBookingCard = (booking: Booking) => {
    const statusConfig = STATUS_STYLES[booking.status] ?? STATUS_STYLES.confirmed;

    return (
      <View key={booking.id} style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.cardDetails}>
            {renderStatus(booking.status)}
            <View style={{ marginTop: 4 }}>
              <Text style={styles.venueName}>{booking.venue}</Text>
              <Text style={styles.matchText}>{booking.match}</Text>
            </View>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MaterialIcons name="calendar-today" size={18} color={colors.subtext} />
                <Text style={[styles.metaText, { color: colors.subtext }]}>{booking.date}</Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialIcons name="group" size={18} color={colors.subtext} />
                <Text style={[styles.metaText, { color: colors.subtext }]}>{booking.people}</Text>
              </View>
            </View>
          </View>
          <Image source={{ uri: booking.image }} style={[styles.cardImage, booking.status === 'pending' && styles.cardImagePending]} />
        </View>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.qrButton} onPress={() => handleOpenQrModal(booking)}>
          <MaterialIcons name="qr-code" size={20} color={COLORS.text} />
          <Text style={styles.qrButtonText}>Voir le QR Code</Text>
        </TouchableOpacity>
        <View style={styles.cardActionsRow}>
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactButton, { backgroundColor: statusConfig.color === STATUS_STYLES.pending?.color ? COLORS.primary : COLORS.primary }]}>
            <MaterialIcons name="call" size={18} color={COLORS.text} />
            <Text style={styles.contactText}>Contacter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'} />
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.surfaceAlt }]} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>MES RÉSERVATIONS</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={[styles.stateWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.stateText, { color: colors.text }]}>Chargement de vos réservations...</Text>
          </View>
        ) : error ? (
          <View style={[styles.stateWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.stateText, { color: colors.text }]}>{error}</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={loadBookings} activeOpacity={0.85}>
              <MaterialIcons name="refresh" size={18} color={colors.white} />
              <Text style={[styles.retryButtonText, { color: colors.white }]}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : bookings.length === 0 ? (
          <View style={[styles.stateWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialIcons name="event-busy" size={36} color={colors.textSecondary} />
            <Text style={[styles.stateText, { color: colors.text }]}>Vous n'avez aucune réservation pour le moment.</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('TestMapScreen' as never)} activeOpacity={0.85}>
              <MaterialIcons name="search" size={18} color={colors.white} />
              <Text style={[styles.retryButtonText, { color: colors.white }]}>Explorer les bars</Text>
            </TouchableOpacity>
          </View>
        ) : (
          bookings.map(renderBookingCard)
        )}

        <TouchableOpacity style={[styles.findButton, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]} onPress={() => navigation.navigate('TestMapScreen' as never)}>
          <MaterialIcons name="add-circle" size={20} color={colors.primary} />
          <Text style={[styles.findButtonText, { color: colors.text }]}>Trouver un autre bar</Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
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
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    marginHorizontal: 12,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
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
  contactText: {
    color: COLORS.text,
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
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  findButtonText: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: '#221710',
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
    backgroundColor: '#221710',
    left: -12,
    top: '68%',
  },
  ticketCutoutRight: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#221710',
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
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default TestUserBookedScreen;
