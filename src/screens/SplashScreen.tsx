import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreenNative from "expo-splash-screen";
import Svg, { Path, Polygon, G, Circle, Defs, RadialGradient, Stop, Pattern, Rect } from "react-native-svg";

const { width, height } = Dimensions.get("window");

// Brand Constants from CharteGraphique/colors.ts
const GREEN = "#9CFF00";       // Neon Green
const VIOLET = "#6D00FF";      // Official Brand Violet (Vibrant)
const VIOLET_LIGHT = "#8F00FF"; // Atmospheric Glow
const DEEP_BLACK = "#000025";  // Premium Dark Blue-Black
const WHITE = "#FFFFFF";

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

const SplashScreen = () => {
    // --- ANIMATED VALUES ---

    // 1. Intro & Strike
    const introGlow = useRef(new Animated.Value(0)).current;
    const boltPathOffset = useRef(new Animated.Value(1000)).current;
    const boltOpacity = useRef(new Animated.Value(0)).current;

    // 2. Impact
    const burstScale = useRef(new Animated.Value(0)).current;
    const burstOpacity = useRef(new Animated.Value(0)).current;

    // 3. Logo Reveal
    const logoStrokeOffset = useRef(new Animated.Value(4500)).current;
    const logoFillOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;

    // 4. Text Reveal
    const textOpacity = useRef(new Animated.Value(0)).current;
    const textY = useRef(new Animated.Value(20)).current;
    const progressWidth = useRef(new Animated.Value(0)).current;

    // 5. Idle Breathing
    const breathScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        SplashScreenNative.hideAsync().catch(() => {});

        // --- NATIVE DRIVER ANIMATIONS ---
        Animated.sequence([
            // STAGE 1: Intro Glow Pulse (0.0 - 0.5s)
            Animated.timing(introGlow, {
                toValue: 0.8,
                duration: 500,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
            }),

            // STAGE 2: Lightning Strike (0.5 - 1.1s)
            Animated.parallel([
                Animated.timing(boltOpacity, { toValue: 1, duration: 50, useNativeDriver: true }),
                Animated.timing(boltPathOffset, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(introGlow, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),

            // STAGE 3: Impact Burst (1.1s)
            Animated.parallel([
                Animated.timing(burstScale, { toValue: 1.8, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                Animated.timing(burstOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
                Animated.timing(boltOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
                // Start drawing Logo Stroke
                Animated.timing(logoStrokeOffset, {
                    toValue: 0,
                    duration: 700,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                    useNativeDriver: true,
                }),
            ]),

            // STAGE 4: Morph/Fill Logo & Text Reveal (1.8 - 3.0s)
            Animated.parallel([
                Animated.timing(logoFillOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(logoScale, { toValue: 1, duration: 500, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
                Animated.timing(burstOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.sequence([
                    Animated.delay(200),
                    Animated.parallel([
                        Animated.timing(textOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
                        Animated.timing(textY, { toValue: 0, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                    ]),
                ]),
            ]),
        ]).start(() => {
            // STAGE 5: Idle Breathing & Progress Loop
            Animated.loop(
                Animated.sequence([
                    Animated.timing(breathScale, { toValue: 1.03, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                    Animated.timing(breathScale, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                ])
            ).start();

            const animateProgress = () => {
                Animated.sequence([
                    Animated.timing(progressWidth, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                    Animated.timing(progressWidth, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                ]).start(() => animateProgress());
            };
            animateProgress();
        });
    }, []);

    return (
        <View style={styles.container}>
            {/* Cinematic Background Svg */}
            <View style={StyleSheet.absoluteFillObject}>
                <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
                    <Defs>
                        {/* Main deep background */}
                        <RadialGradient id="mainBgGrad" cx="50%" cy="40%" r="90%" fx="50%" fy="40%">
                            <Stop offset="0%" stopColor={VIOLET} stopOpacity="0.45" />
                            <Stop offset="45%" stopColor={DEEP_BLACK} stopOpacity="0.85" />
                            <Stop offset="100%" stopColor={DEEP_BLACK} stopOpacity="1" />
                        </RadialGradient>
                        
                        {/* Atmospheric Orb 1 (Top Left) */}
                        <RadialGradient id="orb1Grad" cx="50%" cy="50%" r="50%">
                            <Stop offset="0%" stopColor={VIOLET_LIGHT} stopOpacity="0.18" />
                            <Stop offset="100%" stopColor={VIOLET_LIGHT} stopOpacity="0" />
                        </RadialGradient>
                        
                        {/* Atmospheric Orb 2 (Bottom Right) */}
                        <RadialGradient id="orb2Grad" cx="50%" cy="50%" r="50%">
                            <Stop offset="0%" stopColor={GREEN} stopOpacity="0.12" />
                            <Stop offset="100%" stopColor={GREEN} stopOpacity="0" />
                        </RadialGradient>

                        {/* Atmospheric Orb 3 (Center Bottom) */}
                        <RadialGradient id="orb3Grad" cx="50%" cy="50%" r="50%">
                            <Stop offset="0%" stopColor={VIOLET} stopOpacity="0.15" />
                            <Stop offset="100%" stopColor={VIOLET} stopOpacity="0" />
                        </RadialGradient>

                        {/* Grid Pattern Pattern */}
                        <Pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                            <Path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeOpacity="0.04" strokeWidth="1"/>
                        </Pattern>
                    </Defs>

                    {/* Fill background */}
                    <Circle cx="50%" cy="50%" r="100%" fill="url(#mainBgGrad)" />
                    
                    {/* Ambient Orbs */}
                    <Circle cx="15%" cy="15%" r="45%" fill="url(#orb1Grad)" />
                    <Circle cx="85%" cy="85%" r="40%" fill="url(#orb2Grad)" />
                    <Circle cx="50%" cy="110%" r="50%" fill="url(#orb3Grad)" />

                    {/* Grid Overlay */}
                    <Rect width="100%" height="100%" fill="url(#gridPattern)" />
                </Svg>
            </View>

            {/* Stage 1: Dynamic Center Glow */}
            <Animated.View style={[
                styles.dynamicGlow, 
                { 
                    opacity: introGlow,
                    transform: [{ scale: breathScale }]
                }
            ]} />

            {/* Main Content (Logo + Text) */}
            <Animated.View style={[
                styles.content,
                { transform: [{ scale: Animated.multiply(logoScale, breathScale) }] }
            ]}>
                
                <View style={styles.logoWrapper}>
                    <Svg width={300} height={300} viewBox="0 0 1080 1080">
                        <Defs>
                            <RadialGradient id="burstGrad" cx="540" cy="540" r="540" fx="540" fy="540">
                                <Stop offset="0%" stopColor={GREEN} stopOpacity="1" />
                                <Stop offset="70%" stopColor={VIOLET_LIGHT} stopOpacity="0.3" />
                                <Stop offset="100%" stopColor={VIOLET_LIGHT} stopOpacity="0" />
                            </RadialGradient>
                        </Defs>

                        {/* Impact Burst */}
                        <AnimatedG style={{ transform: [{ scale: burstScale }], opacity: burstOpacity }}>
                            <Circle cx="540" cy="540" r="500" fill="url(#burstGrad)" />
                        </AnimatedG>

                        {/* Lightning Bolt Strike (Stage 2) */}
                        <AnimatedPath
                            d="M540,-500 L600,-200 L480,100 L540,300"
                            stroke={GREEN}
                            strokeWidth="15"
                            strokeDasharray="1000"
                            strokeDashoffset={boltPathOffset}
                            opacity={boltOpacity}
                            fill="none"
                        />

                        {/* M Logo (Stage 3) */}
                        <G>
                            <AnimatedPolygon
                                points="717.7 279.9 567.1 452.6 525.9 281 414.1 472.4 504.4 451.1 257.5 743.7 382.4 743.7 443 557.2 521.7 686.6 714.2 470.6 640.6 743.2 800.2 743.7 898.1 279.9 717.7 279.9"
                                stroke={GREEN}
                                strokeWidth="12"
                                strokeDasharray="4500"
                                strokeDashoffset={logoStrokeOffset}
                                fill={GREEN}
                                fillOpacity={logoFillOpacity}
                            />
                            <AnimatedPath
                                d="M295.4,558.2l207.3-277.4-168.5-.9-2,6.2h0c-2.1,5.6-4.7,15.7-6,19.9-33.4,108.3-63.5,218-94.8,326.9l-39,131.5c-.3,1-.6,2-.9,3.1l-.2.7-9.4,31.8,210.3-273.5-96.8,31.6h0Z"
                                stroke={GREEN}
                                strokeWidth="12"
                                strokeDasharray="4500"
                                strokeDashoffset={logoStrokeOffset}
                                fill={GREEN}
                                fillOpacity={logoFillOpacity}
                            />
                        </G>
                    </Svg>
                </View>

                {/* Typography (Stage 4) */}
                <Animated.View style={[
                    styles.textContainer, 
                    { opacity: textOpacity, transform: [{ translateY: textY }] }
                ]}>
                    <Animated.Text style={styles.brandText}>MATCH</Animated.Text>
                    
                    {/* Loading Line */}
                    <View style={styles.progressTrack}>
                        <Animated.View style={[
                            styles.progressFill,
                            { transform: [{ scaleX: progressWidth }] }
                        ]} />
                    </View>
                </Animated.View>
            </Animated.View>

            {/* Safe Area Spacer (Bottom) */}
            <View style={styles.homeIndicatorSpacer} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DEEP_BLACK,
        alignItems: "center",
        justifyContent: "center",
    },
    dynamicGlow: {
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: 250,
        backgroundColor: VIOLET,
        shadowColor: VIOLET_LIGHT,
        shadowRadius: 120,
        shadowOpacity: 0.8,
        opacity: 0.4,
    },
    content: {
        alignItems: "center",
        justifyContent: "center",
    },
    logoWrapper: {
        alignItems: "center",
        justifyContent: "center",
    },
    textContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    brandText: {
        color: WHITE,
        fontSize: 58,
        fontWeight: '900',
        letterSpacing: 4,
        textShadowColor: 'rgba(143, 0, 255, 0.6)', // Consistent with VIOLET_LIGHT
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    progressTrack: {
        marginTop: 25,
        height: 2,
        width: 140,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        width: '100%',
        backgroundColor: GREEN,
    },
    homeIndicatorSpacer: {
        position: 'absolute',
        bottom: 40,
    },
});

export default SplashScreen;
