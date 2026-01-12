import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ImageBackground, StatusBar, Dimensions, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { COLORS } from '../constants/colors';
import { testApi } from '../services/testApi';

const { width } = Dimensions.get('window');

type ReservationDate = {
    fullDate: Date;
    day: number;
    month: string;
    weekDay: string;
    isoDate: string;
};

const getArrivalTime = (matchTime: string) => {
    if (!matchTime) return '--:--';
    const [hours, minutes] = matchTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() - 30);
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
};

const FILTERS = [
    { label: 'Tout', icon: 'apps', selected: true },
    { label: 'Football', icon: 'sports-soccer', selected: false },
    { label: 'Basket', icon: 'sports-basketball', selected: false },
    { label: 'Rugby', icon: 'sports-rugby', selected: false },
    { label: 'Tennis', icon: 'sports-tennis', selected: false },
];

const TestReservationsScreen = ({ navigation }: { navigation: any }) => {
    const insets = useSafeAreaInsets();
    const [guests, setGuests] = useState(4);
    const [specialRequest, setSpecialRequest] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic Date & Match Logic
    // We use useMemo to ensure dates are generated once on mount
    const [dates, setDates] = useState<ReservationDate[]>([]);
    const [datesLoading, setDatesLoading] = useState(true);
    const [datesError, setDatesError] = useState<string | null>(null);
    const [selectedDateIso, setSelectedDateIso] = useState<string | null>(null);

    const [availableMatches, setAvailableMatches] = useState<any[]>([]);
    const [matchesLoading, setMatchesLoading] = useState(false);
    const [matchesError, setMatchesError] = useState<string | null>(null);
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

    const selectedMatch = useMemo(
        () => availableMatches.find(m => m.id === selectedMatchId),
        [availableMatches, selectedMatchId]
    );
    const selectedDate = useMemo(
        () => dates.find((date) => date.isoDate === selectedDateIso),
        [dates, selectedDateIso]
    );

    const arrivalTime = useMemo(() =>
        selectedMatch ? getArrivalTime(selectedMatch.time) : '--:--',
        [selectedMatch]
    );

    const loadMatchesForDate = useCallback(async (dateIso: string) => {
        setMatchesError(null);
        setMatchesLoading(true);
        try {
            const data = await testApi.fetchMatchesForDate(dateIso);
            setAvailableMatches(data);
        } catch (error) {
            console.warn('Failed to load matches', error);
            setMatchesError("Impossible de charger les matchs pour cette date.");
            setAvailableMatches([]);
        } finally {
            setMatchesLoading(false);
        }
    }, []);

    const loadDates = useCallback(async () => {
        setDatesError(null);
        setDatesLoading(true);
        try {
            const fetchedDates = await testApi.fetchReservationDates();
            setDates(fetchedDates);
            setSelectedDateIso(fetchedDates[0]?.isoDate ?? null);
        } catch (error) {
            console.warn('Failed to load reservation dates', error);
            setDatesError("Impossible de charger les dates disponibles.");
        } finally {
            setDatesLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDates();
    }, [loadDates]);

    useEffect(() => {
        if (!selectedDateIso) {
            setAvailableMatches([]);
            return;
        }
        setSelectedMatchId(null);
        loadMatchesForDate(selectedDateIso);
    }, [selectedDateIso, loadMatchesForDate]);

    const handleBack = () => navigation.goBack();
    const incrementGuests = () => setGuests(prev => prev + 1);
    const decrementGuests = () => setGuests(prev => Math.max(1, prev - 1));

    const toggleMatchSelection = (id: string) => {
        setSelectedMatchId(prev => prev === id ? null : id);
    };

    const handleRetryDates = () => {
        loadDates();
    };

    const handleRetryMatches = () => {
        if (selectedDateIso) {
            loadMatchesForDate(selectedDateIso);
        }
    };

    const handleConfirmReservation = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const dateLabel = selectedDate ? `${selectedDate.weekDay} ${selectedDate.day} ${selectedDate.month}` : selectedDateIso;
        const reference = `#BK-${selectedDateIso?.split("-").join("").slice(-4)}-${(Math.random() * 900 + 100).toFixed(0)}`;

        setTimeout(() => {
            setIsSubmitting(false);
            navigation.navigate("TestReservationSuccess", {
                venueName: selectedMatch ? `${selectedMatch.team1} vs ${selectedMatch.team2}` : "THE KOP BAR",
                address: "12 Rue de la Soif, Paris",
                dateLabel,
                time: selectedMatch?.time ?? "--:--",
                guestsLabel: `${guests} ${guests > 1 ? "personnes" : "personne"}`,
                reference,
                image: selectedMatch?.bgImage,
            });
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top, height: 60 + insets.top }]}>
                <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Réserver une table</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Date Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Date</Text>
                        <TouchableOpacity style={styles.seeMoreButton} onPress={handleRetryDates}>
                            <Text style={styles.seeMoreText}>Rafraîchir</Text>
                            <MaterialIcons name="refresh" size={14} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    {datesLoading ? (
                        <View style={styles.stateWrapper}>
                            <ActivityIndicator color={COLORS.primary} />
                            <Text style={styles.stateText}>Chargement des dates...</Text>
                        </View>
                    ) : datesError ? (
                        <View style={styles.stateWrapper}>
                            <Text style={styles.stateText}>{datesError}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={handleRetryDates}>
                                <MaterialIcons name="refresh" size={18} color={COLORS.white} />
                                <Text style={styles.retryButtonText}>Réessayer</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
                            {dates.map((date, index) => {
                                const isSelected = date.isoDate === selectedDateIso;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.dateCard, isSelected ? styles.dateCardSelected : styles.dateCardUnselected]}
                                        onPress={() => setSelectedDateIso(date.isoDate)}
                                    >
                                        <Text style={[styles.dateMonth, isSelected ? styles.textWhite : styles.textSecondary]}>{date.month}</Text>
                                        <Text style={[styles.dateDay, isSelected ? styles.textWhite : styles.textWhite]}>{date.day}</Text>
                                        <Text style={[styles.dateWeekDay, isSelected ? styles.textWhite : styles.textSecondary]}>{date.weekDay}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}

                    {/* Filter Pills */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {FILTERS.map((filter, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.filterChip, filter.selected ? styles.filterChipSelected : styles.filterChipUnselected]}
                            >
                                <MaterialIcons
                                    name={filter.icon as any}
                                    size={18}
                                    color={filter.selected ? COLORS.white : COLORS.textSecondary}
                                />
                                <Text style={[styles.filterText, filter.selected ? styles.textWhite : styles.textSecondary]}>{filter.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                                        </View>

                {/* Matchs Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Matchs diffusés</Text>
                    {matchesLoading ? (
                        <View style={styles.stateWrapper}>
                            <ActivityIndicator color={COLORS.primary} />
                            <Text style={styles.stateText}>Chargement des matchs...</Text>
                        </View>
                    ) : matchesError ? (
                        <View style={styles.stateWrapper}>
                            <Text style={styles.stateText}>{matchesError}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={handleRetryMatches}>
                                <MaterialIcons name="refresh" size={18} color={COLORS.white} />
                                <Text style={styles.retryButtonText}>Réessayer</Text>
                            </TouchableOpacity>
                        </View>
                    ) : availableMatches.length === 0 ? (
                        <Text style={styles.stateText}>Aucun match prévu pour cette date.</Text>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matchScroll} snapToInterval={296} snapToAlignment="start" decelerationRate="fast">
                            {availableMatches.map((match) => {
                                const isSelected = match.id === selectedMatchId;
                                return (
                                    <TouchableOpacity
                                        key={match.id}
                                        style={[styles.matchCard, isSelected ? styles.matchCardSelected : styles.matchCardUnselected]}
                                        onPress={() => toggleMatchSelection(match.id)}
                                    >
                                        <ImageBackground source={{ uri: match.bgImage }} style={styles.matchImage} imageStyle={{ borderRadius: 12 }}>
                                            <LinearGradient
                                                colors={['transparent', 'rgba(0,0,0,0.8)']}
                                                style={styles.matchGradient}
                                            />
                                            <View style={styles.matchContent}>
                                                <View style={styles.matchLeagueContainer}>
                                                    <Text style={styles.matchLeague}>{match.league}</Text>
                                                </View>
                                                <Text style={styles.matchTeams}>{match.team1} vs {match.team2}</Text>
                                            </View>
                                            <View style={styles.matchTimeBadge}>
                                                <Text style={styles.matchTimeText}>{match.time}</Text>
                                            </View>
                                        </ImageBackground>

                                        <View style={[styles.matchFooter, isSelected ? styles.matchFooterSelected : styles.matchFooterUnselected]}>
                                            <View style={styles.matchStatusRow}>
                                                <MaterialIcons
                                                    name={isSelected ? "check-circle" : "sports-soccer"}
                                                    size={18}
                                                    color={isSelected ? COLORS.primary : COLORS.textSecondary}
                                                />
                                                <Text style={[styles.matchStatusText, isSelected ? { color: COLORS.primary } : { color: COLORS.textSecondary }]}>
                                                    {isSelected ? "Sélectionné" : "Réserver"}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>

                {/* Arrival Time */}
                <View style={styles.section}>
                    <View style={styles.arrivalCard}>
                        <View style={styles.arrivalInfo}>
                            <View style={styles.arrivalIconBox}>
                                <MaterialIcons name="access-time" size={20} color={COLORS.primary} />
                            </View>
                            <View>
                                <Text style={styles.arrivalLabel}>Heure d'arrivée</Text>
                                <Text style={styles.arrivalSubLabel}>30 min avant le match</Text>
                            </View>
                        </View>
                        <Text style={styles.arrivalTime}>{arrivalTime}</Text>
                    </View>
                </View>

                {/* Guest Counter */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nombre d'invités</Text>
                    <View style={styles.guestCard}>
                        <View>
                            <Text style={styles.guestLabel}>Personnes</Text>
                            <Text style={styles.guestSubLabel}>Table standard</Text>
                        </View>
                        <View style={styles.counterContainer}>
                            <TouchableOpacity style={styles.counterButton} onPress={decrementGuests}>
                                <MaterialIcons name="remove" size={20} color={COLORS.white} />
                                </TouchableOpacity>
                            <Text style={styles.guestCount}>{guests}</Text>
                            <TouchableOpacity style={styles.counterButton} onPress={incrementGuests}>
                                <MaterialIcons name="add" size={20} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                {/* Info Note */}
                <View style={styles.infoNote}>
                    <MaterialIcons name="info" size={20} color={COLORS.primary} style={{ marginTop: 2 }} />
                    <Text style={styles.infoNoteText}>
                        <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>Note: </Text>
                        Pour les groupes de plus de 8 personnes, un dépôt de garantie de 10€ par personne est requis.
                    </Text>
                </View>

                {/* Special Request */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Demande spéciale</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Ex: Une table près de l'écran, accès PMR..."
                        placeholderTextColor={COLORS.textMuted}
                        multiline
                        textAlignVertical="top"
                        value={specialRequest}
                        onChangeText={setSpecialRequest}
                    />
                </View>

            </ScrollView>

            {/* Bottom Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                <TouchableOpacity
                    style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]}
                    onPress={handleConfirmReservation}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                >
                    {isSubmitting ? (
                        <View style={styles.confirmLoadingRow}>
                            <ActivityIndicator color={COLORS.white} />
                            <Text style={styles.confirmButtonText}>Confirmation...</Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.confirmButtonText}>Confirmer la réservation</Text>
                            <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: COLORS.background,
        zIndex: 10,
    },
    headerButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 12,
    },
    seeMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    seeMoreText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },

    // Dates
    dateScroll: {
        gap: 12,
        paddingBottom: 4,
    },
    dateCard: {
        width: 72,
        height: 84,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    dateCardSelected: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    confirmButtonDisabled: {
        opacity: 0.7,
    },
    confirmLoadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dateCardUnselected: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    dateMonth: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    dateDay: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    dateWeekDay: {
        fontSize: 12,
        fontWeight: '500',
    },
    textWhite: { color: COLORS.white },
    textSecondary: { color: COLORS.textSecondary },

    // Filters
    filterScroll: {
        gap: 12,
        marginTop: 16,
        paddingVertical: 4,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 99,
    },
    filterChipSelected: {
        backgroundColor: COLORS.primary,
    },
    filterChipUnselected: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
    },

    // Matches
    matchScroll: {
        gap: 16,
        paddingRight: 16,
    },
    matchCard: {
        width: 280,
        borderRadius: 16,
        backgroundColor: COLORS.surface,
        overflow: 'hidden',
    },
    matchCardSelected: {
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    matchCardUnselected: {
        borderWidth: 1,
        borderColor: COLORS.border,
        opacity: 0.9,
    },
    matchImage: {
        height: 128,
        width: '100%',
        justifyContent: 'space-between',
        padding: 12,
    },
    matchGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
        borderRadius: 12,
    },
    matchContent: {
        justifyContent: 'flex-end',
        flex: 1,
    },
    matchLeagueContainer: {
        marginBottom: 4,
    },
    matchLeague: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        opacity: 0.9,
    },
    matchTeams: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    matchTimeBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    matchTimeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    matchFooter: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    matchFooterSelected: {
        backgroundColor: 'rgba(244, 123, 37, 0.12)',
    },
    matchFooterUnselected: {
        backgroundColor: 'transparent',
    },
    matchStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    matchStatusText: {
        fontSize: 14,
        fontWeight: '600',
    },

    // Arrival
    arrivalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(244, 123, 37, 0.3)', // Slight orange tint border
    },
    arrivalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    arrivalIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(244, 123, 37, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrivalLabel: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    arrivalSubLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    arrivalTime: {
        color: COLORS.primary,
        fontSize: 20,
        fontWeight: 'bold',
    },

    // Guests
    guestCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    guestLabel: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '500',
    },
    guestSubLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    counterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    guestCount: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: 'bold',
        width: 24,
        textAlign: 'center',
    },

    // Note
    infoNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: COLORS.surfaceAlt,
        borderWidth: 1,
        borderColor: 'rgba(244, 123, 37, 0.25)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    infoNoteText: {
        flex: 1,
        color: COLORS.textSecondary,
        fontSize: 12,
        lineHeight: 18,
    },

    // Input
    textArea: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
        height: 100,
        color: COLORS.white,
        fontSize: 14,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(11, 11, 15, 0.95)',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        padding: 16,
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
        width: '100%',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    confirmButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    stateWrapper: {
        width: '100%',
        minHeight: 120,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.divider,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 12,
    },
    stateText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: 'center',
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: COLORS.primary,
    },
    retryButtonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 13,
    },
});

export default TestReservationsScreen;
