import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, ImageBackground, StatusBar, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { testApi, Venue, VenueMatch } from '../services/testApi';

const { width } = Dimensions.get('window');

const TestVenueProfileScreen = ({ navigation, route }: { navigation: any; route: any }) => {
    const insets = useSafeAreaInsets();
    const venueId: string | undefined = route?.params?.venueId;
    const [venue, setVenue] = useState<Venue | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadVenue = useCallback(async () => {
        try {
            setError(null);
            setIsLoading(true);
            const data = venueId ? await testApi.fetchVenueById(venueId) : null;
            setVenue(data ?? null);
        } catch (err) {
            console.warn('Failed to load venue', err);
            setError("Impossible de charger les informations de ce bar.");
        } finally {
            setIsLoading(false);
        }
    }, [venueId]);

    useEffect(() => {
        loadVenue();
    }, [loadVenue]);

    const handleBack = () => {
        navigation.goBack();
    };

    const renderRatingLabel = useMemo(() => {
        if (!venue) return null;
        return `${venue.rating.toFixed(1)} (${venue.tags.length * 40 + 40} avis)`;
    }, [venue]);

    const renderMatchCard = (match: VenueMatch) => (
        <View key={match.id} style={styles.matchCard}>
            <View style={styles.matchCardLeft}>
                <View style={styles.matchTeams}>
                    <View style={styles.teamLogo}>
                        <Text style={styles.teamLogoText}>{match.team1.slice(0, 3).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.vsText}>VS</Text>
                    <View style={styles.teamLogo}>
                        <Text style={styles.teamLogoText}>{match.team2.slice(0, 3).toUpperCase()}</Text>
                    </View>
                </View>
                <View style={styles.matchDetails}>
                    <Text style={styles.leagueText}>{match.league.toUpperCase()}</Text>
                    <Text style={styles.matchName}>{match.team1} vs {match.team2}</Text>
                    <Text style={styles.stadiumText}>{venue?.name}</Text>
                </View>
            </View>
            <View style={styles.matchCardRight}>
                <Text style={styles.matchTime}>{match.time}</Text>
                <Text style={styles.tomorrowText}>{match.month} {match.date}</Text>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centerState]}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={styles.stateText}>Chargement du bar...</Text>
            </View>
        );
    }

    if (error || !venue) {
        return (
            <View style={[styles.container, styles.centerState]}>
                <Text style={styles.stateText}>{error ?? "Ce bar n'est pas disponible."}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadVenue} activeOpacity={0.85}>
                    <MaterialIcons name="refresh" size={18} color={COLORS.white} />
                    <Text style={styles.retryButtonText}>Réessayer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.retryButton, { marginTop: 12, backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.primary }]}
                    onPress={handleBack}
                    activeOpacity={0.85}
                >
                    <MaterialIcons name="arrow-back" size={18} color={COLORS.primary} />
                    <Text style={[styles.retryButtonText, { color: COLORS.primary }]}>Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 180 }}>
                {/* Header Image Section */}
                <View style={styles.imageContainer}>
                    <ImageBackground
                        source={{ uri: venue.image }}
                        style={styles.headerImage}
                    >
                        <LinearGradient
                            colors={['rgba(0,0,0,0.2)', 'transparent', '#050505']}
                            style={styles.imageGradient}
                        />
                        <TouchableOpacity style={[styles.backButton, { top: insets.top + 16 }]} onPress={handleBack}>
                            <BlurView intensity={30} tint="dark" style={styles.backButtonBlur}>
                                <MaterialIcons name="arrow-back-ios" size={20} color={COLORS.white} style={{ marginLeft: 6 }} />
                            </BlurView>
                        </TouchableOpacity>
                    </ImageBackground>
                </View>

                {/* Venue Title & Info */}
                <View style={styles.contentContainer}>
                    <View style={styles.headerInfo}>
                        <Text style={styles.venueTitle}>{venue.name}</Text>
                        <View style={styles.venueAddressRow}>
                            <MaterialIcons name="location-on" size={16} color={COLORS.primary} />
                            <Text style={styles.venueAddress}>{venue.address}</Text>
                        </View>
                    </View>

                    {/* Chips Row */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsContainer}>
                        <View style={styles.chip}>
                            <Text style={styles.chipText}>{venue.priceLevel}</Text>
                        </View>
                        {venue.tags.slice(0, 2).map((tag) => (
                            <View key={tag} style={styles.chip}>
                                <MaterialIcons name="local-fire-department" size={16} color={COLORS.primary} />
                                <Text style={styles.chipText}>{tag}</Text>
                            </View>
                        ))}
                        <View style={styles.chip}>
                            <MaterialIcons name="star" size={16} color={COLORS.primary} />
                            <Text style={styles.chipText}>{renderRatingLabel}</Text>
                        </View>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.actionButton}>
                            <MaterialIcons name="sports-soccer" size={20} color={COLORS.white} />
                            <Text style={styles.actionButtonText}>Voir les matchs</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <MaterialIcons name="rate-review" size={20} color={COLORS.white} />
                            <Text style={styles.actionButtonText}>Voir les avis</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* Matchs Recommandés */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Matchs recommandés</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>Voir tout</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.matchesContainer}>
                        {venue.matches.length > 0 ? (
                            venue.matches.map(renderMatchCard)
                        ) : (
                            <Text style={styles.stateText}>Aucun match n'est programmé pour ce bar.</Text>
                        )}
                    </View>

                    {/* Informations Pratiques */}
                    <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>Informations Pratiques</Text>
                    <View style={styles.infoContainer}>
                        <InfoRow icon="schedule" title="Heures d'ouverture" subtitle="17:00 - 02:00 (Tous les jours)" />
                        <InfoRow icon="train" title="Transports" subtitle="Métro Parmentier (Ligne 3)" />
                        <InfoRow icon="local-drink" title="Happy Hour" subtitle="17h - 20h sur toutes les pintes" iconColor={COLORS.primary} highlighted />
                        <InfoRow icon="wifi" title="Équipements" subtitle="Wi-Fi gratuit, Climatisation" />
                    </View>

                    {/* Map Preview */}
                    <View style={styles.mapPreviewContainer}>
                        <ImageBackground
                            source={{ uri: venue.image }}
                            style={styles.mapImage}
                        >
                            <View style={styles.mapOverlay}>
                                <TouchableOpacity style={styles.viewMapButton}>
                                    <MaterialIcons name="map" size={18} color={COLORS.white} />
                                    <Text style={styles.viewMapText}>Voir sur la carte</Text>
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                    </View>

                    {/* Reserve Button - REMOVED FROM SCROLLVIEW */}
                </View>
            </ScrollView>

            {/* Floating Reserve Button */}
            <TouchableOpacity
                style={[
                    styles.floatingReserveButton,
                    {
                        bottom: insets.bottom + 32,
                        left: 20,
                        right: 20
                    }
                ]}
                onPress={() => navigation.navigate("TestReservationsScreen")}
            >
                <MaterialIcons name="calendar-today" size={20} color={COLORS.white} />
                <Text style={styles.reserveButtonText}>Réserver une table</Text>
            </TouchableOpacity>

        </View>
    );
};

const InfoRow = ({ icon, title, subtitle, iconColor, highlighted }: any) => (
    <View style={styles.infoRow}>
        <View style={[styles.iconBox, highlighted && { backgroundColor: 'rgba(244, 123, 37, 0.1)', borderColor: 'rgba(244, 123, 37, 0.2)' }]}>
            <MaterialIcons name={icon} size={20} color={iconColor || COLORS.textSecondary} />
        </View>
        <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>{title}</Text>
            <Text style={[styles.infoSubtitle, highlighted && { color: COLORS.primary }]}>{subtitle}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    centerState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 16,
    },
    stateText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
    scrollView: {
        flex: 1,
    },
    imageContainer: {
        width: '100%',
        height: 320,
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    imageGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
    },
    backButton: {
        position: 'absolute',
        left: 16,
        zIndex: 10,
    },
    backButtonBlur: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    contentContainer: {
        paddingHorizontal: 20,
        marginTop: -32,
    },
    headerInfo: {
        marginBottom: 24,
    },
    venueTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.white,
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    venueAddressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 6,
    },
    venueAddress: {
        color: '#D1D5DB', // Gray 300
        fontSize: 14,
    },
    chipsScroll: {
        marginBottom: 24,
    },
    chipsContainer: {
        gap: 10,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.surfaceGlass,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    chipText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '500',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    actionButton: {
        flex: 1,
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: COLORS.surfaceGlass,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    actionButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    seeAllText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    matchesContainer: {
        gap: 16,
    },
    matchCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surfaceGlass,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        padding: 16,
    },
    matchCardLeft: {
        flex: 1,
        flexDirection: 'row',
        gap: 16,
    },
    matchTeams: {
        alignItems: 'center',
        gap: 4,
        width: 48,
    },
    teamLogo: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    teamLogoText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    vsText: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: '600',
    },
    matchDetails: {
        justifyContent: 'center',
    },
    leagueText: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
        letterSpacing: 1,
    },
    matchName: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    stadiumText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 4,
    },
    matchCardRight: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(255,255,255,0.1)',
        paddingLeft: 16,
    },
    matchTime: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    liveBadge: {
        marginTop: 4,
        backgroundColor: 'rgba(244, 123, 37, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(244, 123, 37, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 99,
    },
    liveBadgeText: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: 'bold',
    },
    tomorrowText: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    infoContainer: {
        backgroundColor: COLORS.surfaceGlass,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        gap: 24,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    infoTitle: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    infoSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: 4,
    },
    mapPreviewContainer: {
        marginTop: 32,
        marginBottom: 24,
        height: 160,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    mapImage: {
        width: '100%',
        height: '100%',
    },
    mapOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewMapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',

    },
    viewMapText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    reserveButton: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: 'rgb(124, 45, 18)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    reserveButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: COLORS.primary,
    },
    retryButtonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 13,
    },

    floatingReserveButton: {
        position: 'absolute',
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: 'rgb(124, 45, 18)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
        zIndex: 20, // Ensure it sits above scroll content but below nav (nav is zIndex ?) Nav needs high zIndex
    },
});

export default TestVenueProfileScreen;
