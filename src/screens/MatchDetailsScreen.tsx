import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { Match } from '../types';
import { mockData } from '../services/api';

const MatchDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const match: Match = route.params?.match;
  const [following, setFollowing] = useState(false);

  const recommendedVenues = mockData.venues.slice(0, 3);

  const handleVenuePress = (venue: any) => {
    navigation.navigate('VenueDetails', { venue });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="globe-outline" size={28} color={theme.colors.secondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.profileIcon}>
            <Text>👤</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>L'affiche</Text>

          <View style={styles.matchCard}>
            <Image
              source={{ uri: match.thumbnail || 'https://via.placeholder.com/400x200' }}
              style={styles.matchThumbnail}
            />
            <View style={styles.matchOverlay}>
              <Text style={styles.matchTeams}>{match.homeTeam} / {match.awayTeam}</Text>
            </View>

            <View style={styles.matchInfo}>
              <Text style={styles.matchDate}>
                {match.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} - {match.time}
              </Text>
              <Text style={styles.matchSubtitle}>Lieux qui diffusent ce match</Text>
            </View>

            {recommendedVenues.map(venue => (
              <TouchableOpacity
                key={venue.id}
                style={styles.venueCard}
                onPress={() => handleVenuePress(venue)}
              >
                <View style={styles.venueHeader}>
                  <Text style={styles.venueName}>{venue.name} - {venue.distance} km</Text>
                  <TouchableOpacity style={styles.viewButton}>
                    <Ionicons name="eye" size={20} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.venueTags}>
                  {venue.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.moreButton}>
              <Text style={styles.moreButtonText}>Voir plus</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.followButton}
              onPress={() => setFollowing(!following)}
            >
              <Text style={styles.followButtonText}>
                {following ? 'Ne plus suivre' : 'Suivre le match'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={24} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 50,
    paddingBottom: theme.spacing.md,
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
  },
  card: {
    marginHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  matchCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    padding: theme.spacing.lg,
  },
  matchThumbnail: {
    width: '100%',
    height: 180,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  matchOverlay: {
    position: 'absolute',
    top: theme.spacing.lg,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  matchTeams: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  matchInfo: {
    marginBottom: theme.spacing.lg,
  },
  matchDate: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  matchSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.primary,
  },
  venueCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  venueName: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  viewButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  tag: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  tagText: {
    color: theme.colors.secondary,
    fontSize: theme.fonts.sizes.xs,
    fontWeight: '600',
  },
  moreButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  moreButtonText: {
    color: theme.colors.text,
    fontSize: theme.fonts.sizes.sm,
    fontWeight: 'bold',
  },
  followButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  followButtonText: {
    color: theme.colors.background,
    fontSize: theme.fonts.sizes.md,
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

export default MatchDetailsScreen;
