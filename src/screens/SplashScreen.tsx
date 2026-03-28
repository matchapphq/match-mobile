import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions, StatusBar, Text, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreenNative from "expo-splash-screen";
import Svg, { Path, G, Polygon, RadialGradient, Defs, Stop, Rect } from "react-native-svg";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Brand Constants (Updated to match Brand Guidelines PDF)
const BRAND_VIOLET = "#6D00FF";
const DEEP_NAVY = "#000025";
const BRAND_GREEN = "#9CFF00";

const SplashScreen = () => {
    // Snappy animations for instant recognition
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const glowAnim = useRef(new Animated.Value(0.2)).current;
    const taglineFadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Hide native splash screen
        SplashScreenNative.hideAsync().catch(() => {});

        // Snappy, modern entrance
        Animated.parallel([
            Animated.timing(fadeAnim, { 
                toValue: 1, 
                duration: 700, 
                useNativeDriver: true 
            }),
            Animated.spring(scaleAnim, { 
                toValue: 1, 
                friction: 8, 
                tension: 30,
                useNativeDriver: true 
            }),
            Animated.timing(taglineFadeAnim, {
                toValue: 1,
                duration: 800,
                delay: 400,
                useNativeDriver: true
            }),
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, { toValue: 0.4, duration: 2500, useNativeDriver: true }),
                    Animated.timing(glowAnim, { toValue: 0.2, duration: 2500, useNativeDriver: true }),
                ])
            ).start(),
        ]).start();
    }, [fadeAnim, scaleAnim, glowAnim, taglineFadeAnim]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* 1. Brand Gradient Background (Updated Colors) */}
            <LinearGradient
                colors={[BRAND_VIOLET, DEEP_NAVY]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />

            {/* 2. Subtle Stadium Atmosphere Glow */}
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: glowAnim }]}>
                <Svg height="100%" width="100%">
                    <Defs>
                        <RadialGradient id="stadiumGlow" cx="50%" cy="50%" r="50%">
                            <Stop offset="0%" stopColor={BRAND_VIOLET} stopOpacity="0.4" />
                            <Stop offset="100%" stopColor={DEEP_NAVY} stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Rect width="100%" height="100%" fill="url(#stadiumGlow)" />
                </Svg>
            </Animated.View>

            {/* 3. MATCH Wordmark (Iconic Green M + Square-Geometric ATCH) */}
            <Animated.View style={[
                styles.contentWrapper,
                { 
                    opacity: fadeAnim, 
                    transform: [{ scale: scaleAnim }],
                }
            ]}>
                <Svg width={width * 0.85} height={100} viewBox="0 0 550 100">
                    {/* Iconic M: Original Green Paths */}
                    <G transform="translate(-10, -45) scale(0.18)" fill={BRAND_GREEN}>
                        <Polygon
                            points="717.7 279.9 567.1 452.6 525.9 281 414.1 472.4 504.4 451.1 257.5 743.7 382.4 743.7 443 557.2 521.7 686.6 714.2 470.6 640.6 743.2 800.2 743.7 898.1 279.9 717.7 279.9"
                        />
                        <Path
                            d="M295.4,558.2l207.3-277.4-168.5-.9-2,6.2h0c-2.1,5.6-4.7,15.7-6,19.9-33.4,108.3-63.5,218-94.8,326.9l-39,131.5c-.3,1-.6,2-.9,3.1l-.2.7-9.4,31.8,210.3-273.5-96.8,31.6h0Z"
                        />
                    </G>

                    {/* ATCH: Square-Geometric Bold White Paths (Sporty / Tech Style) */}
                    <G fill="#FFFFFF" transform="translate(155, 0)">
                        {/* A: Blocky with flat top */}
                        <Path d="M0 85 L20 10 H60 L80 85 H60 L55 65 H25 L20 85 H0 Z" />
                        <Path d="M28 50 H52 L54 58 H26 Z" />

                        {/* T: Wide and Robust */}
                        <Path d="M90 10 H170 V25 H143 V85 H117 V25 H90 V10 Z" />

                        {/* C: Squarish Tech Curve */}
                        <Path d="M185 25 V70 C185 80 190 85 200 85 H250 V70 H205 V25 H250 V10 H200 C190 10 185 15 185 25 Z" />

                        {/* H: Wide Pillars */}
                        <Path d="M265 10 H285 V40 H330 V10 H350 V85 H330 V55 H285 V85 H265 V10 Z" />
                    </G>
                </Svg>

                {/* 4. Tagline (from Page 10 of Brand Guidelines) */}
                <Animated.View style={[styles.taglineWrapper, { opacity: taglineFadeAnim }]}>
                    <Text style={styles.taglineText}>
                        Trouve en 30 secondes les meilleurs spots pour regarder tes matchs
                    </Text>
                </Animated.View>
            </Animated.View>

            {/* 5. Settings Access */}
            <View style={styles.settingsContainer}>
                <MaterialIcons name="settings" size={24} color="rgba(255,255,255,0.4)" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: DEEP_NAVY,
    },
    contentWrapper: {
        alignItems: "center",
        justifyContent: "center",
    },
    taglineWrapper: {
        marginTop: 20,
        paddingHorizontal: 40,
    },
    taglineText: {
        color: BRAND_GREEN,
        fontSize: 14,
        textAlign: "center",
        fontWeight: "700",
        fontFamily: Platform.select({
            ios: "AvenirNext-Bold",
            android: "sans-serif-condensed",
            default: "System",
        }),
        letterSpacing: 1.2,
        textTransform: "uppercase",
        opacity: 0.9,
    },
    settingsContainer: {
        position: "absolute",
        bottom: 60,
        right: 35,
    }
});

export default SplashScreen;
