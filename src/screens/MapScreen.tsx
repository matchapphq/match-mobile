import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, SafeAreaView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../constants/theme';
import { useStore } from '../store/useStore';
import { mockData } from '../services/api';
import FloatingNavBar from '../components/FloatingNavBar';

const MapScreen = () => {
  const navigation = useNavigation<any>();
  const { venues, setVenues, filteredVenues, applyFilters, filters } = useStore();
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedFilters, setSelectedFilters] = useState(filters);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    loadVenues();
    getUserLocation();
  }, []);

  const loadVenues = () => {
    // Load mock venues for now
    setVenues(mockData.venues);
  };

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  const toggleFilter = (category: string, value: string) => {
    setSelectedFilters(prev => {
      const updated = { ...prev };
      const categoryArray = updated[category as keyof typeof updated] as string[];
      
      if (categoryArray.includes(value)) {
        updated[category as keyof typeof updated] = categoryArray.filter(v => v !== value) as any;
      } else {
        updated[category as keyof typeof updated] = [...categoryArray, value] as any;
      }
      
      return updated;
    });
  };

  const applyFilterChanges = () => {
    applyFilters(selectedFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const cleared = {
      sports: [],
      ambiance: [],
      foodTypes: [],
      priceRange: [],
    };
    setSelectedFilters(cleared);
    applyFilters(cleared);
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtres</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filtersList}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>• Lieux</Text>
              <View style={styles.filterOptions}>
                {['Bar', 'Fast-Food', 'Chicha'].map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.filterChip,
                      selectedFilters.foodTypes.includes(option) && styles.filterChipSelected
                    ]}
                    onPress={() => toggleFilter('foodTypes', option)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedFilters.foodTypes.includes(option) && styles.filterChipTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>• Prix</Text>
              <View style={styles.filterOptions}>
                {['-5€', '5-10€', '10-20€', '+20€'].map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.filterChip,
                      selectedFilters.priceRange.includes(option) && styles.filterChipSelected
                    ]}
                    onPress={() => toggleFilter('priceRange', option)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedFilters.priceRange.includes(option) && styles.filterChipTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>• Sports</Text>
              <View style={styles.filterOptions}>
                {['Foot', 'Basket', 'Rugby', 'Tennis'].map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.filterChip,
                      selectedFilters.sports.includes(option) && styles.filterChipSelected
                    ]}
                    onPress={() => toggleFilter('sports', option)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedFilters.sports.includes(option) && styles.filterChipTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>• Ambiance</Text>
              <View style={styles.filterOptions}>
                {['Conviviale', 'Ultra', 'Posée'].map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.filterChip,
                      selectedFilters.ambiance.includes(option) && styles.filterChipSelected
                    ]}
                    onPress={() => toggleFilter('ambiance', option)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedFilters.ambiance.includes(option) && styles.filterChipTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>• Food & Drinks</Text>
              <View style={styles.filterOptions}>
                {['Bière', 'Tacos', 'Pizza', 'Grec'].map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.filterChip,
                      selectedFilters.foodTypes.includes(option) && styles.filterChipSelected
                    ]}
                    onPress={() => toggleFilter('foodTypes', option)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedFilters.foodTypes.includes(option) && styles.filterChipTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.validateButton}
            onPress={applyFilterChanges}
          >
            <Text style={styles.validateButtonText}>VALIDER</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.closeModalButton}
          onPress={() => setShowFilters(false)}
        >
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: userLocation?.latitude || 48.8566,
          longitude: userLocation?.longitude || 2.3522,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {filteredVenues.map(venue => (
          <Marker
            key={venue.id}
            coordinate={{
              latitude: venue.latitude,
              longitude: venue.longitude,
            }}
            onPress={() => navigation.navigate('VenueDetails', { venue })}
          >
            <View style={styles.markerContainer}>
              <View style={styles.marker}>
                <Text style={styles.markerText}>📍</Text>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      <SafeAreaView style={styles.headerOverlay}>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.profileIcon}>
            <Text style={styles.profileEmoji}>👤</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>AUTOUR DE MOI</Text>
        </View>
      </SafeAreaView>

      <FloatingNavBar
        onListPress={() => navigation.navigate('Matches')}
        onSearchPress={() => navigation.navigate('Search')}
        onFilterPress={() => setShowFilters(true)}
      />

      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 48,
  },
  headerTitle: {
    color: theme.colors.primary,
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    fontStyle: 'italic',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  profileButton: {
    position: 'absolute',
    right: theme.spacing.lg,
    zIndex: 10,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.secondary,
  },
  profileEmoji: {
    fontSize: 24,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    backgroundColor: theme.colors.secondary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerText: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  modalTitle: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  filtersList: {
    padding: theme.spacing.lg,
  },
  filterSection: {
    marginBottom: theme.spacing.lg,
  },
  filterSectionTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  filterChip: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  filterChipSelected: {
    backgroundColor: theme.colors.text,
  },
  filterChipText: {
    color: theme.colors.text,
    fontSize: theme.fonts.sizes.sm,
  },
  filterChipTextSelected: {
    color: theme.colors.primary,
  },
  validateButton: {
    backgroundColor: theme.colors.secondary,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  validateButtonText: {
    color: theme.colors.background,
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
  },
  closeModalButton: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
});

export default MapScreen;
