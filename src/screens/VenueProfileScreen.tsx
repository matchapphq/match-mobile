import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Dimensions, 
    StatusBar, 
    Platform, 
    Linking, 
    Animated 
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mobileApi, Venue, VenueMatch } from '../services/mobileApi';
import { useStore } from '../store/useStore';
import { usePostHog } from "posthog-react-native";
import { VenueProfileSkeleton } from '../components/Skeleton';
import { hapticFeedback } from '../utils/haptics';
import { sharing } from '../utils/sharing';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

const VenueProfileScreen = ({ navigation, route }: { navigation: any; route: any }) => {
    const { 
        colors, 
        computedTheme: themeMode, 
        favouriteVenueIds, 
        toggleFavourite, 
        checkAndCacheFavourite,
        recordVenueView,
    } = useStore();
    const posthog = usePostHog();
    const insets = useSafeAreaInsets();
    const venueId: string | undefined = route?.params?.venueId;
    const [venue, setVenue] = useState<Venue | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isFavourite = venueId ? favouriteVenueIds.has(venueId) : false;

    // Scroll animation for sticky button
    const scrollY = useRef(new Animated.Value(0)).current;
    const stickyHeaderHeight = 300;

    useEffect(() => {
        if (venueId) {
            checkAndCacheFavourite(venueId);
        }
    }, [venueId, checkAndCacheFavourite]);

    const handleToggleFavourite = async () => {
        if (venueId) {
            const newState = !isFavourite;
            hapticFeedback.light();
            await toggleFavourite(venueId);
            posthog?.capture(newState ? 'favorite_added' : 'favorite_removed', {
                venue_id: venueId,
                venue_name: venue?.name ?? "",
            });
        }
    };

    const handleShare = () => {
        if (venue && venueId) {
            sharing.shareVenue(venue.name, venueId);
            posthog?.capture('venue_shared', {
                venue_id: venueId,
                venue_name: venue.name,
            });
        }
    };

    const loadVenue = useCallback(async () => {
        try {
            setError(null);
            setIsLoading(true);
            const data = venueId ? await mobileApi.fetchVenueById(venueId) : null;
            setVenue(data ?? null);
            if (venueId && data) {
                recordVenueView(venueId);
                posthog?.capture("venue_viewed", {
                    venue_id: venueId,
                    venue_name: data.name,
                    source: route.params?.source || "unknown",
                });
            }
        } catch (err) {
            console.warn('Failed to load venue', err);
            setError("Impossible de charger les informations de ce lieu.");
        } finally {
            setIsLoading(false);
        }
    }, [venueId, recordVenueView]);

    useEffect(() => {
        loadVenue();
    }, [loadVenue]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleCall = (phone: string) => {
        const url = `tel:${phone}`;
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                console.warn('Phone call not supported on this device/simulator');
            }
        });
    };

    const openDirections = () => {
        if (!venue) return;
        const lat = venue.latitude;
        const lng = venue.longitude;
        const url = Platform.select({
            ios: `maps://app?daddr=${lat},${lng}&t=m`,
            android: `google.navigation:q=${lat},${lng}`
        });
        if (url) {
            Linking.canOpenURL(url).then(supported => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
                }
            });
        }
    };

    const stickyBtnOpacity = scrollY.interpolate({
        inputRange: [stickyHeaderHeight, stickyHeaderHeight + 50],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const stickyBtnTranslateY = scrollY.interpolate({
        inputRange: [stickyHeaderHeight, stickyHeaderHeight + 50],
        outputRange: [100, 0],
        extrapolate: 'clamp',
    });

    if (isLoading) return <VenueProfileSkeleton />;

    if (error || !venue) {
        return (
            <View style={[styles.container, styles.centerState, { backgroundColor: colors.background }]}>
                <Text style={[styles.stateText, { color: colors.textSecondary }]}>{error ?? "Ce lieu n'est pas disponible."}</Text>
                <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.accent }]} onPress={loadVenue}>
                    <Text style={{ color: '#000', fontWeight: 'bold' }}>Réessayer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            <Animated.ScrollView 
                showsVerticalScrollIndicator={false} 
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
            >
                {/* 2026 Hero Layout */}
                <View style={styles.heroContainer}>
                    <Image source={{ uri: venue.image }} style={styles.heroImage} contentFit="cover" />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.2)', 'transparent', 'rgba(0,0,0,0.9)']}
                        style={StyleSheet.absoluteFill}
                    />
                    
                    {/* Top Buttons Overlay */}
                    <View style={[styles.topActions, { top: insets.top + 10 }]}>
                        <TouchableOpacity onPress={handleBack} style={styles.compactRoundBtn}>
                            <MaterialIcons name="arrow-back" size={20} color="#fff" />
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity onPress={handleShare} style={styles.compactRoundBtn}>
                                <MaterialIcons name="share" size={18} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleToggleFavourite} style={styles.compactRoundBtn}>
                                <MaterialIcons name={isFavourite ? "favorite" : "favorite-border"} size={18} color={isFavourite ? colors.accent : "#fff"} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Image Bottom Info */}
                    <View style={styles.heroInfoOverlay}>
                        <View style={[styles.livePill, { backgroundColor: colors.accent }]}>
                            <Text style={styles.livePillText}>LIVE SPORTS</Text>
                        </View>
                        <Text style={styles.heroTitle} numberOfLines={2}>{venue.name}</Text>
                    </View>
                </View>

                {/* Floating Glass Info Card */}
                <View style={styles.floatingCardContainer}>
                    <BlurView intensity={themeMode === 'dark' ? 40 : 80} tint={themeMode} style={styles.glassCard}>
                        <View style={styles.glassRow}>
                            <MaterialIcons name="location-on" size={14} color={colors.accent} />
                            <Text style={[styles.glassAddress, { color: colors.text }]} numberOfLines={1}>{venue.address}</Text>
                        </View>
                        <View style={styles.glassChipsRow}>
                            <Text style={[styles.glassChip, { color: colors.textSecondary }]}>★ {venue.rating || "0.0"}</Text>
                            <View style={styles.dotSeparator} />
                            <Text style={[styles.glassChip, { color: colors.textSecondary }]}>Lieu sportif</Text>
                            <View style={styles.dotSeparator} />
                            <Text style={[styles.glassChip, { color: colors.textSecondary }]}>{venue.priceLevel}</Text>
                            <View style={styles.dotSeparator} />
                            <Text style={[styles.glassChip, { color: colors.textSecondary }]}>{venue.distance}</Text>
                        </View>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusGlow, { backgroundColor: colors.accent }]} />
                            <Text style={[styles.statusText, { color: colors.accent }]}>OUVERT</Text>
                        </View>
                    </BlurView>
                </View>

                <View style={styles.contentBody}>
                    {/* Modern Actions Row */}
                    <View style={[styles.actionsRow, { backgroundColor: colors.surface }]}>
                        <TouchableOpacity 
                            style={styles.actionItem}
                            onPress={() => navigation.navigate('VenueMatches', { venueId: venue.id, venueName: venue.name })}
                        >
                            <MaterialCommunityIcons name="soccer" size={24} color={colors.accent} />
                            <Text style={[styles.actionLabel, { color: colors.text }]}>Matchs</Text>
                        </TouchableOpacity>
                        <View style={[styles.actionSeparator, { backgroundColor: colors.border }]} />
                        <TouchableOpacity style={styles.actionItem} onPress={() => handleCall('+33000000000')}>
                            <MaterialIcons name="phone" size={24} color={colors.accent} />
                            <Text style={[styles.actionLabel, { color: colors.text }]}>Appeler</Text>
                        </TouchableOpacity>
                        <View style={[styles.actionSeparator, { backgroundColor: colors.border }]} />
                        <TouchableOpacity style={styles.actionItem} onPress={openDirections}>
                            <MaterialIcons name="directions" size={24} color={colors.accent} />
                            <Text style={[styles.actionLabel, { color: colors.text }]}>Itinéraire</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Matches Preview Carousel */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ce lieu diffuse</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('VenueMatches', { venueId: venue.id, venueName: venue.name })}>
                                <Text style={[styles.ghostBtn, { color: colors.textSecondary }]}>Voir tous les matchs</Text>
                            </TouchableOpacity>
                        </View>
                        
                        {venue.matches && venue.matches.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                {venue.matches.slice(0, 4).map((match) => (
                                    <TouchableOpacity 
                                        key={match.id} 
                                        style={[styles.matchCard, { backgroundColor: colors.surface }]}
                                        onPress={() => navigation.navigate('MatchDetail', { matchId: match.id })}
                                    >
                                        <View style={styles.matchCardTop}>
                                            <MaterialCommunityIcons name="trophy-outline" size={14} color={colors.accent} />
                                            <Text style={[styles.matchLeague, { color: colors.textSecondary }]}>{match.league.toUpperCase()}</Text>
                                        </View>
                                        <View style={styles.matchTeamsRow}>
                                            <Text style={[styles.matchTeamText, { color: colors.text }]} numberOfLines={1}>{match.team1}</Text>
                                            <Text style={{ color: colors.textSecondary, fontSize: 10 }}>vs</Text>
                                            <Text style={[styles.matchTeamText, { color: colors.text }]} numberOfLines={1}>{match.team2}</Text>
                                        </View>
                                        <View style={[styles.matchTimePill, { backgroundColor: colors.background }]}>
                                            <Text style={[styles.matchTimeText, { color: colors.text }]}>{match.month} {match.date} • {match.time}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        ) : (
                            <View style={[styles.emptyMatches, { borderColor: colors.border }]}>
                                <MaterialCommunityIcons name="soccer" size={32} color={colors.textSecondary} />
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun match prévu pour l'instant.</Text>
                            </View>
                        )}
                    </View>

                    {/* Practical Info - Ultra Clean */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>Infos pratiques</Text>
                        <View style={styles.practicalInfoStack}>
                            <PracticalRow icon="schedule" label="Horaires" value="17:00 - 02:00" valueColor={colors.accent} colors={colors} />
                            <PracticalRow icon="train" label="Transports" value="Métro Parmentier (L3)" colors={colors} />
                            <PracticalRow icon="local-bar" label="Happy Hour" value="17:00 - 20:00" valueColor={colors.accent} colors={colors} />
                            <View style={styles.amenitiesRow}>
                                <MaterialIcons name="check-circle" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                                <View style={styles.amenitiesList}>
                                    {['Wi-Fi', 'Terrasse', 'Écrans HD', 'Clim'].map(item => (
                                        <View key={item} style={[styles.amenityPill, { backgroundColor: colors.surface }]}>
                                            <Text style={[styles.amenityText, { color: colors.textSecondary }]}>{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Map Banner CTA */}
                    <TouchableOpacity 
                        style={styles.mapBanner}
                        onPress={() => navigation.navigate('Map', { focusVenueId: venue.id })}
                    >
                        <Image source={{ uri: venue.image }} style={styles.mapBannerImg} contentFit="cover" />
                        <View style={styles.mapBannerOverlay}>
                            <View style={styles.mapBannerBtn}>
                                <MaterialIcons name="map" size={18} color="#fff" />
                                <Text style={styles.mapBannerBtnText}>Voir sur la carte</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Help Support */}
                    <View style={[styles.helpCard, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.helpTitle, { color: colors.text }]}>Besoin d'aide ?</Text>
                        <Text style={[styles.helpText, { color: colors.textSecondary }]}>Des questions sur ce lieu ou votre réservation ?</Text>
                        <TouchableOpacity style={[styles.contactBtn, { borderColor: colors.accent }]}>
                            <Text style={[styles.contactBtnText, { color: colors.accent }]}>Contacter le lieu</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.ScrollView>

            {/* Sticky Reservation CTA */}
            <Animated.View style={[
                styles.stickyCTAContainer, 
                { 
                    bottom: insets.bottom + 20,
                    opacity: stickyBtnOpacity,
                    transform: [{ translateY: stickyBtnTranslateY }]
                }
            ]}>
                <TouchableOpacity 
                    style={[styles.reserveBtnSticky, { backgroundColor: colors.accent }]}
                    onPress={() => navigation.navigate("ReservationsScreen", { venue })}
                >
                    <MaterialIcons name="calendar-today" size={20} color="#000" />
                    <Text style={styles.reserveBtnText}>Réserver une table</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const PracticalRow = ({ icon, label, value, valueColor, colors }: any) => (
    <View style={[styles.practicalRow, { borderBottomColor: colors.border }]}>
        <MaterialIcons name={icon} size={20} color={colors.textSecondary} />
        <Text style={[styles.practicalLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.practicalValue, { color: valueColor || colors.text }]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    heroContainer: { width: '100%', height: 340, position: 'relative' },
    heroImage: { width: '100%', height: '100%' },
    topActions: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
    compactRoundBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
    heroInfoOverlay: { position: 'absolute', bottom: 50, left: 20, right: 20 },
    livePill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
    livePillText: { fontSize: 10, fontWeight: '900', color: '#000' },
    heroTitle: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    
    floatingCardContainer: { paddingHorizontal: 20, marginTop: -40, zIndex: 20 },
    glassCard: { borderRadius: 24, padding: 16, overflow: 'hidden', borderWeight: 1, borderColor: 'rgba(255,255,255,0.1)' },
    glassRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    glassAddress: { fontSize: 14, fontWeight: '600', flex: 1 },
    glassChipsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    glassChip: { fontSize: 12, fontWeight: '500' },
    dotSeparator: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 8 },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
    statusGlow: { width: 8, height: 8, borderRadius: 4, shadowColor: '#fff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4 },
    statusText: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    
    contentBody: { paddingHorizontal: 20, marginTop: 24 },
    actionsRow: { flexDirection: 'row', height: 70, borderRadius: 20, alignItems: 'center', paddingHorizontal: 10, marginBottom: 32 },
    actionItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
    actionLabel: { fontSize: 11, fontWeight: '800' },
    actionSeparator: { width: 1, height: 30, opacity: 0.5 },
    
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
    ghostBtn: { fontSize: 13, fontWeight: '600' },
    
    matchCard: { width: 180, padding: 16, borderRadius: 24, gap: 12 },
    matchCardTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    matchLeague: { fontSize: 10, fontWeight: '800' },
    matchTeamsRow: { gap: 2 },
    matchTeamText: { fontSize: 14, fontWeight: '700' },
    matchTimePill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
    matchTimeText: { fontSize: 10, fontWeight: '700' },
    emptyMatches: { height: 120, borderRadius: 24, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 10 },
    emptyText: { fontSize: 13, fontWeight: '500' },
    
    practicalInfoStack: { gap: 0 },
    practicalRow: { flexDirection: 'row', alignItems: 'center', height: 56, borderBottomWidth: 1 },
    practicalLabel: { flex: 1, marginLeft: 16, fontSize: 14, fontWeight: '600' },
    practicalValue: { fontSize: 14, fontWeight: '700' },
    amenitiesRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
    amenitiesList: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    amenityPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    amenityText: { fontSize: 11, fontWeight: '700' },
    
    mapBanner: { height: 140, borderRadius: 24, overflow: 'hidden', position: 'relative', marginBottom: 32 },
    mapBannerImg: { width: '100%', height: '100%', opacity: 0.6 },
    mapBannerOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
    mapBannerBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20 },
    mapBannerBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
    
    helpCard: { borderRadius: 24, padding: 20, gap: 8 },
    helpTitle: { fontSize: 16, fontWeight: '800' },
    helpText: { fontSize: 13, fontWeight: '500' },
    contactBtn: { height: 48, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    contactBtnText: { fontSize: 14, fontWeight: '800' },
    
    stickyCTAContainer: { position: 'absolute', left: 20, right: 20, zIndex: 100 },
    reserveBtnSticky: { height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    reserveBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },
    
    centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
    stateText: { fontSize: 15, fontWeight: '600' },
    retryButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
});

export default VenueProfileScreen;
