import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    Dimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useStore } from "../store/useStore";
import { mockTeams, mockVenues } from "../lib/mockData";

const { width, height } = Dimensions.get("window");

const TeamDetailScreen = () => {
    const { colors, computedTheme } = useStore();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { teamId } = route.params || { teamId: "team-psg" };
    
    const isDark = computedTheme === "dark";
    const team = useMemo(() => mockTeams.find(t => t.id === teamId) || mockTeams[0], [teamId]);
    const [isFollowed, setIsFollowed] = useState(team.is_followed);

    const toggleFollow = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsFollowed(!isFollowed);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header Section */}
                <View style={styles.header}>
                    <LinearGradient
                        colors={[colors.accent + "40", "transparent"]}
                        style={styles.headerGradient}
                    />
                    <SafeAreaView edges={["top"]} style={styles.headerNav}>
                        <TouchableOpacity 
                            style={[styles.circleButton, { backgroundColor: "rgba(255,255,255,0.1)" }]}
                            onPress={() => navigation.goBack()}
                        >
                            <MaterialIcons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.circleButton, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                            <MaterialIcons name="share" size={22} color="#fff" />
                        </TouchableOpacity>
                    </SafeAreaView>

                    <View style={styles.teamHeaderContent}>
                        <View style={styles.logoRing}>
                            <View style={styles.logoBg}>
                                <Image source={{ uri: team.logo_url }} style={styles.teamLogoLarge} />
                            </View>
                        </View>
                        <Text style={styles.teamNameLarge}>{team.name}</Text>
                        <Text style={styles.teamMetaLarge}>{team.league} • {team.country}</Text>
                        
                        <TouchableOpacity 
                            style={[
                                styles.followButtonMain, 
                                { backgroundColor: isFollowed ? "rgba(255,255,255,0.1)" : colors.accent, borderColor: isFollowed ? colors.accent : "transparent" }
                            ]}
                            onPress={toggleFollow}
                        >
                            <MaterialIcons 
                                name={isFollowed ? "check" : "add"} 
                                size={20} 
                                color={isFollowed ? colors.accent : "#000"} 
                            />
                            <Text style={[styles.followButtonText, { color: isFollowed ? colors.accent : "#000" }]}>
                                {isFollowed ? "Suivi" : "Suivre cette équipe"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Section 1: Matchs à venir */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Matchs à venir</Text>
                        <TouchableOpacity>
                            <Text style={[styles.seeAll, { color: colors.accent }]}>Voir tout</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.matchesList}>
                        {[1, 2].map((_, idx) => (
                            <TouchableOpacity 
                                key={idx} 
                                style={[styles.matchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={() => navigation.navigate("MatchDetail", { matchId: "match-" + idx })}
                            >
                                <View style={styles.matchDateCol}>
                                    <Text style={[styles.matchDay, { color: colors.text }]}>{24 + idx}</Text>
                                    <Text style={[styles.matchMonth, { color: colors.textMuted }]}>MARS</Text>
                                </View>
                                <View style={styles.matchInfo}>
                                    <View style={styles.matchTeamsRow}>
                                        <Text style={[styles.matchTeamName, { color: colors.text }]}>{team.name}</Text>
                                        <Text style={[styles.vsLabel, { color: colors.textMuted }]}>vs</Text>
                                        <Text style={[styles.matchTeamName, { color: colors.text }]}>Opposition {idx + 1}</Text>
                                    </View>
                                    <View style={styles.matchMetaRow}>
                                        <View style={styles.leagueInfoRow}>
                                            <MaterialIcons name="emoji-events" size={14} color={colors.accent} />
                                            <Text style={[styles.matchTime, { color: colors.textMuted, marginLeft: 4 }]}>21:00 • {team.league}</Text>
                                        </View>
                                        <View style={[styles.livePill, { backgroundColor: colors.accent + "20" }]}>
                                            <MaterialIcons name="location-on" size={12} color={colors.accent} />
                                            <Text style={[styles.livePillText, { color: colors.accent }]}>Diffusé près de toi</Text>
                                        </View>
                                    </View>
                                </View>
                                <MaterialIcons name="chevron-right" size={24} color={colors.textMuted} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Section 2: Bars qui diffusent le plus */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Bars qui diffusent le plus cette équipe</Text>
                    </View>
                    
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        contentContainerStyle={styles.barsScroll}
                    >
                        {mockVenues.map(venue => (
                            <TouchableOpacity 
                                key={venue.id} 
                                style={[styles.barCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={() => navigation.navigate("VenueProfile", { venueId: venue.id })}
                            >
                                <Image source={{ uri: venue.image }} style={styles.barImage} />
                                <View style={styles.barInfo}>
                                    <Text style={[styles.barName, { color: colors.text }]} numberOfLines={1}>{venue.name}</Text>
                                    <View style={styles.barLocation}>
                                        <MaterialIcons name="place" size={14} color={colors.textMuted} />
                                        <Text style={[styles.barCity, { color: colors.textMuted }]}>{venue.address.split(',')[1]?.trim() || "Paris"}</Text>
                                    </View>
                                    
                                    <View style={[styles.frequentLabel, { backgroundColor: colors.accent + "15" }]}>
                                        <Text style={[styles.frequentText, { color: colors.accent }]}>Diffuse souvent {team.name.split(' ').pop()}</Text>
                                    </View>

                                    <View style={styles.ratingRow}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <MaterialIcons 
                                                key={s} 
                                                name="star" 
                                                size={14} 
                                                color={s <= Math.floor(venue.rating) ? colors.accent : colors.surfaceAlt} 
                                            />
                                        ))}
                                        <Text style={[styles.ratingCount, { color: colors.textMuted }]}>(124)</Text>
                                    </View>

                                    <TouchableOpacity 
                                        style={[styles.detailsBtn, { borderColor: colors.border }]}
                                        onPress={() => navigation.navigate("VenueProfile", { venueId: venue.id })}
                                    >
                                        <Text style={[styles.detailsBtnText, { color: colors.text }]}>Voir les détails</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Visual Mock of Bottom Tab Bar (as it's usually persistent but required in layout) */}
            {/* In a real app, this is handled by TabNavigator, but I'll add a placeholder to match requirements */}
            <View style={[styles.tabBarMock, { backgroundColor: "rgba(11,11,15,0.95)", borderTopColor: colors.border }]}>
                <View style={styles.tabItem}>
                    <MaterialIcons name="map" size={24} color={colors.textMuted} />
                    <Text style={[styles.tabLabel, { color: colors.textMuted }]}>Carte</Text>
                </View>
                <View style={styles.tabItem}>
                    <MaterialIcons name="explore" size={24} color={colors.accent} />
                    <Text style={[styles.tabLabel, { color: colors.accent }]}>Découvrir</Text>
                </View>
                <View style={styles.tabItem}>
                    <MaterialIcons name="search" size={24} color={colors.textMuted} />
                    <Text style={[styles.tabLabel, { color: colors.textMuted }]}>Rechercher</Text>
                </View>
                <View style={styles.tabItem}>
                    <MaterialIcons name="confirmation-number" size={24} color={colors.textMuted} />
                    <Text style={[styles.tabLabel, { color: colors.textMuted }]}>Réservations</Text>
                </View>
                <View style={styles.tabItem}>
                    <MaterialIcons name="person" size={24} color={colors.textMuted} />
                    <Text style={[styles.tabLabel, { color: colors.textMuted }]}>Profil</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        height: 420,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    headerGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 300,
    },
    headerNav: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        zIndex: 10,
    },
    circleButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    teamHeaderContent: {
        alignItems: "center",
        marginTop: 40,
    },
    logoRing: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "rgba(150, 219, 31, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(150, 219, 31, 0.2)",
    },
    logoBg: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: "#fff",
        padding: 15,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    teamLogoLarge: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    teamNameLarge: {
        fontSize: 32,
        fontWeight: "900",
        color: "#fff",
        marginTop: 20,
        textAlign: "center",
    },
    teamMetaLarge: {
        fontSize: 16,
        color: "rgba(255,255,255,0.6)",
        marginTop: 4,
    },
    followButtonMain: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 30,
        marginTop: 24,
        gap: 10,
        borderWidth: 1,
    },
    followButtonText: {
        fontSize: 16,
        fontWeight: "800",
    },
    section: {
        marginTop: 32,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        flex: 1,
    },
    seeAll: {
        fontSize: 14,
        fontWeight: "700",
    },
    matchesList: {
        paddingHorizontal: 20,
        gap: 12,
    },
    matchCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    matchDateCol: {
        alignItems: "center",
        justifyContent: "center",
        width: 50,
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: "rgba(255,255,255,0.1)",
        paddingRight: 12,
        marginRight: 16,
    },
    matchDay: {
        fontSize: 20,
        fontWeight: "800",
    },
    matchMonth: {
        fontSize: 10,
        fontWeight: "700",
        marginTop: 2,
    },
    matchInfo: {
        flex: 1,
    },
    matchTeamsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    matchTeamName: {
        fontSize: 15,
        fontWeight: "700",
    },
    vsLabel: {
        fontSize: 12,
        fontWeight: "500",
    },
    matchMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 6,
    },
    matchTime: {
        fontSize: 13,
    },
    leagueInfoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    livePill: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    livePillText: {
        fontSize: 10,
        fontWeight: "700",
    },
    barsScroll: {
        paddingHorizontal: 20,
        gap: 16,
    },
    barCard: {
        width: 260,
        borderRadius: 24,
        borderWidth: 1,
        overflow: "hidden",
    },
    barImage: {
        width: "100%",
        height: 140,
        resizeMode: "cover",
    },
    barInfo: {
        padding: 16,
    },
    barName: {
        fontSize: 18,
        fontWeight: "800",
    },
    barLocation: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        gap: 4,
    },
    barCity: {
        fontSize: 13,
    },
    frequentLabel: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginTop: 12,
    },
    frequentText: {
        fontSize: 11,
        fontWeight: "700",
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
        gap: 2,
    },
    ratingCount: {
        fontSize: 12,
        marginLeft: 4,
    },
    detailsBtn: {
        width: "100%",
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
    },
    detailsBtnText: {
        fontSize: 14,
        fontWeight: "700",
    },
    tabBarMock: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 90,
        flexDirection: "row",
        justifyContent: "space-around",
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    tabItem: {
        alignItems: "center",
        gap: 4,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: "600",
    },
});

export default TeamDetailScreen;
