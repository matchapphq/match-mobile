import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { theme } from "../constants/theme";
import { useStore } from "../store/useStore";

// Import screens
import SplashScreen from "../screens/SplashScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import MapScreen from "../screens/MapScreen";
import MatchesScreen from "../screens/MatchesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import VenueDetailsScreen from "../screens/VenueDetailsScreen";
import MatchDetailsScreen from "../screens/MatchDetailsScreen";
import ReservationsScreen from "../screens/ReservationsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import SearchScreen from "../screens/SearchScreen";
import LevelScreen from "../screens/LevelScreen";
import ReviewsScreen from "../screens/ReviewsScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import UserInfoScreen from "../screens/UserInfoScreen";
import PreferencesScreen from "../screens/PreferencesScreen";
import TestMapScreen from "../screens/TestMapScreen";
import TestSearchMenu from "../screens/TestSearchMenu";
import TestTabNavigator from "./TestTabNavigator";
import TestReservationsScreen from "../screens/TestReservationsScreen";
import TestVenueProfileScreen from "../screens/TestVenueProfileScreen";
import TestFaqSupport from "../screens/TestFaqSupport";
import TestReservationSuccessScreen from "../screens/TestReservationSuccessScreen";
import TestMatchDetailScreen from "../screens/TestMatchDetailScreen";

const Stack = createStackNavigator();

export const AppNavigator = () => {
    const { onboardingCompleted: _onboardingCompleted, isAuthenticated: _isAuthenticated } = useStore();
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
                    cardStyle: { backgroundColor: theme.colors.background },
                }}
            >
                {/* TEMP: bypass auth/onboarding screens to jump straight into Test flow
                {!isAuthenticated ? (
                    <>
                        <Stack.Screen name="Welcome" component={WelcomeScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="TestTab" component={TestTabNavigator} />
                        ...
                    </>
                )} */}

                <Stack.Screen name="TestTab" component={TestTabNavigator} />
                <Stack.Screen name="TestVenueProfile" component={TestVenueProfileScreen} />
                <Stack.Screen name="TestReservationsScreen" component={TestReservationsScreen} />
                <Stack.Screen name="TestReservationSuccess" component={TestReservationSuccessScreen} />
                <Stack.Screen name="TestMatchDetail" component={TestMatchDetailScreen} />
                {/* <Stack.Screen name="TestMap" component={TestMapScreen} /> */}
                {/* <Stack.Screen name="TestSearch" component={TestSearchMenu} /> */}
                {/* <Stack.Screen name="Main" component={MapScreen} /> */}
                <Stack.Screen name="Matches" component={MatchesScreen} />
                {/* <Stack.Screen name="Search" component={SearchScreen} /> */}
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="VenueDetails" component={VenueDetailsScreen} />
                <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} />
                <Stack.Screen name="Reservations" component={ReservationsScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="Level" component={LevelScreen} />
                <Stack.Screen name="Reviews" component={ReviewsScreen} />
                <Stack.Screen name="Favorites" component={FavoritesScreen} />
                <Stack.Screen name="UserInfo" component={UserInfoScreen} />
                <Stack.Screen name="Preferences" component={PreferencesScreen} />
                <Stack.Screen name="TestFaqSupport" component={TestFaqSupport} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
