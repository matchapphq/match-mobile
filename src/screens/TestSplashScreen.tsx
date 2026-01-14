import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../constants/theme";

const { width, height } = Dimensions.get("window");
const BRAND_PRIMARY = "#f47b25";
const DOT_COUNT = 3;
const PATTERN_COLUMNS = 6;
const PATTERN_ROWS = 14;

const TestSplashScreen = () => {
    const iconScale = useRef(new Animated.Value(0.7)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const dotAnimations = useRef([...Array(DOT_COUNT)].map(() => new Animated.Value(0))).current;

    const patternDots = useMemo(() => {
        const dots = [];
        for (let row = 0; row < PATTERN_ROWS; row++) {
            for (let col = 0; col < PATTERN_COLUMNS; col++) {
                dots.push({ row, col, key: `${row}-${col}` });
            }
        }
        return dots;
    }, []);

    useEffect(() => {
        Animated.parallel([
            Animated.spring(iconScale, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        dotAnimations.forEach((anim, index) => {
            const animateDot = () => {
                Animated.sequence([
                    Animated.delay(index * 160),
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 320,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0.3,
                        duration: 320,
                        useNativeDriver: true,
                    }),
                    Animated.delay((DOT_COUNT - index) * 120),
                ]).start(animateDot);
            };

            animateDot();
        });
    }, [contentOpacity, dotAnimations, iconScale]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#050506", "#0b0b0f", "#0f0f18"]}
                style={StyleSheet.absoluteFillObject}
                locations={[0, 0.4, 1]}
            />

            <LinearGradient
                colors={[`${BRAND_PRIMARY}15`, `${BRAND_PRIMARY}05`, "transparent"]}
                style={[styles.glow, styles.glowTop]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
            />
            <LinearGradient
                colors={["transparent", `${BRAND_PRIMARY}08`, `${BRAND_PRIMARY}20`]}
                style={[styles.glow, styles.glowBottom]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 1, y: 0.8 }}
            />

            <View style={styles.pattern} pointerEvents="none">
                {patternDots.map(({ key, row, col }) => (
                    <View
                        key={key}
                        style={[
                            styles.patternDot,
                            {
                                top: row * 32,
                                left: col * 32,
                                opacity: row % 2 === 0 ? 0.05 : 0.08,
                            },
                        ]}
                    />
                ))}
            </View>

            <Animated.View style={[styles.content, { opacity: contentOpacity, transform: [{ scale: iconScale }] }]}>
                <View style={styles.iconWrapper}>
                    <MaterialIcons name="sports-bar" size={60} color={BRAND_PRIMARY} />
                    <View style={styles.iconBorder} />
                </View>
                <Text style={styles.title}>MATCH</Text>
                <Text style={styles.subtitle}>Les meilleurs plans matchs qui te laisseront sans voix</Text>
            </Animated.View>

            <View style={styles.loader}>
                <View style={styles.dotRow}>
                    {dotAnimations.map((anim, idx) => (
                        <Animated.View
                            key={`loader-dot-${idx}`}
                            style={[
                                styles.dot,
                                {
                                    opacity: anim,
                                    transform: [
                                        {
                                            translateY: anim.interpolate({
                                                inputRange: [0.3, 1],
                                                outputRange: [0, -4],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        />
                    ))}
                </View>
                <Text style={styles.loaderLabel}>CHARGEMENT</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#050506",
    },
    glow: {
        position: "absolute",
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        opacity: 0.7,
    },
    glowTop: {
        top: height * 0.1,
        left: -width * 0.1,
    },
    glowBottom: {
        bottom: height * 0.05,
        right: -width * 0.15,
    },
    pattern: {
        position: "absolute",
        opacity: 0.05,
        flexDirection: "row",
        flexWrap: "wrap",
        width: width * 0.8,
        height: height * 0.8,
    },
    patternDot: {
        position: "absolute",
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#ffffff",
    },
    content: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
        gap: 16,
    },
    iconWrapper: {
        width: 110,
        height: 110,
        borderRadius: 32,
        backgroundColor: "#1c1c21",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        position: "relative",
        shadowColor: BRAND_PRIMARY,
        shadowOpacity: 0.3,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 12 },
        elevation: 10,
    },
    iconBorder: {
        position: "absolute",
        inset: 6,
        borderRadius: 26,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    title: {
        fontSize: 56,
        fontWeight: "800",
        letterSpacing: 8,
        color: theme.colors.text,
    },
    subtitle: {
        color: "#a1a1aa",
        fontSize: 18,
        textAlign: "center",
        lineHeight: 26,
    },
    loader: {
        position: "absolute",
        bottom: 60,
        alignItems: "center",
        gap: 10,
    },
    dotRow: {
        flexDirection: "row",
        gap: 6,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: BRAND_PRIMARY,
    },
    loaderLabel: {
        marginTop: 8,
        fontSize: 12,
        letterSpacing: 4,
        color: "rgba(161,161,170,0.6)",
    },
});

export default TestSplashScreen;
