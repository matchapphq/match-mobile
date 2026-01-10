import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../constants/theme";

const SearchScreen = () => {
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"history" | "trending">(
        "history",
    );

    const searchHistory = [
        "Bars avec terrasse",
        "Happy hour",
        "NBA ce soir",
        "Match du moment",
    ];

    const trendingSearches = [
        "PSG vs OM",
        "Roland Garros",
        "Final ATP",
        "Premier League",
    ];

    const handleSearch = () => {
        if (searchQuery.trim()) {
            // Perform search
            console.log("Searching for:", searchQuery);
        }
    };

    const handleSearchItemPress = (query: string) => {
        setSearchQuery(query);
        handleSearch();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Recherche</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Profile")}
                >
                    <View style={styles.profileIcon}>
                        <Text>👤</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.searchCard}>
                <View style={styles.searchInputContainer}>
                    <TextInput
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Rechercher..."
                        placeholderTextColor={theme.colors.textSecondary}
                        onSubmitEditing={handleSearch}
                    />
                    <TouchableOpacity onPress={handleSearch}>
                        <Ionicons
                            name="search"
                            size={24}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === "history" && styles.activeTab,
                        ]}
                        onPress={() => setActiveTab("history")}
                    >
                        <Ionicons
                            name="time-outline"
                            size={20}
                            color={theme.colors.primary}
                        />
                        <Text style={styles.tabText}>Historique</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === "trending" && styles.activeTab,
                        ]}
                        onPress={() => setActiveTab("trending")}
                    >
                        <Ionicons
                            name="trending-up"
                            size={20}
                            color={theme.colors.primary}
                        />
                        <Text style={styles.tabText}>Tendances</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.searchList}>
                    {activeTab === "history" && (
                        <>
                            {searchHistory.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.searchItem}
                                    onPress={() => handleSearchItemPress(item)}
                                >
                                    <Text style={styles.searchItemText}>
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </>
                    )}

                    {activeTab === "trending" && (
                        <>
                            {trendingSearches.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.searchItem}
                                    onPress={() => handleSearchItemPress(item)}
                                >
                                    <Text style={styles.searchItemText}>
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </>
                    )}
                </ScrollView>

                <TouchableOpacity
                    style={styles.validateButton}
                    onPress={handleSearch}
                >
                    <Text style={styles.validateButtonText}>VALIDER</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        paddingTop: 50,
    },
    title: {
        fontSize: theme.fonts.sizes.xxl,
        fontWeight: "bold",
        color: theme.colors.text,
    },
    profileIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.secondary,
        justifyContent: "center",
        alignItems: "center",
    },
    searchCard: {
        backgroundColor: theme.colors.primary,
        marginHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        borderWidth: 2,
        borderColor: theme.colors.text,
    },
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.text,
        paddingBottom: theme.spacing.sm,
        marginBottom: theme.spacing.lg,
    },
    searchInput: {
        flex: 1,
        fontSize: theme.fonts.sizes.lg,
        color: theme.colors.text,
    },
    tabContainer: {
        flexDirection: "row",
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    tab: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.xs,
        paddingVertical: theme.spacing.xs,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.secondary,
    },
    tabText: {
        fontSize: theme.fonts.sizes.md,
        fontWeight: "bold",
        color: theme.colors.primary,
    },
    searchList: {
        maxHeight: 300,
        marginBottom: theme.spacing.lg,
    },
    searchItem: {
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surface,
    },
    searchItemText: {
        fontSize: theme.fonts.sizes.md,
        color: theme.colors.text,
    },
    validateButton: {
        backgroundColor: theme.colors.secondary,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.full,
        alignItems: "center",
    },
    validateButtonText: {
        fontSize: theme.fonts.sizes.lg,
        fontWeight: "bold",
        color: theme.colors.background,
    },
    closeButton: {
        position: "absolute",
        bottom: 30,
        alignSelf: "center",
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.secondary,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default SearchScreen;
