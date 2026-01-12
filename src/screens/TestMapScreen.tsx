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
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import TestMapScreenFilter, {
    DEFAULT_FILTER_SELECTIONS,
    FilterSelections,
} from "../components/TestMapScreenFilter";
import { COLORS } from "../constants/colors";
import { testApi, Venue, VenueMatch } from "../services/testApi";


const { width, height } = Dimensions.get("window");

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

const TestMapScreen = ({ navigation }: { navigation: any }) => {
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [upcomingMatches, setUpcomingMatches] = useState<VenueMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const drawerAnim = useRef(new Animated.Value(-width * 0.8)).current;

    // Bottom Sheet Animation
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const sheetAnim = useRef(new Animated.Value(0)).current; // 0 = collapsed, 1 = expanded
    const bottomSheetHeight = height * 0.5; // Expand to 50% of screen
    const collapsedOffset = 104; // The bottom position of the handle in collapsed state

    // Animate Drawer
    useEffect(() => {
        Animated.timing(drawerAnim, {
            toValue: isDrawerOpen ? 0 : -width * 0.8,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isDrawerOpen]);

    // Animate Sheet
    useEffect(() => {
        Animated.spring(sheetAnim, {
            toValue: isSheetOpen ? 1 : 0,
            useNativeDriver: false, // height/bottom sometimes don't support native driver with layout anims, but transform does. Let's use transform Y.
            friction: 8,
            tension: 40,
        }).start();
    }, [isSheetOpen]);

    const [filterSelections, setFilterSelections] = useState<FilterSelections>(DEFAULT_FILTER_SELECTIONS);
    const [filterSheetVisible, setFilterSheetVisible] = useState(false);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const toggleSheet = () => {
        setIsSheetOpen(!isSheetOpen);
    };

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const [fetchedVenues, fetchedMatches] = await Promise.all([
                    testApi.fetchVenues(),
                    testApi.fetchUpcomingMatches(),
                ]);
                if (!active) return;
                setVenues(fetchedVenues);
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
            <StatusBar barStyle="light-content" />

            {/* ... (Keep Drawer Overlay/Content) ... */}
            {isDrawerOpen && (
                <TouchableOpacity
                    style={styles.drawerOverlay}
                    activeOpacity={1}
                    onPress={() => setIsDrawerOpen(false)}
                />
            )}
            <Animated.View style={[styles.drawerContent, { transform: [{ translateX: drawerAnim }] }]}>
                {/* ... Drawer Content ... */}
                <View style={styles.drawerHeader}>
                    <View style={styles.userProfile}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAv-V7A3SeCdF1j2Bm_cd8CNyCIPLta_60LMVXq6t8rqMzmR3jN9jIZ7bt9ISzqvvQzy15wMvgUi21QK1UeBjAKXD9SYDWvlhxJUKZe5NlK9VOV88baSy0v-zOcbIUMHIc3VF02oz_MO0Xxk3r3CAxCxHQ5uqurmEX4Wo8XypMwNPoDZ3cNhTDHlQV9wpmMCe97EnjPVTHTez6ZZ_Ew_rtUBIDA5gBcfnhoDE5jG4-cqWPRraSda6xFkT3mnJTt9-MA5H7kBzttVcmr" }}
                                style={styles.avatar}
                            />
                        </View>
                        <View>
                            <Text style={styles.drawerTitle}>Bonjour !</Text>
                            <Text style={styles.drawerSubtitle}>Membre Premium</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.proButton}>
                        <MaterialIcons name="star" size={18} color={COLORS.primary} />
                        <Text style={styles.proButtonText}>Passer à l'offre Pro</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.drawerNav}>
                    <View style={styles.drawerNavItemContainer}>
                        <DrawerItem icon="settings" label="Paramètres" />
                        <DrawerItem icon="help" label="Aide & Support" />
                        <DrawerItem icon="share" label="Partager l'app" />
                        <DrawerItem icon="info" label="À propos" />
                    </View>
                    <View style={styles.drawerDivider} />
                    <View style={styles.drawerNavItemContainer}>
                        <DrawerItem icon="logout" label="Déconnexion" color={COLORS.red400} />
                    </View>
                </ScrollView>
                <View style={styles.drawerFooter}>
                    <Text style={styles.versionText}>Version 2.4.0</Text>
                </View>
            </Animated.View>

            {/* Map Custom */}
            <MapView
                provider={PROVIDER_DEFAULT}
                style={StyleSheet.absoluteFillObject}
                customMapStyle={DARK_MAP_STYLE}
                onPress={handleMapPress}
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
                                        color={COLORS.primary}
                                    />
                                    {isSelected && <View style={styles.activePinDot} />}
                                </View>
                                {isSelected && (
                                    <View style={styles.pinLabel}>
                                        <Text style={styles.pinLabelText}>{venue.name}</Text>
                                    </View>
                                )}
                            </View>
                        </Marker>
                    );
                })}
            </MapView>

            {/* Header */}
            <LinearGradient
                colors={['rgba(15, 23, 42, 0.95)', 'transparent']}
                style={styles.header}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity style={styles.menuButton} onPress={toggleDrawer}>
                            <MaterialIcons name="menu" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>AUTOUR DE MOI</Text>
                        <TouchableOpacity style={styles.filterButton} onPress={openFilterSheet}>
                            <MaterialIcons name="tune" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.headerTabs} contentContainerStyle={{ paddingHorizontal: 16 }}>
                        <FilterTab label="Tout" active />
                        <FilterTab label="Football" />
                        <FilterTab label="Rugby" />
                        <FilterTab label="Tennis" />
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>

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
                    <View style={styles.venueCard}>
                        <Image
                            source={{ uri: selectedVenue.image }}
                            style={styles.venueImage}
                        />
                        <View style={styles.venueInfo}>
                            <View>
                                <View style={styles.venueHeaderRow}>
                                    <Text style={styles.venueName} numberOfLines={1}>{selectedVenue.name}</Text>
                                    <View style={[styles.openBadge, !selectedVenue.isOpen && styles.closedBadge]}>
                                        <Text style={[styles.openBadgeText, !selectedVenue.isOpen && styles.closedBadgeText]}>
                                            {selectedVenue.isOpen ? "OUVERT" : "FERMÉ"}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.ratingRow}>
                                    <MaterialIcons name="star" size={16} color={COLORS.yellow400} />
                                    <Text style={styles.ratingText}>{selectedVenue.rating.toFixed(1)}</Text>
                                    <Text style={styles.venueSubText}>• {selectedVenue.tags[0]} • {selectedVenue.priceLevel} • {selectedVenue.distance}</Text>
                                </View>
                            </View>
                            <View style={styles.broadcastRow}>
                                <View style={styles.broadcastBadge}>
                                    <MaterialIcons name="live-tv" size={14} color={COLORS.primary} />
                                    <Text style={styles.broadcastText}>Diffusé ici</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.venueActions}>
                        <TouchableOpacity style={styles.venueBtnSecondary}>
                            <MaterialIcons name="directions" size={18} color={COLORS.slate400} />
                            <Text style={styles.venueBtnTextSecondary}>Itinéraire</Text>
                        </TouchableOpacity>
                        <View style={styles.venueBtnDivider} />
                        <TouchableOpacity
                            style={styles.venueBtnPrimary}
                            onPress={() => navigation.navigate('TestVenueProfile', { venueId: selectedVenue?.id })}
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
                    <Text style={styles.handleText}>
                        {isSheetOpen ? "Masquer les matchs" : "Prochains Matchs"}
                    </Text>
                    <MaterialIcons
                        name={isSheetOpen ? "keyboard-arrow-down" : "keyboard-arrow-up"}
                        size={20}
                        color={COLORS.slate400}
                        style={{ marginTop: 4 }}
                    />
                </TouchableOpacity>

                {/* Content */}
                <View style={styles.sheetContent}>
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
                            />
                        ))}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                </View>
            </Animated.View>

            {/* Near Me Button */}
            <TouchableOpacity style={styles.nearMeButton} activeOpacity={0.8}>
                <MaterialIcons name="near-me" size={24} color={COLORS.white} />
            </TouchableOpacity>

            <TestMapScreenFilter
                visible={filterSheetVisible}
                initialSelections={filterSelections}
                onClose={closeFilterSheet}
                onApply={handleApplyFilters}
            />
        </View>
    );
};

const DrawerItem = ({ icon, label, color = COLORS.slate300 }: any) => (
    <TouchableOpacity style={styles.drawerItem}>
        <MaterialIcons name={icon} size={24} color={color} />
        <Text style={[styles.drawerItemLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
);

const FilterTab = ({ label, active }: any) => (
    <TouchableOpacity style={[styles.filterTab, active && styles.filterTabActive]}>
        <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>{label}</Text>
    </TouchableOpacity>
);

const MatchItem = ({ date, month, team1, team2, team1Color, team2Color, time, league, divider = "vs" }: any) => (
    <TouchableOpacity style={styles.matchItem}>
        <View style={styles.matchDate}>
            <Text style={styles.matchMonth}>{month}</Text>
            <Text style={styles.matchDay}>{date}</Text>
        </View>
        <View style={styles.matchInfo}>
            <View style={styles.teamsRow}>
                <Text style={[styles.teamName, { color: team1Color }]}>{team1}</Text>
                <Text style={styles.teamDivider}>{divider}</Text>
                <Text style={[styles.teamName, { color: team2Color }]}>{team2}</Text>
            </View>
            <View style={styles.matchMeta}>
                <MaterialIcons name="schedule" size={12} color={COLORS.slate400} />
                <Text style={styles.matchMetaText}>{time} • {league}</Text>
            </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={COLORS.slate500} />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    // Drawer
    drawerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 60,
    },
    drawerContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '80%',
        maxWidth: 320,
        backgroundColor: COLORS.slate900,
        zIndex: 70,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        borderRightWidth: 1,
        borderRightColor: 'rgba(255,255,255,0.1)',
    },
    drawerHeader: {
        paddingTop: 56, // Safe area approx
        paddingBottom: 32,
        paddingHorizontal: 24,
        backgroundColor: COLORS.surfaceDark, // Or gradient
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    userProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.surfaceDark,
        borderWidth: 2,
        borderColor: COLORS.primary,
        padding: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
    },
    drawerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    drawerSubtitle: {
        fontSize: 14,
        color: COLORS.slate400,
    },
    proButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(244, 123, 37, 0.1)',
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(244, 123, 37, 0.2)',
        gap: 8,
    },
    proButtonText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    drawerNav: {
        flex: 1,
        paddingVertical: 16,
    },
    drawerNavItemContainer: {
        paddingHorizontal: 12,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 16,
    },
    drawerItemLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    drawerDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 16,
        marginHorizontal: 24,
    },
    drawerFooter: {
        padding: 24,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        color: COLORS.slate600,
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
        paddingBottom: 4, // Reduced padding
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
        marginTop: 12, // More top margin
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
    headerTabs: {
        paddingBottom: 12, // Increased padding
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(30, 41, 59, 0.8)', // Surface dark / 80
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginRight: 8,
    },
    filterTabActive: {
        backgroundColor: COLORS.white,
        borderColor: COLORS.white,
    },
    filterTabText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '500',
    },
    filterTabTextActive: {
        color: COLORS.slate900,
        fontWeight: 'bold',
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
});

export default TestMapScreen;
