import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { Venue } from '../types';

const VenueDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const venue: Venue = route.params?.venue;
  const [isFavorite, setIsFavorite] = useState(false);

  const handleReservation = () => {
    navigation.navigate('Reservations', { venue });
  };

  const handleViewReviews = () => {
    // Navigate to reviews or open modal
  };

  const handleViewMatches = () => {
    navigation.navigate('MatchDetails', { venue });
  };

  const openInMaps = () => {
    const url = `https://maps.google.com/?q=${venue.latitude},${venue.longitude}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.profileIcon}>
            <Text>👤</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{venue.name}</Text>
        <Text style={styles.distance}>{venue.distance} km</Text>
        <Text style={styles.address}>{venue.address}</Text>

        {venue.images && venue.images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
            {venue.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.venueImage} />
            ))}
          </ScrollView>
        )}

        <View style={styles.tagsContainer}>
          {venue.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          <View style={styles.ratingTag}>
            <Text style={styles.tagText}>⭐ {venue.rating}</Text>
          </View>
        </View>

        <View style={styles.peopleIndicator}>
          <Ionicons name="people" size={20} color={theme.colors.text} />
          <Ionicons name="people" size={20} color={theme.colors.text} />
          <Ionicons name="people" size={20} color={theme.colors.text} />
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={openInMaps}>
            <MaterialCommunityIcons name="map-marker" size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleViewReviews}>
            <MaterialCommunityIcons name="message-text" size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#FF0000" : theme.colors.secondary} 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleReservation}>
          <Text style={styles.primaryButtonText}>Voir le lieu</Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>• Recommandations Match</Text>
          <Text style={styles.infoText}>Dans ton budget habituel</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>• Matchs diffusés ici</Text>
          <View style={styles.matchesList}>
            <Text style={styles.matchText}>PSG / OM - 21h</Text>
            <Text style={styles.matchText}>Real Madrid / Barca - 16h</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>• Informations Pratiques</Text>
          <Text style={styles.infoText}>Horaires : {venue.hours || '11h / 01h'}</Text>
          <Text style={styles.infoText}>Métro à proximité 🚇</Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewReviews}>
            <Text style={styles.secondaryButtonText}>Voir les avis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewMatches}>
            <Text style={styles.secondaryButtonText}>Voir les matchs</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.reserveButton} onPress={handleReservation}>
          <Text style={styles.reserveButtonText}>Réserver</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    paddingTop: 50,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: theme.colors.text,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  distance: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.fonts.sizes.sm,
    fontWeight: 'bold',
  },
  address: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  imagesContainer: {
    marginVertical: theme.spacing.md,
  },
  venueImage: {
    width: 280,
    height: 150,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  tag: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  ratingTag: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  tagText: {
    color: theme.colors.text,
    fontSize: theme.fonts.sizes.sm,
    fontWeight: '600',
  },
  peopleIndicator: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  primaryButtonText: {
    color: theme.colors.text,
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
  },
  infoSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  matchesList: {
    gap: theme.spacing.xs,
  },
  matchText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: theme.fonts.sizes.sm,
    fontWeight: '600',
  },
  reserveButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: theme.colors.background,
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
  },
});

export default VenueDetailsScreen;
