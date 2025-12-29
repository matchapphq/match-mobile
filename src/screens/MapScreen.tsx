import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
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
  const [isMapMoving, setIsMapMoving] = useState(false);
  const buttonOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(buttonOpacity, {
      toValue: isMapMoving ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isMapMoving]);

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

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

  const handleSortSelection = (sortOption: 'distance' | 'rating' | null, sortDirection: 'asc' | 'desc') => {
    setSelectedFilters(prev => ({
      ...prev,
      sortOption,
      sortDirection,
    }));
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
      sortOption: null,
      sortDirection: 'asc',
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
              <Text style={styles.filterSectionTitle}>• Trier par</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedFilters.sortOption === 'distance' && styles.filterChipSelected
                  ]}
                  onPress={() => handleSortSelection('distance', 'asc')}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedFilters.sortOption === 'distance' && styles.filterChipTextSelected
                  ]}>
                    Distance
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedFilters.sortOption === 'rating' && styles.filterChipSelected
                  ]}
                  onPress={() => handleSortSelection('rating', 'desc')}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedFilters.sortOption === 'rating' && styles.filterChipTextSelected
                  ]}>
                    Note
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

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
              style={styles.map}        initialRegion={{
          latitude: userLocation?.latitude || 48.8566,
          longitude: userLocation?.longitude || 2.3522,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onRegionChange={() => setIsMapMoving(true)}
        onRegionChangeComplete={() => setIsMapMoving(false)}
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
        {/* Empty view for spacing, to balance the profile button */}
        <View style={{ width: 48, height: 48 }} />
        <Animated.View style={{ opacity: buttonOpacity }}>
          <TouchableOpacity onPress={centerOnUser}>
            <Text style={styles.headerTitle}>AUTOUR DE MOI</Text>
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileEmoji}>👤</Text>
          </View>
        </TouchableOpacity>
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
    backgroundColor: theme.colors.background,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileEmoji: {
    fontSize: 20,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    backgroundColor: theme.colors.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
  },
  filtersList: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  validateButton: {
    margin: 20,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  validateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.fonts.bold,
  },
  closeModalButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
  },
});

export default MapScreen;
