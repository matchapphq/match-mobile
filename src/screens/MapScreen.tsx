import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Animated,
    StatusBar,
    ActivityIndicator,
    Linking,
    Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, Region } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import MapScreenFilter, {
    DEFAULT_FILTER_SELECTIONS,
    FilterSelections,
} from "../components/MapScreenFilter";
import EmptyState from "../components/EmptyState";
import { COLORS } from "../constants/colors";
import { useStore } from "../store/useStore";
import { mobileApi, Venue, VenueMatch } from "../services/mobileApi";
import { usePostHog } from "posthog-react-native";
import {
    BUDGET_OPTIONS,
    MOOD_OPTIONS,
    SPORTS_OPTIONS,
    VENUE_OPTIONS,
} from "./onboarding/options";
import type { UserPreferences } from "../types";


const { width, height } = Dimensions.get("window");

const LEGACY_SPORTS_MAP: Record<string, string> = {
    Football: "football",
    Rugby: "rugby",
    Tennis: "tennis",
    Basket: "basketball",
    MMA: "mma",
};

const LEGACY_AMBIANCE_MAP: Record<string, string> = {
    Festif: "conviviale",
    Stade: "ultra",
    Chill: "posee",
    Cosy: "posee",
};

const LEGACY_VENUE_MAP: Record<string, string> = {
    "Sports Bar": "bar",
    "Pub Irlandais": "bar",
    Restaurant: "restaurant",
    Rooftop: "bar",
};

const LEGACY_BUDGET_MAP: Record<string, string> = {
    "€": "eco",
    "€€": "standard",
    "€€€": "premium",
};

const SPORTS_IDS = new Set(SPORTS_OPTIONS.map((option) => option.id));
const AMBIANCE_IDS = new Set(MOOD_OPTIONS.map((option) => option.id));
const VENUE_IDS = new Set(VENUE_OPTIONS.map((option) => option.id));
const BUDGET_IDS = new Set(BUDGET_OPTIONS.map((option) => option.id));

const normalizePreferenceList = (
    value: unknown,
    validIds: Set<string>,
    legacyMap?: Record<string, string>,
): string[] => {
    if (!Array.isArray(value)) return [];
    const mapped = value
        .filter((item): item is string => typeof item === "string")
        .map((item) => (legacyMap && legacyMap[item] ? legacyMap[item] : item))
        .filter((item) => validIds.has(item));
    return Array.from(new Set(mapped));
};

const resolveBudget = (value: unknown): string => {
    if (typeof value !== "string" || !value.trim()) return DEFAULT_FILTER_SELECTIONS.budget;
    const mapped = LEGACY_BUDGET_MAP[value] ?? value;
    return BUDGET_IDS.has(mapped) ? mapped : DEFAULT_FILTER_SELECTIONS.budget;
};

const mapUserPreferencesToFilters = (preferences?: UserPreferences): FilterSelections => {
    const sports = normalizePreferenceList(preferences?.sports, SPORTS_IDS, LEGACY_SPORTS_MAP);
    const ambiances = normalizePreferenceList(preferences?.ambiance, AMBIANCE_IDS, LEGACY_AMBIANCE_MAP);
    const venues = normalizePreferenceList(preferences?.foodTypes, VENUE_IDS, LEGACY_VENUE_MAP);

    return {
        sports: sports.length > 0 ? sports : DEFAULT_FILTER_SELECTIONS.sports,
        ambiances: ambiances.length > 0 ? ambiances : DEFAULT_FILTER_SELECTIONS.ambiances,
        venues: venues.length > 0 ? venues : DEFAULT_FILTER_SELECTIONS.venues,
        budget: resolveBudget(preferences?.budget),
    };
};

const DARK_MAP_STYLE = [
    {
        "elementType": "geometry",
        "stylers": [{ "color": "#212121" }]
    },
    {
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#212121" }]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "administrative.country",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#9e9e9e" }]
    },
    {
        "featureType": "administrative.land_parcel",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "administrative.locality",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#bdbdbd" }]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#181818" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#616161" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#1b1b1b" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#2c2c2c" }]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#8a8a8a" }]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [{ "color": "#373737" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [{ "color": "#3c3c3c" }]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [{ "color": "#4e4e4e" }]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#616161" }]
    },
    {
        "featureType": "transit",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#000000" }]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#3d3d3d" }]
    }
];

const LIGHT_MAP_STYLE = [
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#e9e9e9"
            },
            {
                "lightness": 17
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5f5f5"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "lightness": 17
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "lightness": 29
            },
            {
                "weight": 0.2
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "lightness": 18
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5f5f5"
            },
            {
                "lightness": 21
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dedede"
            },
            {
                "lightness": 21
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#ffffff"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "saturation": 36
            },
            {
                "color": "#333333"
            },
            {
                "lightness": 40
            }
        ]
    },
    {
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f2f2f2"
            },
            {
                "lightness": 19
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#fefefe"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#fefefe"
            },
            {
                "lightness": 17
            },
            {
                "weight": 1.2
            }
        ]
    }
];

const MapScreen = ({ navigation, route }: { navigation: any; route: any }) => {
    const { colors, computedTheme: themeMode, user } = useStore();
    const userData = user?.user ?? user ?? null;
    const focusVenueId: string | undefined = route?.params?.focusVenueId;
    const focusLat: number | undefined = route?.params?.focusLat;
    const focusLng: number | undefined = route?.params?.focusLng;
    const focusVenueName: string | undefined = route?.params?.focusVenueName;
    const posthog = usePostHog();
    const mapRef = useRef<MapView>(null);
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [upcomingMatches, setUpcomingMatches] = useState<VenueMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Area search state
    const [showSearchButton, setShowSearchButton] = useState(false);
    const [isSearchingArea, setIsSearchingArea] = useState(false);
    const [hasSearchedArea, setHasSearchedArea] = useState(false);
    const [noVenuesFound, setNoVenuesFound] = useState(false);
    const [currentRegion, setCurrentRegion] = useState<Region>({
        latitude: 48.8566,
        longitude: 2.3522,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });
    const lastSearchedRegion = useRef<Region | null>(null);
    const searchButtonAnim = useRef(new Animated.Value(0)).current;
    const emptyStateTimer = useRef<NodeJS.Timeout | null>(null);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (emptyStateTimer.current) {
                clearTimeout(emptyStateTimer.current);
            }
        };
    }, []);

    // Location Logic - focus on venue if params provided, otherwise user location
    useEffect(() => {
        (async () => {
            if (focusLat != null && focusLng != null) {
                // Focus on the specific venue
                if (mapRef.current) {
                    mapRef.current.animateToRegion({
                        latitude: focusLat,
                        longitude: focusLng,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                    }, 1000);
                }
                // Load the venue as a pin
                if (focusVenueId) {
                    try {
                        const venueData = await mobileApi.fetchVenueById(focusVenueId);
                        if (venueData) {
                            setVenues([venueData]);
                            setSelectedVenue(venueData);
                            setHasSearchedArea(true);
                            setIsSheetOpen(true);
                        }
                    } catch (e) {
                        console.warn('Failed to load focused venue', e);
                    }
                }
                return;
            }

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            if (mapRef.current && location) {
                mapRef.current.animateToRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }, 1000);
            }
        })();
    }, [focusVenueId, focusLat, focusLng]);

    const handleCenterOnUser = async () => {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
            status = (await Location.requestForegroundPermissionsAsync()).status;
        }

        if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            if (mapRef.current && location) {
                mapRef.current.animateToRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }, 1000);
            }
        }
    };

    // Check if region has changed significantly from last search
    const hasRegionChangedSignificantly = (newRegion: Region): boolean => {
        if (!lastSearchedRegion.current) return true;
        const last = lastSearchedRegion.current;
        const latDiff = Math.abs(newRegion.latitude - last.latitude);
        const lngDiff = Math.abs(newRegion.longitude - last.longitude);
        const deltaDiff = Math.abs(newRegion.latitudeDelta - last.latitudeDelta);
        // Show button if moved more than 20% of the view or zoom changed significantly
        const threshold = last.latitudeDelta * 0.2;
        return latDiff > threshold || lngDiff > threshold || deltaDiff > last.latitudeDelta * 0.3;
    };

    // Hide button while user is moving the map
    const handleRegionChange = () => {
        if (showSearchButton && hasSearchedArea) {
            setShowSearchButton(false);
            Animated.timing(searchButtonAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }).start();
        }
    };

    // Handle map region change - this fires when user STOPS moving the map
    const handleRegionChangeComplete = (region: Region) => {
        setCurrentRegion(region);
        
        // Show search button when user stops moving (after first search)
        if (hasSearchedArea && hasRegionChangedSignificantly(region)) {
            setShowSearchButton(true);
            Animated.spring(searchButtonAnim, {
                toValue: 1,
                useNativeDriver: true,
                friction: 8,
            }).start();
        }
    };

    // Search venues in the current area
    const handleSearchArea = async () => {
        posthog?.capture("venue_area_searched", {
            latitude: currentRegion.latitude,
            longitude: currentRegion.longitude,
            lat_delta: currentRegion.latitudeDelta,
        });
        setIsSearchingArea(true);
        setNoVenuesFound(false);
        setShowSearchButton(false);
        
        // Clear any existing empty state timer
        if (emptyStateTimer.current) {
            clearTimeout(emptyStateTimer.current);
        }
        
        Animated.timing(searchButtonAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start();

        try {
            const fetchedVenues = await mobileApi.fetchVenuesInArea(
                currentRegion.latitude,
                currentRegion.longitude,
                currentRegion.latitudeDelta,
                currentRegion.longitudeDelta
            );
            
            setVenues(fetchedVenues);
            lastSearchedRegion.current = currentRegion;
            setHasSearchedArea(true);
            
            if (fetchedVenues.length === 0) {
                setNoVenuesFound(true);
                // Auto-dismiss empty state after 4 seconds
                emptyStateTimer.current = setTimeout(() => {
                    setNoVenuesFound(false);
                }, 4000);
            } else {
                setNoVenuesFound(false);
            }
        } catch (error) {
            console.warn("Search area failed", error);
            setNoVenuesFound(true);
            // Auto-dismiss error state after 4 seconds
            emptyStateTimer.current = setTimeout(() => {
                setNoVenuesFound(false);
            }, 4000);
        } finally {
            setIsSearchingArea(false);
        }
    };

    // Bottom Sheet Animation
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const sheetAnim = useRef(new Animated.Value(0)).current; // 0 = collapsed, 1 = expanded
    const bottomSheetHeight = height * 0.5; // Expand to 50% of screen
    const collapsedOffset = 104; // The bottom position of the handle in collapsed state

    // Animate Sheet
    useEffect(() => {
        Animated.spring(sheetAnim, {
            toValue: isSheetOpen ? 1 : 0,
            useNativeDriver: false, // height/bottom sometimes don't support native driver with layout anims, but transform does. Let's use transform Y.
            friction: 8,
            tension: 40,
        }).start();
    }, [isSheetOpen]);

    const preferenceSelections = mapUserPreferencesToFilters(userData?.preferences);
    const [filterSelections, setFilterSelections] = useState<FilterSelections>(preferenceSelections);
    const [filterSheetVisible, setFilterSheetVisible] = useState(false);

    useEffect(() => {
        setFilterSelections(preferenceSelections);
    }, [
        preferenceSelections.budget,
        JSON.stringify(preferenceSelections.sports),
        JSON.stringify(preferenceSelections.ambiances),
        JSON.stringify(preferenceSelections.venues),
    ]);

    const toggleSheet = () => {
        setIsSheetOpen(!isSheetOpen);
    };

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                // Only load upcoming matches on initial load
                // Venues will be loaded when user clicks "Search in this area"
                const fetchedMatches = await mobileApi.fetchUpcomingMatches();
                if (!active) return;
                setUpcomingMatches(fetchedMatches);
            } catch (error) {
                console.warn("Failed to load map data", error);
            } finally {
                if (active) setIsLoading(false);
            }
        };
        load();
        return () => {
            active = false;
        };
    }, []);

    const handleMarkerPress = (venue: Venue) => {
        posthog?.capture("map_marker_selected", {
            venue_id: venue.id,
            venue_name: venue.name,
        });
        setSelectedVenue(venue);
        setIsSheetOpen(true);
    };

    const handleMapPress = () => {
        setSelectedVenue(null);
        setIsSheetOpen(false);
    };

    const openFilterSheet = () => {
        setFilterSheetVisible(true);
    };

    const closeFilterSheet = () => {
        setFilterSheetVisible(false);
    };

    const handleApplyFilters = (nextSelections: FilterSelections) => {
        posthog?.capture("filter_applied", {
            filter_type: "map_discovery",
            ...nextSelections,
        });
        setFilterSelections(nextSelections);
        setFilterSheetVisible(false);
    };

    // Interpolate sheet position
    const sheetTranslateY = sheetAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -bottomSheetHeight + 100] // Move up by height roughly
    });

    // Better approach: 
    // Collapsed: just the handle at bottom 104.
    // Expanded: Sheet occupies bottom 0 to ~50%.
    // Let's implement a fixed Bottom Sheet View that translates Y.
    // Initial position (Collapsed): TranslateY = height - (Handle Position + Safety)
    // Actually, let's look at the styles. the handle was absolute bottom 104.

    // Let's refactor:
    // The Sheet will be a container at the bottom.
    // We animate its translateY.

    const sheetY = sheetAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [160, -160] // 0 state: pushed down 160px (hidden), 1 state: pulled up 160px (under widget)
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'} />

            {/* Map Custom */}
            <MapView
                ref={mapRef}
                showsUserLocation={true}
                showsMyLocationButton={false}
                provider={PROVIDER_DEFAULT}
                style={StyleSheet.absoluteFillObject}
                customMapStyle={themeMode === 'light' ? LIGHT_MAP_STYLE : DARK_MAP_STYLE}
                onPress={handleMapPress}
                onRegionChange={handleRegionChange}
                onRegionChangeComplete={handleRegionChangeComplete}
                initialRegion={{
                    latitude: 48.8566,
                    longitude: 2.3522,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                {venues.map((venue) => {
                    const isSelected = selectedVenue?.id === venue.id;
                    return (
                        <Marker
                            key={venue.id}
                            coordinate={{ latitude: venue.latitude, longitude: venue.longitude }}
                            anchor={{ x: 0.5, y: 0.5 }}
                            onPress={(e) => {
                                e.stopPropagation();
                                handleMarkerPress(venue);
                            }}
                        >
                            <View style={{ alignItems: "center" }}>
                                <View style={styles.activePin}>
                                    <MaterialIcons
                                        name="location-on"
                                        size={isSelected ? 60 : 45}
                                        color={colors.primary}
                                    />
                                    {isSelected && <View style={[styles.activePinDot, { backgroundColor: colors.white }]} />}
                                </View>
                                {isSelected && (
                                    <View style={[styles.pinLabel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                        <Text style={[styles.pinLabelText, { color: colors.text }]}>{venue.name}</Text>
                                    </View>
                                )}
                            </View>
                        </Marker>
                    );
                })}
            </MapView>

            {/* Header */}
            <LinearGradient
                colors={themeMode === 'light'
                    ? ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.5)', 'transparent']
                    : ['rgba(15, 23, 42, 0.95)', 'transparent']}
                style={styles.header}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerTop}>
                        <View style={{ width: 40 }} />
                        <Text style={[styles.headerTitle, { color: colors.text, textShadowColor: themeMode === 'light' ? 'transparent' : 'rgba(0,0,0,0.5)' }]}>AUTOUR DE MOI</Text>
                        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.primary }]} onPress={openFilterSheet}>
                            <MaterialIcons name="tune" size={24} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.headerSearchContainer}>
                        {(showSearchButton || !hasSearchedArea) && !isSearchingArea && (
                            <Animated.View
                                style={{
                                    transform: [{
                                        translateY: hasSearchedArea 
                                                ? searchButtonAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [-5, 0],
                                                })
                                                : 0,                                    }],
                                    alignSelf: "center",
                                }}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.searchAreaButton,
                                        { backgroundColor: colors.surfaceDark, borderColor: colors.border }
                                    ]}
                                    onPress={handleSearchArea}
                                    activeOpacity={0.8}
                                >
                                    <MaterialIcons name="search" size={18} color={colors.text} />
                                    <Text style={[styles.searchAreaButtonText, { color: colors.text }]}>
                                        Rechercher dans cette zone
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {isSearchingArea && (
                            <View style={[styles.searchAreaButton, { backgroundColor: colors.surfaceDark, borderColor: colors.border }]}>
                                <ActivityIndicator color={colors.primary} size="small" />
                                <Text style={[styles.searchAreaButtonText, { color: colors.textMuted }]}>
                                    Recherche en cours...
                                </Text>
                            </View>
                        )}
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* Empty State - No venues found (auto-dismisses after 4 seconds) */}
            {noVenuesFound && !isSearchingArea && (
                <View style={styles.emptyStateContainer}>
                    <EmptyState
                        icon="search-off"
                        title="Aucun lieu trouvé"
                        description="Essaye de changer de sport ou de zoomer en arrière."
                        style={[
                            styles.emptyStateCard, 
                            { 
                                backgroundColor: colors.surfaceDark, 
                                borderColor: colors.border,
                                paddingVertical: 20,
                                paddingHorizontal: 20,
                            }
                        ]}
                    />
                </View>
            )}

            {/* Loading */}
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator color={COLORS.primary} size="large" />
                    <Text style={styles.loadingText}>Chargement des bars...</Text>
                </View>
            )}

            {/* Venue Card - Only Conditionally Rendered */}
            {selectedVenue && (
                <View style={styles.venueCardContainer}>
                    <View style={[styles.venueCard, { backgroundColor: colors.card }]}>
                        <Image
                            source={{ uri: selectedVenue.image }}
                            style={styles.venueImage}
                        />
                        <View style={styles.venueInfo}>
                            <View>
                                <View style={styles.venueHeaderRow}>
                                    <Text style={[styles.venueName, { color: colors.text }]} numberOfLines={1}>{selectedVenue.name}</Text>
                                    <View style={[styles.openBadge, !selectedVenue.isOpen && styles.closedBadge]}>
                                        <Text style={[styles.openBadgeText, !selectedVenue.isOpen && styles.closedBadgeText]}>
                                            {selectedVenue.isOpen ? "OUVERT" : "FERMÉ"}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.ratingRow}>
                                    <MaterialIcons name="star" size={16} color={colors.yellow400} />
                                    <Text style={[styles.ratingText, { color: colors.text }]}>{typeof selectedVenue.rating === 'number' ? selectedVenue.rating.toFixed(1) : (Number(selectedVenue.rating) || 0).toFixed(1)}</Text>
                                    <Text style={[styles.venueSubText, { color: colors.textMuted }]}>• {selectedVenue.tags[0]} • {selectedVenue.priceLevel} • {selectedVenue.distance}</Text>
                                </View>
                            </View>
                            <View style={styles.broadcastRow}>
                                <View style={styles.broadcastBadge}>
                                    <MaterialIcons name="live-tv" size={14} color={colors.primary} />
                                    <Text style={[styles.broadcastText, { color: colors.primary }]}>Diffusé ici</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.venueActions, { backgroundColor: colors.card }]}>
                        <TouchableOpacity
                            style={styles.venueBtnSecondary}
                            onPress={() => {
                                if (selectedVenue) {
                                    const lat = selectedVenue.latitude;
                                    const lng = selectedVenue.longitude;
                                    const label = encodeURIComponent(selectedVenue.name);
                                    const url = Platform.select({
                                        ios: `maps:0,0?q=${label}@${lat},${lng}`,
                                        android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
                                    });
                                    if (url) Linking.openURL(url);
                                }
                            }}
                        >
                            <MaterialIcons name="directions" size={18} color={colors.slate400} />
                            <Text style={[styles.venueBtnTextSecondary, { color: colors.slate400 }]}>Itinéraire</Text>
                        </TouchableOpacity>
                        <View style={[styles.venueBtnDivider, { backgroundColor: colors.divider }]} />
                        <TouchableOpacity
                            style={[styles.venueBtnPrimary, { backgroundColor: colors.primary }]}
                            onPress={() => navigation.navigate('VenueProfile', { venueId: selectedVenue?.id })}
                        >
                            <Text style={styles.venueBtnTextPrimary}>Voir détails</Text>
                            <MaterialIcons name="arrow-forward" size={18} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Expandable Prochains Matchs Sheet */}
            <Animated.View
                style={[
                    styles.bottomSheetContainer,
                    {
                        transform: [{ translateY: sheetY }],
                        zIndex: 35
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.sheetHandleArea}
                    activeOpacity={0.9}
                    onPress={toggleSheet}
                >
                    <View style={styles.handleBar} />
                    <Text style={[styles.handleText, { color: colors.text }]}>
                        {isSheetOpen ? "Masquer les matchs" : "Prochains Matchs"}
                    </Text>
                    <MaterialIcons
                        name={isSheetOpen ? "keyboard-arrow-down" : "keyboard-arrow-up"}
                        size={20}
                        color={colors.slate400}
                        style={{ marginTop: 4 }}
                    />
                </TouchableOpacity>

                {/* Content */}
                <View style={[styles.sheetContent, { backgroundColor: colors.backgroundElevated }]}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {upcomingMatches.map((match) => (
                            <MatchItem
                                key={match.id}
                                date={match.date}
                                month={match.month}
                                team1={match.team1}
                                team2={match.team2}
                                team1Color={match.team1Color}
                                team2Color={match.team2Color}
                                time={match.time}
                                league={match.league}
                                colors={colors}
                            />
                        ))}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                </View>
            </Animated.View>

            {/* Near Me Button */}
            <TouchableOpacity
                style={styles.nearMeButton}
                activeOpacity={0.8}
                onPress={handleCenterOnUser}
            >
                <MaterialIcons name="near-me" size={24} color={COLORS.white} />
            </TouchableOpacity>

            <MapScreenFilter
                visible={filterSheetVisible}
                initialSelections={filterSelections}
                onClose={() => setFilterSheetVisible(false)}
                onApply={handleApplyFilters}
            />
        </View>
    );
};

const MatchItem = ({ date, month, team1, team2, team1Color, team2Color, time, league, divider = "vs", colors }: any) => (
    <TouchableOpacity style={[styles.matchItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.matchDate}>
            <Text style={[styles.matchMonth, { color: colors.textMuted }]}>{month}</Text>
            <Text style={[styles.matchDay, { color: colors.text }]}>{date}</Text>
        </View>
        <View style={styles.matchInfo}>
            <View style={styles.teamsRow}>
                <Text style={[styles.teamName, { color: team1Color }]}>{team1}</Text>
                <Text style={[styles.teamDivider, { color: colors.textMuted }]}>{divider}</Text>
                <Text style={[styles.teamName, { color: team2Color }]}>{team2}</Text>
            </View>
            <View style={styles.matchMeta}>
                <MaterialIcons name="schedule" size={12} color={colors.slate400} />
                <Text style={[styles.matchMetaText, { color: colors.textMuted }]}>{time} • {league}</Text>
            </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={colors.slate500} />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: COLORS.background, // Handled dynamically
    },
    // Map
    mapContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.slate900,
        zIndex: 0,
    },
    mapImage: {
        width: '100%',
        height: '100%',
    },
    pinContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    activePin: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activePinDot: {
        position: 'absolute',
        top: 22,
        width: 12,
        height: 12,
        backgroundColor: COLORS.white,
        borderRadius: 6,
    },
    pinLabel: {
        marginTop: 4,
        backgroundColor: COLORS.surfaceDark,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    pinLabelText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.white,
    },

    // Header
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        paddingBottom: 0,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 4,
        marginTop: 0,
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
        letterSpacing: 0.5, // Tracking tight
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    headerSearchContainer: {
        alignItems: 'center',
        paddingBottom: 4,
        minHeight: 32,
    },

    // Floating Elements
    nearMeButton: {
        position: 'absolute',
        bottom: 168, // As per HTML
        right: 16,
        zIndex: 40,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.slate900,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 32,
    },

    // Floating Elements
    // We are replacing floatingHandle with bottomSheetContainer styles

    bottomSheetContainer: {
        position: 'absolute',
        bottom: -320, // Hide most content
        left: 0,
        right: 0,
        height: 480, // Enough height for content
        backgroundColor: 'rgba(39, 39, 42, 0.98)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
    },
    sheetHandleArea: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 12,
        // Make this area hit slop large
    },
    handleBar: {
        width: 48,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.slate500,
        marginBottom: 8,
    },
    handleText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.slate400,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sheetContent: {
        width: '100%',
        flex: 1,
        paddingHorizontal: 16,
    },

    // Venue Card
    venueCardContainer: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: '36%', // Approximate
        zIndex: 20,
        backgroundColor: COLORS.surfaceDark,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
    },
    venueCard: {
        flexDirection: 'row',
        padding: 16,
        gap: 16,
    },
    venueImage: {
        width: 96,
        height: 96,
        borderRadius: 8,
        backgroundColor: COLORS.slate600,
    },
    venueInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    venueHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    venueName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        flex: 1,
        marginRight: 8,
    },
    openBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    openBadgeText: {
        color: COLORS.emerald400,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    ratingText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    venueSubText: {
        color: COLORS.slate400,
        fontSize: 12,
    },
    broadcastRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 'auto',
    },
    broadcastBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(244, 123, 37, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(244, 123, 37, 0.2)',
    },
    broadcastText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '500',
    },
    venueActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    venueBtnSecondary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    venueBtnTextSecondary: {
        color: COLORS.slate400,
        fontSize: 14,
        fontWeight: '500',
    },
    venueBtnDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    venueBtnPrimary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: COLORS.primary,
        gap: 6,
    },
    venueBtnTextPrimary: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },

    // Bottom Sheet

    viewAllText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    matchesList: {
        padding: 16,
        gap: 12,
    },
    matchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
        backgroundColor: COLORS.surfaceDark,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    matchDate: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    matchMonth: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.slate400,
        textTransform: 'uppercase',
    },
    matchDay: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        lineHeight: 20,
    },
    matchInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    teamsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    teamName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    teamDivider: {
        fontSize: 12,
        color: COLORS.slate500,
        marginHorizontal: 8,
    },
    matchMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 6,
    },
    matchMetaText: {
        fontSize: 12,
        color: COLORS.slate400,
    },

    // Floating Nav Bar
    navBar: {
        position: 'absolute',
        bottom: 32,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderRadius: 32,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        zIndex: 50,
    },
    navItem: {
        alignItems: 'center',
        gap: 4,
        width: 64,
    },
    navItemLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: COLORS.slate400,
    },
    navItemLabelActive: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(8,8,12,0.8)',
        zIndex: 80,
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    closedBadge: {
        backgroundColor: 'rgba(248,113,113,0.15)',
        borderColor: 'rgba(248,113,113,0.4)',
    },
    closedBadgeText: {
        color: COLORS.red400,
    },
    filterBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#09090b',
        zIndex: 80,
    },
    filterSheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        backgroundColor: COLORS.backgroundDark,
        zIndex: 90,
    },
    filterHeader: {
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    filterHeaderButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    filterTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '700',
    },
    filterReset: {
        color: COLORS.textMuted,
        fontSize: 14,
        fontWeight: '600',
    },
    filterContent: {
        padding: 20,
        paddingBottom: 160,
        gap: 24,
    },
    filterSection: {
        gap: 12,
    },
    filterSectionTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    chipWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: COLORS.surfaceDark,
    },
    chipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
    },
    chipHighlighted: {
        backgroundColor: 'rgba(244,123,37,0.15)',
        borderColor: 'rgba(244,123,37,0.4)',
    },
    chipLabel: {
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    chipLabelActive: {
        color: COLORS.white,
    },
    chipLabelHighlighted: {
        color: COLORS.primary,
    },
    priceRow: {
        flexDirection: 'row',
        gap: 12,
    },
    priceButton: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: COLORS.surfaceDark,
        paddingVertical: 14,
        alignItems: 'center',
    },
    priceButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
    },
    priceButtonText: {
        color: COLORS.textMuted,
        fontWeight: '700',
        fontSize: 14,
    },
    priceButtonTextActive: {
        color: COLORS.white,
    },
    filterFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 32,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    validateButton: {
        height: 56,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 10 },
    },
    validateLabel: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 1,
    },

    // Search Area Button
    searchAreaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: 8,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    searchAreaButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.white,
    },

    // Empty State
    emptyStateContainer: {
        position: 'absolute',
        top: 150,
        left: 16,
        right: 16,
        zIndex: 20,
    },
    emptyStateCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 16,
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 32,
        elevation: 10,
        gap: 12,
    },
    emptyStateIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateContent: {
        flex: 1,
    },
    emptyStateTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 4,
    },
    emptyStateSubtitle: {
        fontSize: 12,
        color: COLORS.slate400,
        lineHeight: 18,
    },
});

export default MapScreen;
