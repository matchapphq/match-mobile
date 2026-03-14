
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from '../screens/MapScreen';
import SearchMenu from '../screens/SearchMenu';
import UserBookedScreen from '../screens/UserBookedScreen';
import BottomTabPill from '../components/BottomTabPill';
import ProfileScreen from '../screens/ProfileScreen';
import DiscoverScreen from '../screens/DiscoverScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <BottomTabPill {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: 'transparent',
                    borderTopWidth: 0,
                    elevation: 0,
                }
            }}
            initialRouteName="Discover"
        >
            <Tab.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Discover" component={DiscoverScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Search" component={SearchMenu} options={{ headerShown: false }} />
            <Tab.Screen name="Reservations" component={UserBookedScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
};

export default TabNavigator;
