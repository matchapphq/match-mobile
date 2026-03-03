import React from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const FEATURED_CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.7, 280);
const RECENT_CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.7, 260);

const AVATARS = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDl-ZiYi_kmr_bxJOa1ufUP6kk8BBoGCxjxPfLg49u8EUqT2s-pBNgs0crIy34z4aEtQJKL9oddJWLDK33iTZLu28aCXPVI43gr-sG1f3FWHgWLSqce8Ov9jtoh7oZ9J3o7ookA6tgJVNfQkTUjO9xOc3VmgTAi4xr0jIgmQWXrib_aiuUV6nCcvQTViS2l5TUzs_GeilaX6tUV8PyFOgQ1jAdH86Vxjt2B3mIOuvYi6avFUQXqquthKEaZcyXYTDHefik1jmmcbh5y",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAEEve-uxXGpOCqCUUug4FH2QdRxjiwGe6YEPB5BRnElxMw5sHXBxwakI9GXUX-ZXaQBNBoB-TyZPIqN5UBCIPhsQfGPZGRhZ-Py19LuogedA-Sp9owBnghsUMCrmbC6bnWyFvp6kbcIUiXcpY6gJNp56GdbdCqtkoufPI7vnT2l6U7uOZC2CmXBZGL_72HfEWXs7RVhq4oKcnWJ-A_V5L0CrHO1ZXduPTlqBaQGmSKpSs4hQyRZea1oU8r7UY4GJgpmAOrmnFs7mza",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDda9l5XKufwq4MPZh_F5AWTmcZLR-dhyaxQR9salTQIseo4DLQ2SUXVOG5jcHmbwSeKRoP3O7QwWN-hJ2ZKGZV7G1bWAyexxEXR0XWgAOSZvmoFVEehFwAcSewa5YG7m-kKYzn60p-EePt-Hc6Uuh1Hv_9-_xubXmrFCGwQp7qaVJtg4_N6ZGFUz8dYKQGZDNdtBGfFRd3Mna5wkAUn81rIpu9Dggip4PX_uMkFhrDvmBrtISo_VhbzxELm74B-lJv4Hj6IU_kT_bz",
];

const HERO = [
    {
        id: "world-cup",
        badge: "Compétition",
        date: "Du 20 Nov au 18 Dec",
        title: "FIFA WORLD CUP",
        subtitle: "Qatar 2022",
        action: "Voir les bars",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuD9VE5UejG6EUCBXCAWtSci4W1RyoLlpihq1GPlgvkqMHcHXaLdnv0I-jvdmcfXjHC3OrMhgs_0GUJ8ApjWAE7823gse6kGgDNGVqKqVktQY1To_QT93c8jHpEPL46fWWbKwuLpVc0aJQvP1gOqFdZMDKlX8z9x4MWCDlZD44NQPk_SVsxlTFolH5hgiILcOzTNjCjrEepgxZxMyDYUwS_wMvscrGWk45_Gk1ALlfuCfFvPsnVW_BIbkYXWki3dhrY30ZLBWo05J1mj",
        gradient: ["#1e3a8a", "#312e81"] as const,
    },
    {
        id: "rg",
        badge: "Grand Chelem",
        date: "Du 22 Mai au 5 Juin",
        title: "ROLAND-GARROS",
        subtitle: "Paris, France",
        action: "Réserver",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuD9VE5UejG6EUCBXCAWtSci4W1RyoLlpihq1GPlgvkqMHcHXaLdnv0I-jvdmcfXjHC3OrMhgs_0GUJ8ApjWAE7823gse6kGgDNGVqKqVktQY1To_QT93c8jHpEPL46fWWbKwuLpVc0aJQvP1gOqFdZMDKlX8z9x4MWCDlZD44NQPk_SVsxlTFolH5hgiILcOzTNjCjrEepgxZxMyDYUwS_wMvscrGWk45_Gk1ALlfuCfFvPsnVW_BIbkYXWki3dhrY30ZLBWo05J1mj",
        gradient: ["#9a3412", "#7f1d1d"] as const,
    },
];

const TEAMS = [
    {
        id: "psg",
        label: "PSG",
        logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBg9fQ1OQ2_5EVNXdZE4b_5ixrmiZdq0O7Tp7PnQNpU6uW5F8AcGzJMkUH6usrpp9NLjF1aqAE_Kbk9DqLTcKv3XcbPswLw5zFwM69XTpc_x3zIdOseC59bbtL7QM2nvOsZOgS-sjb-4kymcKSgtWLxazV5amqKnjEYoiS4jjbqsEp6g2hdt5ElXf5aeD-1hhhhFP4c2r5miLC0jHuzcsI1f305o2fmw6kDq-8ZZtFbiv4CqXaOvi4_wImKQ9m1ez2vvNz7jFfjGfl7",
        ring: true,
        live: true,
    },
    {
        id: "lakers",
        label: "Lakers",
        logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1XLEdTHRiWp7gMA2rtMRKtSNlRqbLWVYp8VZDguKpd1DLh3TQ_NxonJHHkiZNACTJON05x4SVqeYpfL2en2qhbRPQM_hl_xwR-ZL8CVuIxdFGRHO4yc2wYJAndTGTYREqwokIwS8TpwEIrVbvMff1mLhaS26hYfwoaMJWQWB8FSHcDBNPHto0xXUly9204qe3ShHMOk4xHchNyvqFqpEAdThpVGWIto9Uqm8uo2eeDbqZQDcXNwJ5kkqlmcU4yi5Xc7PghjgBLTb-",
        ring: true,
    },
    {
        id: "real",
        label: "Real Madrid",
        logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9VE5UejG6EUCBXCAWtSci4W1RyoLlpihq1GPlgvkqMHcHXaLdnv0I-jvdmcfXjHC3OrMhgs_0GUJ8ApjWAE7823gse6kGgDNGVqKqVktQY1To_QT93c8jHpEPL46fWWbKwuLpVc0aJQvP1gOqFdZMDKlX8z9x4MWCDlZD44NQPk_SVsxlTFolH5hgiILcOzTNjCjrEepgxZxMyDYUwS_wMvscrGWk45_Gk1ALlfuCfFvPsnVW_BIbkYXWki3dhrY30ZLBWo05J1mj",
    },
    { id: "add", label: "Ajouter", add: true },
];

const COMPETITIONS: Array<{ id: string; label: string; icon: keyof typeof MaterialIcons.glyphMap }> = [
    { id: "wc", label: "World Cup", icon: "sports-soccer" },
    { id: "rg", label: "Roland-Garros", icon: "sports-tennis" },
    { id: "nba", label: "NBA Finals", icon: "sports-basketball" },
    { id: "f1", label: "Formula 1", icon: "directions-car" },
    { id: "t14", label: "Top 14", icon: "sports-rugby" },
    { id: "hb", label: "Handball", icon: "sports-handball" },
];

const FEATURED = [
    {
        id: "clasico",
        badge: "Match Choc",
        info: "La Liga • 21:00",
        title: "El Clásico",
        details: "Real Madrid  vs  FC Barcelone",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBuRMxq66rRIxQvc7dwacuT_sPY4CH2cmQ6gZzrQN0P-lvYnhOSwl_g5lcLAQai6wxyjgq7BI7hYLfm7Ydk_9e6QrxwOcKbNtb6s8vI-zptKFvVF0JM_oIC8XXZlIQYMrCSeycO0KNzp4xWBbR9hsIenJMqWLSuHfuoUbiOHBnYafbngdmwYRJwGuX943pCOxg1l6ZWUTYtdyTeWQXNcYztlkVlLyCqXE7kbhRheRK71woX-8mM-4fFXhRzaykCwsQigHFxrMoXER9t",
    },
    {
        id: "nba-finals",
        badge: "Finale NBA",
        info: "NBA • 03:00",
        title: "Lakers vs Celtics",
        details: "Game 7  •  Decider",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuA1XLEdTHRiWp7gMA2rtMRKtSNlRqbLWVYp8VZDguKpd1DLh3TQ_NxonJHHkiZNACTJON05x4SVqeYpfL2en2qhbRPQM_hl_xwR-ZL8CVuIxdFGRHO4yc2wYJAndTGTYREqwokIwS8TpwEIrVbvMff1mLhaS26hYfwoaMJWQWB8FSHcDBNPHto0xXUly9204qe3ShHMOk4xHchNyvqFqpEAdThpVGWIto9Uqm8uo2eeDbqZQDcXNwJ5kkqlmcU4yi5Xc7PghjgBLTb-",
    },
    {
        id: "rg-final",
        badge: "Grand Chelem",
        info: "Finale • 15:00",
        title: "Roland-Garros",
        details: "Court Philippe-Chatrier",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuD9VE5UejG6EUCBXCAWtSci4W1RyoLlpihq1GPlgvkqMHcHXaLdnv0I-jvdmcfXjHC3OrMhgs_0GUJ8ApjWAE7823gse6kGgDNGVqKqVktQY1To_QT93c8jHpEPL46fWWbKwuLpVc0aJQvP1gOqFdZMDKlX8z9x4MWCDlZD44NQPk_SVsxlTFolH5hgiILcOzTNjCjrEepgxZxMyDYUwS_wMvscrGWk45_Gk1ALlfuCfFvPsnVW_BIbkYXWki3dhrY30ZLBWo05J1mj",
    },
];

const RECENT = [
    {
        id: "lions",
        title: "The Lions Pub",
        subtitle: "Pub irlandais • Paris 11",
        note: "Happy Hour 17h-20h",
        score: "9.2",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBuRMxq66rRIxQvc7dwacuT_sPY4CH2cmQ6gZzrQN0P-lvYnhOSwl_g5lcLAQai6wxyjgq7BI7hYLfm7Ydk_9e6QrxwOcKbNtb6s8vI-zptKFvVF0JM_oIC8XXZlIQYMrCSeycO0KNzp4xWBbR9hsIenJMqWLSuHfuoUbiOHBnYafbngdmwYRJwGuX943pCOxg1l6ZWUTYtdyTeWQXNcYztlkVlLyCqXE7kbhRheRK71woX-8mM-4fFXhRzaykCwsQigHFxrMoXER9t",
    },
    {
        id: "sportscafe",
        title: "Le Sportscafé",
        subtitle: "Brasserie • Paris 08",
        note: "Diffusion Roland-Garros",
        score: "8.8",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCRCbFJwj0DplxVNkaMglWlBAX68ZuVuTcqLWEmtYLh9ZcvhxTQQIfxgk2eH1VK7DZDDUQZiIoYQLUK6rn1I-_ayj908s2L_4--hR7me0JlqD909wlDmZ4H1K7ISX_AMg9_WHQK1q8oyp_PYDW9_bu2AqawFlGujtmIVBAFrtake9aczM8Dy8iSZffHIRFUGC6ojGSqMaglLlBV_6aka8kzM3JS2xtE5xlJMCN7vp5oUAthnYjwHfgYRAoHQf7d1BShXEzh-eAPghy-",
    },
];

const UPCOMING = [
    { id: "1", home: "Paris SG", away: "Marseille", league: "Ligue 1", homeCode: "PSG", awayCode: "OM", time: "21:00", when: "Ce soir", primary: true },
    { id: "2", home: "Lakers", away: "Warriors", league: "NBA", homeCode: "LAL", awayCode: "GSW", time: "03:00", when: "Demain" },
];

const TestSearchScreen = () => {
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.tabActive} activeOpacity={0.85}>
                        <Text style={styles.tabActiveText}>Pour toi</Text>
                        <View style={styles.tabUnderline} />
                    </TouchableOpacity>

                    <View style={styles.avatarStack}>
                        {AVATARS.map((uri, index) => (
                            <View key={uri} style={[styles.avatarFrame, index > 0 && styles.avatarOverlap, { zIndex: 30 - index }]}>
                                <Image source={uri} style={styles.avatarImg} contentFit="cover" />
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.feedWrap} activeOpacity={0.85}>
                        <Text style={styles.feedText}>Feed</Text>
                        <View style={styles.newPill}>
                            <Text style={styles.newPillText}>New</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.locationRow} activeOpacity={0.85}>
                    <Text style={styles.locationText}>Ma position actuelle</Text>
                    <MaterialIcons name="expand-more" size={18} color="#ffffff" />
                </TouchableOpacity>

                <View style={styles.searchRow}>
                    <View style={styles.searchField}>
                        <MaterialIcons name="search" size={18} color="#a1a1aa" />
                        <TextInput placeholder="Rechercher un bar, un plat..." placeholderTextColor="#a1a1aa" style={styles.searchInput} />
                    </View>
                    <TouchableOpacity style={styles.mapBtn} activeOpacity={0.85}>
                        <MaterialIcons name="map" size={24} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
                <View style={styles.heroSection}>
                    <ScrollView horizontal pagingEnabled snapToInterval={SCREEN_WIDTH} decelerationRate="fast" showsHorizontalScrollIndicator={false} bounces={false}>
                        {HERO.map((item) => (
                            <View key={item.id} style={styles.heroSlide}>
                                <LinearGradient colors={item.gradient} style={styles.heroCard}>
                                    <Image source={item.image} style={styles.heroImage} contentFit="cover" />
                                    <LinearGradient colors={["rgba(0,0,0,0.82)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0)"]} style={styles.heroShade} />
                                    <View style={styles.heroContent}>
                                        <View style={styles.heroMetaRow}>
                                            <Text style={styles.heroBadge}>{item.badge}</Text>
                                            <Text style={styles.heroDate}>• {item.date}</Text>
                                        </View>
                                        <Text style={styles.heroTitle}>{item.title}</Text>
                                        <View style={styles.heroBottomRow}>
                                            <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
                                            <TouchableOpacity style={styles.heroAction} activeOpacity={0.85}>
                                                <Text style={styles.heroActionText}>{item.action}</Text>
                                                <MaterialIcons name="arrow-forward" size={12} color="#ffffff" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </View>
                        ))}
                    </ScrollView>
                    <View style={styles.heroDots}>
                        <View style={styles.dotActive} />
                        <View style={styles.dot} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tes Équipes</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowPad}>
                        {TEAMS.map((team) => (
                            <TouchableOpacity key={team.id} style={styles.teamItem} activeOpacity={0.85}>
                                {team.add ? (
                                    <View style={styles.teamAdd}>
                                        <MaterialIcons name="add" size={20} color="#a1a1aa" />
                                    </View>
                                ) : team.ring ? (
                                    <LinearGradient colors={["#f47b25", "#fb923c"]} style={styles.teamRing}>
                                        <View style={styles.teamInner}>
                                            <Image source={team.logo} style={styles.teamLogo} contentFit="contain" />
                                        </View>
                                        {team.live ? (
                                            <View style={styles.liveBadge}>
                                                <Text style={styles.liveBadgeText}>LIVE</Text>
                                            </View>
                                        ) : null}
                                    </LinearGradient>
                                ) : (
                                    <View style={styles.teamPlain}>
                                        <Image source={team.logo} style={styles.teamLogo} contentFit="contain" />
                                    </View>
                                )}
                                <Text style={[styles.teamLabel, team.add && { color: "#a1a1aa" }]} numberOfLines={1}>
                                    {team.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Compétitions populaires</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.competitionRow}>
                        {COMPETITIONS.map((c) => (
                            <TouchableOpacity key={c.id} style={styles.competitionItem} activeOpacity={0.85}>
                                <View style={styles.competitionCircle}>
                                    <MaterialIcons name={c.icon} size={20} color="#f47b25" />
                                </View>
                                <Text style={styles.competitionLabel} numberOfLines={1}>
                                    {c.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>À la une</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredRow}>
                        {FEATURED.map((item) => (
                            <TouchableOpacity key={item.id} style={[styles.featuredCard, { width: FEATURED_CARD_WIDTH }]} activeOpacity={0.9}>
                                <Image source={item.image} style={styles.featuredImage} contentFit="cover" />
                                <LinearGradient colors={["rgba(0,0,0,0.88)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0)"]} style={styles.featuredShade} />
                                <View style={styles.featuredTag}>
                                    <Text style={styles.featuredTagText}>{item.badge}</Text>
                                </View>
                                <View style={styles.featuredBottom}>
                                    <View style={styles.featuredTopRow}>
                                        <Text style={styles.featuredInfo}>{item.info}</Text>
                                        <TouchableOpacity style={styles.reserveBtn} activeOpacity={0.85}>
                                            <Text style={styles.reserveText}>Réserver</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.featuredTitle}>{item.title}</Text>
                                    <Text style={styles.featuredDetails}>{item.details}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Récemment vus</Text>
                        <TouchableOpacity activeOpacity={0.85}>
                            <Text style={styles.clearText}>Effacer</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
                        {RECENT.map((item) => (
                            <View key={item.id} style={[styles.recentCard, { width: RECENT_CARD_WIDTH }]}>
                                <Image source={item.image} style={styles.recentImage} contentFit="cover" />
                                <View style={styles.recentContent}>
                                    <Text style={styles.recentTitle} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    <Text style={styles.recentSub} numberOfLines={1}>
                                        {item.subtitle}
                                    </Text>
                                    <Text style={styles.recentSubSmall} numberOfLines={1}>
                                        {item.note}
                                    </Text>
                                </View>
                                <View style={styles.score}>
                                    <Text style={styles.scoreText}>{item.score}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <View style={[styles.section, { paddingHorizontal: 24 }]}>
                    <Text style={[styles.sectionTitle, { marginBottom: 2 }]}>Matchs à venir</Text>
                    <View style={styles.upcomingList}>
                        {UPCOMING.map((m) => (
                            <View key={m.id} style={styles.upcomingCard}>
                                <View style={styles.upcomingSide}>
                                    <View style={styles.code}>
                                        <Text style={styles.codeText}>{m.homeCode}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.teamName}>{m.home}</Text>
                                        <Text style={styles.teamLeague}>{m.league}</Text>
                                    </View>
                                </View>
                                <View style={styles.centerBlock}>
                                    <View style={[styles.timePill, m.primary ? styles.timePillPrimary : styles.timePillMuted]}>
                                        <Text style={[styles.timeText, m.primary ? { color: "#f47b25" } : { color: "#a1a1aa" }]}>{m.time}</Text>
                                    </View>
                                    <Text style={styles.whenText}>{m.when}</Text>
                                </View>
                                <View style={[styles.upcomingSide, styles.right]}>
                                    <View>
                                        <Text style={[styles.teamName, { textAlign: "right" }]}>{m.away}</Text>
                                        <Text style={[styles.teamLeague, { textAlign: "right" }]}>{m.league}</Text>
                                    </View>
                                    <View style={styles.code}>
                                        <Text style={styles.codeText}>{m.awayCode}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0b0b0f" },
    header: { paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)", backgroundColor: "#0b0b0f" },
    headerTop: { paddingHorizontal: 24, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 6 },
    tabActive: { position: "relative", paddingVertical: 6 },
    tabActiveText: { color: "#ffffff", fontSize: 27, fontWeight: "800" },
    tabUnderline: { position: "absolute", left: 0, right: 0, bottom: 0, height: 3, borderRadius: 99, backgroundColor: "#f47b25" },
    avatarStack: { flexDirection: "row", alignItems: "center" },
    avatarFrame: { width: 24, height: 24, borderRadius: 99, borderWidth: 1, borderColor: "#0b0b0f", overflow: "hidden" },
    avatarOverlap: { marginLeft: -8 },
    avatarImg: { width: "100%", height: "100%" },
    feedWrap: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6 },
    feedText: { color: "#a1a1aa", fontSize: 18, fontWeight: "600" },
    newPill: { backgroundColor: "#dc2626", borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 },
    newPillText: { color: "#fff", fontSize: 9, fontWeight: "800", lineHeight: 10 },
    locationRow: { paddingHorizontal: 24, flexDirection: "row", alignItems: "center", gap: 2, marginBottom: 8, alignSelf: "flex-start" },
    locationText: { color: "#ffffff", fontSize: 18, fontWeight: "700" },
    searchRow: { paddingHorizontal: 24, flexDirection: "row", alignItems: "center", gap: 12 },
    searchField: { flex: 1, minHeight: 46, borderRadius: 16, backgroundColor: "#232329", paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 8 },
    searchInput: { flex: 1, color: "#fff", fontSize: 14, fontWeight: "500", paddingVertical: 0 },
    mapBtn: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
    scroll: { flex: 1 },
    heroSection: { position: "relative", width: "100%", marginTop: 8 },
    heroSlide: { width: SCREEN_WIDTH, height: 176 },
    heroCard: { flex: 1 },
    heroImage: { ...StyleSheet.absoluteFillObject, opacity: 0.45 },
    heroShade: { ...StyleSheet.absoluteFillObject },
    heroContent: { flex: 1, justifyContent: "flex-end", paddingHorizontal: 20, paddingBottom: 30 },
    heroMetaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
    heroBadge: { backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 9, fontWeight: "800", textTransform: "uppercase", borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, overflow: "hidden" },
    heroDate: { color: "rgba(255,255,255,0.82)", fontSize: 10, fontWeight: "600" },
    heroTitle: { color: "#fff", fontSize: 35, fontWeight: "900", fontStyle: "italic", letterSpacing: -0.4 },
    heroBottomRow: { marginTop: 2, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    heroSubtitle: { color: "#e5e7eb", fontSize: 12, fontWeight: "500" },
    heroAction: { backgroundColor: "#f47b25", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, flexDirection: "row", alignItems: "center", gap: 4 },
    heroActionText: { color: "#fff", fontSize: 10, fontWeight: "800" },
    heroDots: { position: "absolute", bottom: 12, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 },
    dotActive: { width: 6, height: 6, borderRadius: 99, backgroundColor: "#fff" },
    dot: { width: 6, height: 6, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.4)" },
    section: { marginTop: 16, gap: 6 },
    sectionHeaderRow: { paddingHorizontal: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    sectionTitle: { color: "#fff", fontSize: 19, fontWeight: "800", paddingHorizontal: 24 },
    rowPad: { paddingHorizontal: 24, gap: 12 },
    teamItem: { minWidth: 56, alignItems: "center", gap: 4 },
    teamRing: { width: 56, height: 56, borderRadius: 99, padding: 2, position: "relative" },
    teamInner: { flex: 1, borderRadius: 99, borderWidth: 2, borderColor: "#0b0b0f", backgroundColor: "#1c1c21", alignItems: "center", justifyContent: "center", padding: 4 },
    teamPlain: { width: 56, height: 56, borderRadius: 99, borderWidth: 2, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#1c1c21", alignItems: "center", justifyContent: "center", padding: 4 },
    teamLogo: { width: 32, height: 32 },
    liveBadge: { position: "absolute", left: "50%", marginLeft: -14, bottom: -3, backgroundColor: "#dc2626", borderRadius: 99, borderWidth: 1, borderColor: "#0b0b0f", paddingHorizontal: 4, paddingVertical: 1 },
    liveBadgeText: { color: "#fff", fontSize: 7, fontWeight: "800", lineHeight: 8 },
    teamAdd: { width: 56, height: 56, borderRadius: 99, borderWidth: 2, borderStyle: "dashed", borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
    teamLabel: { width: 56, textAlign: "center", color: "#fff", fontSize: 9, fontWeight: "600" },
    competitionRow: { paddingHorizontal: 24, gap: 8 },
    competitionItem: { minWidth: 48, alignItems: "center", gap: 4 },
    competitionCircle: { width: 48, height: 48, borderRadius: 99, backgroundColor: "#1c1c21", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
    competitionLabel: { width: 56, textAlign: "center", color: "#a1a1aa", fontSize: 8, fontWeight: "700", textTransform: "uppercase" },
    featuredRow: { paddingHorizontal: 24, gap: 12 },
    featuredCard: { height: 168, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", backgroundColor: "#1c1c21" },
    featuredImage: { width: "100%", height: "100%", opacity: 0.92 },
    featuredShade: { ...StyleSheet.absoluteFillObject },
    featuredTag: { position: "absolute", top: 8, left: 8, backgroundColor: "rgba(244,123,37,0.9)", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
    featuredTagText: { color: "#fff", fontSize: 8, fontWeight: "800", textTransform: "uppercase" },
    featuredBottom: { position: "absolute", left: 10, right: 10, bottom: 10 },
    featuredTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    featuredInfo: { color: "#f47b25", fontSize: 9, fontWeight: "700" },
    reserveBtn: { backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    reserveText: { color: "#000", fontSize: 9, fontWeight: "800" },
    featuredTitle: { color: "#fff", marginTop: 2, fontSize: 16, fontWeight: "800" },
    featuredDetails: { marginTop: 1, color: "#f3f4f6", fontSize: 10, fontWeight: "500" },
    clearText: { color: "#a1a1aa", fontSize: 9, fontWeight: "600" },
    recentRow: { paddingHorizontal: 24, gap: 12 },
    recentCard: { minHeight: 72, borderRadius: 12, padding: 8, flexDirection: "row", gap: 10, backgroundColor: "#232329", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", position: "relative" },
    recentImage: { width: 56, height: 56, borderRadius: 8 },
    recentContent: { flex: 1, justifyContent: "center", gap: 2 },
    recentTitle: { color: "#fff", fontSize: 12, fontWeight: "800", paddingRight: 26 },
    recentSub: { color: "#a1a1aa", fontSize: 9, fontWeight: "500" },
    recentSubSmall: { color: "#a1a1aa", fontSize: 8, fontWeight: "500", marginTop: 1 },
    score: { position: "absolute", right: 8, top: 8, backgroundColor: "#166534", borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
    scoreText: { color: "#d1fae5", fontSize: 8, fontWeight: "800" },
    upcomingList: { gap: 8 },
    upcomingCard: { backgroundColor: "#1c1c21", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", minHeight: 66, paddingHorizontal: 10, paddingVertical: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    upcomingSide: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
    right: { justifyContent: "flex-end" },
    code: { width: 28, height: 28, borderRadius: 99, backgroundColor: "#2b2b32", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
    codeText: { color: "#cbd5e1", fontSize: 9, fontWeight: "800" },
    teamName: { color: "#fff", fontSize: 12, fontWeight: "700" },
    teamLeague: { color: "#a1a1aa", fontSize: 8, fontWeight: "500" },
    centerBlock: { alignItems: "center", paddingHorizontal: 4 },
    timePill: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1 },
    timePillPrimary: { backgroundColor: "rgba(244,123,37,0.12)", borderColor: "rgba(244,123,37,0.2)" },
    timePillMuted: { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.07)" },
    timeText: { fontSize: 9, fontWeight: "800" },
    whenText: { marginTop: 2, color: "#a1a1aa", fontSize: 7, fontWeight: "500" },
});

export default TestSearchScreen;
