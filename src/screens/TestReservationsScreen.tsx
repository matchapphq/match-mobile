import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ImageBackground,
    StatusBar,
    Dimensions,
    ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useStore } from "../store/useStore";
import { apiService, MatchVenue } from "../services/api";
import type { Match } from "../types";

const { width } = Dimensions.get("window");

type ReservationDate = {
    fullDate: Date;
    day: number;
    month: string;
    weekDay: string;
    isoDate: string;
};

type EnrichedMatch = {
    id: string;
    league?: string;
    team1: string;
    team2: string;
    time: string;
    bgImage?: string;
    venueMatchId: string;
    venueName: string;
    venueAddress?: string;
    dateIso: string;
};

const getArrivalTime = (matchTime: string) => {
    if (!matchTime) return "--:--";
    const [hours, minutes] = matchTime.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() - 30);
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
};

const toIsoDate = (date: Date) => date.toISOString().split("T")[0];

const weekDays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const months = ["JAN", "FEV", "MAR", "AVR", "MAI", "JUIN", "JUIL", "AOUT", "SEPT", "OCT", "NOV", "DEC"];

const buildReservationDate = (date: Date): ReservationDate => {
    return {
        fullDate: date,
        day: date.getDate(),
        month: months[date.getMonth()],
        weekDay: weekDays[date.getDay()],
        isoDate: toIsoDate(date),
    };
};

const formatFullDateLabel = (reservationDate?: ReservationDate) => {
    if (!reservationDate) return "";
    return `${reservationDate.weekDay} ${reservationDate.day} ${reservationDate.month}`;
};

const formatVenueAddress = (venue?: MatchVenue["venue"]) => {
    if (!venue) return undefined;
    const parts = [venue.street_address, venue.city].filter(Boolean);
    return parts.join(", ");
};

const extractErrorMessage = (error: any) => {
    const apiError = error?.response?.data?.error;
    if (typeof apiError === "string") return apiError;
    if (error?.message) return error.message;
    return "Impossible de confirmer la réservation.";
};

const FILTERS = [
    { label: "Tout", icon: "apps", selected: true },
    { label: "Football", icon: "sports-soccer", selected: false },
    { label: "Basket", icon: "sports-basketball", selected: false },
    { label: "Rugby", icon: "sports-rugby", selected: false },
    { label: "Tennis", icon: "sports-tennis", selected: false },
];

const TestReservationsScreen = ({ navigation, route }: { navigation: any; route: any }) => {
    const { colors, themeMode } = useStore();
    const insets = useSafeAreaInsets();
    const [guests, setGuests] = useState(4);
    const [specialRequest, setSpecialRequest] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reservationError, setReservationError] = useState<string | null>(null);

    const [dates, setDates] = useState<ReservationDate[]>([]);
    const [datesLoading, setDatesLoading] = useState(true);
    const [datesError, setDatesError] = useState<string | null>(null);

    const preselectedDateIsoFromRoute = route.params?.matchDateIso || route.params?.match?.dateIso || null;
    const [selectedDateIso, setSelectedDateIso] = useState<string | null>(preselectedDateIsoFromRoute);

    const [availableMatches, setAvailableMatches] = useState<EnrichedMatch[]>([]);
    const [matchesLoading, setMatchesLoading] = useState(false);
    const [matchesError, setMatchesError] = useState<string | null>(null);
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

    const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
    const venuesCache = useRef<Map<string, MatchVenue[]>>(new Map());

    const preselectedVenue = route.params?.venue;
    const preselectedMatchIdFromRoute = route.params?.matchId;

    const selectedMatch = useMemo(
        () => availableMatches.find((m) => m.id === selectedMatchId),
        [availableMatches, selectedMatchId],
    );
    const selectedDate = useMemo(() => dates.find((date) => date.isoDate === selectedDateIso), [dates, selectedDateIso]);

    const arrivalTime = useMemo(() => (selectedMatch ? getArrivalTime(selectedMatch.time) : "--:--"), [selectedMatch]);

    const fetchMatchVenues = useCallback(
        async (matchId: string): Promise<MatchVenue[]> => {
            if (venuesCache.current.has(matchId)) {
                return venuesCache.current.get(matchId)!;
            }
            const venues = await apiService.getMatchVenues(matchId);
            venuesCache.current.set(matchId, venues);
            return venues;
        },
        [],
    );

    const loadMatchesForDate = useCallback(
        async (dateIso: string) => {
            setMatchesError(null);
            setMatchesLoading(true);
            try {
                const matchesForDate = upcomingMatches.filter((match) => toIsoDate(match.date) === dateIso);
                if (matchesForDate.length === 0) {
                    setAvailableMatches([]);
                    if (!preselectedMatchIdFromRoute) { // Only reset if not preselected
                        setSelectedMatchId(null);
                    }
                    return;
                }

                const enriched = await Promise.all(
                    matchesForDate.map(async (match) => {
                        try {
                            const venues = await fetchMatchVenues(match.id);
                            let venue = venues.find((v) => v.allowsReservations && v.availableCapacity > 0) ?? venues[0];

                            // If preselectedVenue exists, try to find a matching venue
                            if (preselectedVenue) {
                                const matchedVenue = venues.find(v => v.venue.id === preselectedVenue.id);
                                if (matchedVenue) {
                                    venue = matchedVenue;
                                }
                            }

                            if (!venue) return null;
                            return {
                                id: match.id,
                                league: match.competition ?? "Match",
                                team1: match.homeTeam,
                                team2: match.awayTeam,
                                time: match.time,
                                bgImage: match.thumbnail,
                                venueMatchId: venue.venueMatchId,
                                venueName: venue.venue?.name ?? "Venue",
                                venueAddress: formatVenueAddress(venue.venue),
                                dateIso,
                            };
                        } catch (error) {
                            console.warn("Failed to load venues for match", match.id, error);
                            return null;
                        }
                    }),
                );

                const filtered = enriched.filter(Boolean) as EnrichedMatch[];
                setAvailableMatches(filtered);
                // If there's a preselectedMatchIdFromRoute, and it's still in the filtered list, keep it selected
                // Otherwise, reset selectedMatchId only if the current selectedMatchId is not in the filtered list
                if (preselectedMatchIdFromRoute && filtered.some(m => m.id === preselectedMatchIdFromRoute)) {
                    setSelectedMatchId(preselectedMatchIdFromRoute);
                } else if (selectedMatchId && !filtered.some((match) => match.id === selectedMatchId)) {
                    setSelectedMatchId(null);
                } else if (!selectedMatchId && filtered.length > 0) { // Automatically select first match if none is selected
                    setSelectedMatchId(filtered[0].id);
                }
            } catch (error) {
                console.warn("Failed to load matches", error);
                setMatchesError("Impossible de charger les matchs pour cette date.");
                setAvailableMatches([]);
            } finally {
                setMatchesLoading(false);
            }
        },
        [fetchMatchVenues, upcomingMatches, preselectedVenue, preselectedMatchIdFromRoute, selectedMatchId],
    );

    const loadUpcomingMatches = useCallback(async () => {
        setDatesError(null);
        setDatesLoading(true);
        try {
            const results = await apiService.getUpcomingMatches();
            const sorted = [...results].sort((a, b) => a.date.getTime() - b.date.getTime());
            setUpcomingMatches(sorted);

            const uniqueDates = Array.from(
                new Map(sorted.map((match) => [toIsoDate(match.date), buildReservationDate(match.date)])).values(),
            );
            setDates(uniqueDates);

            let initialDate = preselectedDateIsoFromRoute || uniqueDates[0]?.isoDate || null;
            let initialMatchId = null;

            if (preselectedMatchIdFromRoute) {
                const preselectedMatch = sorted.find(match => match.id === preselectedMatchIdFromRoute);
                if (preselectedMatch) {
                    initialDate = toIsoDate(preselectedMatch.date);
                    initialMatchId = preselectedMatchIdFromRoute;
                }
            }

            setSelectedDateIso(initialDate);
            setSelectedMatchId(initialMatchId); // Set the preselected match ID here
        } catch (error) {
            console.warn("Failed to load reservation dates", error);
            setDates([]);
            setUpcomingMatches([]);
            setDatesError("Impossible de charger les dates disponibles.");
            setSelectedDateIso(null);
            setSelectedMatchId(null);
        } finally {
            setDatesLoading(false);
        }
    }, [preselectedDateIsoFromRoute, preselectedMatchIdFromRoute]);

    useEffect(() => {
        loadUpcomingMatches();
    }, [loadUpcomingMatches]);

    useEffect(() => {
        if (!selectedDateIso) {
            setAvailableMatches([]);
            setSelectedMatchId(null);
            return;
        }
        loadMatchesForDate(selectedDateIso);
    }, [loadMatchesForDate, selectedDateIso]);

    const handleBack = () => navigation.goBack();
    const incrementGuests = () => setGuests((prev) => prev + 1);
    const decrementGuests = () => setGuests((prev) => Math.max(1, prev - 1));

    const toggleMatchSelection = (id: string) => {
        setSelectedMatchId((prev) => (prev === id ? null : id));
    };

    const handleRetryDates = () => {
        loadUpcomingMatches();
    };

    const handleRetryMatches = () => {
        if (selectedDateIso) {
            loadMatchesForDate(selectedDateIso);
        }
    };

    const handleConfirmReservation = useCallback(async () => {
        if (isSubmitting || !selectedMatch) return;
        setReservationError(null);
        setIsSubmitting(true);
        try {
            const response = await apiService.createReservation({
                venueMatchId: selectedMatch.venueMatchId,
                partySize: guests,
                specialRequests: specialRequest.trim() ? specialRequest.trim() : undefined,
            });

            const dateLabel = formatFullDateLabel(selectedDate) || selectedMatch.dateIso;
            const reference = response.reservation?.id || `#BK-${Date.now()}`;

            setIsSubmitting(false);
            navigation.navigate("TestReservationSuccess", {
                venueName: selectedMatch.venueName,
                address: selectedMatch.venueAddress,
                dateLabel,
                time: selectedMatch.time,
                guestsLabel: `${guests} ${guests > 1 ? "personnes" : "personne"}`,
                reference,
                image: selectedMatch.bgImage,
            });
        } catch (error) {
            setIsSubmitting(false);
            setReservationError(extractErrorMessage(error));
        }
    }, [guests, isSubmitting, navigation, selectedDate, selectedMatch, specialRequest]);

    const confirmDisabled = !selectedMatch || isSubmitting;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top, height: 60 + insets.top, backgroundColor: colors.background }]}>
                <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Réserver une table</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Date Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Date</Text>
                        <TouchableOpacity style={styles.seeMoreButton} onPress={handleRetryDates}>
                            <Text style={[styles.seeMoreText, { color: colors.primary }]}>Rafraîchir</Text>
                            <MaterialIcons name="refresh" size={14} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {datesLoading ? (
                        <View style={styles.stateWrapper}>
                            <ActivityIndicator color={colors.primary} />
                            <Text style={[styles.stateText, { color: colors.textSecondary }]}>Chargement des dates...</Text>
                        </View>
                    ) : datesError ? (
                        <View style={styles.stateWrapper}>
                            <Text style={[styles.stateText, { color: colors.textSecondary }]}>{datesError}</Text>
                            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={handleRetryDates}>
                                <MaterialIcons name="refresh" size={18} color={colors.white} />
                                <Text style={[styles.retryButtonText, { color: colors.white }]}>Réessayer</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
                            {dates.map((date, index) => {
                                const isSelected = date.isoDate === selectedDateIso;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.dateCard,
                                            isSelected
                                                ? { backgroundColor: colors.primary, shadowColor: colors.primary, ...styles.dateCardSelected }
                                                : { backgroundColor: colors.surface, borderColor: colors.border }
                                        ]}
                                        onPress={() => setSelectedDateIso(date.isoDate)}
                                    >
                                        <Text style={[styles.dateMonth, isSelected ? { color: colors.white } : { color: colors.textSecondary }]}>{date.month}</Text>
                                        <Text style={[styles.dateDay, isSelected ? { color: colors.white } : { color: colors.text }]}>{date.day}</Text>
                                        <Text style={[styles.dateWeekDay, isSelected ? { color: colors.white } : { color: colors.textSecondary }]}>{date.weekDay}</Text>
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
                                style={[
                                    styles.filterChip,
                                    filter.selected
                                        ? { backgroundColor: colors.primary, borderColor: colors.primary, borderWidth: 0 }
                                        : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }
                                ]}
                            >
                                <MaterialIcons
                                    name={filter.icon as any}
                                    size={18}
                                    color={filter.selected ? colors.white : colors.textSecondary}
                                />
                                <Text style={[styles.filterText, filter.selected ? { color: colors.white } : { color: colors.textSecondary }]}>{filter.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Matchs Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { marginBottom: 12, color: colors.text }]}>Matchs diffusés</Text>
                    {matchesLoading ? (
                        <View style={styles.stateWrapper}>
                            <ActivityIndicator color={colors.primary} />
                            <Text style={[styles.stateText, { color: colors.textSecondary }]}>Chargement des matchs...</Text>
                        </View>
                    ) : matchesError ? (
                        <View style={styles.stateWrapper}>
                            <Text style={[styles.stateText, { color: colors.textSecondary }]}>{matchesError}</Text>
                            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={handleRetryMatches}>
                                <MaterialIcons name="refresh" size={18} color={colors.white} />
                                <Text style={[styles.retryButtonText, { color: colors.white }]}>Réessayer</Text>
                            </TouchableOpacity>
                        </View>
                    ) : availableMatches.length === 0 ? (
                        <Text style={[styles.stateText, { color: colors.textSecondary }]}>Aucun match prévu pour cette date.</Text>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matchScroll} snapToInterval={296} snapToAlignment="start" decelerationRate="fast">
                            {availableMatches.map((match) => {
                                const isSelected = match.id === selectedMatchId;
                                return (
                                    <TouchableOpacity
                                        key={match.id}
                                        style={[
                                            styles.matchCard,
                                            { backgroundColor: colors.surface },
                                            isSelected ? { borderColor: colors.primary, borderWidth: 2 } : { borderColor: colors.border, borderWidth: 1, opacity: 0.9 }
                                        ]}
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
                                            <View style={[styles.matchTimeBadge, { backgroundColor: colors.primary }]}>
                                                <Text style={styles.matchTimeText}>{match.time}</Text>
                                            </View>
                                        </ImageBackground>

                                        <View style={[styles.matchFooter, isSelected ? { backgroundColor: 'rgba(244, 123, 37, 0.12)' } : { backgroundColor: 'transparent' }]}>
                                            <View style={styles.matchStatusRow}>
                                                <MaterialIcons
                                                    name={isSelected ? "check-circle" : "sports-soccer"}
                                                    size={18}
                                                    color={isSelected ? colors.primary : colors.textSecondary}
                                                />
                                                <Text style={[styles.matchStatusText, isSelected ? { color: colors.primary } : { color: colors.textSecondary }]}>
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
                    <View style={[styles.arrivalCard, { backgroundColor: colors.surface, borderColor: 'rgba(244, 123, 37, 0.3)' }]}>
                        <View style={styles.arrivalInfo}>
                            <View style={styles.arrivalIconBox}>
                                <MaterialIcons name="access-time" size={20} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.arrivalLabel, { color: colors.text }]}>Heure d'arrivée</Text>
                                <Text style={[styles.arrivalSubLabel, { color: colors.textSecondary }]}>30 min avant le match</Text>
                            </View>
                        </View>
                        <Text style={[styles.arrivalTime, { color: colors.primary }]}>{arrivalTime}</Text>
                    </View>
                </View>

                {/* Guest Counter */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Nombre d'invités</Text>
                    <View style={[styles.guestCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                        <View>
                            <Text style={[styles.guestLabel, { color: colors.text, fontSize: 16, fontWeight: 'bold' }]}>Personnes</Text>
                            <Text style={[styles.guestSubLabel, { color: colors.textSecondary, fontSize: 13 }]}>Table standard</Text>
                        </View>
                        <View style={styles.counterContainer}>
                            <TouchableOpacity style={[styles.counterButton, { backgroundColor: colors.surfaceAlt }]} onPress={decrementGuests}>
                                <MaterialIcons name="remove" size={20} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={[styles.guestCount, { color: colors.text, fontSize: 18, fontWeight: 'bold', marginHorizontal: 16 }]}>{guests}</Text>
                            <TouchableOpacity style={[styles.counterButton, { backgroundColor: colors.primary }]} onPress={incrementGuests}>
                                <MaterialIcons name="add" size={20} color={colors.white} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Info Note */}
                <View style={[styles.infoNote, { backgroundColor: 'rgba(244,123,37,0.1)', padding: 12, borderRadius: 12, flexDirection: 'row', gap: 10 }]}>
                    <MaterialIcons name="info" size={20} color={colors.primary} style={{ marginTop: 2 }} />
                    <Text style={[styles.infoNoteText, { color: colors.textSecondary, flex: 1, fontSize: 13, lineHeight: 18 }]}>
                        <Text style={{ fontWeight: 'bold', color: colors.primary }}>Note: </Text>
                        Pour les groupes de plus de 8 personnes, un dépôt de garantie de 10€ par personne est requis.
                    </Text>
                </View>

                {/* Special Request */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Demande spéciale</Text>
                    <TextInput
                        style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 12, height: 100 }]}
                        placeholder="Ex: Une table près de l'écran, accès PMR..."
                        placeholderTextColor={colors.textMuted}
                        multiline
                        textAlignVertical="top"
                        value={specialRequest}
                        onChangeText={setSpecialRequest}
                    />
                </View>

            </ScrollView>

            {/* Bottom Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.confirmButton, (isSubmitting || confirmDisabled) && styles.confirmButtonDisabled, { backgroundColor: confirmDisabled ? colors.surfaceAlt : colors.primary }]}
                    onPress={handleConfirmReservation}
                    disabled={confirmDisabled}
                    activeOpacity={0.85}
                >
                    {isSubmitting ? (
                        <View style={styles.confirmLoadingRow}>
                            <ActivityIndicator color={colors.white} />
                            <Text style={[styles.confirmButtonText, { color: colors.white }]}>Confirmation...</Text>
                        </View>
                    ) : (
                        <>
                            <Text style={[styles.confirmButtonText, { color: confirmDisabled ? colors.textMuted : colors.white }]}>
                                {selectedMatch ? "Confirmer la réservation" : "Sélectionne un match"}
                            </Text>
                            {selectedMatch ? <MaterialIcons name="arrow-forward" size={20} color={colors.white} /> : null}
                        </>
                    )}
                </TouchableOpacity>
                {reservationError ? <Text style={styles.errorText}>{reservationError}</Text> : null}
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
        borderWidth: 1,
    },
    dateCardSelected: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 0,
    },
    confirmButtonDisabled: {
        opacity: 0.7,
    },
    confirmLoadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    errorText: {
        color: "#ff6b6b",
        fontSize: 14,
        marginTop: 12,
        textAlign: "center",
    },
    dateCardUnselected: {
        // Removed static colors, handled inline
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
        // dynamic
    },
    filterChipUnselected: {
        // dynamic
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
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
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
