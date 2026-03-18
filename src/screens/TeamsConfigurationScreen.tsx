import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    Dimensions,
    TextInput,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useStore } from "../store/useStore";
import { mobileApi } from "../services/mobileApi";
import { apiService } from "../services/api";
import { Team } from "../types/app.types";

const { width } = Dimensions.get("window");

const SPORTS = [
    { id: "all", label: "Tous", icon: "apps" },
    { id: "football", label: "Football", icon: "sports-soccer" },
    { id: "basketball", label: "Basketball", icon: "sports-basketball" },
    { id: "rugby", label: "Rugby", icon: "sports-rugby" },
];

const TeamsConfigurationScreen = () => {
    const { colors, computedTheme, toggleTeamFollow, discoveryHome } = useStore();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const isDark = computedTheme === "dark";

    const [isLoading, setIsLoading] = useState(true);
    const [isFiltersLoading, setIsFiltersLoading] = useState(true);
    const [teams, setTeams] = useState<Team[]>([]);
    const [availableCountries, setAvailableCountries] = useState<{name: string, id: string}[]>([]);
    const [availableLeagues, setAvailableLeagues] = useState<{name: string, id: string}[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSport, setSelectedSport] = useState("football");
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);

    const followedTeamIds = new Set(discoveryHome.followed_teams.map(t => t.id));

    const fetchFilters = useCallback(async () => {
        setIsFiltersLoading(true);
        try {
            const data = await apiService.getDiscoveryFilters();
            
            // Map and deduplicate countries
            const countries = data.countries.map((c: any) => ({
                name: c.name,
                id: c.id
            }));
            setAvailableCountries(countries);

            // Map leagues, optionally filter by sport if selectedSport is not "all"
            let leagues = data.leagues;
            if (selectedSport !== "all") {
                leagues = leagues.filter((l: any) => l.sport?.name.toLowerCase().includes(selectedSport.toLowerCase()));
            }
            
            setAvailableLeagues(leagues.map((l: any) => ({
                name: l.name,
                id: l.id
            })));
        } catch (error) {
            console.error("Error fetching filters:", error);
        } finally {
            setIsFiltersLoading(false);
        }
    }, [selectedSport]);

    useEffect(() => {
        fetchFilters();
    }, [fetchFilters]);

    const fetchTeams = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await mobileApi.fetchTeams({
                sport: selectedSport === "all" ? undefined : selectedSport,
                country: selectedCountry || undefined,
                leagueId: selectedLeagueId || undefined,
                query: searchQuery || undefined,
            });
            setTeams(data);
        } catch (error) {
            console.error("Error fetching teams:", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedSport, selectedCountry, selectedLeagueId, searchQuery]);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    const handleToggleFollow = async (team: Team) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await toggleTeamFollow(team);
    };

    const handleContinue = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.goBack();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            
            <SafeAreaView edges={["top"]} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity 
                        style={[styles.backButton, { backgroundColor: colors.surface }]}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Tes équipes favorites</Text>
                    <View style={{ width: 40 }} />
                </View>
                
                {/* Search Bar */}
                <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <MaterialIcons name="search" size={20} color={colors.textMuted} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Rechercher une équipe..."
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <MaterialIcons name="cancel" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Sport Filter Chips */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.filterScroll}
                >
                    {SPORTS.map(sport => {
                        const isSelected = selectedSport === sport.id;
                        return (
                            <TouchableOpacity
                                key={sport.id}
                                style={[
                                    styles.sportChip,
                                    { backgroundColor: isSelected ? colors.accent : colors.surfaceAlt },
                                    isSelected && styles.activeChipShadow
                                ]}
                                onPress={() => {
                                    setSelectedSport(sport.id);
                                    setSelectedLeagueId(null);
                                    setSelectedCountry(null);
                                }}
                            >
                                <MaterialIcons 
                                    name={sport.icon as any} 
                                    size={18} 
                                    color={isSelected ? "#000" : colors.textMuted} 
                                />
                                <Text style={[styles.chipLabel, { color: isSelected ? "#000" : colors.textMuted }]}>
                                    {sport.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Sub-filters: Pays & Compétition */}
                <View style={styles.subFilters}>
                    {availableCountries.length > 0 && (
                        <>
                            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Pays</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollSmall}>
                                {availableCountries.map(country => {
                                    const isSelected = selectedCountry === country.name;
                                    return (
                                        <TouchableOpacity
                                            key={country.id}
                                            style={[
                                                styles.smallChip,
                                                { backgroundColor: isSelected ? colors.accent : "transparent", borderColor: isSelected ? colors.accent : colors.border }
                                            ]}
                                            onPress={() => setSelectedCountry(isSelected ? null : country.name)}
                                        >
                                            <Text style={[styles.smallChipLabel, { color: isSelected ? "#000" : colors.textMuted }]}>
                                                {country.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </>
                    )}

                    {availableLeagues.length > 0 && (
                        <>
                            <Text style={[styles.filterSectionTitle, { color: colors.text, marginTop: 16 }]}>Compétition</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollSmall}>
                                {availableLeagues.map(league => {
                                    const isSelected = selectedLeagueId === league.id;
                                    return (
                                        <TouchableOpacity
                                            key={league.id}
                                            style={[
                                                styles.smallChip,
                                                { backgroundColor: isSelected ? colors.accent : "transparent", borderColor: isSelected ? colors.accent : colors.border }
                                            ]}
                                            onPress={() => setSelectedLeagueId(isSelected ? null : league.id)}
                                        >
                                            <Text style={[styles.smallChipLabel, { color: isSelected ? "#000" : colors.textMuted }]}>
                                                {league.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </>
                    )}
                </View>

                {/* Teams List */}
                <View style={styles.teamsList}>
                    {isLoading ? (
                        <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
                    ) : teams.length > 0 ? (
                        teams.map(team => {
                            const isFollowed = followedTeamIds.has(team.id);
                            return (
                                <TouchableOpacity 
                                    key={team.id} 
                                    style={[styles.teamRow, { borderBottomColor: colors.border }]}
                                    onPress={() => navigation.navigate("TeamDetail", { teamId: team.id })}
                                >
                                    <View style={[styles.teamLogoContainer, { backgroundColor: "#fff" }]}>
                                        <Image source={{ uri: team.logo_url }} style={styles.teamLogo} />
                                    </View>
                                    <View style={styles.teamInfo}>
                                        <Text style={[styles.teamName, { color: colors.text }]}>{team.name}</Text>
                                        <Text style={[styles.teamMeta, { color: colors.textMuted }]}>
                                            {team.league} • {team.country}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={[
                                            styles.followPill,
                                            { backgroundColor: isFollowed ? colors.accent : colors.surfaceAlt }
                                        ]}
                                        onPress={() => handleToggleFollow(team)}
                                    >
                                        <Text style={[styles.followPillText, { color: isFollowed ? "#000" : colors.text }]}>
                                            {isFollowed ? "Suivi" : "Suivre"}
                                        </Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <View style={styles.emptySearch}>
                            <MaterialIcons name="search-off" size={48} color={colors.textMuted} />
                            <Text style={[styles.emptySearchText, { color: colors.textMuted }]}>
                                Aucune équipe ne correspond à votre recherche.
                            </Text>
                        </View>
                    )}
                </View>
                
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Sticky Continue Button */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        { 
                            backgroundColor: followedTeamIds.size > 0 ? colors.accent : colors.surfaceAlt,
                            opacity: followedTeamIds.size > 0 ? 1 : 0.6
                        }
                    ]}
                    disabled={followedTeamIds.size === 0}
                    onPress={handleContinue}
                >
                    <Text style={[styles.continueButtonText, { color: followedTeamIds.size > 0 ? "#000" : colors.textMuted }]}>
                        Continuer
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    headerTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 10,
        marginBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        marginBottom: 8,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
        fontWeight: "500",
    },
    subtitle: {
        fontSize: 15,
        marginTop: 8,
        textAlign: "center",
    },
    scrollContent: {
        paddingTop: 8,
    },
    filterScroll: {
        paddingHorizontal: 20,
        gap: 12,
        paddingBottom: 16,
    },
    sportChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 8,
    },
    activeChipShadow: {
        shadowColor: "#96DB1F",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    chipLabel: {
        fontSize: 14,
        fontWeight: "700",
    },
    subFilters: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    filterSectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 12,
    },
    filterScrollSmall: {
        gap: 10,
    },
    smallChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
    },
    smallChipLabel: {
        fontSize: 13,
        fontWeight: "600",
    },
    teamsList: {
        paddingHorizontal: 20,
    },
    teamRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    teamLogoContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        padding: 8,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    teamLogo: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    teamInfo: {
        flex: 1,
        marginLeft: 16,
    },
    teamName: {
        fontSize: 16,
        fontWeight: "700",
    },
    teamMeta: {
        fontSize: 13,
        marginTop: 2,
    },
    followPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 80,
        alignItems: "center",
    },
    followPillText: {
        fontSize: 13,
        fontWeight: "700",
    },
    emptySearch: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        gap: 12,
    },
    emptySearchText: {
        textAlign: "center",
        fontSize: 14,
        paddingHorizontal: 40,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: "rgba(11,11,15,0.9)",
    },
    continueButton: {
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    continueButtonText: {
        fontSize: 17,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
});

export default TeamsConfigurationScreen;
