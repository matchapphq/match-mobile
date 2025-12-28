import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useStore } from '../store/useStore';

const ReservationsScreen = () => {
  const navigation = useNavigation<any>();
  const { reservations } = useStore();

  const mockReservations = [
    {
      id: '1',
      venueName: 'The Kop Bar',
      date: "Aujourd'hui",
      details: '• Heure du match / table\n• Nombre de personnes\n• Conditions\n  (arriver avant X min, annulation, etc.)',
      status: 'confirmed' as const,
    },
    {
      id: '2',
      venueName: 'La fumée',
      date: '07/12/2025',
      details: '• Heure du match / table\n• Nombre de personnes\n• Conditions\n  (arriver avant X min, annulation, etc.)',
      status: 'pending' as const,
    },
  ];

  const handleCancelReservation = (id: string) => {
    // Handle cancellation
  };

  const handleContactVenue = (venueName: string) => {
    // Handle contact venue
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="globe-outline" size={28} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Mes réservations</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.profileIcon}>
            <Text>👤</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
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
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
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
  cancelButton: {
    backgroundColor: theme.colors.warning,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontSize: theme.fonts.sizes.sm,
    fontWeight: 'bold',
  },
  contactButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  contactButtonText: {
    color: theme.colors.background,
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
});

export default ReservationsScreen;
