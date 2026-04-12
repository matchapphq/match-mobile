import React, { useState, useEffect, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useStore } from "../store/useStore";
import { apiService } from "../services/api";

const CompetitionsScreen = ({ navigation }: { navigation: any }) => {
    const { colors, computedTheme, toggleLeagueFollow, discoveryHome } = useStore();
    const isLightTheme = computedTheme === "light";

    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSport, setSelectedSport] = useState("Football");
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    
    const [allLeagues, setAllLeagues] = useState<any[]>([]);
    const [countries, setCountries] = useState<any[]>([]);
    
    const followedLeagues = discoveryHome.followed_leagues || [];

    useEffect(() => {
        const fetchFilters = async () => {
            setLoading(true);
            try {
                const data = await apiService.getDiscoveryFilters();
                setAllLeagues(data.leagues || []);
                setCountries(data.countries || []);
            } catch (error) {
                console.error("Error fetching filters:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFilters();
    }, []);

    const sports = ["Football", "Basketball", "Rugby", "Tennis"];
    const types = ["Championnat", "Coupe"];

    const filteredLeagues = useMemo(() => {
        return allLeagues.filter((league) => {
            const matchesQuery = league.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSport = !selectedSport || (league.sport?.name === selectedSport);
            const matchesCountry = !selectedCountry || (league.country?.name === selectedCountry);
            // Type logic might need more data from API, but for now we can mock it or check name
            const matchesType = !selectedType || 
                (selectedType === "Championnat" ? !league.name.toLowerCase().includes("cup") && !league.name.toLowerCase().includes("coupe") : 
                 league.name.toLowerCase().includes("cup") || league.name.toLowerCase().includes("coupe"));
            
            return matchesQuery && matchesSport && matchesCountry && matchesType;
        });
    }, [allLeagues, searchQuery, selectedSport, selectedCountry, selectedType]);

    const majorLeagues = useMemo(() => {
        return allLeagues.filter(l => l.is_major).slice(0, 5);
    }, [allLeagues]);

    const isFollowed = (leagueId: string) => {
        return followedLeagues.some((l: any) => l.id === leagueId);
    };

    const renderLeagueItem = ({ item }: { item: any }) => (
        <View style={[styles.leagueItem, { borderBottomColor: colors.border }]}>
            <View style={[styles.leagueLogoContainer, { backgroundColor: colors.surface }]}>
                {item.logo_url ? (
                    <Image source={{ uri: item.logo_url }} style={styles.leagueLogo} />
                ) : (
                    <MaterialIcons name="emoji-events" size={24} color={colors.accent} />
                )}
            </View>
            <View style={styles.leagueInfo}>
                <Text style={[styles.leagueName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.leagueSubtitle, { color: colors.textMuted }]}>
                    {item.country?.name || "International"} - {item.name.toLowerCase().includes("cup") || item.name.toLowerCase().includes("coupe") ? "Coupe" : "Championnat"}
                </Text>
            </View>
            <TouchableOpacity 
                style={[
                    styles.followButton, 
                    { 
                        backgroundColor: isFollowed(item.id) ? colors.surface : colors.primary,
                        borderColor: isFollowed(item.id) ? colors.border : colors.primary
                    }
                ]}
                onPress={() => toggleLeagueFollow(item)}
            >
                <Text style={[
                    styles.followButtonText, 
                    { color: isFollowed(item.id) ? colors.text : "white" }
                ]}>
                    {isFollowed(item.id) ? "Suivie" : "Suivre"}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderHeader = () => (
        <View>
            <View style={styles.searchBarContainer}>
                <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <MaterialIcons name="search" size={20} color={colors.textMuted} />
                    <TextInput
                        placeholder="Rechercher une compétition..."
                        placeholderTextColor={colors.textMuted}
                        style={[styles.searchInput, { color: colors.text }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {sports.map((sport) => (
                    <TouchableOpacity
                        key={sport}
                        style={[
                            styles.filterChip,
                            { 
                                backgroundColor: selectedSport === sport ? colors.primary : colors.surface,
                                borderColor: selectedSport === sport ? colors.primary : colors.border
                            }
                        ]}
                        onPress={() => setSelectedSport(sport)}
                    >
                        <Text style={[
                            styles.filterChipText,
                            { color: selectedSport === sport ? "white" : colors.text }
                        ]}>{sport}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRowSecondary}>
                <TouchableOpacity
                    style={[
                        styles.filterChipSmall,
                        { 
                            backgroundColor: selectedCountry ? colors.accent10 : colors.surface,
                            borderColor: selectedCountry ? colors.accent : colors.border
                        }
                    ]}
                    onPress={() => setSelectedCountry(null)}
                >
                    <Text style={[styles.filterChipSmallText, { color: selectedCountry ? colors.accent : colors.text }]}>
                        Pays: {selectedCountry || "Tous"}
                    </Text>
                    <MaterialIcons name="keyboard-arrow-down" size={16} color={selectedCountry ? colors.accent : colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterChipSmall,
                        { 
                            backgroundColor: selectedType ? colors.accent10 : colors.surface,
                            borderColor: selectedType ? colors.accent : colors.border
                        }
                    ]}
                    onPress={() => setSelectedType(null)}
                >
                    <Text style={[styles.filterChipSmallText, { color: selectedType ? colors.accent : colors.text }]}>
                        Type: {selectedType || "Tous"}
                    </Text>
                    <MaterialIcons name="keyboard-arrow-down" size={16} color={selectedType ? colors.accent : colors.textMuted} />
                </TouchableOpacity>
            </ScrollView>

            {majorLeagues.length > 0 && !searchQuery && !selectedCountry && (
                <View style={styles.pharesSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Compétitions phares</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pharesContent}>
                        {majorLeagues.map((league) => (
                            <TouchableOpacity 
                                key={league.id} 
                                style={[styles.pharesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={() => toggleLeagueFollow(league)}
                            >
                                <View style={styles.pharesLogoContainer}>
                                    {league.logo_url ? (
                                        <Image source={{ uri: league.logo_url }} style={styles.pharesLogo} />
                                    ) : (
                                        <MaterialIcons name="emoji-events" size={32} color={colors.accent} />
                                    )}
                                </View>
                                <Text style={[styles.pharesName, { color: colors.text }]} numberOfLines={1}>{league.name}</Text>
                                <View style={[styles.pharesFollowBadge, { backgroundColor: isFollowed(league.id) ? colors.accent : colors.accent10 }]}>
                                    <Text style={[styles.pharesFollowText, { color: isFollowed(league.id) ? "white" : colors.accent }]}>
                                        {isFollowed(league.id) ? "Suivie" : "Suivre"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            <View style={styles.listHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Toutes les compétitions</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isLightTheme ? "dark-content" : "light-content"} />
            <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Compétitions</Text>
                    <View style={{ width: 40 }} />
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={filteredLeagues}
                        renderItem={renderLeagueItem}
                        keyExtractor={(item) => item.id}
                        ListHeaderComponent={renderHeader}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
                    <TouchableOpacity 
                        style={[styles.saveButton, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.saveButtonText}>Terminer</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    searchBarContainer: {
        paddingHorizontal: 20,
        marginVertical: 15,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
        paddingHorizontal: 15,
        height: 48,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
    },
    filterRow: {
        paddingHorizontal: 20,
        gap: 10,
        marginBottom: 15,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: "600",
    },
    filterRowSecondary: {
        paddingHorizontal: 20,
        gap: 10,
        marginBottom: 20,
    },
    filterChipSmall: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        gap: 4,
    },
    filterChipSmallText: {
        fontSize: 12,
        fontWeight: "500",
    },
    pharesSection: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    pharesContent: {
        paddingHorizontal: 20,
        gap: 15,
    },
    pharesCard: {
        width: 140,
        padding: 15,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: "center",
        gap: 10,
    },
    pharesLogoContainer: {
        width: 64,
        height: 64,
        alignItems: "center",
        justifyContent: "center",
    },
    pharesLogo: {
        width: 50,
        height: 50,
        contentFit: "contain",
    },
    pharesName: {
        fontSize: 13,
        fontWeight: "bold",
        textAlign: "center",
    },
    pharesFollowBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
    },
    pharesFollowText: {
        fontSize: 11,
        fontWeight: "bold",
    },
    listHeader: {
        marginBottom: 10,
    },
    listContent: {
        paddingBottom: 100,
    },
    leagueItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    leagueLogoContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    leagueLogo: {
        width: 32,
        height: 32,
        contentFit: "contain",
    },
    leagueInfo: {
        flex: 1,
        marginLeft: 15,
        gap: 2,
    },
    leagueName: {
        fontSize: 15,
        fontWeight: "600",
    },
    leagueSubtitle: {
        fontSize: 12,
    },
    followButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
    },
    followButtonText: {
        fontSize: 12,
        fontWeight: "bold",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
    },
    saveButton: {
        height: 56,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    saveButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default CompetitionsScreen;
