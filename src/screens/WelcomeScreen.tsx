import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Animated,
    Dimensions,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { usePostHog } from "posthog-react-native";

type HeroSlide = {
    id: string;
    image: ImageSourcePropType;
    headline: string;
    subtitle: string;
};

const HERO_SLIDES: HeroSlide[] = [
    {
        id: "discover",
        image: require("../../assets/onboarding/discover.png"),
        headline: "Trouve ton spot, vis le match.",
        subtitle: "Les meilleurs bars sportifs autour de toi, en quelques secondes.",
    },
    {
        id: "reserve",
        image: require("../../assets/onboarding/reserve.png"),
        headline: "Réserve ta table avant le coup d'envoi.",
        subtitle: "Choisis ton lieu, ton horaire et confirme en un instant.",
    },
    {
        id: "share",
        image: require("../../assets/onboarding/share.png"),
        headline: "Invite tes amis et vibrez ensemble.",
        subtitle: "Partage ton plan en 1 clic et retrouvez-vous sur place.",
    },
    {
        id: "vibe",
        image: require("../../assets/onboarding/vibe.png"),
        headline: "Filtre selon l'ambiance que tu cherches.",
        subtitle: "Calme, festif, grand écran: trouve le spot qui te correspond.",
    },
    {
        id: "plan",
        image: require("../../assets/onboarding/plan.png"),
        headline: "Planifie ta soirée sans prise de tête.",
        subtitle: "Tout est clair: distance, disponibilité et infos utiles.",
    },
];

const LOOP_SLIDES: HeroSlide[] = [
    { ...HERO_SLIDES[HERO_SLIDES.length - 1], id: "clone-last" },
    ...HERO_SLIDES,
    { ...HERO_SLIDES[0], id: "clone-first" },
];

const AUTO_SCROLL_INTERVAL_MS = 10000;
const BRAND_PRIMARY = "#f47b25";
const { height, width } = Dimensions.get("window");

const WelcomeScreen = () => {
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentTranslate = useRef(new Animated.Value(40)).current;
    const carouselRef = useRef<FlatList<HeroSlide>>(null);
    const isDraggingRef = useRef(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loopIndex, setLoopIndex] = useState(1);
    const [autoScrollResetToken, setAutoScrollResetToken] = useState(0);
    const navigation = useNavigation<any>();
    const posthog = usePostHog();

    useEffect(() => {
        posthog.capture("onboarding_started");
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

    const goToLoopIndex = (index: number, animated = true) => {
        carouselRef.current?.scrollToIndex({ index, animated });
        setLoopIndex(index);
        if (index === 0) {
            setCurrentIndex(HERO_SLIDES.length - 1);
            return;
        }
        if (index === LOOP_SLIDES.length - 1) {
            setCurrentIndex(0);
            return;
        }
        setCurrentIndex(index - 1);
    };

    const resetAutoScrollTimer = () => {
        setAutoScrollResetToken((value) => value + 1);
    };

    const handleMomentumScrollEnd = (
        event: NativeSyntheticEvent<NativeScrollEvent>,
    ) => {
        const nextLoopIndex = Math.round(
            event.nativeEvent.contentOffset.x / width,
        );

        if (nextLoopIndex === 0) {
            const targetIndex = HERO_SLIDES.length;
            carouselRef.current?.scrollToIndex({
                index: targetIndex,
                animated: false,
            });
            setLoopIndex(targetIndex);
            setCurrentIndex(HERO_SLIDES.length - 1);
            return;
        }

        if (nextLoopIndex === LOOP_SLIDES.length - 1) {
            carouselRef.current?.scrollToIndex({
                index: 1,
                animated: false,
            });
            setLoopIndex(1);
            setCurrentIndex(0);
            return;
        }

        if (nextLoopIndex >= 1 && nextLoopIndex <= HERO_SLIDES.length) {
            setLoopIndex(nextLoopIndex);
            setCurrentIndex(nextLoopIndex - 1);
        }
    };

    useEffect(() => {
        if (isDraggingRef.current) {
            return;
        }

        const timeoutId = setTimeout(() => {
            if (isDraggingRef.current) {
                return;
            }

            const nextLoopIndex =
                loopIndex + 1 > LOOP_SLIDES.length - 1 ? 1 : loopIndex + 1;
            goToLoopIndex(nextLoopIndex);
        }, AUTO_SCROLL_INTERVAL_MS);

        return () => clearTimeout(timeoutId);
    }, [loopIndex, autoScrollResetToken]);

    const handleStart = () => {
        navigation.navigate("AuthEntry");
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={carouselRef}
                data={LOOP_SLIDES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        <ImageBackground
                            source={item.image}
                            style={styles.background}
                            resizeMode="cover"
                        >
                            <LinearGradient
                                colors={[
                                    "rgba(11,11,15,0.95)",
                                    "rgba(11,11,15,0.85)",
                                    "rgba(34,23,16,0.95)",
                                ]}
                                locations={[0, 0.5, 1]}
                                style={StyleSheet.absoluteFillObject}
                            />
                        </ImageBackground>
                    </View>
                )}
                style={StyleSheet.absoluteFillObject}
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                initialScrollIndex={1}
                getItemLayout={(_, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
                onScrollToIndexFailed={({ index }) => {
                    setTimeout(() => {
                        carouselRef.current?.scrollToOffset({
                            offset: index * width,
                            animated: false,
                        });
                    }, 0);
                }}
                onScrollBeginDrag={() => {
                    isDraggingRef.current = true;
                    resetAutoScrollTimer();
                }}
                onScrollEndDrag={() => {
                    isDraggingRef.current = false;
                }}
                onMomentumScrollEnd={(event) => {
                    isDraggingRef.current = false;
                    handleMomentumScrollEnd(event);
                    resetAutoScrollTimer();
                }}
            />

            <SafeAreaView
                style={styles.safeArea}
                edges={["top", "bottom"]}
                pointerEvents="box-none"
            >
                <View style={styles.header} pointerEvents="none">
                    <Text style={styles.brand}>MATCH</Text>
                </View>
                <Animated.View
                    pointerEvents="box-none"
                    style={[
                        styles.content,
                        {
                            opacity: contentOpacity,
                            transform: [{ translateY: contentTranslate }],
                        },
                    ]}
                >
                    <Text style={styles.headline} pointerEvents="none">
                        {HERO_SLIDES[currentIndex]?.headline}
                    </Text>
                    <Text style={styles.subtitle} pointerEvents="none">
                        {HERO_SLIDES[currentIndex]?.subtitle}
                    </Text>

                    <View style={styles.pagination} pointerEvents="none">
                        {HERO_SLIDES.map((slide, index) => (
                            <View
                                key={slide.id}
                                style={[
                                    styles.paginationDot,
                                    index === currentIndex &&
                                        styles.paginationDotActive,
                                ]}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.cta}
                        activeOpacity={0.85}
                        onPress={handleStart}
                    >
                        <Text style={styles.ctaLabel}>Commencer</Text>
                        <MaterialIcons
                            name="arrow-forward"
                            size={22}
                            color="#fff"
                        />
                    </TouchableOpacity>

                    <View style={styles.ctaSpacer} />
                </Animated.View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#221710",
    },
    slide: {
        width,
        flex: 1,
    },
    background: {
        flex: 1,
        justifyContent: "space-between",
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 24,
        justifyContent: "space-between",
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
    subtitle: {
        color: "rgba(255,255,255,0.76)",
        fontSize: 15,
        textAlign: "center",
        lineHeight: 22,
        paddingHorizontal: 12,
        marginTop: -4,
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
    ctaSpacer: {
        height: 8,
    },
});

export default WelcomeScreen;
