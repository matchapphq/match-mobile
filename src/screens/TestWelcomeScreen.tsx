import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Animated,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const HERO_IMAGE =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBEo8L905bV0tu0itMAcKX8KWGIrVmXYi5Y8dAnmnQulD6fC7SxwQotT9NEE3f2C8EX4ctlqzeM3xOM_MSjqSikfte-Wd68AaSOtq1_LRV4ClV4oRz1YE0tHAYhvWmxFqjgCyocp-bWHbGnsDf8PCPgc_I_FXlGsrgGDGKt7uNxNK91tKKgOfcibjSCB2_7NRRFeRQtoUJ0axV6FnKmAafdP7_QZlurwu3OQK3Aow9zr0OUsmuGugpKABgfWtak7I-U0n5gvyRsnS6n";
const BRAND_PRIMARY = "#f47b25";
const { height } = Dimensions.get("window");

const TestWelcomeScreen = () => {
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentTranslate = useRef(new Animated.Value(40)).current;
    const navigation = useNavigation<any>();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(contentTranslate, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, [contentOpacity, contentTranslate]);

    const handleNext = () => {
        navigation.navigate("TestAuthEntry");
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={{ uri: HERO_IMAGE }} style={styles.background} resizeMode="cover">
                <LinearGradient
                    colors={["rgba(11,11,15,0.95)", "rgba(11,11,15,0.85)", "rgba(34,23,16,0.95)"]}
                    locations={[0, 0.5, 1]}
                    style={StyleSheet.absoluteFillObject}
                />
                <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                    <View style={styles.header}>
                        <Text style={styles.brand}>MATCH</Text>
                    </View>
                    <Animated.View
                        style={[
                            styles.content,
                            {
                                opacity: contentOpacity,
                                transform: [{ translateY: contentTranslate }],
                            },
                        ]}
                    >
                        <Text style={styles.headline}>
                            Trouve en 30 secondes les meilleurs spots pour regarder tes matchs
                        </Text>

                        <View style={styles.pagination}>
                            <View style={[styles.paginationDot, styles.paginationDotActive]} />
                            <View style={styles.paginationDot} />
                            <View style={styles.paginationDot} />
                        </View>

                        <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={handleNext}>
                            <Text style={styles.ctaLabel}>Suivant</Text>
                            <MaterialIcons name="arrow-forward" size={22} color="#fff" />
                        </TouchableOpacity>

                        <View style={{ height: 8 }} />
                    </Animated.View>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#221710",
    },
    background: {
        flex: 1,
        justifyContent: "space-between",
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    header: {
        alignItems: "center",
        paddingTop: 12,
        paddingBottom: 6,
    },
    brand: {
        color: "#ffffff",
        fontSize: 22,
        fontWeight: "800",
        letterSpacing: 4,
    },
    content: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: height * 0.1,
        gap: 24,
    },
    headline: {
        color: "#ffffff",
        fontSize: 34,
        textAlign: "center",
        fontWeight: "700",
        lineHeight: 42,
        letterSpacing: -0.5,
    },
    pagination: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(255,255,255,0.3)",
    },
    paginationDotActive: {
        backgroundColor: BRAND_PRIMARY,
    },
    cta: {
        marginTop: 16,
        width: "100%",
        height: 56,
        borderRadius: 16,
        backgroundColor: BRAND_PRIMARY,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        shadowColor: BRAND_PRIMARY,
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    ctaLabel: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
});

export default TestWelcomeScreen;
