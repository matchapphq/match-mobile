import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";

interface TestPillProps {
    state: any;
    descriptors: any;
    navigation: any;
}

const TestPill = ({ state, descriptors, navigation }: TestPillProps) => {
    return (
        <BlurView intensity={80} tint="dark" style={styles.navBar}>
            {state.routes.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                // Map route names to icons and labels
                let iconName: keyof typeof MaterialIcons.glyphMap = "circle";
                let displayText = label;

                // Adjust these based on your actual route names in TestTabNavigator
                if (route.name === "TestMap") {
                    iconName = "map";
                    displayText = "Découvrir";
                } else if (route.name === "TestSearch") {
                    iconName = "search";
                    displayText = "Rechercher";
                } else if (route.name === "Reservations") {
                    iconName = "confirmation-number";
                    displayText = "Réservations";
                } else if (route.name === "Profile") {
                    iconName = "person";
                    displayText = "Profil";
                }

                return (
                    <NavBarItem
                        key={index}
                        icon={iconName}
                        label={displayText}
                        active={isFocused}
                        onPress={onPress}
                    />
                );
            })}
        </BlurView>
    );
};

const NavBarItem = ({ icon, label, active, onPress }: any) => {
    // Animation for scale
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: active ? 1.15 : 1,
            useNativeDriver: true,
            friction: 5,
            tension: 40
        }).start();
    }, [active]);

    return (
        <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.7}>
            <Animated.View style={{ alignItems: 'center', gap: 4, transform: [{ scale: scaleAnim }] }}>
                <MaterialIcons name={icon} size={26} color={active ? COLORS.primary : COLORS.slate400} />
                <Text style={[styles.navItemLabel, active && styles.navItemLabelActive]}>{label}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    navBar: {
        position: 'absolute',
        bottom: 32,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 32,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        zIndex: 50,
        maxWidth: 384,
        alignSelf: 'center',
        overflow: 'hidden', // Required for BlurView to clip correctly
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    navItemLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: COLORS.slate400,
    },
    navItemLabelActive: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});

export default TestPill;
