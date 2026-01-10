import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, images } from '../constants/theme';
import { useStore } from '../store/useStore';
import { Match } from '../types';

const { width } = Dimensions.get('window');

const MatchesScreen = () => {
  const navigation = useNavigation<any>();
  const { matches, setMatches, matchFilters, applyMatchSorting } = useStore();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    const { fetchUpcomingMatches } = useStore.getState();
    await fetchUpcomingMatches();
    applyMatchSorting(matchFilters.sortBy, matchFilters.sortDirection);
  };

  const getSportIcon = (sport: string) => {
    switch (sport?.toLowerCase()) {
      case 'football': return '⚽';
      case 'basketball': return '🏀';
      case 'rugby': return '🏉';
      case 'tennis': return '🎾';
      default: return '⚽';
    }
  };

  const renderMatchCard = (match: Match) => (
    <View key={match.id} style={styles.matchCard}>
      <ImageBackground
        source={{ uri: match.thumbnail || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800' }}
        style={styles.matchThumbnail}
        imageStyle={styles.matchThumbnailImage}
      >
        <LinearGradient
          colors={['transparent', 'rgba(123, 47, 254, 0.95)']}
          style={styles.matchGradient}
        >
          <View style={styles.matchContent}>
            <View style={styles.matchInfo}>
              <Text style={styles.matchTeams}>{match.homeTeam} / {match.awayTeam}</Text>
              <Text style={styles.matchDateTime}>
                {match.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} - {match.time}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.watchButton}
              onPress={() => navigation.navigate('MatchDetails', { match: { ...match, date: match.date.toISOString() } })}
            >
              <Text style={styles.watchButtonText}>Voir le match</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
      <View style={styles.sportBadge}>
        <Text style={styles.sportBadgeText}>{getSportIcon(match.sport)}</Text>
      </View>
    </View>
  );

  return (
    <ImageBackground source={images.background} style={styles.backgroundContainer} resizeMode="cover">
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.globeButton}>
          <Ionicons name="globe-outline" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Prochains Matchs</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.profileIcon}>
            <Text>👤</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, matchFilters.sortBy === 'sport' && styles.filterChipActive]}
          onPress={() => applyMatchSorting('sport', 'asc')} // Assuming alphabetical for sports
        >
          <Text style={[styles.filterChipText, matchFilters.sortBy === 'sport' && styles.filterChipTextActive]}>
            Sports
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, matchFilters.sortBy === 'date' && styles.filterChipActive]}
          onPress={() => applyMatchSorting('date', 'asc')} // Assuming ascending date for now
        >
          <Text style={[styles.filterChipText, matchFilters.sortBy === 'date' && styles.filterChipTextActive]}>
            Date
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, matchFilters.sortBy === 'proximity' && styles.filterChipActive]}
          onPress={() => applyMatchSorting('proximity', 'asc')} // Proximity sorting will be a placeholder for now
        >
          <Text style={[styles.filterChipText, matchFilters.sortBy === 'proximity' && styles.filterChipTextActive]}>
            À proximité
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.matchesList} showsVerticalScrollIndicator={false}>
        {matches.map(renderMatchCard)}
      </ScrollView>
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
    color: theme.colors.textDark,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    justifyContent: 'center',
  },
  filterChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.full,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    color: theme.colors.primary,
    fontSize: theme.fonts.sizes.sm,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: theme.colors.text,
  },
  matchesList: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  matchCard: {
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  matchThumbnail: {
    width: '100%',
    height: 200,
  },
  matchThumbnailImage: {
    borderRadius: theme.borderRadius.lg,
  },
  matchGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  matchContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: theme.spacing.md,
  },
  matchInfo: {
    flex: 1,
  },
  matchTeams: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  sportBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  sportBadgeText: {
    fontSize: 18,
  },
  matchDateTime: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.text,
    opacity: 0.9,
  },
  watchButton: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  watchButtonText: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: theme.colors.primary,
  },
});

export default MatchesScreen;
