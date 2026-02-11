import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialIcons } from "@expo/vector-icons";
import { useStore } from "../store/useStore";

interface BottomTabPillProps {
    state: any;
    descriptors: any;
    navigation: any;
}

const BottomTabPill = ({ state, descriptors, navigation }: BottomTabPillProps) => {
    const { colors, themeMode } = useStore();

    return (
        <BlurView
            intensity={80}
            tint={themeMode === 'light' ? 'light' : 'dark'}
            style={[styles.navBar, { borderColor: colors.border }]}
        >
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

                // Adjust these based on your actual route names in TabNavigator
                if (route.name === "Map") {
                    iconName = "map";
                    displayText = "Découvrir";
                } else if (route.name === "Search") {
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
                        colors={colors}
                    />
                );
            })}
        </BlurView>
    );
};

const NavBarItem = ({ icon, label, active, onPress, colors }: any) => {
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
                <MaterialIcons name={icon} size={26} color={active ? colors.primary : colors.slate400} />
                <Text style={[styles.navItemLabel, { color: colors.slate400 }, active && { color: colors.primary, fontWeight: 'bold' }]}>{label}</Text>
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
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
    },
});

export default BottomTabPill;
