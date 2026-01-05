import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Animated,
    Image,
    Dimensions,
    TextInput,
    ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { theme, images } from "../constants/theme";
import { useStore } from "../store/useStore";
import FloatingNavBar from "../components/FloatingNavBar";

// Default user avatar
const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/adventurer/png?seed=Match";

const { width } = Dimensions.get("window");

const MapScreen = () => {
    const navigation = useNavigation<any>();
    const { venues, setVenues, filteredVenues, applyFilters, filters } =
        useStore();
    const [showFilters, setShowFilters] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [selectedFilters, setSelectedFilters] = useState(filters);
    const [selectedVenue, setSelectedVenue] = useState<any>(null);

    const searchHistory = [
        "Bars avec terrasse",
        "Happy hour",
        "NBA ce soir",
        "Match du moment",
    ];
    const trendingSearches = [
        "PSG vs OM",
        "Roland Garros",
        "Final ATP",
        "Premier League",
    ];
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
            await fetchNearbyVenues(
                userLocation.latitude,
                userLocation.longitude,
            );
        } else {
            await fetchVenues();
        }
    };

    const getUserLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        });
    };

    const toggleFilter = (
        category: "sports" | "ambiance" | "foodTypes" | "priceRange",
        value: string,
    ) => {
        setSelectedFilters((prev) => {
            const categoryArray = prev[category];
            const newArray = categoryArray.includes(value)
                ? categoryArray.filter((v) => v !== value)
                : [...categoryArray, value];

            return { ...prev, [category]: newArray };
        });
    };

    const handleSortSelection = (
        sortOption: "distance" | "rating" | null,
        sortDirection: "asc" | "desc",
    ) => {
        setSelectedFilters((prev) => ({
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
        const cleared: typeof filters = {
            sports: [] as string[],
            ambiance: [] as string[],
            foodTypes: [] as string[],
            priceRange: [] as string[],
            sortOption: null,
            sortDirection: "asc" as const,
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
                            { transform: [{ translateY: cardSlideAnim }] },
                        ]}
                    >
                        <TouchableOpacity activeOpacity={1}>
                            <View style={styles.venueCardHeader}>
                                <View>
                                    <Text style={styles.venueCardName}>
                                        {selectedVenue.name}
                                    </Text>
                                    <Text style={styles.venueCardAddress}>
                                        {selectedVenue.type} -{" "}
                                        {selectedVenue.address}
                                    </Text>
                                </View>
                                <Text style={styles.venueCardDistance}>
                                    {selectedVenue.distance || "0.9"} KM
                                </Text>
                            </View>

                            <View style={styles.venueCardImageContainer}>
                                <View style={styles.venueCardImagePlaceholder}>
                                    <Text style={styles.venueCardImageText}>
                                        📷
                                    </Text>
                                </View>
                                <TouchableOpacity style={styles.addPhotoButton}>
                                    <Text style={styles.addPhotoText}>
                                        + 📷
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.venueCardTags}>
                                {selectedVenue.sports
                                    ?.slice(0, 1)
                                    .map((sport: string, index: number) => (
                                        <View key={index} style={styles.tag}>
                                            <Text style={styles.tagText}>
                                                {sport}
                                            </Text>
                                        </View>
                                    ))}
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>
                                        {selectedVenue.priceRange || "5-10€"}
                                    </Text>
                                </View>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>
                                        {selectedVenue.ambiance || "Conviviale"}
                                    </Text>
                                </View>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>
                                        {selectedVenue.foodTypes?.[0] ||
                                            "Bière"}
                                    </Text>
                                </View>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>
                                        +{selectedVenue.rating || "4.5"}⭐
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.venueCardActions}>
                                <View style={styles.attendeesContainer}>
                                    <Text style={styles.attendeesText}>👥</Text>
                                </View>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                    >
                                        <Ionicons
                                            name="share-outline"
                                            size={22}
                                            color={theme.colors.secondary}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                    >
                                        <Ionicons
                                            name="link-outline"
                                            size={22}
                                            color={theme.colors.secondary}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                    >
                                        <Ionicons
                                            name="heart-outline"
                                            size={22}
                                            color={theme.colors.secondary}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.viewVenueButton}
                                onPress={() => {
                                    closeVenueCard();
                                    navigation.navigate("VenueDetails", {
                                        venue: selectedVenue,
                                    });
                                }}
                            >
                                <Text style={styles.viewVenueButtonText}>
                                    Voir le lieu
                                </Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Animated.View>

                    <TouchableOpacity
                        style={styles.closeCardButton}
                        onPress={closeVenueCard}
                    >
                        <Ionicons
                            name="close"
                            size={24}
                            color={theme.colors.text}
                        />
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
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPressOut={() => setShowFilters(false)}
            >
                <ImageBackground
                    source={images.background}
                    style={styles.modalContent}
                    imageStyle={{ borderRadius: 28 }}
                    // onStartShouldSetResponder={() => true}
                >
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filtres</Text>
                        <MaterialCommunityIcons
                            name="tune-variant"
                            size={24}
                            color={theme.colors.text}
                        />
                    </View>

                    <ScrollView style={styles.filtersList}>
                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>
                                • Trier par
                            </Text>
                            <View style={styles.filterOptions}>
                                <TouchableOpacity
                                    style={[
                                        styles.filterChip,
                                        selectedFilters.sortOption ===
                                        "distance" &&
                                        styles.filterChipSelected,
                                    ]}
                                    onPress={() =>
                                        handleSortSelection("distance", "asc")
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            selectedFilters.sortOption ===
                                            "distance" &&
                                            styles.filterChipTextSelected,
                                        ]}
                                    >
                                        Distance
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.filterChip,
                                        selectedFilters.sortOption ===
                                        "rating" &&
                                        styles.filterChipSelected,
                                    ]}
                                    onPress={() =>
                                        handleSortSelection("rating", "desc")
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            selectedFilters.sortOption ===
                                            "rating" &&
                                            styles.filterChipTextSelected,
                                        ]}
                                    >
                                        Note
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>
                                • Lieux
                            </Text>
                            <View style={styles.filterOptions}>
                                {["Bar", "Fast-Food", "Chicha"].map(
                                    (option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={[
                                                styles.filterChip,
                                                selectedFilters.foodTypes.includes(
                                                    option,
                                                ) && styles.filterChipSelected,
                                            ]}
                                            onPress={() =>
                                                toggleFilter(
                                                    "foodTypes",
                                                    option,
                                                )
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.filterChipText,
                                                    selectedFilters.foodTypes.includes(
                                                        option,
                                                    ) &&
                                                    styles.filterChipTextSelected,
                                                ]}
                                            >
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    ),
                                )}
                            </View>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>
                                • Prix
                            </Text>
                            <View style={styles.filterOptions}>
                                {["-5€", "5-10€", "10-20€", "+20€"].map(
                                    (option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={[
                                                styles.filterChip,
                                                selectedFilters.priceRange.includes(
                                                    option,
                                                ) && styles.filterChipSelected,
                                            ]}
                                            onPress={() =>
                                                toggleFilter(
                                                    "priceRange",
                                                    option,
                                                )
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.filterChipText,
                                                    selectedFilters.priceRange.includes(
                                                        option,
                                                    ) &&
                                                    styles.filterChipTextSelected,
                                                ]}
                                            >
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    ),
                                )}
                            </View>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>
                                • Sports
                            </Text>
                            <View style={styles.filterOptions}>
                                {["Foot", "Basket", "Rugby", "Tennis"].map(
                                    (option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={[
                                                styles.filterChip,
                                                selectedFilters.sports.includes(
                                                    option,
                                                ) && styles.filterChipSelected,
                                            ]}
                                            onPress={() =>
                                                toggleFilter("sports", option)
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.filterChipText,
                                                    selectedFilters.sports.includes(
                                                        option,
                                                    ) &&
                                                    styles.filterChipTextSelected,
                                                ]}
                                            >
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    ),
                                )}
                            </View>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>
                                • Ambiance
                            </Text>
                            <View style={styles.filterOptions}>
                                {["Conviviale", "Ultra", "Posée"].map(
                                    (option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={[
                                                styles.filterChip,
                                                selectedFilters.ambiance.includes(
                                                    option,
                                                ) && styles.filterChipSelected,
                                            ]}
                                            onPress={() =>
                                                toggleFilter("ambiance", option)
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.filterChipText,
                                                    selectedFilters.ambiance.includes(
                                                        option,
                                                    ) &&
                                                    styles.filterChipTextSelected,
                                                ]}
                                            >
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    ),
                                )}
                            </View>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>
                                • Food & Drinks
                            </Text>
                            <View style={styles.filterOptions}>
                                {["Bière", "Tacos", "Pizza", "Grec"].map(
                                    (option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={[
                                                styles.filterChip,
                                                selectedFilters.foodTypes.includes(
                                                    option,
                                                ) && styles.filterChipSelected,
                                            ]}
                                            onPress={() =>
                                                toggleFilter(
                                                    "foodTypes",
                                                    option,
                                                )
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.filterChipText,
                                                    selectedFilters.foodTypes.includes(
                                                        option,
                                                    ) &&
                                                    styles.filterChipTextSelected,
                                                ]}
                                            >
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    ),
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.validateButton}
                        onPress={applyFilterChanges}
                    >
                        <Text style={styles.validateButtonText}>VALIDER</Text>
                    </TouchableOpacity>

                </ImageBackground>

                {/*<TouchableOpacity
                    style={styles.closeModalButton}
                    onPress={() => setShowFilters(false)}
                >
                    <Ionicons
                        name="close"
                        size={24}
                        color={theme.colors.primary}
                    />
                </TouchableOpacity>*/}
            </TouchableOpacity >
        </Modal >
    );

    const renderSearchModal = () => (
        <Modal
            visible={showSearch}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setShowSearch(false)}
        >
            <TouchableOpacity
                style={styles.searchModalOverlay}
                activeOpacity={1}
                onPressOut={() => setShowSearch(false)}
            >
                <ImageBackground
                    source={images.background}
                    style={styles.searchModalContent}
                    imageStyle={{ borderRadius: 28 }}
                    // onStartShouldSetResponder={() => true}
                >
                    <View style={styles.searchModalHeader}>
                        <Text style={styles.searchModalTitle}>Recherche</Text>
                        <Ionicons
                            name="search"
                            size={24}
                            color={theme.colors.text}
                        />
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
                            <Ionicons
                                name="time-outline"
                                size={18}
                                color={theme.colors.secondary}
                            />
                            <Text style={styles.searchSectionTitle}>
                                Historique
                            </Text>
                        </View>
                        {searchHistory.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setSearchQuery(item)}
                                style={styles.searchItem}
                            >
                                <Text style={styles.searchItemText}>
                                    "{item}"
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.searchSection}>
                        <View style={styles.searchSectionHeader}>
                            <Ionicons
                                name="trending-up"
                                size={18}
                                color={theme.colors.secondary}
                            />
                            <Text style={styles.searchSectionTitle}>
                                Tendances
                            </Text>
                        </View>
                        {trendingSearches.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setSearchQuery(item)}
                                style={styles.searchItem}
                            >
                                <Text style={styles.searchItemText}>
                                    "{item}"
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.searchValidateButton}
                        onPress={() => {
                            console.log("Search:", searchQuery);
                            setShowSearch(false);
                        }}
                    >
                        <Text style={styles.searchValidateButtonText}>
                            VALIDER
                        </Text>
                    </TouchableOpacity>

                </ImageBackground>

                <TouchableOpacity
                    style={styles.closeModalButton}
                    onPress={() => setShowSearch(false)}
                >
                    <Ionicons
                        name="close"
                        size={24}
                        color={theme.colors.primary}
                    />
                </TouchableOpacity>
            </TouchableOpacity >
        </Modal >
    );

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
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
                {filteredVenues.map((venue) => (
                    <Marker
                        key={venue.id}
                        coordinate={{
                            latitude: venue.latitude,
                            longitude: venue.longitude,
                        }}
                        onPress={() => handleVenueSelect(venue)}
                    >
                        <View style={styles.markerContainer}>
                            <View style={styles.markerPin}>
                                <View style={styles.markerPinHead} />
                                <View style={styles.markerPinTail} />
                            </View>
                        </View>
                    </Marker>
                ))}
            </MapView>

            <SafeAreaView style={styles.headerOverlay}>
                {/* Globe icon - navigate to matches list */}
                <TouchableOpacity
                    style={styles.globeButton}
                    onPress={() => navigation.navigate("Matches")}
                >
                    <Feather
                        name="globe"
                        size={28}
                        color={theme.colors.secondary}
                    />
                </TouchableOpacity>

                <Animated.View style={{ opacity: buttonOpacity }}>
                    <TouchableOpacity
                        onPress={centerOnUser}
                        style={styles.locationBadge}
                    >
                        <Text style={styles.headerTitle}>AUTOUR DE MOI</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Profile avatar */}
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate("Profile")}
                >
                    <Image
                        source={{ uri: DEFAULT_AVATAR }}
                        style={styles.profileAvatar}
                    />
                </TouchableOpacity>
            </SafeAreaView>

            <FloatingNavBar
                onListPress={() => navigation.navigate("Matches")}
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
        width: "100%",
        height: "100%",
    },
    headerOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 10,
        zIndex: 10,
    },
    globeButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: theme.colors.secondary,
        justifyContent: "center",
        alignItems: "center",
    },
    locationBadge: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: "800",
        fontStyle: "italic",
        color: theme.colors.primary,
        letterSpacing: 0.5,
    },
    profileButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 3,
        borderColor: theme.colors.secondary,
    },
    profileAvatar: {
        width: "100%",
        height: "100%",
        borderRadius: 24,
    },
    markerContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    markerPin: {
        alignItems: "center",
    },
    markerPinHead: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: theme.colors.secondary,
        borderWidth: 3,
        borderColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 4,
    },
    markerPinTail: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 10,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: theme.colors.secondary,
        marginTop: -2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: width - 48,
        borderRadius: 28,
        padding: 24,
        maxHeight: "70%",
        borderWidth: 3,
        borderColor: theme.colors.primary,
        overflow: "hidden",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(123, 47, 254, 0.1)",
    },
    modalTitle: {
        fontSize: 26,
        fontWeight: "bold",
        color: theme.colors.primary,
    },
    filtersList: {
        paddingVertical: 8,
    },
    filterSection: {
        marginBottom: 20,
    },
    filterSectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: theme.colors.primary,
        marginBottom: 10,
    },
    filterOptions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor: theme.colors.secondary,
        borderWidth: 2,
        borderColor: theme.colors.secondary,
    },
    filterChipSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: "600",
        color: theme.colors.primary,
    },
    filterChipTextSelected: {
        color: "#fff",
    },
    validateButton: {
        marginTop: 16,
        backgroundColor: theme.colors.secondary,
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: "center",
    },
    validateButtonText: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: "bold",
        fontStyle: "italic",
    },
    closeModalButton: {
        position: "absolute",
        bottom: 100,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.9)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    venueCardOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    venueCard: {
        backgroundColor: theme.colors.primary,
        borderRadius: 28,
        padding: 20,
        width: width - 48,
        maxWidth: 380,
        borderWidth: 3,
        borderColor: theme.colors.secondary,
    },
    venueCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    venueCardName: {
        fontSize: 18,
        fontWeight: "bold",
        color: theme.colors.secondary,
        marginBottom: 4,
        textTransform: "uppercase",
    },
    venueCardAddress: {
        fontSize: 13,
        color: theme.colors.text,
        opacity: 0.9,
    },
    venueCardDistance: {
        fontSize: 13,
        fontWeight: "bold",
        color: theme.colors.secondary,
    },
    venueCardImageContainer: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 12,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.3)",
    },
    venueCardImagePlaceholder: {
        flex: 1,
        height: 100,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center",
        alignItems: "center",
    },
    venueCardImageText: {
        fontSize: 32,
    },
    addPhotoButton: {
        width: 60,
        height: 120,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: theme.colors.text,
        borderStyle: "dashed",
    },
    addPhotoText: {
        fontSize: 16,
        color: theme.colors.text,
    },
    venueCardTags: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
    },
    tag: {
        backgroundColor: theme.colors.secondary,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
    },
    tagText: {
        fontSize: 11,
        fontWeight: "700",
        color: theme.colors.primary,
    },
    venueCardActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    attendeesContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    attendeesText: {
        fontSize: 24,
        color: theme.colors.text,
    },
    actionButtons: {
        flexDirection: "row",
        gap: 12,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.secondary,
        justifyContent: "center",
        alignItems: "center",
    },
    viewVenueButton: {
        backgroundColor: theme.colors.secondary,
        paddingVertical: 12,
        borderRadius: 22,
        alignItems: "center",
    },
    viewVenueButtonText: {
        fontSize: 15,
        fontWeight: "bold",
        fontStyle: "italic",
        color: theme.colors.primary,
    },
    closeCardButton: {
        position: "absolute",
        bottom: 100,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.9)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    // Search Modal Styles
    searchModalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    searchModalContent: {
        width: width - 48,
        borderRadius: 28,
        padding: 24,
        maxHeight: "65%",
        borderWidth: 3,
        borderColor: theme.colors.secondary,
        overflow: "hidden",
    },
    searchModalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    searchModalTitle: {
        fontSize: 26,
        fontWeight: "bold",
        color: theme.colors.text,
    },
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "rgba(255,255,255,0.5)",
        marginBottom: 20,
        paddingBottom: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 18,
        color: theme.colors.text,
        paddingVertical: 4,
    },
    searchSection: {
        marginBottom: 16,
    },
    searchSectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 10,
    },
    searchSectionTitle: {
        fontSize: 15,
        fontWeight: "bold",
        color: theme.colors.secondary,
    },
    searchItem: {
        paddingVertical: 5,
    },
    searchItemText: {
        fontSize: 14,
        color: theme.colors.text,
    },
    searchValidateButton: {
        backgroundColor: theme.colors.secondary,
        paddingVertical: 12,
        borderRadius: 22,
        alignItems: "center",
        marginTop: 12,
    },
    searchValidateButtonText: {
        fontSize: 15,
        fontWeight: "bold",
        fontStyle: "italic",
        color: theme.colors.primary,
    },
});

export default MapScreen;
