import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../constants/theme";
import { useStore } from "../store/useStore";

const ProfileScreen = () => {
    const navigation = useNavigation<any>();
    const { user, logout } = useStore();

    const menuItems = [
        {
            id: "level",
            label: "Mon niveau",
            icon: "trophy-outline",
            color: theme.colors.primary,
        },
        {
            id: "reservations",
            label: "Mes réservations",
            icon: "people-outline",
            color: theme.colors.primary,
        },
        {
            id: "notifications",
            label: "Notifications",
            icon: "notifications-outline",
            color: theme.colors.primary,
        },
        {
            id: "reviews",
            label: "Mes avis",
            icon: "flag-outline",
            color: theme.colors.primary,
        },
        {
            id: "favorites",
            label: "Coups de coeur",
            icon: "heart-outline",
            color: theme.colors.primary,
        },
        {
            id: "info",
            label: "Mes infos",
            icon: "information-circle-outline",
            color: theme.colors.primary,
        },
        {
            id: "preferences",
            label: "Préférences sportives",
            icon: "settings-outline",
            color: theme.colors.primary,
        },
    ];

    const handleMenuPress = (id: string) => {
        switch (id) {
            case "reservations":
                navigation.navigate("Reservations");
                break;
            case "notifications":
                navigation.navigate("Notifications");
                break;
            default:
                break;
        }
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.globeButton}
                >
                    <Ionicons
                        name="globe-outline"
                        size={24}
                        color={theme.colors.secondary}
                    />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        Bonjour {user?.first_name} {user?.last_name}
                    </Text>
                    <View style={styles.titleUnderline} />
                </View>
                <View style={styles.headerProfileIcon}>
                    <Text style={styles.headerProfileEmoji}>👤</Text>
                </View>
            </View>

            <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarInner}>
                        <Image
                            source={{
                                uri:
                                    user?.avatar ||
                                    "https://api.dicebear.com/7.x/avataaars/png?seed=match",
                            }}
                            style={styles.avatarImage}
                        />
                    </View>
                </View>
                <Text style={styles.levelText}>Niveau Social Sport</Text>
            </View>

            <ScrollView
                style={styles.menuList}
                showsVerticalScrollIndicator={false}
            >
                {menuItems.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.menuItem}
                        onPress={() => handleMenuPress(item.id)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuItemContent}>
                            <Ionicons
                                name={item.icon as any}
                                size={24}
                                color={item.color}
                            />
                            <Text style={styles.menuItemText}>
                                {item.label}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.8}
            >
                <Text style={styles.logoutButtonText}>Déconnexion</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.footerButton}>
                    <Ionicons
                        name="open-outline"
                        size={18}
                        color={theme.colors.textSecondary}
                    />
                    <Text style={styles.footerText}>
                        Proposer un lieu{"\n"}sur Match
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
    },
    globeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: theme.colors.secondary,
        justifyContent: "center",
        alignItems: "center",
    },
    titleContainer: {
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: theme.colors.textDark,
    },
    titleUnderline: {
        width: 120,
        height: 2,
        backgroundColor: theme.colors.textDark,
        marginTop: 4,
    },
    headerProfileIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.secondary,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: theme.colors.secondary,
    },
    headerProfileEmoji: {
        fontSize: 18,
    },
    profileSection: {
        alignItems: "center",
        paddingVertical: theme.spacing.lg,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: theme.colors.secondary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: theme.spacing.md,
        backgroundColor: "#FFFFFF",
    },
    avatarInner: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: theme.colors.secondary,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    avatarImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
    },
    levelText: {
        fontSize: theme.fonts.sizes.lg,
        fontWeight: "bold",
        color: theme.colors.textDark,
    },
    menuList: {
        flex: 1,
        paddingHorizontal: theme.spacing.xl,
    },
    menuItem: {
        paddingVertical: theme.spacing.md + 4,
    },
    menuItemContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
    },
    menuItemText: {
        fontSize: theme.fonts.sizes.md,
        fontWeight: "500",
        color: theme.colors.primary,
    },
    logoutButton: {
        backgroundColor: theme.colors.secondary,
        marginHorizontal: theme.spacing.xxl,
        marginVertical: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.full,
        alignItems: "center",
    },
    logoutButtonText: {
        fontSize: theme.fonts.sizes.md,
        fontWeight: "bold",
        color: theme.colors.textDark,
    },
    footer: {
        paddingVertical: theme.spacing.lg,
        alignItems: "center",
    },
    footerButton: {
        alignItems: "center",
        gap: 4,
    },
    footerText: {
        fontSize: theme.fonts.sizes.sm,
        color: theme.colors.textSecondary,
        textAlign: "center",
    },
});

export default ProfileScreen;
