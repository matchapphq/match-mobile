import React, { useEffect } from "react";
import { Appearance, AppState } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
// import { theme } from "../constants/theme"; // Removed static theme import to avoid confusion
import { useStore } from "../store/useStore";
import { useNotifications } from "../hooks/useNotifications";
import { apiService } from "../services/api";

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
import ThemeSelectionScreen from "../screens/ThemeSelectionScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import DeleteAccountWarningScreen from "../screens/DeleteAccountWarningScreen";
import DeleteAccountConfirmScreen from "../screens/DeleteAccountConfirmScreen";
import DeleteAccountFinalScreen from "../screens/DeleteAccountFinalScreen";
import DeleteAccountSuccessScreen from "../screens/DeleteAccountSuccessScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import DataPrivacyScreen from "../screens/DataPrivacyScreen";
import FavouritesScreen from "../screens/FavouritesScreen";
import { PostHogProvider } from 'posthog-react-native';
import OAuthProfileCompletionModal from "../components/OAuthProfileCompletionModal";

const Stack = createStackNavigator();

const NotificationHandler = () => {
    useNotifications();
    return null;
};

export const AppNavigator = () => {
    const { isAuthenticated, colors, updateComputedTheme } = useStore();
    const [isLoading, setIsLoading] = React.useState(true);
    const navigationRef = React.useRef<any>(null);
    const routeNameRef = React.useRef<string | undefined>(undefined);
    const lastHeartbeatRef = React.useRef(0);
    const heartbeatInFlightRef = React.useRef(false);

    const sendSessionHeartbeat = React.useCallback(
        async (force: boolean = false) => {
            if (!isAuthenticated) return;
            const now = Date.now();
            if (!force && now - lastHeartbeatRef.current < 20_000) {
                return;
            }
            if (!force && heartbeatInFlightRef.current) {
                return;
            }
            heartbeatInFlightRef.current = true;
            try {
                await apiService.sendSessionHeartbeat();
                lastHeartbeatRef.current = Date.now();
            } catch (error) {
                console.log("[SESSION_HEARTBEAT] request failed:", error);
            } finally {
                heartbeatInFlightRef.current = false;
            }
        },
        [isAuthenticated]
    );

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setIsLoading(false), 2000);
    }, []);

    // Listen for OS appearance changes so "system" theme updates reactively
    useEffect(() => {
        const listener = Appearance.addChangeListener(() => {
            updateComputedTheme();
        });
        return () => listener.remove();
    }, [updateComputedTheme]);

    // iOS may miss live appearance events while app is in background settings;
    // re-sync on app resume.
    useEffect(() => {
        const sub = AppState.addEventListener("change", (state) => {
            if (state === "active") {
                updateComputedTheme();
                void sendSessionHeartbeat(true);
            }
        });
        return () => sub.remove();
    }, [sendSessionHeartbeat, updateComputedTheme]);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        lastHeartbeatRef.current = 0;
        void sendSessionHeartbeat(true);

        const interval = setInterval(() => {
            void sendSessionHeartbeat(true);
        }, 60_000);

        return () => clearInterval(interval);
    }, [isAuthenticated, sendSessionHeartbeat]);

    if (isLoading) {
        return <SplashScreen />;
    }

    return (
        <NavigationContainer
            ref={navigationRef}
            onReady={() => {
                routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
            }}
            onStateChange={() => {
                const previousRouteName = routeNameRef.current;
                const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

                if (previousRouteName !== currentRouteName && currentRouteName) {
                    // Using posthog directly here if analytics service failed to create
                    // but I'll assume we want to keep the hook-like style or direct provider access
                    void sendSessionHeartbeat();
                }
                routeNameRef.current = currentRouteName;
            }}
        >
            <NotificationHandler />
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
                            <Stack.Screen name="DeleteAccountSuccess" component={DeleteAccountSuccessScreen} />
                        </>
                    ) : (
                        <>
                            <Stack.Screen name="Tab" component={TabNavigator} />
                            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                            <Stack.Screen name="DeleteAccountWarning" component={DeleteAccountWarningScreen} />
                            <Stack.Screen name="DeleteAccountConfirm" component={DeleteAccountConfirmScreen} />
                            <Stack.Screen name="DeleteAccountFinal" component={DeleteAccountFinalScreen} />
                            <Stack.Screen name="VenueProfile" component={VenueProfileScreen} />
                            <Stack.Screen name="VenueMatches" component={VenueMatchesScreen} />
                            <Stack.Screen name="VenueReviews" component={VenueReviewsScreen} />
                            <Stack.Screen name="ReservationsScreen" component={ReservationsScreen} />
                            <Stack.Screen name="ReservationSuccess" component={ReservationSuccessScreen} />
                            <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />
                            <Stack.Screen name="FaqSupport" component={FaqSupport} />
                            {/* LanguageSelection temporarily disabled: app is French-only for now. */}
                            <Stack.Screen name="ThemeSelection" component={ThemeSelectionScreen} />
                            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                            <Stack.Screen name="DataPrivacy" component={DataPrivacyScreen} />
                            <Stack.Screen name="Favourites" component={FavouritesScreen} />
                        </>
                    )}
                </Stack.Navigator>
                <OAuthProfileCompletionModal />
            </PostHogProvider>
        </NavigationContainer>
    );
};
