import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Dimensions,
    ActivityIndicator,
    Animated,
    Platform,
    Linking,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../store/useStore";
import { usePostHog } from "posthog-react-native";
import { apiService, MatchVenue } from "../services/api";
import { mobileApi, VenueMatch } from "../services/mobileApi";
import type { Match, Reservation } from "../types";
import { hapticFeedback } from "../utils/haptics";
import { Image } from "expo-image";

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

// Timezone-safe date to ISO string (YYYY-MM-DD)
const toLocalIsoDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getArrivalTime = (matchTime: string) => {
    if (!matchTime) return "19:30";
    try {
        const [hours, minutes] = matchTime.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        date.setMinutes(date.getMinutes() - 30);
        const h = date.getHours().toString().padStart(2, "0");
        const m = date.getMinutes().toString().padStart(2, "0");
        return `${h}:${m}`;
    } catch {
        return matchTime;
    }
};

const weekDays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];

const buildReservationDate = (date: Date): ReservationDate => {
    return {
        fullDate: date,
        day: date.getDate(),
        month: months[date.getMonth()],
        weekDay: weekDays[date.getDay()],
        isoDate: toLocalIsoDate(date),
    };
};

const buildNextReservationDates = (numberOfDays: number): ReservationDate[] => {
    const dates: ReservationDate[] = [];
    for (let i = 0; i < numberOfDays; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(buildReservationDate(d));
    }
    return dates;
};

const formatFullDateLabel = (reservationDate?: ReservationDate) => {
    if (!reservationDate) return "";
    return `${reservationDate.weekDay} ${reservationDate.day} ${reservationDate.month}`;
};

const extractErrorMessage = (error: any) => {
    const apiError = error?.response?.data?.error;
    if (typeof apiError === "string") return apiError;
    return error?.message || "Impossible de confirmer la réservation.";
};

const SPORT_FILTERS = [
    { key: "all", label: "Tout", icon: "apps" },
    { key: "football", label: "Football", icon: "soccer" },
    { key: "rugby", label: "Rugby", icon: "rugby" },
    { key: "basket", label: "Basket", icon: "basketball" },
];

const ReservationsScreen = ({ navigation, route }: { navigation: any; route: any }) => {
    const { colors, computedTheme: themeMode, refreshReservations } = useStore();
    const insets = useSafeAreaInsets();
    const posthog = usePostHog();

    // Context from navigation
    const preselectedVenue = route.params?.venue;
    const preselectedMatchId = route.params?.matchId;
    const preselectedDateIso = route.params?.matchDateIso;

    // Step state
    const [currentStep, setCurrentStep] = useState(1);
    
    // Form state
    const [guests, setGuests] = useState(4);
    const [specialRequest, setSpecialRequest] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reservationError, setReservationError] = useState<string | null>(null);

    // Data state
    const [dates, setDates] = useState<ReservationDate[]>([]);
    const [datesLoading, setDatesLoading] = useState(true);
    const [selectedDateIso, setSelectedDateIso] = useState<string | null>(preselectedDateIso || null);

    const [availableMatches, setAvailableMatches] = useState<EnrichedMatch[]>([]);
    const [matchesLoading, setMatchesLoading] = useState(false);
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(preselectedMatchId || null);
    const [activeSportFilter, setActiveSportFilter] = useState("all");

    // Memoized selections
    const selectedMatch = useMemo(
        () => availableMatches.find((m) => m.id === selectedMatchId),
        [availableMatches, selectedMatchId],
    );
    const selectedDate = useMemo(() => dates.find((date) => date.isoDate === selectedDateIso), [dates, selectedDateIso]);
    const arrivalTime = useMemo(() => (selectedMatch ? getArrivalTime(selectedMatch.time) : "19:30"), [selectedMatch]);

    const filteredMatches = useMemo(() => {
        let list = availableMatches;
        if (activeSportFilter !== "all") {
            list = list.filter(m => {
                const league = m.league?.toLowerCase() || "";
                if (activeSportFilter === "football") return league.includes("ligue") || league.includes("premier") || league.includes("liga") || league.includes("champions");
                if (activeSportFilter === "rugby") return league.includes("rugby") || league.includes("top 14");
                if (activeSportFilter === "basket") return league.includes("nba") || league.includes("basket") || league.includes("euroleague");
                return true;
            });
        }
        return list;
    }, [availableMatches, activeSportFilter]);

    // Initialize dates
    useEffect(() => {
        const nextDates = buildNextReservationDates(14);
        setDates(nextDates);
        setDatesLoading(false);
        if (!selectedDateIso) {
            setSelectedDateIso(nextDates[0].isoDate);
        }
    }, []);

    // Load matches when date or venue changes
    const loadMatches = useCallback(async () => {
        if (!selectedDateIso || !preselectedVenue) return;
        
        setMatchesLoading(true);
        try {
            // Fetch matches specifically for this venue
            const venueDetails = await mobileApi.fetchVenueById(preselectedVenue.id);
            if (venueDetails && venueDetails.matches) {
                const matchesForDate = venueDetails.matches.filter(m => m.dateIso === selectedDateIso);

                const enriched: EnrichedMatch[] = matchesForDate.map(m => ({
                    id: m.id,
                    league: m.league,
                    team1: m.team1,
                    team2: m.team2,
                    time: m.time,
                    bgImage: m.bgImage || preselectedVenue.image,
                    venueMatchId: m.venueMatchId, 
                    venueName: preselectedVenue.name,
                    venueAddress: preselectedVenue.address,
                    dateIso: m.dateIso
                }));
                setAvailableMatches(enriched);
            } else {
                setAvailableMatches([]);
            }
        } catch (error) {
            console.warn("Failed to load matches for venue", error);
            setAvailableMatches([]);
        } finally {
            setMatchesLoading(false);
        }
    }, [selectedDateIso, preselectedVenue, selectedDate]);

    useEffect(() => {
        loadMatches();
    }, [loadMatches]);

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            hapticFeedback.light();
        } else {
            navigation.goBack();
        }
    };

    const handleConfirm = async () => {
        if (isSubmitting || !selectedMatch) return;
        setIsSubmitting(true);
        setReservationError(null);
        try {
            const response = await apiService.createReservation({
                venueMatchId: selectedMatch.venueMatchId,
                partySize: guests,
                specialRequests: specialRequest.trim() || undefined,
            });
            hapticFeedback.success();
            refreshReservations();
            navigation.navigate("ReservationSuccess", {
                venueName: selectedMatch.venueName,
                address: selectedMatch.venueAddress,
                dateLabel: formatFullDateLabel(selectedDate),
                time: selectedMatch.time,
                guestsLabel: `${guests} personnes`,
                matchTitle: `${selectedMatch.team1} vs ${selectedMatch.team2}`,
                reference: response.reservation?.id || `#BK-${Date.now()}`,
                image: selectedMatch.bgImage,
            });
        } catch (error) {
            hapticFeedback.error();
            setReservationError(extractErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderProgress = () => (
        <View style={styles.stepper}>
            {[1, 2, 3, 4].map(s => (
                <View key={s} style={styles.stepItem}>
                    <View style={[styles.stepDot, { backgroundColor: s <= currentStep ? colors.accent : colors.surfaceAlt }]} />
                    {s < 4 && <View style={[styles.stepLine, { backgroundColor: s < currentStep ? colors.accent : colors.surfaceAlt }]} />}
                </View>
            ))}
        </View>
    );

    const renderContent = () => {
        if (currentStep === 1) return (
            <View style={styles.step}>
                <Text style={[styles.title, { color: colors.text }]}>Quand veux-tu venir ?</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Choisis ta date de passage chez {preselectedVenue?.name}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
                    {dates.map(d => {
                        const isSel = d.isoDate === selectedDateIso;
                        return (
                            <TouchableOpacity key={d.isoDate} onPress={() => setSelectedDateIso(d.isoDate)} style={[styles.datePill, isSel ? { backgroundColor: colors.accent } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                                <Text style={[styles.dateWeek, { color: isSel ? '#000' : colors.textSecondary }]}>{d.weekDay.toUpperCase()}</Text>
                                <Text style={[styles.dateDay, { color: isSel ? '#000' : colors.text }]}>{d.day}</Text>
                                <Text style={[styles.dateMonth, { color: isSel ? '#000' : colors.textSecondary }]}>{d.month}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
                <View style={[styles.arrivalCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.arrivalLeft}>
                        <View style={[styles.iconBox, { backgroundColor: `${colors.accent}20` }]}><MaterialIcons name="access-time" size={24} color={colors.accent} /></View>
                        <View>
                            <Text style={[styles.arrivalLabel, { color: colors.text }]}>Arrivée recommandée</Text>
                            <Text style={[styles.arrivalHint, { color: colors.textSecondary }]}>30 min avant le match</Text>
                        </View>
                    </View>
                    <Text style={[styles.arrivalTimeText, { color: colors.accent }]}>{arrivalTime}</Text>
                </View>
            </View>
        );

        if (currentStep === 2) return (
            <View style={styles.step}>
                <Text style={[styles.title, { color: colors.text }]}>Quel match regarder ?</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Voici ce qui est diffusé ce jour-là</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
                    {SPORT_FILTERS.map(f => (
                        <TouchableOpacity key={f.key} onPress={() => setActiveSportFilter(f.key)} style={[styles.filterChip, activeSportFilter === f.key ? { backgroundColor: colors.accent } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                            <MaterialCommunityIcons name={f.icon as any} size={18} color={activeSportFilter === f.key ? '#000' : colors.textSecondary} />
                            <Text style={[styles.filterLabel, { color: activeSportFilter === f.key ? '#000' : colors.textSecondary }]}>{f.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                {matchesLoading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : filteredMatches.length > 0 ? (
                    <View style={styles.matchList}>
                        {filteredMatches.map(m => {
                            const isSel = m.id === selectedMatchId;
                            return (
                                <TouchableOpacity key={m.id} onPress={() => setSelectedMatchId(isSel ? null : m.id)} style={[styles.matchItem, { backgroundColor: colors.surface }, isSel && { borderColor: colors.accent, borderWidth: 2 }]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.matchLeague, { color: colors.accent }]}>{m.league?.toUpperCase()}</Text>
                                        <Text style={[styles.matchTeams, { color: colors.text }]}>{m.team1} vs {m.team2}</Text>
                                        <Text style={[styles.matchTime, { color: colors.textSecondary }]}>{m.time}</Text>
                                    </View>
                                    {isSel && <MaterialIcons name="check-circle" size={24} color={colors.accent} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.empty}>
                        <MaterialCommunityIcons name="soccer" size={64} color={colors.surfaceAlt} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun match prévu à cette date.</Text>
                        <TouchableOpacity onPress={() => setCurrentStep(1)}><Text style={{ color: colors.accent, fontWeight: '700', marginTop: 10 }}>Changer de date</Text></TouchableOpacity>
                    </View>
                )}
            </View>
        );

        if (currentStep === 3) return (
            <View style={styles.step}>
                <Text style={[styles.title, { color: colors.text }]}>Combien de personnes ?</Text>
                <View style={[styles.guestCard, { backgroundColor: colors.surface }]}>
                    <View>
                        <Text style={[styles.guestTitle, { color: colors.text }]}>Nombre d'invités</Text>
                        <Text style={[styles.guestSub, { color: colors.textSecondary }]}>{guests > 6 ? "Grande table" : "Table standard"}</Text>
                    </View>
                    <View style={styles.counter}>
                        <TouchableOpacity onPress={() => setGuests(Math.max(1, guests - 1))} style={[styles.countBtn, { backgroundColor: colors.background }]}><MaterialIcons name="remove" size={24} color={colors.text} /></TouchableOpacity>
                        <Text style={[styles.countText, { color: colors.text }]}>{guests}</Text>
                        <TouchableOpacity onPress={() => setGuests(guests + 1)} style={[styles.countBtn, { backgroundColor: colors.accent }]}><MaterialIcons name="add" size={24} color="#000" /></TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.note, { backgroundColor: `${colors.accent}10`, borderColor: `${colors.accent}30` }]}>
                    <MaterialIcons name="info-outline" size={20} color={colors.accent} />
                    <Text style={[styles.noteText, { color: colors.textSecondary }]}>Note : Pour les groupes de plus de 8 personnes, une empreinte bancaire peut être demandée.</Text>
                </View>
                <Text style={[styles.label, { color: colors.text }]}>Demande spéciale (optionnel)</Text>
                <TextInput value={specialRequest} onChangeText={setSpecialRequest} placeholder="Ex: Près d'un écran..." placeholderTextColor={colors.textMuted} multiline style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} />
            </View>
        );

        return (
            <View style={styles.step}>
                <Text style={[styles.title, { color: colors.text }]}>Récapitulatif</Text>
                <View style={[styles.recap, { backgroundColor: colors.surface }]}>
                    <View style={styles.recapTop}>
                        <Image source={{ uri: selectedMatch?.bgImage || preselectedVenue?.image }} style={styles.recapImg} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.recapVenue, { color: colors.text }]}>{preselectedVenue?.name.toUpperCase()}</Text>
                            <Text style={[styles.recapAddr, { color: colors.textSecondary }]} numberOfLines={1}>{preselectedVenue?.address}</Text>
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <RecapRow icon="event" label="Date" value={formatFullDateLabel(selectedDate)} colors={colors} />
                    <RecapRow icon="access-time" label="Arrivée" value={arrivalTime} colors={colors} />
                    <RecapRow icon="sports-soccer" label="Match" value={selectedMatch ? `${selectedMatch.team1} vs ${selectedMatch.team2}` : "Sans match précis"} colors={colors} />
                    <RecapRow icon="people" label="Invités" value={`${guests} pers.`} colors={colors} isLast />
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={handleBack} style={styles.backBtn}><MaterialIcons name="close" size={24} color={colors.text} /></TouchableOpacity>
                {renderProgress()}
                <View style={{ width: 40 }} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {renderContent()}
            </ScrollView>
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                {reservationError && <Text style={styles.error}>{reservationError}</Text>}
                <TouchableOpacity 
                    disabled={isSubmitting}
                    onPress={() => currentStep < 4 ? (setCurrentStep(currentStep + 1), hapticFeedback.medium()) : handleConfirm()} 
                    style={[styles.cta, { backgroundColor: colors.accent }]}
                >
                    {isSubmitting ? <ActivityIndicator color="#000" /> : <Text style={styles.ctaText}>{currentStep === 4 ? "Confirmer la réservation" : "Continuer"}</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const RecapRow = ({ icon, label, value, colors, isLast }: any) => (
    <View style={[styles.row, !isLast && { marginBottom: 12 }]}>
        <View style={styles.rowL}><MaterialIcons name={icon} size={18} color={colors.textSecondary} /><Text style={{ color: colors.textSecondary, marginLeft: 8 }}>{label}</Text></View>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    stepItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    stepDot: { width: 8, height: 8, borderRadius: 4 },
    stepLine: { width: 20, height: 2, borderRadius: 1 },
    scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 120 },
    step: { flex: 1 },
    title: { fontSize: 26, fontWeight: '900', marginBottom: 8 },
    subtitle: { fontSize: 15, fontWeight: '500', marginBottom: 24 },
    dateList: { gap: 12, paddingBottom: 10 },
    datePill: { width: 75, height: 95, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 4 },
    dateWeek: { fontSize: 10, fontWeight: '800' },
    dateDay: { fontSize: 24, fontWeight: '900' },
    dateMonth: { fontSize: 11, fontWeight: '700' },
    arrivalCard: { marginTop: 32, borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    arrivalLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    arrivalLabel: { fontSize: 14, fontWeight: '700' },
    arrivalHint: { fontSize: 12, fontWeight: '500' },
    arrivalTimeText: { fontSize: 22, fontWeight: '900' },
    filters: { gap: 10, marginBottom: 24 },
    filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, gap: 8 },
    filterLabel: { fontSize: 13, fontWeight: '700' },
    matchList: { gap: 12 },
    matchItem: { borderRadius: 20, padding: 16, borderWidth: 2, borderColor: 'transparent', flexDirection: 'row', alignItems: 'center' },
    matchLeague: { fontSize: 10, fontWeight: '800', marginBottom: 4 },
    matchTeams: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    matchTime: { fontSize: 12, fontWeight: '500' },
    empty: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
    emptyText: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
    guestCard: { borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    guestTitle: { fontSize: 16, fontWeight: '800' },
    guestSub: { fontSize: 13, fontWeight: '500' },
    counter: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    countBtn: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    countText: { fontSize: 22, fontWeight: '900' },
    note: { padding: 16, borderRadius: 20, borderWidth: 1, flexDirection: 'row', gap: 12, marginBottom: 32 },
    noteText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '500' },
    label: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
    input: { borderRadius: 20, padding: 16, fontSize: 14, borderWidth: 1, height: 100, textAlignVertical: 'top' },
    recap: { borderRadius: 28, padding: 20 },
    recapTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    recapImg: { width: 50, height: 50, borderRadius: 12 },
    recapVenue: { fontSize: 16, fontWeight: '900' },
    recapAddr: { fontSize: 12, fontWeight: '500' },
    divider: { height: 1, marginVertical: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    rowL: { flexDirection: 'row', alignItems: 'center' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24 },
    cta: { height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    ctaText: { color: '#000', fontSize: 16, fontWeight: '900' },
    error: { color: '#ff4b4b', fontSize: 12, textAlign: 'center', marginBottom: 12, fontWeight: '700' },
});

export default ReservationsScreen;
