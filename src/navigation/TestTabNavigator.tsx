
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TestMapScreen from '../screens/TestMapScreen';
import TestSearchMenu from '../screens/TestSearchMenu';
import TestUserBookedScreen from '../screens/TestUserBookedScreen';
import TestPill from '../components/TestPill';
import TestProfilePage from '../screens/TestProfilePage';

const Tab = createBottomTabNavigator();

const TestTabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <TestPill {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: 'transparent',
                    borderTopWidth: 0,
                    elevation: 0,
                }
            }}
            initialRouteName="TestMap"
        >
            <Tab.Screen name="TestMap" component={TestMapScreen} options={{ headerShown: false }} />
            <Tab.Screen name="TestSearch" component={TestSearchMenu} options={{ headerShown: false }} />
            <Tab.Screen name="Reservations" component={TestUserBookedScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Profile" component={TestProfilePage} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
};

export default TestTabNavigator;
