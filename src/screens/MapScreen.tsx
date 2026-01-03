import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated, Image, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../constants/theme';
import { useStore } from '../store/useStore';
import FloatingNavBar from '../components/FloatingNavBar';

const { width } = Dimensions.get('window');

const MapScreen = () => {
  const navigation = useNavigation<any>();
  const { venues, setVenues, filteredVenues, applyFilters, filters } = useStore();
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedFilters, setSelectedFilters] = useState(filters);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  
  const searchHistory = ['Bars avec terrasse', 'Happy hour', 'NBA ce soir', 'Match du moment'];
  const trendingSearches = ['PSG vs OM', 'Roland Garros', 'Final ATP', 'Premier League'];
  const mapRef = useRef<MapView>(null);
  const [isMapMoving, setIsMapMoving] = useState(false);
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const cardSlideAnim = useRef(new Animated.Value(300)).current;

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

  const loadVenues = async () => {
    const { fetchVenues, fetchNearbyVenues } = useStore.getState();
    if (userLocation) {
      await fetchNearbyVenues(userLocation.latitude, userLocation.longitude);
    } else {
      await fetchVenues();
    }
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

  const handleVenueSelect = (venue: any) => {
    setSelectedVenue(venue);
    Animated.spring(cardSlideAnim, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const closeVenueCard = () => {
    Animated.timing(cardSlideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelectedVenue(null));
  };

  const renderVenueCard = () => {
    if (!selectedVenue) return null;

    return (
      <Modal
        visible={!!selectedVenue}
        transparent={true}
        animationType="none"
        onRequestClose={closeVenueCard}
      >
        <TouchableOpacity
          style={styles.venueCardOverlay}
          activeOpacity={1}
          onPress={closeVenueCard}
        >
          <Animated.View
            style={[
              styles.venueCard,
              { transform: [{ translateY: cardSlideAnim }] }
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.venueCardHeader}>
                <View>
                  <Text style={styles.venueCardName}>{selectedVenue.name}</Text>
                  <Text style={styles.venueCardAddress}>
                    {selectedVenue.type} - {selectedVenue.address}
                  </Text>
                </View>
                <Text style={styles.venueCardDistance}>{selectedVenue.distance || '0.9'} KM</Text>
              </View>

              <View style={styles.venueCardImageContainer}>
                <View style={styles.venueCardImagePlaceholder}>
                  <Text style={styles.venueCardImageText}>📷</Text>
                </View>
                <TouchableOpacity style={styles.addPhotoButton}>
                  <Text style={styles.addPhotoText}>+ 📷</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.venueCardTags}>
                {selectedVenue.sports?.slice(0, 1).map((sport: string, index: number) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{sport}</Text>
                  </View>
                ))}
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{selectedVenue.priceRange || '5-10€'}</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{selectedVenue.ambiance || 'Conviviale'}</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{selectedVenue.foodTypes?.[0] || 'Bière'}</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>+{selectedVenue.rating || '4.5'}⭐</Text>
                </View>
              </View>

              <View style={styles.venueCardActions}>
                <View style={styles.attendeesContainer}>
                  <Text style={styles.attendeesText}>👥</Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="share-outline" size={22} color={theme.colors.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="link-outline" size={22} color={theme.colors.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="heart-outline" size={22} color={theme.colors.secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.viewVenueButton}
                onPress={() => {
                  closeVenueCard();
                  navigation.navigate('VenueDetails', { venue: selectedVenue });
                }}
              >
                <Text style={styles.viewVenueButtonText}>Voir le lieu</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity style={styles.closeCardButton} onPress={closeVenueCard}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtres</Text>
            <MaterialCommunityIcons name="tune-variant" size={24} color={theme.colors.text} />
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

  const renderSearchModal = () => (
    <Modal
      visible={showSearch}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowSearch(false)}
    >
      <View style={styles.searchModalOverlay}>
        <View style={styles.searchModalContent}>
          <View style={styles.searchModalHeader}>
            <Text style={styles.searchModalTitle}>Recherche</Text>
            <Ionicons name="search" size={24} color={theme.colors.text} />
          </View>

          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder=""
              placeholderTextColor={theme.colors.textSecondary}
              autoFocus={true}
            />
          </View>

          <View style={styles.searchSection}>
            <View style={styles.searchSectionHeader}>
              <Ionicons name="time-outline" size={18} color={theme.colors.secondary} />
              <Text style={styles.searchSectionTitle}>Historique</Text>
            </View>
            {searchHistory.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => setSearchQuery(item)}
                style={styles.searchItem}
              >
                <Text style={styles.searchItemText}>"{item}"</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.searchSection}>
            <View style={styles.searchSectionHeader}>
              <Ionicons name="trending-up" size={18} color={theme.colors.secondary} />
              <Text style={styles.searchSectionTitle}>Tendances</Text>
            </View>
            {trendingSearches.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => setSearchQuery(item)}
                style={styles.searchItem}
              >
                <Text style={styles.searchItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.searchValidateButton}
            onPress={() => {
              console.log('Search:', searchQuery);
              setShowSearch(false);
            }}
          >
            <Text style={styles.searchValidateButtonText}>VALIDER</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.closeModalButton}
          onPress={() => setShowSearch(false)}
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
            onPress={() => handleVenueSelect(venue)}
          >
            <View style={styles.markerContainer}>
              <View style={styles.marker}>
                <Ionicons name="location" size={24} color={theme.colors.secondary} />
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
        onSearchPress={() => setShowSearch(true)}
        onFilterPress={() => setShowFilters(true)}
      />

      {renderFilterModal()}
      {renderSearchModal()}
      {renderVenueCard()}
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.secondary,
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 48,
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    padding: 24,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
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
  venueCardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    padding: 20,
    width: width - 40,
    maxWidth: 400,
  },
  venueCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  venueCardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: 4,
  },
  venueCardAddress: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.9,
  },
  venueCardDistance: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  venueCardImageContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  venueCardImagePlaceholder: {
    flex: 1,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueCardImageText: {
    fontSize: 32,
  },
  addPhotoButton: {
    width: 60,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.text,
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  venueCardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  venueCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeesText: {
    fontSize: 24,
    color: theme.colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewVenueButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  viewVenueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: theme.colors.primary,
  },
  closeCardButton: {
    position: 'absolute',
    bottom: 80,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  // Search Modal Styles
  searchModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  searchModalContent: {
    width: width - 48,
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchModalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  searchInputContainer: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.text,
    marginBottom: 24,
    paddingBottom: 8,
  },
  searchInput: {
    fontSize: 18,
    color: theme.colors.text,
    paddingVertical: 4,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  searchItem: {
    paddingVertical: 6,
  },
  searchItemText: {
    fontSize: 15,
    color: theme.colors.text,
  },
  searchValidateButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  searchValidateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: theme.colors.primary,
  },
});

export default MapScreen;
