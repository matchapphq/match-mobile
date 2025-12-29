import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useStore } from '../store/useStore';
import { mockData } from '../services/api';
import { Match } from '../types';

const MatchesScreen = () => {
  const navigation = useNavigation<any>();
  const { matches, setMatches, matchFilters, applyMatchSorting } = useStore();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = () => {
    // Load mock matches for now
    setMatches(mockData.matches);
    // Apply initial sorting based on default matchFilters
    applyMatchSorting(matchFilters.sortBy, matchFilters.sortDirection);
  };

  const renderMatchCard = (match: Match) => (
    <TouchableOpacity
      key={match.id}
      style={styles.matchCard}
      onPress={() => navigation.navigate('MatchDetails', { match })}
    >
      <Image
        source={{ uri: match.thumbnail || 'https://via.placeholder.com/400x200' }}
        style={styles.matchThumbnail}
      />
      <View style={styles.matchOverlay}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchTeams}>{match.homeTeam} / {match.awayTeam}</Text>
          <TouchableOpacity style={styles.sportBadge}>
            <Text style={styles.sportBadgeText}>{match.sport === 'Football' ? '⚽' : '🏀'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.matchDateTime}>
          {match.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} - {match.time}
        </Text>
      </View>
      <TouchableOpacity style={styles.watchButton}>
        <Text style={styles.watchButtonText}>Voir le match</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="globe-outline" size={28} color={theme.colors.secondary} />
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  filterChipActive: {
    backgroundColor: theme.colors.secondary,
  },
  filterChipText: {
    color: theme.colors.text,
    fontSize: theme.fonts.sizes.sm,
  },
  filterChipTextActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  matchesList: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  matchCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  matchThumbnail: {
    width: '100%',
    height: 180,
  },
  matchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  matchTeams: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  sportBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportBadgeText: {
    fontSize: 18,
  },
  matchDateTime: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  watchButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  watchButtonText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.background,
  },
});

export default MatchesScreen;
