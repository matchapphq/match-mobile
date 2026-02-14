import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
// import { theme } from "../constants/theme"; // Removed static theme import to avoid confusion
import { useStore } from "../store/useStore";

// Import screens
import SplashScreen from "../screens/SplashScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import AuthEntryScreen from "../screens/AuthEntryScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import TabNavigator from "./TabNavigator";
import ReservationsScreen from "../screens/ReservationsScreen";
import VenueProfileScreen from "../screens/VenueProfileScreen";
import FaqSupport from "../screens/FaqSupport";
import ReservationSuccessScreen from "../screens/ReservationSuccessScreen";
import MatchDetailScreen from "../screens/MatchDetailScreen";
import VenueMatchesScreen from "../screens/VenueMatchesScreen";
import VenueReviewsScreen from "../screens/VenueReviewsScreen";
import LanguageSelectionScreen from "../screens/LanguageSelectionScreen";
import ThemeSelectionScreen from "../screens/ThemeSelectionScreen";
import { PostHogProvider } from 'posthog-react-native';

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
            <PostHogProvider 
                apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY} 
                options={{
                    host: process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
                }}
            >
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        cardStyle: { backgroundColor: colors.background },
                    }}
                >
                    {!isAuthenticated ? (
                        <>
                            <Stack.Screen name="Welcome" component={WelcomeScreen} />
                            <Stack.Screen name="AuthEntry" component={AuthEntryScreen} />
                            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                            <Stack.Screen name="Login" component={LoginScreen} />
                        </>
                    ) : (
                        <>
                            <Stack.Screen name="Tab" component={TabNavigator} />
                            <Stack.Screen name="VenueProfile" component={VenueProfileScreen} />
                            <Stack.Screen name="VenueMatches" component={VenueMatchesScreen} />
                            <Stack.Screen name="VenueReviews" component={VenueReviewsScreen} />
                            <Stack.Screen name="ReservationsScreen" component={ReservationsScreen} />
                            <Stack.Screen name="ReservationSuccess" component={ReservationSuccessScreen} />
                            <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />
                            <Stack.Screen name="FaqSupport" component={FaqSupport} />
                            <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
                            <Stack.Screen name="ThemeSelection" component={ThemeSelectionScreen} />
                        </>
                    )}
                </Stack.Navigator>
            </PostHogProvider>
        </NavigationContainer>
    );
};