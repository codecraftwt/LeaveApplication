import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerRoutes = () => (
    <Drawer.Navigator>
        <Drawer.Screen name="Dashboard" component={DashboardScreen} />
    </Drawer.Navigator>
);

const AppNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Drawer" component={DrawerRoutes} />
    </Stack.Navigator>
);

export default AppNavigator;
