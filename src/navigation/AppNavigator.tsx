import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
// import { theme } from "../constants/theme"; // Removed static theme import to avoid confusion
import { useStore } from "../store/useStore";

// Import screens
import SplashScreen from "../screens/TestSplashScreen";
import TestWelcomeScreen from "../screens/TestWelcomeScreen";
import TestAuthEntryScreen from "../screens/TestAuthEntryScreen";
import TestOnboardingScreen from "../screens/TestOnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import TestTabNavigator from "./TestTabNavigator";
import TestReservationsScreen from "../screens/TestReservationsScreen";
import TestVenueProfileScreen from "../screens/TestVenueProfileScreen";
import TestFaqSupport from "../screens/TestFaqSupport";
import TestReservationSuccessScreen from "../screens/TestReservationSuccessScreen";
import TestMatchDetailScreen from "../screens/TestMatchDetailScreen";
import LanguageSelectionScreen from "../screens/LanguageSelectionScreen";
import ThemeSelectionScreen from "../screens/ThemeSelectionScreen";

const Stack = createStackNavigator();

export const AppNavigator = () => {
    const { isAuthenticated, colors } = useStore();
    const [isLoading, setIsLoading] = React.useState(true);

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setIsLoading(false), 2000);
    }, []);

    if (isLoading) {
        return <SplashScreen />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: colors.background },
                }}
            >
                {!isAuthenticated ? (
                    <>
                        <Stack.Screen name="TestWelcome" component={TestWelcomeScreen} />
                        <Stack.Screen name="TestAuthEntry" component={TestAuthEntryScreen} />
                        <Stack.Screen name="TestOnboarding" component={TestOnboardingScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="TestTab" component={TestTabNavigator} />
                        <Stack.Screen name="TestVenueProfile" component={TestVenueProfileScreen} />
                        <Stack.Screen name="TestReservationsScreen" component={TestReservationsScreen} />
                        <Stack.Screen name="TestReservationSuccess" component={TestReservationSuccessScreen} />
                        <Stack.Screen name="TestMatchDetail" component={TestMatchDetailScreen} />
                        <Stack.Screen name="TestFaqSupport" component={TestFaqSupport} />
                        <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
                        <Stack.Screen name="ThemeSelection" component={ThemeSelectionScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};