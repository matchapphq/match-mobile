import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme, images } from '../constants/theme';
import { useStore } from '../store/useStore';
import { mockReservations } from '../lib/mockData';

const ReservationsScreen = () => {
  const navigation = useNavigation<any>();
  const { reservations } = useStore();
  const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null);

  const handleCancelReservation = (id: string) => {
    // Handle cancellation
  };

  const handleContactVenue = (venueName: string) => {
    // Handle contact venue
  };

  return (
    <ImageBackground source={images.background} style={styles.backgroundContainer} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.globeButton}>
            <Ionicons name="globe-outline" size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Mes réservations</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={styles.profileIcon}>
              <Text style={styles.profileEmoji}>👤</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📋</Text>
            </View>

            <Text style={styles.cardTitle}>Vous avez {mockReservations.length} réservations</Text>

            {mockReservations.map(reservation => (
              <View key={reservation.id} style={styles.reservationCard}>
                <View style={styles.reservationHeader}>
                  <Text style={styles.venueName}>
                    {reservation.venueName} - {reservation.date}
                  </Text>
                </View>

                <Text style={styles.reservationDetails}>{reservation.details}</Text>

                <View style={styles.buttonGroup}>
                  {reservation.status === 'confirmed' && reservation.qrCode && (
                    <TouchableOpacity
                      style={styles.qrButton}
                      onPress={() => setSelectedQrCode(reservation.qrCode)}
                    >
                      <Ionicons name="qr-code-outline" size={20} color={theme.colors.background} style={{ marginRight: 8 }} />
                      <Text style={styles.qrButtonText}>Voir le QR Code</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelReservation(reservation.id)}
                  >
                    <Text style={styles.cancelButtonText}>Annuler la réservation</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => handleContactVenue(reservation.venueName)}
                  >
                    <Text style={styles.contactButtonText}>Contacter le bar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <Modal
          visible={!!selectedQrCode}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedQrCode(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Votre QR Code</Text>
              <Text style={styles.modalSubtitle}>Présentez ce code à l'entrée</Text>

              <View style={styles.qrContainer}>
                {selectedQrCode && (
                  <Image // Use Image component for base64 QR code
                    source={{ uri: selectedQrCode }} // Ensure base64 string is valid data URI
                    style={{ width: 250, height: 250 }}
                    resizeMode="contain"
                  />
                  /* Alternatively, if you were using a library like react-native-qrcode-svg:
                   <QRCode value={selectedQrCode} size={250} /> 
                   But keeping it simple with Image as requested since backend sends an image.
                   NOTE: The placeholder string above is truncated. In a real scenario, use a valid base64 string.
                   For this demo, I will use a simple placeholder view if the image fails, 
                   but let's assume the string is a valid data URI or URL.
                  */
                  // For the purpose of this demo, since I provided a truncated base64, 
                  // I'll render a placeholder View instead of Image effectively to avoid empty image breakdown visually if the base64 is bad.
                  // Ideally this should be:
                  // <Image source={{ uri: selectedQrCode }} style={{ width: 200, height: 200 }} />
                )}
                {/* Visual Placeholder for the mock since I can't put a huge base64 string in code easily without clutter */}
                <Ionicons name="qr-code" size={200} color={theme.colors.textDark} />
              </View>

              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setSelectedQrCode(null)}
              >
                <Text style={styles.closeModalButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
    paddingBottom: 40,
  },
  cardIcon: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardIconText: {
    fontSize: 48,
  },
  cardTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  reservationCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  reservationHeader: {
    marginBottom: theme.spacing.sm,
  },
  venueName: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  reservationDetails: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  buttonGroup: {
    gap: theme.spacing.sm,
  },
  qrButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  qrButtonText: {
    color: theme.colors.background,
    fontSize: theme.fonts.sizes.sm,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: theme.colors.warning,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontSize: theme.fonts.sizes.sm,
    fontWeight: 'bold',
  },
  contactButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  contactButtonText: {
    color: theme.colors.text,
    fontSize: theme.fonts.sizes.sm,
    fontWeight: 'bold',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  modalSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  qrContainer: {
    width: 260,
    height: 260,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  closeModalButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    minWidth: 150,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: theme.colors.text,
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
  },
});

export default ReservationsScreen;
