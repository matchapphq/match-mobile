import React, { useState, useRef, useEffect, useMemo } from "react";
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
    PanResponder,
    useWindowDimensions,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, Region } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useStore } from "../store/useStore";
import { mobileApi, Venue, VenueMatch } from "../services/mobileApi";
import { usePostHog } from "posthog-react-native";

// Constants for layout alignment
const TAB_BAR_TOTAL_HEIGHT = 110; // Clearance for the floating tab bar pill

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const MapScreen = ({ navigation, route }: { navigation: any; route: any }) => {
    const { colors, computedTheme: themeMode } = useStore();
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const posthog = usePostHog();
    const mapRef = useRef<MapView>(null);

    // Dynamic Snap Points starting from the screen bottom (0)
    const SNAPS = useMemo(() => ({
        HIDDEN: 0,
        COLLAPSED: TAB_BAR_TOTAL_HEIGHT + 60, // Peak summary above the pill
        HALF: windowHeight * 0.45,
        FULL: windowHeight - insets.top,
    }), [windowHeight, insets, TAB_BAR_TOTAL_HEIGHT]);

    // State
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [upcomingMatches, setUpcomingMatches] = useState<VenueMatch[]>([]);
    const [hasSearchedArea, setHasSearchedArea] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [currentRegion, setCurrentRegion] = useState<Region>({
        latitude: 48.8566,
        longitude: 2.3522,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    // Animation & Gesture Logic
    const animatedHeight = useRef(new Animated.Value(0)).current;
    const lastHeight = useRef(0);
    const scrollOffset = useRef(0);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponderCapture: (_, gestureState) => {
                const { dy, dx } = gestureState;
                if (Math.abs(dx) > Math.abs(dy)) return false;
                if (Math.abs(dy) < 10) return false;

                const isAtFull = lastHeight.current >= SNAPS.FULL - 50;
                const isScrollingDown = dy > 0;
                
                if (isAtFull) {
                    if (scrollOffset.current > 0) return false;
                    if (scrollOffset.current <= 0 && isScrollingDown) return true;
                    return false;
                }
                return true;
            },
            onPanResponderMove: (_, gestureState) => {
                const newHeight = lastHeight.current - gestureState.dy;
                if (newHeight > 0 && newHeight < SNAPS.FULL + 50) {
                    animatedHeight.setValue(newHeight);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                const finalHeight = lastHeight.current - gestureState.dy;
                let target = SNAPS.COLLAPSED;

                if (finalHeight > SNAPS.HALF + 100 || gestureState.vy < -0.5) {
                    target = SNAPS.FULL;
                } else if (finalHeight > SNAPS.COLLAPSED + 10 || gestureState.vy < -0.2) {
                    target = SNAPS.HALF;
                } else if (gestureState.vy > 0.5) {
                    target = SNAPS.COLLAPSED;
                }

                animateTo(target);
            },
        })
    ).current;

    const animateTo = (height: number) => {
        lastHeight.current = height;
        Animated.spring(animatedHeight, {
            toValue: height,
            useNativeDriver: false,
            friction: 8,
            tension: 40,
        }).start();
    };

    const handleMarkerPress = async (venue: Venue) => {
        posthog?.capture("venue_viewed", { venue_id: venue.id, venue_name: venue.name, source: 'map' });
        setSelectedVenue(venue);
        animateTo(SNAPS.HALF);

        // Fetch actual matches for this venue
        try {
            const fullVenue = await mobileApi.fetchVenueById(venue.id);
            if (fullVenue && fullVenue.matches) {
                setUpcomingMatches(fullVenue.matches);
            } else {
                setUpcomingMatches([]);
            }
        } catch (error) {
            console.warn("Failed to fetch venue matches:", error);
            setUpcomingMatches([]);
        }
    };

    const handleSearchArea = async () => {
        setIsSearching(true);
        try {
            const fetchedVenues = await mobileApi.fetchVenuesInArea(
                currentRegion.latitude, currentRegion.longitude,
                currentRegion.latitudeDelta, currentRegion.longitudeDelta
            );
            setVenues(fetchedVenues);
            setHasSearchedArea(true);
        } catch (error) { 
            console.warn(error); 
        } finally {
            setIsSearching(false);
        }
    };

    const openDirections = (lat: number, lng: number, label: string) => {
        const url = Platform.select({
            ios: `maps://app?daddr=${lat},${lng}&t=m`,
            android: `google.navigation:q=${lat},${lng}`
        });

        if (url) {
            Linking.canOpenURL(url).then(supported => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    // Fallback to Google Maps Web
                    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
                }
            });
        }
    };

    // Interpolations
    const peekOpacity = animatedHeight.interpolate({
        inputRange: [SNAPS.COLLAPSED, SNAPS.HALF - 50],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    const contentOpacity = animatedHeight.interpolate({
        inputRange: [SNAPS.COLLAPSED + 20, SNAPS.HALF],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? "light-content" : "dark-content"} />

            <MapView
                ref={mapRef}
                showsUserLocation={true}
                provider={PROVIDER_DEFAULT}
                style={StyleSheet.absoluteFillObject}
                customMapStyle={themeMode === 'dark' ? DARK_MAP_STYLE : []}
                onPress={() => { setSelectedVenue(null); animateTo(0); setUpcomingMatches([]); }}
                onRegionChangeComplete={(region) => {
                    setCurrentRegion(region);
                    setHasSearchedArea(false);
                    posthog?.capture("map_interacted", {
                        lat: region.latitude,
                        lng: region.longitude,
                        latitudeDelta: region.latitudeDelta,
                        longitudeDelta: region.longitudeDelta,
                    });
                }}
                initialRegion={{
                    latitude: 48.8566,
                    longitude: 2.3522,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                {venues.map((venue) => (
                    <Marker
                        key={venue.id}
                        coordinate={{ latitude: venue.latitude, longitude: venue.longitude }}
                        onPress={(e) => { e.stopPropagation(); handleMarkerPress(venue); }}
                    >
                        <MaterialIcons
                            name="location-on"
                            size={selectedVenue?.id === venue.id ? 50 : 40}
                            color={selectedVenue?.id === venue.id ? colors.accent : colors.primary}
                        />
                    </Marker>
                ))}
            </MapView>

            {/* Header Overlay */}
            <View style={[styles.headerOverlay, { paddingTop: insets.top + 6 }]}>
                <View style={styles.headerRow}>
                    <View />
                    <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={[styles.fab, { backgroundColor: colors.accent }]}>
                        <MaterialIcons name="tune" size={24} color={themeMode === 'dark' ? "#000" : "#fff"} />
                    </TouchableOpacity>
                </View>
                {(!hasSearchedArea || (hasSearchedArea && venues.length === 0)) && (
                    <TouchableOpacity 
                        style={[
                            styles.searchAreaBtn, 
                            { backgroundColor: themeMode === 'dark' ? 'rgba(28,28,30,0.95)' : 'rgba(255,255,255,0.95)', borderColor: colors.border },
                            hasSearchedArea && venues.length === 0 && { backgroundColor: 'rgba(239, 68, 68, 0.9)', borderColor: 'rgba(239, 68, 68, 1)' }
                        ]} 
                        onPress={handleSearchArea}
                        disabled={isSearching}
                    >
                        {isSearching ? (
                            <ActivityIndicator size="small" color={themeMode === 'dark' ? "#fff" : colors.primary} style={{ marginRight: 8 }} />
                        ) : (
                            <MaterialIcons 
                                name={hasSearchedArea && venues.length === 0 ? "error-outline" : "search"} 
                                size={18} 
                                color={hasSearchedArea && venues.length === 0 ? "#fff" : (themeMode === 'dark' ? "#fff" : colors.text)} 
                            />
                        )}
                        <Text style={[styles.searchAreaBtnText, { color: hasSearchedArea && venues.length === 0 ? "#fff" : (themeMode === 'dark' ? "#fff" : colors.text) }]}>
                            {isSearching 
                                ? "RECHERCHE EN COURS..." 
                                : (hasSearchedArea && venues.length === 0 
                                    ? "AUCUN ÉTABLISSEMENT TROUVÉ" 
                                    : "RECHERCHER DANS CETTE ZONE")}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Unified Bottom Sheet (Extends to screen bottom behind Tab Bar) */}
            {selectedVenue && (
                <Animated.View 
                    {...panResponder.panHandlers}
                    style={[
                        styles.bottomSheet, 
                        { 
                            height: animatedHeight,
                            bottom: 0, 
                            backgroundColor: colors.card,
                        }
                    ]}
                >
                    {/* Gesture Interaction Area */}
                    <View style={styles.dragHandleContainer}>
                        <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
                    </View>

                    {/* 1. COLLAPSED PEEK */}
                    <Animated.View pointerEvents="none" style={[styles.collapsedPeek, { opacity: peekOpacity }]}>
                        <Text style={[styles.collapsedText, { color: colors.text }]} numberOfLines={1}>
                            {selectedVenue.name.toUpperCase()} • {selectedVenue.rating} ★ • €€ • {selectedVenue.distance} • <Text style={{ color: colors.accent }}>OUVERT</Text>
                        </Text>
                        <MaterialIcons name="keyboard-arrow-up" size={20} color={colors.textSecondary} />
                    </Animated.View>

                    {/* 2. SCROLLABLE CONTENT */}
                    <Animated.View style={{ flex: 1, opacity: contentOpacity }}>
                        <ScrollView 
                            style={styles.sheetScroll} 
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: TAB_BAR_TOTAL_HEIGHT + 20 }}
                            onScroll={(e) => { scrollOffset.current = e.nativeEvent.contentOffset.y; }}
                            scrollEventThrottle={16}
                            bounces={false}
                        >
                            <View style={styles.sheetInner}>
                                {/* Header */}
                                <View style={styles.venueHeader}>
                                    <Text style={[styles.venueTitle, { color: colors.text }]}>{selectedVenue.name.toUpperCase()}</Text>
                                    <Text style={[styles.venueSubtitle, { color: colors.textSecondary }]}>Lieu sportif · {selectedVenue.address || 'Paris'}</Text>
                                    
                                    <View style={styles.metaRow}>
                                        <View style={styles.metaItem}>
                                            <MaterialIcons name="star" size={16} color="#f59e0b" />
                                            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{selectedVenue.rating} ({selectedVenue.totalReviews || 0})</Text>
                                        </View>
                                        <Text style={[styles.metaDivider, { color: colors.border }]}>•</Text>
                                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>{selectedVenue.priceLevel}</Text>
                                        <Text style={[styles.metaDivider, { color: colors.border }]}>•</Text>
                                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>{selectedVenue.distance}</Text>
                                        <View style={[styles.statusPill, { backgroundColor: `${colors.accent}15`, marginLeft: 8 }]}>
                                            <Text style={[styles.statusText, { color: colors.accent }]}>OUVERT</Text>
                                        </View>
                                    </View>

                                    {/* Action Row */}
                                    <View style={styles.actionRow}>
                                        <TouchableOpacity 
                                           style={[styles.btnFilled, { backgroundColor: colors.accent }]}
                                           onPress={() => navigation.navigate('VenueProfile', { venueId: selectedVenue.id, source: 'map' })}
                                        >                                            <Text style={[styles.btnFilledText, { color: themeMode === 'dark' ? '#000' : '#fff' }]}>Réserver</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.btnOutline, { borderColor: colors.border }]} 
                                            onPress={() => openDirections(selectedVenue.latitude, selectedVenue.longitude, selectedVenue.name)}
                                        >
                                            <MaterialIcons name="directions" size={20} color={colors.accent} />
                                            <Text style={[styles.btnOutlineText, { color: colors.accent }]}>Itinéraire</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.btnIcon, { backgroundColor: colors.border }]}>
                                            <MaterialIcons name="phone" size={24} color={colors.accent} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Photo Gallery Preview */}
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoStrip}>
                                    <Image source={{ uri: selectedVenue.image }} style={styles.mainThumb} />
                                    <Image source={{ uri: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=400&auto=format&fit=crop" }} style={styles.secThumb} />
                                    <Image source={{ uri: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=400&auto=format&fit=crop" }} style={styles.secThumb} />
                                </ScrollView>

                                <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />

                                {/* Matches List */}
                                <View style={styles.matchesHeader}>
                                    <Text style={[styles.matchesTitle, { color: colors.text }]}>Matchs diffusés ici</Text>
                                    <TouchableOpacity onPress={() => animateTo(SNAPS.FULL)}>
                                        <Text style={[styles.seeAllBtn, { color: colors.accent }]}>Voir tout</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.matchList}>
                                    {upcomingMatches.length > 0 ? (
                                        upcomingMatches.slice(0, 5).map((match, i) => (
                                            <TouchableOpacity key={match.id || i} style={[styles.matchItem, { borderBottomColor: colors.border }]}>
                                                <View style={[styles.datePill, { backgroundColor: colors.border }]}>
                                                    <Text style={[styles.dateMonth, { color: colors.textSecondary }]}>{match.month}</Text>
                                                    <Text style={[styles.dateDay, { color: colors.text }]}>{match.date}</Text>
                                                </View>
                                                <View style={styles.matchInfo}>
                                                    <View style={styles.matchTitleRow}>
                                                        <Text style={[styles.matchTeams, { color: colors.text }]}>{match.team1} vs {match.team2}</Text>
                                                        {i === 0 && <View style={[styles.vedetteTag, { backgroundColor: `${colors.text}10` }]}><Text style={[styles.vedetteText, { color: colors.text }]}>VEDETTE</Text></View>}
                                                    </View>
                                                    <Text style={[styles.matchMetaText, { color: colors.textSecondary }]}>{match.time} • {match.league}</Text>
                                                </View>
                                                <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                                            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Aucun match prévu prochainement</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={{ height: 40 }} />
                            </View>
                        </ScrollView>
                    </Animated.View>
                </Animated.View>
            )}
        </View>
    );
};

const DARK_MAP_STYLE = [
    { "elementType": "geometry", "stylers": [{ "color": "#09090b" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#71717a" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1c1c1e" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000" }] }
];

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingHorizontal: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1, opacity: 0.8 },
    fab: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 5 },
    searchAreaBtn: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        alignSelf: 'center', 
        marginTop: 4, 
        paddingHorizontal: 16, 
        paddingVertical: 8, 
        borderRadius: 25, 
        backgroundColor: 'rgba(28,28,30,0.95)', 
        borderWidth: 1, 
        borderColor: '#2c2c2e' 
    },
    searchAreaBtnText: { color: '#fff', marginLeft: 8, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
    
    bottomSheet: {
        position: 'absolute',
        left: 0, right: 0,
        backgroundColor: '#1c1c1e',
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
        shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.5, shadowRadius: 20,
        zIndex: 100,
        overflow: 'hidden'
    },
    dragHandleContainer: { width: '100%', alignItems: 'center', paddingVertical: 16, minHeight: 44 },
    dragHandle: { width: 40, height: 5, borderRadius: 2.5, backgroundColor: '#3a3a3c' },
    collapsedPeek: { position: 'absolute', top: 44, left: 0, right: 0, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 5 },
    collapsedText: { color: '#fff', fontSize: 14, fontWeight: '700', flex: 1 },
    sheetScroll: { flex: 1 },
    sheetInner: { paddingHorizontal: 20 },
    
    venueHeader: { gap: 6 },
    venueTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
    venueSubtitle: { color: '#71717a', fontSize: 15 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, flexWrap: 'wrap' },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { color: '#71717a', fontSize: 14, fontWeight: '600' },
    metaDivider: { color: '#2c2c2e', marginHorizontal: 8 },
    statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 11, fontWeight: '800' },
    
    actionRow: { flexDirection: 'row', marginTop: 25, gap: 12, alignItems: 'center' },
    btnFilled: { flex: 3, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    btnFilledText: { color: '#000', fontSize: 15, fontWeight: 'bold' },
    btnOutline: { flex: 3, height: 50, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    btnOutlineText: { fontSize: 15, fontWeight: 'bold' },
    btnIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#2c2c2e', alignItems: 'center', justifyContent: 'center' },
    
    photoStrip: { marginTop: 25, gap: 12 },
    mainThumb: { width: 180, height: 120, borderRadius: 16 },
    secThumb: { width: 120, height: 120, borderRadius: 16 },
    
    sectionDivider: { height: 1, backgroundColor: '#2c2c2e', marginVertical: 30 },
    
    matchesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    matchesTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    seeAllBtn: { fontSize: 14, fontWeight: '700' },
    matchList: { gap: 15 },
    matchItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#27272a', minHeight: 60 },
    datePill: { width: 54, height: 54, borderRadius: 14, backgroundColor: '#2c2c2e', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    dateMonth: { color: '#71717a', fontSize: 10, fontWeight: 'bold' },
    dateDay: { color: '#fff', fontSize: 20, fontWeight: '900' },
    matchInfo: { flex: 1 },
    matchTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    matchTeams: { color: '#fff', fontSize: 16, fontWeight: '700' },
    vedetteTag: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    vedetteText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
    matchMetaText: { color: '#71717a', fontSize: 13 },
});

export default MapScreen;
